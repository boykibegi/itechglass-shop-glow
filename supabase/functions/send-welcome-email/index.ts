import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ success: false, error: "Service unavailable" }),
        { status: 503, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { email, name } = await req.json();

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return new Response(
        JSON.stringify({ success: false, error: "Valid email required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const resend = new Resend(apiKey);

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #1a1a1a; border-radius: 12px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #D4AF37, #B8860B); padding: 30px; text-align: center;">
              <h1 style="color: #1a1a1a; margin: 0; font-size: 24px; font-weight: bold;">
                iTech<span style="font-weight: normal;">Glass</span>
              </h1>
            </div>
            <div style="padding: 40px 30px;">
              <h2 style="color: #D4AF37; margin: 0 0 20px; font-size: 22px;">Welcome to iTechGlass! 🎉</h2>
              <p style="color: #ffffff; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                Hi ${name || 'there'},
              </p>
              <p style="color: #cccccc; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
                Thank you for creating your account! You now have access to our full collection of premium iPhone protection products.
              </p>
              <div style="background-color: #2a2a2a; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                <h3 style="color: #D4AF37; margin: 0 0 15px; font-size: 16px;">What you can do:</h3>
                <ul style="color: #cccccc; font-size: 14px; line-height: 2; padding-left: 20px; margin: 0;">
                  <li>Browse premium back glass & screen protectors</li>
                  <li>Order with fast delivery across Tanzania</li>
                  <li>Track your orders in real-time</li>
                  <li>Contact us via WhatsApp for instant support</li>
                </ul>
              </div>
              <div style="text-align: center; margin-bottom: 30px;">
                <a href="https://itechglass-shop-glow.lovable.app/shop" 
                   style="display: inline-block; background: linear-gradient(135deg, #D4AF37, #B8860B); color: #1a1a1a; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
                  Start Shopping
                </a>
              </div>
            </div>
            <div style="background-color: #0a0a0a; padding: 20px 30px; text-align: center;">
              <p style="color: #666; font-size: 12px; margin: 0;">
                © 2026 iTechGlass. All rights reserved.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "iTechGlass <support@itechglass.co.tz>",
      to: [email],
      subject: "Welcome to iTechGlass! 🎉",
      html: emailHtml,
    });

    console.log("Welcome email sent successfully to", email);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending welcome email:", error?.message);
    return new Response(
      JSON.stringify({ success: false, error: "Failed to send welcome email" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
