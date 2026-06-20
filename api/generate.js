export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { sku, brand, swimType, colorUa, sizes, imageBase64, imageMime } = req.body;

  const contentParts = [];

  if (imageBase64) {
    contentParts.push({
      type: 'image',
      source: {
        type: 'base64',
        media_type: imageMime || 'image/jpeg',
        data: imageBase64
      }
    });
  }

  contentParts.push({
    type: 'text',
    text: `Ти копірайтер для українського магазину купальників.
Відповідай ТІЛЬКИ валідним JSON без markdown та пояснень.

Товар:
- Артикул: ${sku || '—'}
- Бренд: ${brand || 'Polovy'}
- Тип: ${swimType || 'Роздільний купальник'}
- Колір: ${colorUa || 'визнач з фото'}
- Розміри: ${(sizes || []).join(', ') || '—'}

Поверни JSON:
{"name":"...","short_desc":"...","full_desc":"..."}`
  });

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1500,
        messages: [{ role: 'user', content: contentParts }]
      })
    });

    const data = await r.json();
    if (data.error) return res.status(500).json({ error: data.error.message, type: data.error.type, full: JSON.stringify(data.error) });

    const text = data.content?.find(b => b.type === 'text')?.text || '';

    let parsed;
    try {
      let clean = text.trim().replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
      const match = clean.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(match ? match[0] : clean);
    } catch {
      return res.status(500).json({ error: 'Parse error', raw: text.slice(0, 300) });
    }

    res.status(200).json(parsed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
