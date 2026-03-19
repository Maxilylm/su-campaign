import { NextRequest } from "next/server";

const SYSTEM_PROMPT = `You are an expert social media strategist. Given source content, a content type, brand voice, and target audience, generate platform-specific posts for the requested platforms.

Return ONLY valid JSON (no markdown, no code blocks) with this exact structure for each requested platform:
{
  "linkedin": { "post": "...", "hashtags": "..." },
  "twitter": { "tweet": "...", "thread": ["tweet1", "tweet2", "tweet3"], "hashtags": "..." },
  "instagram": { "caption": "...", "hashtags": "..." },
  "tiktok": { "hook": "...", "script": "...", "hashtags": "..." },
  "facebook": { "post": "..." },
  "email": { "subject": "...", "previewText": "...", "body": "..." }
}

Rules:
- Twitter tweet must be under 280 characters. Thread tweets each under 280 chars.
- LinkedIn post should be professional and under 3000 characters.
- Instagram caption should be engaging with up to 30 relevant hashtags.
- TikTok hook should be attention-grabbing (first 3 seconds). Script should be a full video script.
- Facebook post should be conversational and shareable.
- Email should have a compelling subject line, short preview text, and formatted body with a clear CTA.
- Match the specified brand voice throughout.
- Only include platforms that are requested.`;

export async function POST(request: NextRequest) {
  try {
    const { content, contentType, voice, audience, platforms } =
      await request.json();

    if (!content || !platforms || platforms.length === 0) {
      return Response.json(
        { error: "Content and at least one platform are required." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "GROQ_API_KEY is not configured." },
        { status: 500 }
      );
    }

    const truncatedContent = content.slice(0, 6000);

    const userPrompt = `Content Type: ${contentType}
Brand Voice: ${voice}
Target Audience: ${audience || "General"}
Platforms: ${platforms.join(", ")}

Source Content:
${truncatedContent}`;

    const res = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 4000,
          response_format: { type: "json_object" },
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      console.error("Groq API error:", err);
      return Response.json(
        { error: "AI generation failed. Please try again." },
        { status: 502 }
      );
    }

    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content;

    if (!raw) {
      return Response.json(
        { error: "No content returned from AI." },
        { status: 502 }
      );
    }

    const parsed = JSON.parse(raw);
    return Response.json(parsed);
  } catch (e) {
    console.error("Generate error:", e);
    return Response.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
