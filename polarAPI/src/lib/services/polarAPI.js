export async function connectPolar() {
  // start OAuth redirect
  window.location.href = '/api/polar/authorize';
}

export async function registerPolar() {
  const res = await fetch('/api/polar/register');
  if (!res.ok) throw new Error('Register failed');
  return await res.json();
}

export async function getSleepDay(date) {
  const res = await fetch(`/api/polar/sleep/${date}`);
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || 'Sleep fetch failed');
  }
  return await res.json();
}
