import { json, error } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';

export function GET({ params }) {
  const { date } = params; // YYYY-MM-DD

  // 👇 BIN map
  const filePath = path.resolve(
    'src/lib/Bin/sleep',
    `${date}.json`
  );

  if (!fs.existsSync(filePath)) {
    throw error(404, `No Bin sleep file for ${date}`);
  }

  const raw = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(raw);

  return json({
    ok: true,
    source: 'bin',
    date,
    data
  });
}
