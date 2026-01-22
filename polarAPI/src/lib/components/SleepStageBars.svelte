<script>
  export let sleep = null;

  function fmtHM(seconds) {
    if (!seconds || seconds <= 0) return '0 hrs 0 min';
    const h = Math.floor(seconds / 3600);
    const m = Math.round((seconds % 3600) / 60);
    return `${h} hrs ${m} min`;
  }

  function pct(part, total) {
    if (!total) return 0;
    return Math.max(0, Math.min(100, (part / total) * 100));
  }

  $: total = sleep ? (sleep.light_sleep + sleep.deep_sleep + sleep.rem_sleep) : 0;

  $: lightPct = pct(sleep?.light_sleep ?? 0, total);
  $: deepPct = pct(sleep?.deep_sleep ?? 0, total);
  $: remPct = pct(sleep?.rem_sleep ?? 0, total);
</script>

<div class="wrap">
  <div class="row">
    <div class="left">
      <div class="k">Light sleep:</div>
      <div class="v">{fmtHM(sleep?.light_sleep ?? 0)}</div>
    </div>
    <div class="bar">
      <span class="fill light" style="width:{lightPct}%"></span>
    </div>
  </div>

  <div class="row">
    <div class="left">
      <div class="k">Deep sleep:</div>
      <div class="v">{fmtHM(sleep?.deep_sleep ?? 0)}</div>
    </div>
    <div class="bar">
      <span class="fill deep" style="width:{deepPct}%"></span>
    </div>
  </div>

  <div class="row">
    <div class="left">
      <div class="k">REM sleep:</div>
      <div class="v">{fmtHM(sleep?.rem_sleep ?? 0)}</div>
    </div>
    <div class="bar">
      <span class="fill rem" style="width:{remPct}%"></span>
    </div>
  </div>

  <div class="total">
    <div class="k">Total sleep:</div>
    <div class="v">{fmtHM(total)}</div>
  </div>
</div>

<style>
  .wrap {
    display: grid;
    gap: 10px;
  }

  .row {
    display: grid;
    grid-template-columns: 1fr 1.2fr;
    align-items: center;
    gap: 12px;
  }

  .left {
    display: flex;
    align-items: baseline;
    gap: 8px;
    color: rgba(255, 255, 255, 0.92);
  }

  .k {
    font-size: 13px;
    opacity: 0.9;
  }

  .v {
    font-size: 13px;
    font-weight: 700;
    opacity: 0.95;
  }

  .bar {
    height: 10px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.12);
    overflow: hidden;
  }

  .fill {
    height: 100%;
    display: block;
    border-radius: 999px;
  }

  .fill.light {
    background: rgba(145, 205, 255, 0.85);
    box-shadow: 0 0 16px rgba(145, 205, 255, 0.22);
  }

  .fill.deep {
    background: rgba(165, 155, 255, 0.9);
    box-shadow: 0 0 16px rgba(165, 155, 255, 0.22);
  }

  .fill.rem {
    background: rgba(255, 220, 140, 0.9);
    box-shadow: 0 0 18px rgba(255, 220, 140, 0.25);
  }

  .total {
    display: flex;
    align-items: baseline;
    gap: 8px;
    margin-top: 2px;
    color: rgba(255, 255, 255, 0.92);
  }
</style>
