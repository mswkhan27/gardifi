// app/api/login/route.js
import { supabase } from "../../utils/supabaseClient";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    // Authenticate user
    const { data: user, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error)
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
      });

    // Fetch user role & subscription status
    const { data: userData, error: fetchError } = await supabase
      .from("user_data")
      .select(
        `
        user_id,
        subscription_status,
        email,
        phone,
        first_name,
        last_name,
        address_info,
        user_roles(role_name),
        subscription(subscription_type)
      `
      )
      .eq("user_id", user.user.id)
      .single();

    
      console.log(userData)

    if (userData && !fetchError) {
      const userInfo = {
        userId: userData?.user_id,
        subscriptionStatus: userData?.subscription_status,
        userRole: userData.user_roles.role_name,
        subscriptionType: userData?.subscription?.subscription_type,
        email: userData?.email,
        phone: userData?.phone,
        firstName: userData?.first_name,
        lastName: userData?.last_name,
        addressInfo: userData?.address_info,
      };

      return new Response(
        JSON.stringify({
          message: "Login successful",
          user: userInfo,
          session:user?.session
        }),
        { status: 200 }
      );
      
    }

    return new Response(JSON.stringify({ error: fetchError?.message ?? "Unable to Login" }), {
      status: 400,
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
