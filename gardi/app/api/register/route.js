// app/api/register/route.js
import { supabase } from "../../utils/supabaseClient";
import { ttlockAuthClient } from "../../utils/ttlockClient";
import crypto from 'crypto';

export async function POST(req) {
  const {
    email,
    password,
    firstName,
    lastName,
    phone,
    addressInfo,
    role = "Customer",
    subscriptionType = "Free",
  } = await req.json();

  try {
    // Default subscription: Free (expires in 3 months)
    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from("subscription")
      .select("id")
      .eq("subscription_type", subscriptionType ?? "Free")
      .single();

    if (subscriptionError || !subscriptionData)
      throw new Error("Subscription not found");

    const { data: roleData, error: roleError } = await supabase
      .from("user_roles")
      .select("id")
      .eq("role_name", role)
      .single();

    if (roleError || !roleData)
      throw new Error("Role not found");

    // Register user using Supabase Auth
    const { data: userData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw new Error(authError.message);

    const { user, session } = userData;

    let ttlockSuccess = false;
    let ttLockCredentials = null;

    try {
      // Hash password for TTLock (MD5, lowercase)
      const hashedPassword = crypto.createHash('md5').update(password).digest('hex');
      const ttlockUsername = user.id.replace(/[^a-zA-Z0-9]/g, '');

      // Silently register user on TTLock
      const ttlockResponse = await ttlockAuthClient('user/register', {
        username: ttlockUsername,
        password: hashedPassword
      });
      
     
      if (ttlockResponse?.errcode) {
        console.error('TTLock registration failed:', ttlockResponse);
        ttLockCredentials={}
      } else {
        console.log('TTLock registration successful:', ttlockResponse);
        ttlockSuccess = true;
        ttLockCredentials = {
          username: ttlockResponse?.body?.username,
          password: hashedPassword
      }
    }
    } catch (ttlockError) {
      console.error('Error during TTLock registration:', ttlockError.message);
    }
   
    const { error: insertError } = await supabase.from("user_data").insert([
      {
        user_id: user.id,
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        user_role_id: roleData.id,
        subscription_status: "active",
        subscription_type_id: subscriptionData.id,
        address_info: addressInfo,
        ttlock_active: ttlockSuccess,
        ttlock_credentials: ttLockCredentials

      },
    ]);

    if (insertError) throw new Error(insertError.message);

    return new Response(
      JSON.stringify({
        message: "User registered. Please verify your email address.",
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Registration error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  }
}
