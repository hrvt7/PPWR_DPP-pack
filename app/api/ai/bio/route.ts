import { NextResponse } from "next/server";
import { z } from "zod";
import { rewriteBio } from "../../../../lib/ai";

const schema = z.object({
  bio: z.string().min(1),
  tone: z.string().optional()
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = schema.parse(body);
    const rewritten = await rewriteBio(data.bio, data.tone ?? "clear");
    return NextResponse.json({ bio: rewritten });
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
