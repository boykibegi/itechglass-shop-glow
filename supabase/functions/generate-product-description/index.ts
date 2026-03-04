import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, category, productName } = await req.json();

    if (!imageUrl || !category) {
      return new Response(
        JSON.stringify({ error: "imageUrl and category are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const categoryLabels: Record<string, string> = {
      "back-glass": "back glass replacement panel",
      "screen-glass": "tempered screen protector / screen glass",
      "covers": "phone case / cover",
    };

    const categoryDesc = categoryLabels[category] || category;

    const systemPrompt = `You are a professional e-commerce copywriter for a premium phone accessories store called iTech Glass. You will be given a product image and its category. Return a JSON object with two fields: "name" (a short, catchy product name, max 10 words) and "description" (a compelling 2-3 sentence description). Focus on quality, protection, and style. Keep it professional and luxurious in tone. Do NOT use markdown formatting. Return ONLY valid JSON, no extra text.`;

    const userPrompt = `Generate a product name and description for this ${categoryDesc}${productName ? ` (current name: "${productName}")` : ""}. Look at the product image and describe its key visual features, color, material, and selling points.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: userPrompt },
              { type: "image_url", image_url: { url: imageUrl } },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please top up." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content?.trim() || "";

    let name = "";
    let description = "";
    try {
      const jsonStr = raw.replace(/^```json?\s*/i, "").replace(/```\s*$/, "").trim();
      const parsed = JSON.parse(jsonStr);
      name = parsed.name || "";
      description = parsed.description || "";
    } catch {
      description = raw;
    }

    return new Response(JSON.stringify({ name, description }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-product-description error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
