import { json, error } from "@sveltejs/kit";

const files = import.meta.glob("$lib/bin/sleep/*.json", { eager: true });

function pickDateFile(date) {
  const suffix = `/${date}.json`;
  const key = Object.keys(files).find((k) => k.endsWith(suffix));
  if (!key) return null;

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
