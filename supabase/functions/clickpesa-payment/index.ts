import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const CLICKPESA_BASE_URL = "https://api.clickpesa.com";

// Validate required environment variables at startup
const REQUIRED_ENV = ['CLICKPESA_CLIENT_ID', 'CLICKPESA_API_KEY', 'SUPABASE_URL', 'SUPABASE_ANON_KEY'];
const missingEnv = REQUIRED_ENV.filter(key => !Deno.env.get(key));
if (missingEnv.length > 0) {
  console.error(`Missing required environment variables: ${missingEnv.join(', ')}`);
}

interface TokenResponse {
  success: boolean;
  token: string;
}

async function generateToken(): Promise<string> {
  const clientId = Deno.env.get("CLICKPESA_CLIENT_ID");
  const apiKey = Deno.env.get("CLICKPESA_API_KEY");

  if (!clientId || !apiKey) {
    throw new Error("Payment service configuration error");
  }

  const response = await fetch(`${CLICKPESA_BASE_URL}/generate-token`, {
    method: "POST",
    headers: {
      "client-id": clientId,
      "api-key": apiKey,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    console.error("Token generation failed:", response.status);
    throw new Error("Payment service temporarily unavailable");
  }

  const data: TokenResponse = await response.json();
  if (!data.success || !data.token) {
    throw new Error("Payment service temporarily unavailable");
  }

  return data.token;
}

async function authenticateUser(req: Request): Promise<string> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('No authorization header');
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Service configuration error');
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } }
  });

  const token = authHeader.replace('Bearer ', '');
  const { data, error } = await supabase.auth.getClaims(token);

  if (error || !data?.claims?.sub) {
    console.error('Auth error:', error?.message || 'Invalid token');
    throw new Error('Unauthorized');
  }

  return data.claims.sub as string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Check configuration is valid
    if (missingEnv.length > 0) {
      return new Response(
        JSON.stringify({ success: false, error: "Service temporarily unavailable" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Authenticate the user
    const userId = await authenticateUser(req);
    console.log(`Authenticated user: ${userId}`);

    const { action, ...payload } = await req.json();
    console.log(`ClickPesa action: ${action}`);

    // Generate fresh token for each request
    const token = await generateToken();

    let endpoint: string;
    let method = "POST";

    switch (action) {
      case "preview":
        endpoint = "/third-parties/payments/preview-ussd-push-request";
        break;
      case "initiate":
        endpoint = "/third-parties/payments/initiate-ussd-push-request";
        break;
      case "status":
        endpoint = `/third-parties/payments/status/${payload.orderReference}`;
        method = "GET";
        break;
      default:
        return new Response(
          JSON.stringify({ success: false, error: "Invalid action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    const fetchOptions: RequestInit = {
      method,
      headers: {
        "Authorization": token,
        "Content-Type": "application/json",
      },
    };

    if (method === "POST") {
      fetchOptions.body = JSON.stringify({
        amount: String(payload.amount),
        currency: "TZS",
        orderReference: payload.orderReference,
        phoneNumber: payload.phoneNumber,
        ...(action === "preview" && { fetchSenderDetails: true }),
      });
    }

    console.log(`Calling ClickPesa: ${endpoint}`);
    const response = await fetch(`${CLICKPESA_BASE_URL}${endpoint}`, fetchOptions);
    const data = await response.json();

    console.log(`ClickPesa response status: ${response.status}`);

    if (!response.ok) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: data.message || "Payment request failed"
        }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("ClickPesa payment error:", error instanceof Error ? error.message : "Unknown error");
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    // Return 401 for auth errors, generic message for others
    const status = errorMessage === 'Unauthorized' || errorMessage === 'No authorization header' ? 401 : 500;
    const clientMessage = status === 401 ? errorMessage : "Payment service error. Please try again.";
    
    return new Response(
      JSON.stringify({ success: false, error: clientMessage }),
      { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
