export function secondsToHrsMin(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.round((sec % 3600) / 60);
  return `${h} hrs ${m} min`;
}

export function secondsToHHMM(sec) {
  const totalMin = Math.round(sec / 60);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function formatTimeLocal(iso) {
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

export function formatDateLabel(dateStr) {
  // dateStr: YYYY-MM-DD
  const d = new Date(`${dateStr}T00:00:00`);
  const weekday = d.toLocaleDateString(undefined, { weekday: "long" });
  const day = d.getDate();
  const month = d.getMonth() + 1;
  const year = d.getFullYear();
  return { weekday, short: `${day}-${month}-${year}` };
}

export function addDays(dateStr, deltaDays) {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() + deltaDays);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
