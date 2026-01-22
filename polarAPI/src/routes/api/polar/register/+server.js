import { json, error } from '@sveltejs/kit';
import { getTokens, saveUserId } from '$lib/server/polarTokenStore.js';

export async function GET() {
  const tokens = getTokens();
  if (!tokens?.access_token) throw error(401, 'No access token. Connect Polar first.');

  // Users endpoint zit onder /v3/users. :contentReference[oaicite:7]{index=7}
  const res = await fetch('https://www.polaraccesslink.com/v3/users', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${tokens.access_token}`,
      'Content-Type': 'application/json'
    },
    // Polar vraagt meestal om "member-id" (jouw user id in je eigen systeem).
    // Voor jou: gebruik een vaste string tijdens dev.
    body: JSON.stringify({ 'member-id': 'local-dev-user' })
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.log('Register failed:', data);
    throw error(res.status, 'Register user failed');
  }

  // Response bevat doorgaans een user-id die je later gebruikt bij sommige endpoints
  if (data?.user_id) saveUserId(data.user_id);

  return json({ ok: true, registered: data });
}
