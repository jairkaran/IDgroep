<script>
  import { page } from "$app/stores";

  import StarBackground from "$lib/components/StarBackground.svelte";
  import SleepSummary from "$lib/components/SleepSummary.svelte";
  import SleepStageBars from "$lib/components/SleepStageBars.svelte";

  import { addDays, formatDateLabel } from "$lib/utils/time.js";

  let sleep = null;
  let loading = false;
  let errorMsg = "";

  $: date = $page.params.date;

  async function loadSleep() {
    loading = true;
    errorMsg = "";
    sleep = null;

    try {
      const res = await fetch(`/api/bin/sleep/${date}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      sleep = await res.json();
    } catch (err) {
      errorMsg = err?.message ?? "Failed to load sleep data";
    } finally {
      loading = false;
    }
  }

  $: if (date) loadSleep();

  $: dateLabel = date ? formatDateLabel(date) : null;

  function goDay(delta) {
    const next = addDays(date, delta);
    window.location.href = `/day/${next}/detail`;
  }
</script>

<div class="screen">
  {#if sleep}
    <!-- Data driven sterrenlaag -->
    <StarBackground {sleep} seedKey={date} />
  {/if}

  <div class="content">
    <!-- Top navigation -->
    <div class="top">
      <button class="nav" on:click={() => goDay(-1)} aria-label="Previous day">
        ‹
      </button>

      <div class="date">
        <div class="weekday">{dateLabel?.weekday}</div>
        <div class="short">{dateLabel?.short}</div>
      </div>

      <button class="nav" on:click={() => goDay(1)} aria-label="Next day">
        ›
      </button>
    </div>

    {#if loading}
      <div class="state">Loading…</div>

    {:else if errorMsg}
      <div class="state error">{errorMsg}</div>

    {:else if sleep}
      <!-- Maan + percentages + tijden -->
      <SleepSummary {sleep} />

      <!-- Light / Deep / REM bars -->
      <SleepStageBars {sleep} />

    {:else}
      <div class="state">No data</div>
    {/if}
  </div>
</div>

<style>
  .screen {
    position: relative;
    min-height: 100vh;
    overflow: hidden;
    background:
      radial-gradient(circle at 50% 8%, rgba(120,110,255,0.25), rgba(0,0,0,0.95) 55%),
      linear-gradient(180deg, #050512, #000000);
  }

  .content {
    position: relative;
    z-index: 1;
    padding: 22px 18px 40px;
    display: grid;
    gap: 22px;
  }

  /* Top bar */
  .top {
    display: grid;
    grid-template-columns: 44px 1fr 44px;
    align-items: center;
    color: white;
    margin-bottom: 8px;
  }

  .nav {
    width: 44px;
    height: 44px;
    border-radius: 999px;
    border: none;
    background: rgba(255,255,255,0.12);
    color: white;
    font-size: 26px;
    cursor: pointer;
    display: grid;
    place-items: center;
  }

  .nav:hover {
    background: rgba(255,255,255,0.18);
  }

  .date {
    text-align: center;
    line-height: 1.15;
  }

  .weekday {
    font-size: 16px;
    font-weight: 700;
  }

  .short {
    font-size: 13px;
    opacity: 0.85;
    margin-top: 4px;
  }

  /* Loading / error */
  .state {
    padding: 40px 0;
    text-align: center;
    color: rgba(255,255,255,0.85);
  }

  .state.error {
    color: #ff9a9a;
  }
</style>
