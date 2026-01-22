import { redirect, error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { saveTokens } from '$lib/server/polarTokenStore.js';

function basicAuth(id, secret) {
  return 'Basic ' + Buffer.from(`${id}:${secret}`).toString('base64');
}

export async function GET({ url }) {
  const code = url.searchParams.get('code');
  if (!code) throw error(400, 'Missing code');

  const clientId = env.POLAR_CLIENT_ID;
  const clientSecret = env.POLAR_CLIENT_SECRET;
  const redirectUri = env.POLAR_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    console.log('ENV CHECK', { clientId, hasSecret: !!clientSecret, redirectUri });
    throw error(500, 'Missing POLAR env vars');
  }

  const body = new URLSearchParams();
  body.set('grant_type', 'authorization_code');
  body.set('code', code);
  body.set('redirect_uri', redirectUri);

  const res = await fetch('https://polarremote.com/v2/oauth2/token', {
    method: 'POST',
    headers: {
      Authorization: basicAuth(clientId, clientSecret),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body
  });

  const data = await res.json();
  if (!res.ok) {
    console.log('Token exchange failed:', data);
    throw error(res.status, 'Token exchange failed');
  }

  saveTokens({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    token_type: data.token_type,
    expires_in: data.expires_in,
    obtained_at: Date.now()
  });

  throw redirect(302, '/api/polar/register');
}
