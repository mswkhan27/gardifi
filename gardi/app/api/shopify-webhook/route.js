import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data.json'); // Path to the local JSON file

export async function POST(req) {
  try {
    // Get the incoming data from Shopify's Webhook
    const body = await req.json();
    console.log('Received Shopify Webhook Data:', body);

    // Read the current data from data.json
    const fileData = fs.readFileSync(dataFilePath, 'utf8');
    const jsonData = JSON.parse(fileData);

    // Add the new webhook data to the array
    jsonData.push(body);

    // Write the updated data back to the data.json file
    fs.writeFileSync(dataFilePath, JSON.stringify(jsonData, null, 2));

    return new Response(JSON.stringify({ message: 'Data saved successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error saving data:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
