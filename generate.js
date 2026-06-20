export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
    text: `Ти копірайтер для українського магазину купальників kupalnik-na-more.com.

Опиши товар для WooCommerce. Відповідай ТІЛЬКИ валідним JSON — без markdown, без пояснень, тільки об'єкт починаючи з { і закінчуючи }.

Дані товару:
- Артикул: ${sku || 'не вказано'}
- Бренд: ${brand || 'Polovi'}
- Тип: ${swimType || 'Роздільний купальник'}
- Колір: ${colorUa || 'визнач з фото'}
- Розміри: ${(sizes || []).join(', ') || 'не вказано'}

Поверни об'єкт з полями:
{
  "name": "назва українською: [тип] [бренд] [артикул] [колір] [ключова особливість]",
  "short_desc": "короткий HTML 2-3 речення, теги b та ul/li",
  "full_desc": "повний HTML: strong заголовок, ul/li мінімум 4 пункти про особливості, тканину, стиль. Останнє речення: Колір може відрізнятися від реального залежно від параметрів монітора."
}`
  });

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        messages: [{ role: 'user', content: contentParts }]
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    const text = data.content?.find(b => b.type === 'text')?.text || '';

    // Extract JSON from response
    let parsed;
    try {
      let clean = text.trim().replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
      const match = clean.match(/\{[\s\S]*\}/);
      if (match) clean = match[0];
      parsed = JSON.parse(clean);
    } catch {
      return res.status(500).json({ error: 'Parse error', raw: text.slice(0, 500) });
    }

    res.status(200).json(parsed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
