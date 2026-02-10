import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const REQUIRED_ENV = ['RESEND_API_KEY', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
const missingEnv = REQUIRED_ENV.filter(key => !Deno.env.get(key));
if (missingEnv.length > 0) {
  console.error(`Missing required environment variables: ${missingEnv.join(', ')}`);
}

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (missingEnv.length > 0) {
      return new Response(
        JSON.stringify({ success: false, error: "Service temporarily unavailable" }),
        { status: 503, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { email } = await req.json();

    if (!email || typeof email !== 'string') {
      return new Response(
        JSON.stringify({ success: false, error: "Email is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid email format" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Generate password reset link using admin API
    const redirectTo = `${req.headers.get('origin') || 'https://itechglass-shop-glow.lovable.app'}/reset-password`;
    
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo,
      },
    });

    if (error) {
      console.error("Generate link error:", error.message);
      // Don't reveal whether email exists - always show success to user
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Build the reset URL with the token
    const resetUrl = `${redirectTo}#access_token=${data.properties?.access_token}&type=recovery`;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #1a1a1a; border-radius: 12px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #D4AF37, #B8860B); padding: 30px; text-align: center;">
              <h1 style="color: #1a1a1a; margin: 0; font-size: 24px; font-weight: bold;">
                iTech<span style="font-weight: normal;">Glass</span>
              </h1>
            </div>
            
            <div style="padding: 40px 30px;">
              <h2 style="color: #D4AF37; margin: 0 0 20px; font-size: 22px;">
                Reset Your Password 🔐
              </h2>
              
              <p style="color: #cccccc; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
                You requested to reset your password. Click the button below to set a new password for your account.
              </p>
              
              <div style="text-align: center; margin-bottom: 30px;">
                <a href="${resetUrl}" 
                   style="display: inline-block; background: linear-gradient(135deg, #D4AF37, #B8860B); color: #1a1a1a; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
                  Reset Password
                </a>
              </div>
              
              <p style="color: #888; font-size: 14px; line-height: 1.6; margin: 0 0 10px;">
                If you didn't request this, you can safely ignore this email. Your password won't be changed.
              </p>
              <p style="color: #888; font-size: 14px; line-height: 1.6; margin: 0;">
                This link will expire in 1 hour.
              </p>
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
      subject: "iTechGlass - Reset Your Password",
      html: emailHtml,
    });

    console.log("Password reset email sent successfully");

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-password-reset:", error?.message);
    return new Response(
      JSON.stringify({ success: false, error: "Failed to process request" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
