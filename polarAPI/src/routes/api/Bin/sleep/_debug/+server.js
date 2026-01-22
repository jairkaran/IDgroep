import { json } from "@sveltejs/kit";

const files = import.meta.glob("$lib/bin/sleep/*.json", { eager: true });

export function GET() {
  return json({
    count: Object.keys(files).length,
    keys: Object.keys(files).slice(0, 50) // eerste 50 is genoeg
  });
}
