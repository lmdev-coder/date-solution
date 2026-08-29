const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER;
const GITHUB_REPO = process.env.GITHUB_REPO;
const PASSWORD_HASH = process.env.PASSWORD_HASH;

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: 'Method Not Allowed' };
  }

  // Проверяем пароль
  const authHeader = event.headers.authorization || '';
  const clientHash = authHeader.replace(/^Bearer\s+/i, '');
  if (clientHash !== PASSWORD_HASH) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  try {
    const { time, place } = JSON.parse(event.body);
    if (!time || !place) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing fields' }) };
    }

    // Определяем IP пользователя (учитываем заголовки Netlify)
    const ip = event.headers['x-forwarded-for']?.split(',')[0].trim() ||
               event.headers['client-ip'] ||
               'unknown-ip';

    // Формируем имя файла: answers/<дата>_<ip>.txt
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10); // YYYY-MM-DD
    const timeStr = now.toISOString().replace(/[:.]/g, '-'); // для уникальности
    const fileName = `answers/${dateStr}_${ip}_${timeStr}.txt`;

    const content = `Время: ${time}\nМесто: ${place}\nЗаписано: ${now.toISOString()}\n`;

    const apiUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${fileName}`;

    // Создаём новый файл (PUT без sha)
    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Add response ${fileName}`,
        content: Buffer.from(content, 'utf-8').toString('base64'),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to save file');
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, fileName }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
