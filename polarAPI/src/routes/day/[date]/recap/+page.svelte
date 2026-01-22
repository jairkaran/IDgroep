<script>
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import StarBackground from "$lib/components/StarBackground.svelte";
  import MoonGauge from "$lib/components/MoonGauge.svelte";
  import SleepRecapSlide from "$lib/components/SleepRecapSlide.svelte";

  let loading = true;
  let errorMsg = "";
  let sleep = null;

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const pad2 = (n) => String(n).padStart(2, "0");

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

  function secondsToHoursMinutes(seconds) {
    const s = Math.max(0, Number(seconds) || 0);
    const h = Math.floor(s / 3600);
    const m = Math.round((s % 3600) / 60);
    return { h, m };
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

  // Background stars can still react to stages
  $: lightSeconds = Number(sleep?.light_sleep) || 0;
  $: deepSeconds = Number(sleep?.deep_sleep) || 0;
  $: remSeconds = Number(sleep?.rem_sleep) || 0;

  $: totalSeconds = lightSeconds + deepSeconds + remSeconds;

  $: totalHM = secondsToHoursMinutes(totalSeconds);
  $: lightHM = secondsToHoursMinutes(lightSeconds);
  $: deepHM = secondsToHoursMinutes(deepSeconds);
  $: remHM = secondsToHoursMinutes(remSeconds);

  $: pct = rechargePercent(sleep);

  // Simple “recap insight” values (you can refine later)
  $: interruptionMin = Number(sleep?.sleep_interruptions_minutes) || Number(sleep?.interruptions_minutes) || 0;

  async function goPrev() {
    await goto(`/day/${addDays(date, -1)}/recap`, { invalidateAll: true });
  }

  async function goNext() {
    await goto(`/day/${addDays(date, +1)}/recap`, { invalidateAll: true });
  }

  async function goDetail() {
    await goto(`/day/${date}/detail`);
  }
</script>

<div class="page">
  <StarBackground {lightSeconds} {deepSeconds} {remSeconds} />

  <div class="topbar">
    <button class="nav" on:click={goPrev} aria-label="Vorige dag">‹</button>

    <div class="dateBlock">
      <div class="weekday">{weekdayLabel(date)}</div>
      <div class="date">{prettyDate(date)}</div>
    </div>

    <button class="nav" on:click={goNext} aria-label="Volgende dag">›</button>
  </div>

  {#if loading}
    <div class="state">Loading…</div>
  {:else if errorMsg}
    <div class="state error">{errorMsg}</div>
  {:else}
    <main class="recap">
      <SleepRecapSlide
        title="Your sleep"
        big={`${totalHM.h} hrs ${totalHM.m} min`}
        sub="Tonight"
        note="Scroll down for your recap"
        accent="rgba(255,255,255,0.92)"
      />

      <section class="slide moonSlide">
        <div class="moonBlock">
          <MoonGauge percent={pct} size={220} label="Recharged" moonSrc="/moon.png" />
        </div>
        <div class="moonText">
          <div class="t1">Recharge</div>
          <div class="t2">{pct}%</div>
          <div class="t3">Scroll to see your stages</div>
        </div>
      </section>

      <SleepRecapSlide
        title="Light sleep"
        big={`${lightHM.h} hrs ${lightHM.m} min`}
        sub="Your body was recovering"
        accent="rgba(140,190,255,0.95)"
      />

      <SleepRecapSlide
        title="Deep sleep"
        big={`${deepHM.h} hrs ${deepHM.m} min`}
        sub="Physical recovery"
        accent="rgba(150,140,255,0.95)"
      />

      <SleepRecapSlide
        title="REM sleep"
        big={`${remHM.h} hrs ${remHM.m} min`}
        sub="Memory and processing"
        accent="rgba(255,225,140,0.95)"
      />

      <SleepRecapSlide
        title="Interruption"
        big={`${interruptionMin} min`}
        sub="Total awake time during the night"
        note="Open detail for the full breakdown"
        accent="rgba(255,120,120,0.95)"
      />

      <section class="slide endSlide">
        <div class="endCard">
          <div class="endTitle">Done</div>
          <div class="endSub">View your full sleep details</div>
          <button class="btn" on:click={goDetail}>Open detail</button>
        </div>
      </section>
    </main>
  {/if}
</div>

<style>
  .page {
    position: relative;
    min-height: 100dvh;
    overflow: hidden;
  }

  .topbar {
    position: fixed;
    z-index: 3;
    top: 10px;
    left: 0;
    right: 0;
    display: grid;
    grid-template-columns: 44px 1fr 44px;
    align-items: center;
    padding: 0 14px;
    pointer-events: none;
  }

  .nav {
    pointer-events: auto;
    width: 40px;
    height: 40px;
    border-radius: 999px;
    border: 1px solid rgba(255,255,255,0.10);
    background: rgba(0,0,0,0.22);
    color: rgba(255,255,255,0.95);
    font-size: 20px;
    cursor: pointer;
  }

  .dateBlock {
    pointer-events: none;
    text-align: center;
    color: rgba(255,255,255,0.92);
    line-height: 1.1;
  }

  .weekday {
    font-size: 12px;
    opacity: 0.85;
    text-transform: lowercase;
  }

  .date {
    font-size: 12px;
    opacity: 0.85;
    margin-top: 4px;
  }

  .recap {
    position: relative;
    z-index: 2;
    height: 100dvh;
    overflow-y: auto;
    scroll-snap-type: y mandatory;
    scroll-behavior: smooth;
  }

  .slide {
    height: 100dvh;
    scroll-snap-align: start;
    display: grid;
    place-items: center;
    position: relative;
  }

  .moonSlide {
    grid-template-rows: auto auto;
    align-content: center;
    gap: 18px;
  }

  .moonBlock {
    display: grid;
    place-items: center;
  }

  .moonText {
    text-align: center;
    color: rgba(255,255,255,0.92);
  }

  .t1 {
    font-size: 14px;
    opacity: 0.80;
  }

  .t2 {
    font-size: 34px;
    font-weight: 750;
    letter-spacing: -0.4px;
    margin-top: 4px;
  }

  .t3 {
    font-size: 13px;
    opacity: 0.72;
    margin-top: 8px;
  }

  .endSlide {
    padding-bottom: 24px;
  }

  .endCard {
    width: min(520px, 90vw);
    border-radius: 18px;
    padding: 18px 16px;
    background: rgba(0,0,0,0.28);
    border: 1px solid rgba(255,255,255,0.10);
    text-align: center;
    color: rgba(255,255,255,0.92);
  }

  .endTitle {
    font-size: 18px;
    font-weight: 700;
  }

  .endSub {
    margin-top: 8px;
    font-size: 13px;
    opacity: 0.80;
  }

  .btn {
    margin-top: 14px;
    padding: 10px 14px;
    border-radius: 999px;
    border: 1px solid rgba(255,255,255,0.14);
    background: rgba(0,0,0,0.25);
    color: rgba(255,255,255,0.92);
    cursor: pointer;
  }

  .btn:hover {
    background: rgba(0,0,0,0.33);
  }

  .state {
    position: relative;
    z-index: 2;
    margin-top: 88px;
    text-align: center;
    color: rgba(255,255,255,0.88);
  }

  .state.error {
    color: rgba(255,140,140,0.95);
  }
</style>
