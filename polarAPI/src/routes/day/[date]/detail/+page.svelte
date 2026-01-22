<script>
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import StarBackground from "$lib/components/StarBackground.svelte";
  import MoonGauge from "$lib/components/MoonGauge.svelte";


  let loading = true;
  let errorMsg = "";
  let sleep = null;

  function clamp(v, a, b) {
    return Math.max(a, Math.min(b, v));
  }

  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  function toIsoDate(d) {
    const yyyy = d.getFullYear();
    const mm = pad2(d.getMonth() + 1);
    const dd = pad2(d.getDate());
    return `${yyyy}-${mm}-${dd}`;
  }

  function addDays(dateStr, delta) {
    const d = new Date(`${dateStr}T00:00:00`);
    d.setDate(d.getDate() + delta);
    return toIsoDate(d);
  }

  function weekdayLabel(dateStr) {
    const d = new Date(`${dateStr}T00:00:00`);
    return d.toLocaleDateString("nl-NL", { weekday: "long" });
  }

  function prettyDate(dateStr) {
    const d = new Date(`${dateStr}T00:00:00`);
    return d.toLocaleDateString("nl-NL", {
      day: "numeric",
      month: "numeric",
      year: "numeric"
    });
  }

  function secondsToHhMm(seconds) {
    const s = Math.max(0, Number(seconds) || 0);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return `${pad2(h)}:${pad2(m)}`;
  }

  function timeFromIso(iso) {
    if (!iso) return "--:--";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "--:--";
    return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  }

  function rechargePercent(s) {
    if (!s) return 0;
    if (typeof s.sleep_score === "number") return clamp(Math.round(s.sleep_score), 0, 100);
    if (typeof s.sleep_charge === "number")
      return clamp(Math.round((s.sleep_charge / 5) * 100), 0, 100);
    return 0;
  }

  // ✅ datum altijd uit de route
  $: date = $page.params.date ?? "2025-12-02";

  async function loadSleep(forDate) {
    loading = true;
    errorMsg = "";
    sleep = null;

    try {
      const res = await fetch(`/api/bin/sleep/${forDate}`, {
        cache: "no-store"
      });
      if (!res.ok) throw new Error(`Sleep fetch failed (${res.status})`);
      const payload = await res.json();
      sleep = payload?.data ?? payload;
      if (!sleep) throw new Error("No sleep data found");
    } catch (e) {
      errorMsg = e?.message ?? "Unknown error";
    } finally {
      loading = false;
    }
  }

  // ✅ herladen bij datum-wijziging
  $: if (date) loadSleep(date);

  $: pct = rechargePercent(sleep);

  $: lightSeconds = sleep?.light_sleep ?? 0;
  $: deepSeconds = sleep?.deep_sleep ?? 0;
  $: remSeconds = sleep?.rem_sleep ?? 0;
  $: totalSeconds = (lightSeconds + deepSeconds + remSeconds) || 0;

  async function goPrev() {
    await goto(`/day/${addDays(date, -1)}/detail`, { invalidateAll: true });
  }

  async function goNext() {
    await goto(`/day/${addDays(date, +1)}/detail`, { invalidateAll: true });
  }

</script>

<div class="page">
  <StarBackground {lightSeconds} {deepSeconds} {remSeconds} />

  <div class="content">
    <div class="topbar">
      <button class="nav" on:click={goPrev}>‹</button>

      <div class="dateBlock">
        <div class="weekday">{weekdayLabel(date)}</div>
        <div class="date">{prettyDate(date)}</div>
      </div>

      <button class="nav" on:click={goNext}>›</button>
    </div>

    {#if loading}
      <div class="state">Loading…</div>
    {:else if errorMsg}
      <div class="state error">{errorMsg}</div>
    {:else}
      <div class="moonWrap">
  <MoonGauge percent={pct} size={180} label="Recharged" moonSrc="/moon.png" />
</div>


      <div class="card">
        <div class="row times">
          <div class="t">
            <div class="label">Begin sleep</div>
            <div class="value">{timeFromIso(sleep.sleep_start_time)}</div>
          </div>
          <div class="t right">
            <div class="label">End sleep</div>
            <div class="value">{timeFromIso(sleep.sleep_end_time)}</div>
          </div>
        </div>

        <div class="row barRow">
          <div class="label2">Light Sleep</div>
          <div class="bar">
            <div
              class="fill light"
              style={`width:${totalSeconds ? (lightSeconds / totalSeconds) * 100 : 0}%`}
            ></div>
          </div>
          <div class="dur">{secondsToHhMm(lightSeconds)}</div>
        </div>

        <div class="row barRow">
          <div class="label2">Deep Sleep</div>
          <div class="bar">
            <div
              class="fill deep"
              style={`width:${totalSeconds ? (deepSeconds / totalSeconds) * 100 : 0}%`}
            ></div>
          </div>
          <div class="dur">{secondsToHhMm(deepSeconds)}</div>
        </div>

        <div class="row barRow">
          <div class="label2">REM Sleep</div>
          <div class="bar">
            <div
              class="fill rem"
              style={`width:${totalSeconds ? (remSeconds / totalSeconds) * 100 : 0}%`}
            ></div>
          </div>
          <div class="dur">{secondsToHhMm(remSeconds)}</div>
        </div>

        <div class="row total">
          <div class="label2">Total sleep</div>
          <div class="dur strong">{secondsToHhMm(totalSeconds)}</div>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .page {
    position: relative;
    min-height: 100dvh;
    overflow: hidden;
  }

  .content {
    position: relative;
    z-index: 1;
    padding: 22px 18px 24px;
    color: rgba(255,255,255,0.92);
  }

  .topbar {
    display: grid;
    grid-template-columns: 44px 1fr 44px;
    align-items: center;
    margin-top: 8px;
  }

  .nav {
    width: 40px;
    height: 40px;
    border-radius: 999px;
    border: 1px solid rgba(255,255,255,0.10);
    background: rgba(0,0,0,0.22);
    color: white;
    font-size: 20px;
    cursor: pointer;
  }

  .dateBlock {
    text-align: center;
  }

  .weekday,
  .date {
    font-size: 12px;
    opacity: 0.85;
  }

  .moonWrap {
    display: grid;
    place-items: center;
    margin: 18px 0;
  }

  .card {
    margin: 0 auto;
    width: min(420px, 92vw);
    border-radius: 18px;
    padding: 14px;
    background: rgba(0,0,0,0.28);
    border: 1px solid rgba(255,255,255,0.10);
  }

  .row {
    display: grid;
    gap: 10px;
    margin-top: 10px;
  }

  .times {
    grid-template-columns: 1fr 1fr;
  }

  .t.right {
    text-align: right;
  }

  .barRow {
    grid-template-columns: 92px 1fr 56px;
    align-items: center;
  }

  .bar {
    height: 10px;
    border-radius: 999px;
    background: rgba(255,255,255,0.10);
    overflow: hidden;
  }

  .fill {
  height: 100%;
  display: block;
  border-radius: 999px;
}


  .fill.light { background: rgba(140,190,255,0.95); }
  .fill.deep  { background: rgba(150,140,255,0.95); }
  .fill.rem   { background: rgba(255,225,140,0.95); }

  .dur {
    text-align: right;
    font-size: 12px;
  }

  .state {
    margin-top: 28px;
    text-align: center;
  }

  .state.error {
    color: rgba(255,140,140,0.95);
  }
</style>
