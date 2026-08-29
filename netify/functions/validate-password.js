// netlify/functions/validate-password.js
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

  const authHeader = event.headers.authorization || '';
  const clientHash = authHeader.replace(/^Bearer\s+/i, '');

  const correctHash = process.env.PASSWORD_HASH;

  if (!correctHash) {
    return { statusCode: 500, headers, body: 'Server misconfigured' };
  }

  if (clientHash === correctHash) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ valid: true }),
    };
  } else {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ valid: false, error: 'Invalid password' }),
    };
  }
};
