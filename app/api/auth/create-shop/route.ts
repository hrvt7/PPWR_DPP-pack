import crypto from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "../../../../lib/supabase";
import { generateApiKey } from "../../../../src/auth/apiKey";
import {
  requireSupabaseUser,
  SupabaseAuthError
} from "../../../../src/auth/requireSupabaseUser";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  name: z.string().min(1)
});

export async function POST(request: Request) {
  try {
    const user = await requireSupabaseUser(request);
    const payload = schema.parse(await request.json());
    const supabase = getSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json(
        { message: "Supabase is not configured" },
        { status: 500 }
      );
    }

    const apiKey = generateApiKey();
    const shopId = crypto.randomUUID();

    const { error } = await supabase.from("shops").insert({
      id: shopId,
      merchant_id: user.id,
      name: payload.name,
      api_key: apiKey,
      status: "active",
      created_at: new Date().toISOString()
    });

    if (error) {
      return NextResponse.json(
        { message: "Failed to create shop" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      shop: {
        id: shopId,
        name: payload.name,
        api_key: apiKey
      },
      api_key: apiKey
    });
  } catch (error) {
    if (error instanceof SupabaseAuthError) {
      return NextResponse.json(
        { message: error.message, code: error.code },
        { status: error.status }
      );
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Name is required" }, { status: 400 });
    }
    return NextResponse.json(
      { message: "Failed to create shop" },
      { status: 500 }
    );
  }
}
