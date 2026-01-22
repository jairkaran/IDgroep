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
    return d.toLocaleDateString("nl-NL", { day: "numeric", month: "numeric", year: "numeric" });
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
    if (typeof s.sleep_charge === "number") return clamp(Math.round((s.sleep_charge / 5) * 100), 0, 100);
    return 0;
  }

  $: date = $page.params.date ?? "2025-12-02";

  async function loadSleep(forDate) {
    loading = true;
    errorMsg = "";
    sleep = null;

    try {
      const res = await fetch(`/api/bin/sleep/${forDate}`, { cache: "no-store" });
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

  $: if (date) loadSleep(date);

  $: pct = rechargePercent(sleep);

  $: lightSeconds = sleep?.light_sleep ?? 0;
  $: deepSeconds = sleep?.deep_sleep ?? 0;
  $: remSeconds = sleep?.rem_sleep ?? 0;
  $: totalSeconds = (lightSeconds + deepSeconds + remSeconds) || 0;

  const widthPct = (part) => {
    if (!totalSeconds) return 0;
    return clamp((part / totalSeconds) * 100, 0, 100);
  };

  async function goPrev() {
    await goto(`/day/${addDays(date, -1)}/detail`, { invalidateAll: true });
  }

  async function goNext() {
    await goto(`/day/${addDays(date, +1)}/detail`, { invalidateAll: true });
  }

  async function goRecap() {
    await goto(`/day/${date}/recap`, { invalidateAll: true });
  }

  async function goStars() {
    await goto(`/day/${date}/stars`, { invalidateAll: true });
  }
</script>

<div class="page">
  <StarBackground {lightSeconds} {deepSeconds} {remSeconds} />

  <div class="content">
    <button class="corner left" on:click={goRecap} aria-label="Go to recap">↺</button>
    <button class="corner right" on:click={goStars} aria-label="Go to stars">★</button>

    {#if loading}
      <div class="state">Loading…</div>
    {:else if errorMsg}
      <div class="state error">{errorMsg}</div>
    {:else}
      <div class="moonWrap">
        <MoonGauge percent={pct} size={190} label="Recharged" moonSrc="/moon.png" />
      </div>
    {/if}
  </div>

  <!-- ✅ Bottom sheet met data + pijlen + datum -->
  <div class="bottomSheet">
    {#if loading}
      <div class="sheetState">Loading…</div>
    {:else if errorMsg}
      <div class="sheetState error">{errorMsg}</div>
    {:else}
      <div class="sheetInner">
        <div class="sheetTop">
          <div class="sheetTitle">Total sleep:</div>
          <div class="sheetTotal">{secondsToHhMm(totalSeconds)}</div>
        </div>

        <div class="stageRow">
          <div class="stageLeft">
            <div class="stageLabel">Light Sleep:</div>
          </div>
          <div class="stageRight">
            <div class="stageValue">{secondsToHhMm(lightSeconds)}</div>
          </div>
          <div class="stageBar">
            <span class="seg light" style={`width:${widthPct(lightSeconds)}%`}></span>
          </div>
        </div>

        <div class="stageRow">
          <div class="stageLeft">
            <div class="stageLabel">Deep sleep:</div>
          </div>
          <div class="stageRight">
            <div class="stageValue">{secondsToHhMm(deepSeconds)}</div>
          </div>
          <div class="stageBar">
            <span class="seg deep" style={`width:${widthPct(deepSeconds)}%`}></span>
          </div>
        </div>

        <div class="stageRow">
          <div class="stageLeft">
            <div class="stageLabel">REM Sleep:</div>
          </div>
          <div class="stageRight">
            <div class="stageValue">{secondsToHhMm(remSeconds)}</div>
          </div>
          <div class="stageBar">
            <span class="seg rem" style={`width:${widthPct(remSeconds)}%`}></span>
          </div>
        </div>

        <div class="timesRow">
          <div class="timeItem">
            <div class="timeLabel">Begin sleep</div>
            <div class="timeVal">{timeFromIso(sleep?.sleep_start_time)}</div>
          </div>
          <div class="timeItem right">
            <div class="timeLabel">End sleep</div>
            <div class="timeVal">{timeFromIso(sleep?.sleep_end_time)}</div>
          </div>
        </div>

        <div class="navRow">
          <button class="bbNav" on:click={goPrev} aria-label="Vorige dag">‹</button>

          <div class="bbDate">
            <div class="bbWeekday">{weekdayLabel(date)}</div>
            <div class="bbDay">{prettyDate(date)}</div>
          </div>

          <button class="bbNav" on:click={goNext} aria-label="Volgende dag">›</button>
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
    padding: 22px 18px 260px; /* ruimte voor sheet */
    color: rgba(255, 255, 255, 0.92);
  }

  .corner {
    position: fixed;
    top: 16px;
    width: 42px;
    height: 42px;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.14);
    background: rgba(0, 0, 0, 0.22);
    color: rgba(255, 255, 255, 0.92);
    cursor: pointer;
    z-index: 50;
    font-size: 20px;
    display: grid;
    place-items: center;
  }
  .corner.left { left: 16px; }
  .corner.right { right: 16px; }

  .moonWrap {
    display: grid;
    place-items: center;
    margin-top: 52px;
  }

  .state {
    margin-top: 28px;
    text-align: center;
    opacity: 0.85;
  }
  .state.error { color: rgba(255, 140, 140, 0.95); }

  /* ✅ Bottom Sheet */
  .bottomSheet {
    position: fixed;
    left: 12px;
    right: 12px;
    bottom: 10px;
    z-index: 60;
    border-radius: 26px;
    background: rgba(0, 0, 0, 0.40);
    border: 1px solid rgba(255, 255, 255, 0.10);
    padding: 14px 14px 12px;
    color: rgba(255, 255, 255, 0.92);
  }

  .sheetState {
    text-align: center;
    padding: 12px 0;
    opacity: 0.85;
  }
  .sheetState.error { color: rgba(255, 140, 140, 0.95); }

  .sheetTop {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: baseline;
    margin-bottom: 10px;
  }

  .sheetTitle {
    font-size: 14px;
    opacity: 0.9;
  }

  .sheetTotal {
    font-size: 18px;
    font-weight: 750;
    color: rgba(120, 255, 170, 0.95);
  }

  .stageRow {
    display: grid;
    grid-template-columns: 1fr auto;
    grid-template-areas:
      "l v"
      "b b";
    row-gap: 8px;
    margin-top: 10px;
  }

  .stageLeft { grid-area: l; }
  .stageRight { grid-area: v; text-align: right; }

  .stageLabel {
    font-size: 13px;
    opacity: 0.9;
  }

  .stageValue {
    font-size: 13px;
    font-weight: 700;
    opacity: 0.95;
  }

  .stageBar {
    grid-area: b;
    height: 12px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.16);
    overflow: hidden;
  }

  .seg {
    height: 100%;
    display: block;
    border-radius: 999px;
  }

  .seg.light { background: rgba(140, 190, 255, 0.95); }
  .seg.deep  { background: rgba(150, 140, 255, 0.95); }
  .seg.rem   { background: rgba(255, 225, 140, 0.95); }

  .timesRow {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-top: 14px;
    padding-top: 12px;
    border-top: 1px solid rgba(255, 255, 255, 0.10);
  }

  .timeLabel {
    font-size: 11px;
    opacity: 0.75;
  }

  .timeVal {
    font-size: 13px;
    margin-top: 3px;
    font-weight: 650;
  }

  .timeItem.right { text-align: right; }

  /* ✅ Nav row binnen sheet */
  .navRow {
    display: grid;
    grid-template-columns: 56px 1fr 56px;
    align-items: center;
    margin-top: 12px;
    padding-top: 10px;
    border-top: 1px solid rgba(255, 255, 255, 0.10);
  }

  .bbNav {
    width: 44px;
    height: 44px;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.14);
    background: rgba(0, 0, 0, 0.18);
    color: rgba(255, 255, 255, 0.92);
    cursor: pointer;
    font-size: 22px;
    display: grid;
    place-items: center;
    justify-self: center;
  }

  .bbDate {
    text-align: center;
    line-height: 1.15;
  }

  .bbWeekday {
    font-size: 12px;
    opacity: 0.85;
    text-transform: lowercase;
  }

  .bbDay {
    font-size: 12px;
    opacity: 0.85;
    margin-top: 4px;
  }
</style>
