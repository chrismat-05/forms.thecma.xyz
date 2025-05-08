const fetch = require('node-fetch');

exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const AIRTABLE_TOKEN = process.env.AIRTABLE_PAT;
  const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
  const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME || 'FormSubmissions';

  try {
    const formData = JSON.parse(event.body);

    // Debug: Log the first few chars of PAT (for verification)
    console.log(`Using PAT starting with: ${AIRTABLE_TOKEN.substring(0, 5)}...`);
    console.log(`Using Base ID: ${AIRTABLE_BASE_ID.substring(0, 5)}...`);

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
            // Map fields explicitly
            "Name": formData.name,
            "Email": formData.email,
            "Gender": formData.gender,
            "Hobbies": formData.hobbies?.join(', '),
            "Message": formData.message
          }
        }),
      }
    );

    if (!response.ok) {
      const errorDetails = await response.json();
      console.error('Airtable error details:', errorDetails);
      throw new Error(`Airtable error: ${response.statusText}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Submission successful' }),
    };
  } catch (error) {
    console.error('Full error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: error.message,
        suggestion: 'Verify PAT permissions and base ID'
      }),
    };
  }
};
