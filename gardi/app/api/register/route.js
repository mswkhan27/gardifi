// app/api/register/route.js
import { supabase } from "../../utils/supabaseClient";

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

  // Default subscription: Free (expires in 3 months)
  const { data: subscriptionData } = await supabase
    .from("subscription")
    .select("id")
    .eq("subscription_type", subscriptionType ?? "Free")
    .single();

  if (!subscriptionData)
    return new Response(JSON.stringify({ error: "Subscription not found" }), {
      status: 400,
    });

  const { data: roleData } = await supabase
    .from("user_roles")
    .select("id")
    .eq("role_name", "Customer")
    .single();

  console.log("RoleData: ", roleData);
  if (!roleData)
    return new Response(JSON.stringify({ error: "Role not found" }), {
      status: 400,
    });

  // Register user using Supabase Auth
  const { data: userData, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error)
    return new Response(JSON.stringify({ error: error?.message }), {
      status: 400,
    });
  const { user, session } = userData;


  // Insert into user_data
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
    },
  ]);

  if (insertError)
    return new Response(JSON.stringify({ error: insertError?.message }), {
      status: 400,
    });

  return new Response(
    JSON.stringify({
      message: "User registered",
      access_token: session?.access_token,
    }),
    { status: 200 }
  );
}
