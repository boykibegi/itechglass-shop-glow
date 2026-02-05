 import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
 
 const corsHeaders = {
   'Access-Control-Allow-Origin': '*',
   'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
 };
 
 const CLICKPESA_BASE_URL = "https://api.clickpesa.com";
 
 interface TokenResponse {
   success: boolean;
   token: string;
 }
 
 async function generateToken(): Promise<string> {
   const clientId = Deno.env.get("CLICKPESA_CLIENT_ID");
   const apiKey = Deno.env.get("CLICKPESA_API_KEY");
 
   if (!clientId || !apiKey) {
     throw new Error("ClickPesa credentials not configured");
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
     const errorText = await response.text();
     console.error("Token generation failed:", response.status, errorText);
     throw new Error(`Failed to generate token: ${response.status}`);
   }
 
   const data: TokenResponse = await response.json();
   if (!data.success || !data.token) {
     throw new Error("Invalid token response from ClickPesa");
   }
 
   return data.token;
 }
 
 serve(async (req) => {
   // Handle CORS preflight
   if (req.method === "OPTIONS") {
     return new Response("ok", { headers: corsHeaders });
   }
 
   try {
     const { action, ...payload } = await req.json();
     console.log(`ClickPesa action: ${action}`, JSON.stringify(payload));
 
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
 
     console.log(`Calling ClickPesa: ${CLICKPESA_BASE_URL}${endpoint}`);
     const response = await fetch(`${CLICKPESA_BASE_URL}${endpoint}`, fetchOptions);
     const data = await response.json();
 
     console.log(`ClickPesa response:`, JSON.stringify(data));
 
     if (!response.ok) {
       return new Response(
         JSON.stringify({ 
           success: false, 
           error: data.message || "Payment request failed",
           details: data 
         }),
         { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }
 
     return new Response(
       JSON.stringify({ success: true, data }),
       { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
     );
 
   } catch (error) {
     console.error("ClickPesa payment error:", error);
     const errorMessage = error instanceof Error ? error.message : "Unknown error";
     return new Response(
       JSON.stringify({ success: false, error: errorMessage }),
       { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
     );
   }
 });