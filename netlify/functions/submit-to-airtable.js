const fetch = require('node-fetch');

exports.handler = async (event) => {
  // To remove later: Debugging - log incoming request
  console.log('Incoming request headers:', event.headers);
  console.log('Request body:', event.body);

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Get credentials from environment variables (set in Netlify)
  const AIRTABLE_TOKEN = process.env.AIRTABLE_PAT;
  const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
  const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME || 'FormSubmissions';

  // To remove later: Debugging - verify environment variables
  console.log('Environment variables:', {
    hasPAT: !!AIRTABLE_TOKEN,
    hasBaseID: !!AIRTABLE_BASE_ID,
    tableName: AIRTABLE_TABLE_NAME
  });

  try {
    const formData = JSON.parse(event.body);

    // To remove later: Debugging - log parsed form data
    console.log('Parsed form data:', formData);

    // Transform hobbies array to comma-separated string if needed
    if (formData.hobbies && Array.isArray(formData.hobbies)) {
      formData.hobbies = formData.hobbies.join(', ');
    }

    const airtableEndpoint = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`;
    
    // To remove later: Debugging - log the endpoint being called
    console.log('Airtable endpoint:', airtableEndpoint.replace(AIRTABLE_BASE_ID, '[REDACTED]'));

    const response = await fetch(airtableEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: formData
      }),
    });

    // To remove later: Debugging - enhanced error logging
    if (!response.ok) {
      const errorResponse = await response.text();
      console.error('Airtable error details:', {
        status: response.status,
        statusText: response.statusText,
        errorResponse: errorResponse
      });
      throw new Error(`Airtable error: ${response.statusText}`);
    }

    // To remove later: Debugging - log successful submission
    console.log('Submission successful');
    const successResponse = await response.json();
    console.log('Airtable response:', successResponse);

    return {
      statusCode: 200,
      headers: {
        // To remove later: CORS headers for debugging
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({ 
        message: 'Submission successful',
        // To remove later: Debug info in response
        debug: {
          recordId: successResponse.id,
          table: AIRTABLE_TABLE_NAME
        }
      }),
    };
  } catch (error) {
    // To remove later: Enhanced error logging
    console.error('Full error details:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    return {
      statusCode: 500,
      headers: {
        // To remove later: CORS headers for debugging
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({ 
        error: error.message,
        // To remove later: Debug info in error response
        debug: {
          suggestion: 'Check Netlify function logs for details',
          timestamp: new Date().toISOString()
        }
      }),
    };
  }
};
