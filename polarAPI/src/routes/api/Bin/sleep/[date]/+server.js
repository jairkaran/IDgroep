import { json, error } from "@sveltejs/kit";

// Bundelt alle JSON files tijdens build (werkt op Vercel)
const files = import.meta.glob("$lib/bin/sleep/*.json", { eager: true });

function pickDateFile(date) {
  // keys zijn bv: "/src/lib/bin/sleep/2025-12-01.json" (kan per setup iets verschillen)
  const targetSuffix = `/${date}.json`;
  const key = Object.keys(files).find((k) => k.endsWith(targetSuffix));
  if (!key) return null;

  // eager import geeft meestal { default: <json> } terug
  const mod = files[key];
  return mod?.default ?? mod;
}

export function GET({ params }) {
  const { date } = params;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw error(400, `Invalid date format: ${date}`);
  }

  const data = pickDateFile(date);
  if (!data) {
    throw error(404, `No bin sleep file for ${date}`);
  }

  return json({ ok: true, source: "bin", data }, {
    headers: { "cache-control": "no-store" }
  });
}
