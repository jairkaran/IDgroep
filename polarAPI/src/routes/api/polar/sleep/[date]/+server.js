import { json, error } from '@sveltejs/kit';
import { loadTokens } from '$lib/server/polarTokenStore.js';

// date format: YYYY-MM-DD
export async function GET({ params }) {
  const { date } = params;

  const tokens = loadTokens();
  if (!tokens?.access_token) throw error(401, 'No access token. Authorize first.');

  // Polar AccessLink v3 sleep endpoint
  // NOTE: Sleep is part of "SleepWise™" / "Sleep" resources in AccessLink 3.0
  // We fetch by date.
  const url = `https://www.polaraccesslink.com/v3/users/sleep/${date}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${tokens.access_token}`,
      Accept: 'application/json'
    }
  });

  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }

  if (!res.ok) {
    console.log('Sleep fetch failed:', res.status, data);
    throw error(res.status, data?.error || 'Sleep fetch failed');
  }

  return json({ ok: true, date, data });
}
