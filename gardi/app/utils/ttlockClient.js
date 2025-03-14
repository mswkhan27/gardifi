// utils/ttlockClient.js

const TTLOCK_URL = 'https://euapi.ttlock.com/v3';
const CLIENT_ID = '48244901a0544029b5e32edfcfc3e0b4';
const CLIENT_SECRET = '8a0ea9219ef8382ad6e56a7489279bd5';

export const ttlockAuthClient = async (endpoint, params) => {
  const url = `${TTLOCK_URL}/${endpoint}`;
  const data = new URLSearchParams({
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    date: Date.now().toString(),
    ...params
  });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: data
    });

    const result = await response.text();
    return { status: response.status, body: result };
  } catch (error) {
    throw new Error(error.message);
  }
};


export const ttlockClient = async (endpoint, params) => {
    const url = `${TTLOCK_URL}/${endpoint}`;
    const data = new URLSearchParams({
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      date: Date.now().toString(),
      ...params
    });
  
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: data
      });
  
      const result = await response.text();
      return { status: response.status, body: result };
    } catch (error) {
      throw new Error(error.message);
    }
  };