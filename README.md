# WooCommerce CSV Generator

AI-генератор товарів для kupalnik-na-more.com

## Деплой на Vercel (5 хвилин)

### 1. Завантаж файли на GitHub
Створи новий репозиторій і завантаж всі файли:
```
woo-generator/
  index.html
  api/
    generate.js
  vercel.json
```

### 2. Підключи до Vercel
- Зайди на vercel.com
- "Add New Project" → вибери репозиторій
- Deploy (без змін налаштувань)

### 3. Додай API ключ
- В Vercel: Settings → Environment Variables
- Додай змінну:
  - Name: `ANTHROPIC_API_KEY`
  - Value: твій ключ з console.anthropic.com
- Redeploy після збереження

### 4. Готово
Відкрий URL який дав Vercel — додаток працює.

## Використання
1. Завантаж фото купальника
2. Заповни артикул, бренд, ціну, розміри
3. Натисни "Згенерувати опис AI"
4. Перевір/відредагуй назву та описи
5. "Додати до списку"
6. Повтори для всіх товарів
7. "Завантажити CSV" → імпортуй у WooCommerce
8. Проверь
