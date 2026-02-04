import OpenAI from "openai";
import { z } from "zod";

// AI estimates are not legally binding. Merchant confirmation required.

const responseSchema = z.object({
  estimated_length_cm: z.number().positive(),
  estimated_width_cm: z.number().positive(),
  estimated_height_cm: z.number().positive(),
  confidence: z.number().min(0).max(1),
  reason: z.string().min(1).max(240)
});

export type EstimateInput = {
  product_title: string;
  product_description: string;
  category?: string;
  weight_grams?: number;
};

export type EstimateResult = z.infer<typeof responseSchema>;

export async function estimateProductDimensions(
  input: EstimateInput
): Promise<EstimateResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY");
  }

  const client = new OpenAI({ apiKey });

  const prompt = {
    title: input.product_title,
    description: input.product_description,
    category: input.category ?? null,
    weight_grams: input.weight_grams ?? null
  };

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You estimate physical product dimensions in centimeters. Return JSON with estimated_length_cm, estimated_width_cm, estimated_height_cm, confidence (0-1), and a short reason. Do not include any extra keys."
      },
      {
        role: "user",
        content: JSON.stringify(prompt)
      }
    ]
  });

  const raw = response.choices[0]?.message?.content;
  if (!raw) {
    throw new Error("No response from OpenAI");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Invalid JSON response from OpenAI");
  }

  return responseSchema.parse(parsed);
}
