import crypto from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "../../../../lib/supabase";
import { generateApiKey } from "../../../../src/auth/apiKey";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  name: z.string().min(1)
});

function getBearerToken(request: Request) {
  const header = request.headers.get("authorization") ?? "";
  const [, token] = header.split(" ");
  return token?.trim() || null;
}

export async function POST(request: Request) {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase is not configured" },
      { status: 500 }
    );
  }

  const token = getBearerToken(request);
  if (!token) {
    return NextResponse.json({ error: "Missing auth token" }, { status: 401 });
  }

  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = schema.parse(await request.json());
    const apiKey = generateApiKey();
    const shopId = crypto.randomUUID();

    const { error } = await supabase.from("shops").insert({
      id: shopId,
      merchant_id: userData.user.id,
      name: payload.name,
      api_key: apiKey,
      status: "active",
      created_at: new Date().toISOString()
    });

    if (error) {
      return NextResponse.json(
        { error: "Failed to create shop" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      shop_id: shopId,
      api_key: apiKey
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to create shop" },
      { status: 500 }
    );
  }
}
