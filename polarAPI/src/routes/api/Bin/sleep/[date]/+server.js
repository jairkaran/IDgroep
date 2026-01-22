import fs from "fs";
import path from "path";
import { json, error } from "@sveltejs/kit";

export function GET({ params }) {
  const { date } = params;

  const filePath = path.resolve("src/lib/Bin/Sleep", `${date}.json`);

  if (!fs.existsSync(filePath)) {
    throw error(404, `No Bin sleep file for ${date}`);
  }

  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw);

    return json(
      { ok: true, source: "Bin", data },
      {
        headers: {
          "cache-control": "no-store"
        }
      }
    );
  } catch {
    throw error(500, `Invalid JSON for ${date}`);
  }
}
