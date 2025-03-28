import { supabase } from './supabaseClient'; // Assuming you've already configured Supabase

// Store Tokens in Supabase
async function storeTokens(userId, access_token, refresh_token, expires_at) {
  const { error } = await supabase
    .from('tokens')
    .upsert([
      {
        user_id: userId,
        access_token: access_token,
        refresh_token: refresh_token,
        expires_at: expires_at, // Store expiration time
      },
    ]);

  if (error) {
    console.error('Error storing tokens:', error);
    throw new Error('Unable to store tokens');
  }

  console.log('Tokens stored successfully');
}

// Fetch Access Token from Supabase
async function getAccessToken(userId) {
  const { data, error } = await supabase
    .from('tokens')
    .select('access_token, refresh_token, expires_at')
    .eq('user_id', userId)
    .single();

  if (error) throw new Error('Unable to get tokens from database: ' + error.message);
  if (!data) throw new Error('No tokens found for the user');

  const { access_token, refresh_token, expires_at } = data;

  // Check if the access token is expired
  const currentTime = new Date().getTime();
  const expiryTime = new Date(expires_at).getTime();

  if (currentTime > expiryTime) {
    // Token has expired, refresh it
    const newTokens = await refreshAccessToken(userId, refresh_token);
    if (newTokens) {
      // Store the new tokens
      await storeTokens(userId, newTokens.access_token, newTokens.refresh_token, newTokens.expires_at);
      return newTokens.access_token;
    }
  }

  // Return valid access token
  return access_token;
}

// Refresh the Access Token using the Refresh Token
async function refreshAccessToken(userId, refresh_token) {
  const response = await fetch('https://euapi.ttlock.com/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      clientId: process.env.TTLOCK_CLIENT_ID, // Ensure you have your client ID stored in environment variables
      clientSecret: process.env.TTLOCK_CLIENT_SECRET, // Same for your client secret
      grant_type: 'refresh_token',
      refresh_token: refresh_token,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh access token');
  }

  const data = await response.json();

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: new Date(new Date().getTime() + data.expires_in * 1000), // Calculate expiration time
  };
}



export { storeTokens, getAccessToken, refreshAccessToken };
