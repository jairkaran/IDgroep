<script>
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import StarsGallery from "$lib/components/StarsGallery.svelte";

  let loading = true;
  let errorMsg = "";
  let sleep = null;

  $: date = $page.params.date ?? "2025-12-02";

  function weekdayLabel(dateStr) {
    const d = new Date(`${dateStr}T00:00:00`);
    return d.toLocaleDateString("nl-NL", { weekday: "long" });
  }

  function prettyDate(dateStr) {
    const d = new Date(`${dateStr}T00:00:00`);
    return d.toLocaleDateString("nl-NL", { day: "numeric", month: "numeric", year: "numeric" });
  }

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

  async function goBack() {
    await goto(`/day/${date}/recap`, { invalidateAll: true });
  }
</script>

<div class="page">
  <button class="close" aria-label="Back" on:click={goBack}>×</button>

  {#if loading}
    <div class="state">Loading…</div>
  {:else if errorMsg}
    <div class="state error">{errorMsg}</div>
  {:else}
    <StarsGallery sleep={sleep} dateStr={`${weekdayLabel(date)} ${prettyDate(date)}`} />
  {/if}
</div>

<style>
  .page {
    position: relative;
    min-height: 100dvh;
  }

  .close {
    position: fixed;
    top: 16px;
    left: 16px;
    z-index: 50;
    width: 42px;
    height: 42px;
    border-radius: 999px;
    border: 1px solid rgba(255,255,255,0.14);
    background: rgba(0,0,0,0.24);
    color: rgba(255,255,255,0.92);
    font-size: 26px;
    line-height: 1;
    cursor: pointer;
  }

  .state {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    background: linear-gradient(to bottom, #0b1024 0%, #070c1d 50%, #020617 100%);
    color: rgba(255,255,255,0.85);
  }

  .state.error {
    color: rgba(255, 160, 160, 0.95);
  }
</style>
