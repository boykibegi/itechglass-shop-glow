import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

// Validate required environment variables at startup
const REQUIRED_ENV = ['RESEND_API_KEY', 'SUPABASE_URL', 'SUPABASE_ANON_KEY'];
const missingEnv = REQUIRED_ENV.filter(key => !Deno.env.get(key));
if (missingEnv.length > 0) {
  console.error(`Missing required environment variables: ${missingEnv.join(', ')}`);
}

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderNotificationRequest {
  orderId: string;
  customerEmail: string;
  customerName: string;
  orderStatus: string;
  totalAmount: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    selectedModel?: string;
  }>;
}

async function authenticateAdmin(req: Request): Promise<string> {
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

  const userId = data.claims.sub as string;

  // Check if user has admin role
  const { data: roleData, error: roleError } = await supabase
    .rpc('has_role', { _user_id: userId, _role: 'admin' });

  if (roleError || !roleData) {
    console.error('Role check failed:', roleError?.message || 'Not admin');
    throw new Error('Admin access required');
  }

  return userId;
}

const getStatusMessage = (status: string): { subject: string; heading: string; message: string } => {
  switch (status) {
    case 'processing':
      return {
        subject: 'Your order is being processed',
        heading: 'Order Confirmed! 🎉',
        message: 'Great news! Your payment has been verified and we\'re now preparing your order for shipment.',
      };
    case 'shipped':
      return {
        subject: 'Your order has been shipped',
        heading: 'Your Order is On Its Way! 🚚',
        message: 'Exciting news! Your order has been shipped and is on its way to you.',
      };
    case 'delivered':
      return {
        subject: 'Your order has been delivered',
        heading: 'Order Delivered! ✅',
        message: 'Your order has been successfully delivered. We hope you love your purchase!',
      };
    case 'cancelled':
      return {
        subject: 'Your order has been cancelled',
        heading: 'Order Cancelled',
        message: 'Your order has been cancelled. If you have any questions, please contact our support team.',
      };
    default:
      return {
        subject: 'Order status update',
        heading: 'Order Update',
        message: `Your order status has been updated to: ${status}`,
      };
  }
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-TZ', {
    style: 'currency',
    currency: 'TZS',
    minimumFractionDigits: 0,
  }).format(price);
};

const handler = async (req: Request): Promise<Response> => {
  console.log("Received request to send-order-notification");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check configuration is valid
    if (missingEnv.length > 0) {
      return new Response(
        JSON.stringify({ success: false, error: "Service temporarily unavailable" }),
        { status: 503, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Authenticate admin user
    const adminId = await authenticateAdmin(req);
    console.log(`Admin authenticated: ${adminId}`);

    const { orderId, customerEmail, customerName, orderStatus, totalAmount, items }: OrderNotificationRequest = await req.json();

    console.log(`Processing notification for order ${orderId}, status: ${orderStatus}`);

    if (!customerEmail || !orderId || !orderStatus) {
      throw new Error("Missing required fields");
    }

    const { subject, heading, message } = getStatusMessage(orderStatus);

    const itemsHtml = items.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">
          ${item.name}${item.selectedModel ? ` (${item.selectedModel})` : ''}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">
          ${item.quantity}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">
          ${formatPrice(item.price * item.quantity)}
        </td>
      </tr>
    `).join('');

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #1a1a1a; border-radius: 12px; overflow: hidden;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #D4AF37, #B8860B); padding: 30px; text-align: center;">
              <h1 style="color: #1a1a1a; margin: 0; font-size: 24px; font-weight: bold;">
                iTech<span style="font-weight: normal;">Glass</span>
              </h1>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 30px;">
              <h2 style="color: #D4AF37; margin: 0 0 20px; font-size: 22px;">
                ${heading}
              </h2>
              
              <p style="color: #ffffff; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                Hi ${customerName || 'Valued Customer'},
              </p>
              
              <p style="color: #cccccc; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
                ${message}
              </p>
              
              <!-- Order Details -->
              <div style="background-color: #2a2a2a; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                <h3 style="color: #D4AF37; margin: 0 0 15px; font-size: 16px;">
                  Order #${orderId.slice(0, 8)}
                </h3>
                
                <table style="width: 100%; border-collapse: collapse;">
                  <thead>
                    <tr>
                      <th style="padding: 12px; text-align: left; color: #888; font-weight: normal; border-bottom: 1px solid #444;">Item</th>
                      <th style="padding: 12px; text-align: center; color: #888; font-weight: normal; border-bottom: 1px solid #444;">Qty</th>
                      <th style="padding: 12px; text-align: right; color: #888; font-weight: normal; border-bottom: 1px solid #444;">Price</th>
                    </tr>
                  </thead>
                  <tbody style="color: #ffffff;">
                    ${itemsHtml}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colspan="2" style="padding: 15px 12px; text-align: right; color: #888; font-weight: bold;">Total:</td>
                      <td style="padding: 15px 12px; text-align: right; color: #D4AF37; font-weight: bold; font-size: 18px;">${formatPrice(totalAmount)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin-bottom: 30px;">
                <a href="https://itechglass-shop-glow.lovable.app/order/${orderId}" 
                   style="display: inline-block; background: linear-gradient(135deg, #D4AF37, #B8860B); color: #1a1a1a; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
                  Track Your Order
                </a>
              </div>
              
              <p style="color: #888; font-size: 14px; line-height: 1.6; margin: 0;">
                If you have any questions about your order, feel free to contact us on WhatsApp for instant support.
              </p>
            </div>
            
            <!-- Footer -->
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
      to: [customerEmail],
      subject: `iTechGlass - ${subject}`,
      html: emailHtml,
    });

    console.log("Email sent successfully");

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending order notification:", error?.message || "Unknown error");
    
    // Return appropriate status codes with generic messages
    const status = error.message === 'Unauthorized' || error.message === 'No authorization header' ? 401 
      : error.message === 'Admin access required' ? 403 
      : 500;
    
    const clientMessage = status === 401 || status === 403 ? error.message : "Failed to send notification";
    
    return new Response(
      JSON.stringify({ success: false, error: clientMessage }),
      {
        status,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
