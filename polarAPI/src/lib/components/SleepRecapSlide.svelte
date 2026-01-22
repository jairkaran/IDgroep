<script>
  export let top = "You had";              // "You slept" of "You had"
  export let big = "";                    // "7 hrs 51 min"
  export let label = "";                  // "Deep sleep"
  export let deltaMin = null;             // number, positief = longer, negatief = shorter
  export let showProgress = true;         // onderbalk (zoals concept)
  export let progress = 0.2;              // 0..1
  export let orb = "none";                // "earth" | "moon" | "none"
  export let orbSrc = "";                 // image path
  export let orbOpacity = 0.28;

  $: deltaText =
    typeof deltaMin === "number"
      ? `This is ${Math.abs(deltaMin)} min ${deltaMin < 0 ? "shorter" : "longer"} than normal`
      : "";

  $: deltaClass =
    typeof deltaMin === "number" ? (deltaMin < 0 ? "bad" : "good") : "";
</script>

<section class="slide">
  {#if orb !== "none" && orbSrc}
    <img class="orb {orb}" src={orbSrc} alt="" style={`opacity:${orbOpacity}`} />
  {/if}

  <div class="center">
    <div class="top">{top}</div>
    <div class="big">{big}</div>
    <div class="label">{label}</div>

    {#if typeof deltaMin === "number"}
      <div class={"delta " + deltaClass}>{deltaText}</div>
    {/if}
  </div>

  {#if showProgress}
    <div class="progressWrap">
      <div class="track">
        <div class="fill" style={`width:${Math.max(0, Math.min(1, progress)) * 100}%`}></div>
      </div>
      <div class="arrow">›</div>
    </div>
  {/if}
</section>

<style>
  .slide {
    height: 100dvh;
    scroll-snap-align: start;
    position: relative;
    display: grid;
    place-items: center;
  }

  .center {
    text-align: center;
    width: min(520px, 92vw);
    color: rgba(255,255,255,0.92);
    padding: 24px 18px 34px;
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

  .label {
    font-size: 16px;
    margin-top: 6px;
    opacity: 0.92;
  }

  .delta {
    margin-top: 22px;
    font-size: 14px;
    opacity: 0.92;
  }

  .delta.good { color: rgba(120, 255, 170, 0.95); }
  .delta.bad  { color: rgba(255, 95, 95, 0.95); }

  .progressWrap {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 18px;
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    gap: 12px;
    padding: 0 22px;
  }

  .track {
    height: 14px;
    border-radius: 999px;
    border: 2px solid rgba(255,255,255,0.9);
    overflow: hidden;
    background: rgba(255,255,255,0.08);
  }

  .fill {
    height: 100%;
    border-radius: 999px;
    background: rgba(255,255,255,0.95);
  }

  .arrow {
    font-size: 26px;
    color: rgba(255,255,255,0.92);
    opacity: 0.9;
    transform: translateY(-1px);
  }

  .orb {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    pointer-events: none;
    user-select: none;
    filter: saturate(1.05);
  }

  .orb.earth {
    bottom: -60px;
    width: min(520px, 120vw);
  }

  .orb.moon {
    top: -40px;
    right: -40px;
    left: auto;
    transform: none;
    width: 220px;
  }
</style>
