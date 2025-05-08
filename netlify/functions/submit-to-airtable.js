const fetch = require('node-fetch');

exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Get credentials from environment variables (set in Netlify)
  const AIRTABLE_TOKEN = process.env.AIRTABLE_PAT; // Changed to standard naming
  const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
  const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME || 'FormSubmissions';

  try {
    const formData = JSON.parse(event.body);

    // Transform hobbies array to comma-separated string if needed
    if (formData.hobbies && Array.isArray(formData.hobbies)) {
      formData.hobbies = formData.hobbies.join(', ');
    }

    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fields: formData
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Airtable error: ${response.statusText}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Submission successful' }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
