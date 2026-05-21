exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  const data = JSON.parse(event.body);
  const { phone, name, action, conversationId } = data;

  let message;
  if (action === 'contact_found' && name) {
    message = `Sí, el número existe. El contacto es ${name}.`;
  } else {
    message = 'No encontré ese número en nuestra base de datos.';
  }

  const WEBEX_API_URL = 'https://api.webexconnect.io/v1/messages';
  const WEBEX_API_KEY = process.env.WEBEX_API_KEY;

  try {
    const response = await fetch(WEBEX_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WEBEX_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        conversationId: conversationId,
        message: message,
        channel: 'RTM'
      })
    });

    const webexData = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify({
        status: 'success',
        message: message,
        webex_response: webexData
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        status: 'error',
        message: error.message
      })
    };
  }
};
