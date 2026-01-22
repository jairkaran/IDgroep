<script>
  export let top = "You had";        // "You slept" of "You had"
  export let big = "";              // "7 hrs 51 min"
  export let label = "";            // "Deep sleep" / "REM sleep" / "of interruption"
  export let bottom = "";           // "tonight" (alleen bij total)
  export let deltaMin = null;       // number: + = longer, - = shorter, null = hide

  $: deltaDir = typeof deltaMin === "number" ? (deltaMin < 0 ? "shorter" : "longer") : "";
  $: deltaAbs = typeof deltaMin === "number" ? Math.abs(deltaMin) : 0;
  $: deltaClass = typeof deltaMin === "number" ? (deltaMin < 0 ? "bad" : "good") : "";
</script>

<section class="slide">
  <div class="center">
    <div class="top">{top}</div>

    <div class="big">{big}</div>

    {#if bottom}
      <div class="bottom">{bottom}</div>
    {:else}
      <div class="label">{label}</div>
    {/if}

    {#if typeof deltaMin === "number"}
      <div class="delta">
        <span class="prefix">This was </span>
        <span class={"mid " + deltaClass}>{deltaAbs} min {deltaDir}</span>
        <span class="suffix"> than normal</span>
      </div>
    {/if}
  </div>
</section>

<style>
  .slide {
    height: 100dvh;
    scroll-snap-align: start;
    display: grid;
    place-items: center;
    position: relative;
  }

  .center {
    width: min(520px, 92vw);
    text-align: center;
    color: rgba(255,255,255,0.92);
    padding: 26px 18px 70px; /* ruimte voor progress bar */
  }

  .top {
    font-size: 16px;
    opacity: 0.9;
    margin-bottom: 8px;
  }

  .big {
    font-size: 42px;
    font-weight: 760;
    letter-spacing: -0.4px;
    line-height: 1.05;
  }

  .label,
  .bottom {
    font-size: 16px;
    margin-top: 6px;
    opacity: 0.92;
  }

  .delta {
    margin-top: 26px;
    font-size: 14px;
    opacity: 0.95;
  }

  .mid.good { color: rgba(120, 255, 170, 0.95); }
  .mid.bad  { color: rgba(255, 95, 95, 0.95); }
</style>
