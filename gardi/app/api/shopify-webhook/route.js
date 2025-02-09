import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// Your Shopify secret key (replace with your actual secret key)
const SHOPIFY_SECRET = '2bdb28dc81c2bb4df1c0ee3291b3967d';

// Paths for the log and data files
const dataFilePath = path.join(process.cwd(), 'data.json');
const logsFilePath = path.join(process.cwd(), 'logs.txt');

// Function to log to logs.txt with timestamp
function logToFile(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(logsFilePath, logMessage);
}


// Check and initialize data.json if it doesn't exist
if (!fs.existsSync(dataFilePath)) {
  fs.writeFileSync(dataFilePath, JSON.stringify([]));
}

export async function POST(req) {
  const endpointName = 'shopify-webhook'; // Name of the API endpoint

  try {
    // Get the HMAC signature from the Shopify request header
    const shopifyHmac = req.headers.get('x-shopify-hmac-sha256');
    
    // Log the headers before proceeding
    logToFile(`${endpointName} - INFO: Received headers: ${JSON.stringify([...req.headers])}`);

    // Get the raw request body
    const body = await req.text();

    // // Compute the HMAC hash using the Shopify secret and the body
    // const computedHmac = crypto
    //   .createHmac('sha256', SHOPIFY_SECRET)
    //   .update(body, 'utf8')
    //   .digest('base64');
    
    // // Compare the computed HMAC with the one sent in the header
    // if (computedHmac !== shopifyHmac) {
    //   const error = 'Invalid webhook signature';
    //   logToFile(`${endpointName} - ERROR: ${error}`); // Log error to logs.txt
    //   return new Response(JSON.stringify({ error }), {
    //     status: 400,
    //     headers: { 'Content-Type': 'application/json' },
    //   });
    // }

    // Get the event ID from the header
    const shopifyEventId = req.headers.get('x-shopify-event-id');


    // If signature is valid and it's a new event, process the request
    const webhookData = JSON.parse(body);
    logToFile(`${endpointName} - INFO: Received Shopify Webhook Data: ${JSON.stringify(webhookData)}`);

    // Read the current data from data.json
    const fileData = fs.readFileSync(dataFilePath, 'utf8');
    const jsonData = JSON.parse(fileData);

    // Add headers and payload to the data
    const webhookLog = {
      headers: req.headers,
      payload: webhookData,
      receivedAt: new Date().toISOString(),
    };

    // Add the new webhook log to the array
    jsonData.push(webhookLog);

    // Write the updated data back to data.json
    fs.writeFileSync(dataFilePath, JSON.stringify(jsonData, null, 2));


    logToFile(`${endpointName} - INFO: Data saved successfully for event ID: ${shopifyEventId}`);

    return new Response(JSON.stringify({ message: 'Data saved successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    logToFile(`${endpointName} - ERROR: ${error.message || error}`); // Log the error to logs.txt

    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
