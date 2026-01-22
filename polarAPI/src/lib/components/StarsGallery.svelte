<script>
  export let sleep = null;        // verwacht polar sleep object met light_sleep/deep_sleep/rem_sleep
  export let dateStr = "";        // optioneel, alleen voor labels
  export let initialFilter = "all"; // "all" | "rem" | "deep" | "light"

  let filter = initialFilter;

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  function rng(seed) {
    let s = seed >>> 0;
    return () => {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  function fmtHM(seconds) {
    const s = Math.max(0, Number(seconds) || 0);
    const h = Math.floor(s / 3600);
    const m = Math.round((s % 3600) / 60);
    return `${h} hrs ${m} min`;
  }

  /**
   * Stars earned:
   * Houd dit simpel/consistent en “concept-like”.
   * 0.18 ster per minuut geeft waarden die dichtbij je Figma voorbeelden zitten.
   */
  function starsEarned(seconds) {
    const mins = Math.max(0, Math.round((Number(seconds) || 0) / 60));
    return clamp(Math.round(mins * 0.18), 0, 999);
  }

  function makeStars(seed, count, type) {
    const r = rng(seed);
    return Array.from({ length: count }, () => {
      const size =
        type === "small" ? 1 + r() * 1.6 :
        type === "medium" ? 2.2 + r() * 2.8 :
        6 + r() * 7;

      return {
        x: r() * 100,
        y: r() * 100,
        size,
        opacity:
          type === "small" ? 0.45 + r() * 0.35 :
          type === "medium" ? 0.65 + r() * 0.25 :
          0.90 + r() * 0.10,
        twinkle: 1.6 + r() * 3.0,
        drift: r() * 6
      };
    });
  }

  $: lightSec = sleep?.light_sleep ?? 0;
  $: deepSec  = sleep?.deep_sleep ?? 0;
  $: remSec   = sleep?.rem_sleep ?? 0;

  // earned sterren per type (dit bepaalt ook het aantal sterren in het veld)
  $: smallCount  = starsEarned(lightSec); // Light = kleine sterren
  $: mediumCount = starsEarned(deepSec);  // Deep = medium sterren
  $: bigCount    = starsEarned(remSec);   // REM = grote sterren

  $: totalStars = smallCount + mediumCount + bigCount;

  // vaste seed per dag (en per verdeling) zodat het “stabiel” blijft
  $: seed = Math.round(lightSec + deepSec * 3 + remSec * 7);

  $: smallStars  = makeStars(seed + 11, smallCount, "small");
  $: mediumStars = makeStars(seed + 37, mediumCount, "medium");
  $: bigStars    = makeStars(seed + 97, bigCount, "big");

  // helpers voor filter
  $: showSmall = filter === "all" || filter === "light";
  $: showMed   = filter === "all" || filter === "deep";
  $: showBig   = filter === "all" || filter === "rem";
</script>

<div class="wrap">
  <div class="metaTop">
    {#if dateStr}
      <div class="date">{dateStr}</div>
    {/if}

    <div class="title">
      You earned <span class="starsN">{totalStars} stars</span> tonight!
    </div>

    <div class="subline">
      <span class="pill mini">Light: {smallCount}</span>
      <span class="pill mini">Deep: {mediumCount}</span>
      <span class="pill mini">REM: {bigCount}</span>
    </div>
  </div>

  <div class="field" aria-label="Stars field">
    {#if showSmall}
      {#each smallStars as s}
        <span
          class="star small"
          style="
            left:{s.x}%;
            top:{s.y}%;
            width:{s.size}px;
            height:{s.size}px;
            opacity:{s.opacity};
            animation-duration:{s.twinkle}s;
            animation-delay:-{s.drift}s;"></span>
      {/each}
    {/if}

    {#if showMed}
      {#each mediumStars as s}
        <span
          class="star medium"
          style="
            left:{s.x}%;
            top:{s.y}%;
            width:{s.size}px;
            height:{s.size}px;
            opacity:{s.opacity};
            animation-duration:{s.twinkle}s;
            animation-delay:-{s.drift}s;"></span>
      {/each}
    {/if}

    {#if showBig}
      {#each bigStars as s}
        <span
          class="star big"
          style="
            left:{s.x}%;
            top:{s.y}%;
            width:{s.size}px;
            height:{s.size}px;
            opacity:{s.opacity};
            animation-duration:{s.twinkle}s;
            animation-delay:-{s.drift}s;"></span>
      {/each}
    {/if}
  </div>

  <div class="bottom">
    <div class="chips">
      <button class="pill" class:active={filter === "rem"} on:click={() => (filter = "rem")}>
        REM sleep
        <span class="miniCount">{bigCount}</span>
      </button>

      <button class="pill" class:active={filter === "deep"} on:click={() => (filter = "deep")}>
        Deep sleep
        <span class="miniCount">{mediumCount}</span>
      </button>

      <button class="pill" class:active={filter === "light"} on:click={() => (filter = "light")}>
        Light sleep
        <span class="miniCount">{smallCount}</span>
      </button>

      <button class="pill" class:active={filter === "all"} on:click={() => (filter = "all")}>
        All
      </button>
    </div>

    <div class="detailText">
      {#if filter === "rem"}
        You reached <b>{fmtHM(remSec)}</b> of REM sleep.
      {:else if filter === "deep"}
        You reached <b>{fmtHM(deepSec)}</b> of deep sleep.
      {:else if filter === "light"}
        You reached <b>{fmtHM(lightSec)}</b> of light sleep.
      {:else}
        Total sleep stages: <b>{fmtHM(lightSec + deepSec + remSec)}</b>.
      {/if}
    </div>
  </div>
</div>

<style>
  .wrap {
    position: relative;
    min-height: 100dvh;
    overflow: hidden;
    color: rgba(255,255,255,0.92);
    background: linear-gradient(to bottom, #0b1024 0%, #070c1d 50%, #020617 100%);
  }

  .metaTop {
    position: relative;
    z-index: 2;
    padding: 18px 18px 10px;
    text-align: center;
  }

  .date {
    font-size: 12px;
    opacity: 0.85;
    margin-bottom: 10px;
    text-transform: lowercase;
  }

  .title {
    font-size: 14px;
    opacity: 0.92;
  }

  .starsN {
    font-weight: 800;
    font-size: 22px;
    display: inline-block;
    margin-left: 6px;
  }

  .subline {
    margin-top: 10px;
    display: flex;
    justify-content: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .field {
    position: absolute;
    inset: 0;
    overflow: hidden;
    z-index: 1;
  }

  .star {
    position: absolute;
    transform: translate(-50%, -50%);
    animation-name: twinkle;
    animation-iteration-count: infinite;
    animation-direction: alternate;
    will-change: opacity, transform;
    pointer-events: none;
  }

  .star.small {
    border-radius: 999px;
    background: rgba(150, 205, 255, 0.95);
  }

  .star.medium {
    border-radius: 999px;
    background: rgba(215, 235, 255, 0.98);
    box-shadow: 0 0 6px rgba(200, 235, 255, 0.12);
  }

  .star.big {
    background: rgba(255, 232, 150, 0.98);
    clip-path: polygon(
      50% 0%,
      62% 34%,
      98% 36%,
      68% 58%,
      79% 92%,
      50% 72%,
      21% 92%,
      32% 58%,
      2% 36%,
      38% 34%
    );
    box-shadow: 0 0 10px rgba(255, 220, 130, 0.18);
  }

  @keyframes twinkle {
    from { opacity: 0.45; transform: translate(-50%, -50%) scale(0.85); }
    to   { opacity: 1;    transform: translate(-50%, -50%) scale(1.15); }
  }

  .bottom {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 18px;
    z-index: 3;
    display: grid;
    gap: 10px;
    padding: 0 18px;
  }

  .chips {
    display: flex;
    justify-content: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .pill {
    border: 1px solid rgba(255,255,255,0.14);
    background: rgba(0,0,0,0.22);
    color: rgba(255,255,255,0.92);
    border-radius: 999px;
    padding: 8px 12px;
    font-size: 12px;
    cursor: pointer;
    display: inline-flex;
    gap: 8px;
    align-items: center;
  }

  .pill.active {
    background: rgba(255,255,255,0.12);
    border-color: rgba(255,255,255,0.22);
  }

  .pill.mini {
    padding: 6px 10px;
    font-size: 11px;
  }

  .miniCount {
    opacity: 0.9;
    font-weight: 800;
  }

  .detailText {
    text-align: center;
    font-size: 12px;
    opacity: 0.88;
    background: rgba(0,0,0,0.18);
    border: 1px solid rgba(255,255,255,0.10);
    border-radius: 14px;
    padding: 10px 12px;
  }
</style>
