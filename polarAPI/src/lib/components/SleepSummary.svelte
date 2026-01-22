<script>
  export let sleep = null;

  function toLocalTime(iso) {
    if (!iso) return '--:--';
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '--:--';
    }
  }

  function fmtHM(seconds) {
    if (!seconds || seconds <= 0) return '0 hrs 0 min';
    const h = Math.floor(seconds / 3600);
    const m = Math.round((seconds % 3600) / 60);
    return `${h} hrs ${m} min`;
  }

  $: start = toLocalTime(sleep?.sleep_start_time);
  $: end = toLocalTime(sleep?.sleep_end_time);

  $: total = sleep ? (sleep.light_sleep + sleep.deep_sleep + sleep.rem_sleep) : 0;
  $: totalStr = fmtHM(total);
</script>

<div class="topline">
  <div class="time">
    <div class="t">{start}</div>
    <div class="lbl">Begin sleep</div>
  </div>

  <div class="divider"></div>

  <div class="time">
    <div class="t">{end}</div>
    <div class="lbl">End sleep</div>
  </div>
</div>

<div class="sub">
  <div class="k">Total sleep:</div>
  <div class="v">{totalStr}</div>
</div>

<style>
  .topline {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 12px;
    color: rgba(255, 255, 255, 0.92);
    margin-bottom: 10px;
  }

  .time {
    display: grid;
    gap: 2px;
  }

  .t {
    font-size: 14px;
    font-weight: 700;
  }

  .lbl {
    font-size: 11px;
    opacity: 0.8;
  }

  .divider {
    width: 40px;
    height: 2px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.22);
  }

  .sub {
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
    font-weight: 800;
  }
</style>
