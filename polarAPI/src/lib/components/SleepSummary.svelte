<script>
  import { formatTimeLocal, secondsToHHMM } from "$lib/utils/time.js";

  export let sleep; // jouw JSON object

  $: rechargePct = sleep?.sleep_score ?? 0;

  $: startLabel = sleep?.sleep_start_time ? formatTimeLocal(sleep.sleep_start_time) : "--:--";
  $: endLabel = sleep?.sleep_end_time ? formatTimeLocal(sleep.sleep_end_time) : "--:--";

  $: totalSeconds =
    (sleep?.light_sleep ?? 0) + (sleep?.deep_sleep ?? 0) + (sleep?.rem_sleep ?? 0);

  $: totalLabel = secondsToHHMM(totalSeconds);
</script>

<div class="summary">
  <div class="moonWrap">
    <div class="moon" aria-hidden="true"></div>
    <div class="moonText">
      <div class="pct">{rechargePct}%</div>
      <div class="sub">Recharged</div>
    </div>
  </div>

  <div class="timeline">
    <div class="timeBlock">
      <div class="time">{startLabel}</div>
      <div class="label">Begin sleep</div>
    </div>

    <div class="line" aria-hidden="true">
      <span class="dot left"></span>
      <span class="dot right"></span>
    </div>

    <div class="timeBlock right">
      <div class="time">{endLabel}</div>
      <div class="label">End sleep</div>
    </div>
  </div>

  <div class="total">
    <div class="totalLabel">Total sleep:</div>
    <div class="totalValue">{totalLabel}</div>
  </div>
</div>

<style>
  .summary {
    display: grid;
    gap: 18px;
  }

  .moonWrap {
    position: relative;
    width: 240px;
    height: 240px;
    margin: 0 auto;
    display: grid;
    place-items: center;
  }

  .moon {
    width: 200px;
    height: 200px;
    border-radius: 999px;
    background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.35), rgba(255,255,255,0.08) 55%, rgba(0,0,0,0.35) 80%),
                radial-gradient(circle at 40% 50%, rgba(255,255,255,0.12), rgba(0,0,0,0.55));
    box-shadow: 0 18px 60px rgba(0,0,0,0.45);
    filter: saturate(0.9) contrast(1.05);
  }

  .moonText {
    position: absolute;
    text-align: center;
    line-height: 1.1;
  }

  .pct {
    font-size: 44px;
    font-weight: 700;
    color: white;
    letter-spacing: 0.5px;
  }

  .sub {
    font-size: 16px;
    opacity: 0.9;
    color: white;
  }

  .timeline {
    display: grid;
    grid-template-columns: 1fr 120px 1fr;
    align-items: center;
    gap: 12px;
    color: white;
  }

  .timeBlock {
    display: grid;
    gap: 4px;
  }

  .timeBlock.right {
    text-align: right;
  }

  .time {
    font-size: 16px;
    font-weight: 600;
  }

  .label {
    font-size: 12px;
    opacity: 0.8;
  }

  .line {
    position: relative;
    height: 2px;
    background: rgba(255,255,255,0.35);
    border-radius: 999px;
  }

  .dot {
    position: absolute;
    top: 50%;
    width: 8px;
    height: 8px;
    transform: translateY(-50%);
    border-radius: 999px;
    background: rgba(255,255,255,0.9);
  }

  .dot.left { left: -2px; }
  .dot.right { right: -2px; }

  .total {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    color: white;
  }

  .totalLabel {
    font-size: 14px;
    opacity: 0.9;
  }

  .totalValue {
    font-size: 18px;
    font-weight: 700;
  }
</style>
