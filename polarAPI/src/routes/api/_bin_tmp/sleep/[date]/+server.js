import { json, error } from "@sveltejs/kit";

// ✅ let op: 'sleep' (lowercase)
const files = import.meta.glob("$lib/bin/sleep/*.json", { eager: true });

export function GET({ params }) {
  const { date } = params;

  // vind exact het bestand dat eindigt op /YYYY-MM-DD.json
  const matchKey = Object.keys(files).find((p) => p.endsWith(`/${date}.json`));

  if (!matchKey) {
    throw error(404, `No sleep file for ${date}`);
  }

  // eager glob geeft modules terug: default export is de JSON
  const mod = files[matchKey];
  const data = mod?.default ?? mod;

  return json({ ok: true, source: matchKey, data }, { headers: { "cache-control": "no-store" } });
}
