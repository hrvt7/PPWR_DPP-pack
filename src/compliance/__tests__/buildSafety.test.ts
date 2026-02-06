import { describe, expect, it } from "vitest";
import fs from "fs";
import path from "path";

const APP_DIR = path.resolve(process.cwd(), "app");

function listFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).flatMap((entry) => {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) return listFiles(full);
    if (stat.isFile()) return [full];
    return [];
  });
}

describe("Build safety", () => {
  it("does not import server-only modules in client components", () => {
    const files = listFiles(APP_DIR).filter((file) => file.endsWith(".tsx"));
    const violations: string[] = [];
    for (const file of files) {
      const content = fs.readFileSync(file, "utf8");
      if (!content.includes("\"use client\"") && !content.includes("'use client'")) {
        continue;
      }
      if (content.includes("lib/supabase") || content.includes("src/compliance")) {
        violations.push(file);
      }
    }
    expect(violations).toEqual([]);
  });
});
