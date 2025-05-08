const fetch = require('node-fetch');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const AIRTABLE_TOKEN = process.env.AIRTABLE_PAT;
  const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
  const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME || 'FormSubmissions';

  try {
    const formData = JSON.parse(event.body);

    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fields: {
            "Name": formData.name,
            "Email": formData.email,
            "Gender": formData.gender,
            "Hobbies ": formData.hobbies?.join(', '),
            "Message": formData.message
          }
        }),
      }
    );

    if (!response.ok) {
      const errorDetails = await response.json();
      console.error('Submission error:', errorDetails);
      throw new Error(`Failed to save to Airtable`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Submission successful' }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: error.message,
        help: 'Check field names in Airtable match exactly'
      }),
    };
  }
};
