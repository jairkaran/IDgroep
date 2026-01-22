// import { redirect, error } from '@sveltejs/kit';
// import { env } from '$env/dynamic/private';

// export function GET() {
//   const clientId = env.POLAR_CLIENT_ID;
//   const redirectUri = env.POLAR_REDIRECT_URI;

//   if (!clientId || !redirectUri) {
//     console.log('ENV CHECK', { clientId, redirectUri });
//     throw error(500, 'Missing POLAR env vars');
//   }

//   const url =
//     `https://flow.polar.com/oauth2/authorization` +
//     `?response_type=code` +
//     `&client_id=${encodeURIComponent(clientId)}` +
//     `&redirect_uri=${encodeURIComponent(redirectUri)}`;

//   throw redirect(302, url);
// }
