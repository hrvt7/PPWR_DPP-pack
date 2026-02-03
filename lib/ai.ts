import OpenAI from "openai";
import type { ProfileType } from "./types";

const profileTypes: ProfileType[] = ["sales", "tech", "investor"];

export async function rewriteBio(bio: string, tone = "clear") {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return `${bio} (AI: results-driven, concise, focus on buyer outcomes).`;
  }
  const client = new OpenAI({ apiKey });
  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "Rewrite the bio to be crisp, sales-friendly, and outcome oriented. Return a single paragraph."
      },
      {
        role: "user",
        content: `Tone: ${tone}. Bio: ${bio}`
      }
    ],
    temperature: 0.4
  });
  return response.choices[0]?.message?.content?.trim() ?? bio;
}

export async function suggestProfileType(context: string): Promise<ProfileType> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    const lower = context.toLowerCase();
    if (lower.includes("tech") || lower.includes("developer")) return "tech";
    if (lower.includes("invest") || lower.includes("vc")) return "investor";
    return "sales";
  }
  const client = new OpenAI({ apiKey });
  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "Classify the best profile type. Return only one of: sales, tech, investor."
      },
      { role: "user", content: context }
    ],
    temperature: 0
  });
  const raw = response.choices[0]?.message?.content?.trim().toLowerCase();
  const match = profileTypes.find((type) => raw?.includes(type));
  return match ?? "sales";
}
