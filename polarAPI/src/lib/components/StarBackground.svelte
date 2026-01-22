<script>
  // Star types:
  // small  = light sleep (light blue)
  // medium = deep sleep (clear/bright white)
  // big    = REM sleep (yellow star with points)

  export let seed = 'default';
  export let lightSeconds = 0;
  export let deepSeconds = 0;
  export let remSeconds = 0;

  // Optional: override total density (handig om het "meer sterren" gevoel snel te tunen)
  export let density = 1.0;

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  // Simple seeded RNG (deterministic)
  function xmur3(str) {
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) {
      h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    return function () {
      h = Math.imul(h ^ (h >>> 16), 2246822507);
      h = Math.imul(h ^ (h >>> 13), 3266489909);
      return (h ^= h >>> 16) >>> 0;
    };
  }

  function mulberry32(a) {
    return function () {
      let t = (a += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function makeStars() {
    const total = Math.max(1, lightSeconds + deepSeconds + remSeconds);

    const pLight = lightSeconds / total;
    const pDeep = deepSeconds / total;
    const pRem = remSeconds / total;

    // Baseline sterren: bewust "veel" (zoals concept)
    // Je kunt deze multipliers later nog hoger zetten als je nóg meer wilt.
    const BASE = Math.round(220 * density); // totaalgevoel
    const smallCount = clamp(Math.round(BASE * (0.55 + 0.65 * pLight)), 120, 520);
    const mediumCount = clamp(Math.round(BASE * (0.25 + 0.55 * pDeep)), 60, 360);
    const bigCount = clamp(Math.round(BASE * (0.08 + 0.35 * pRem)), 18, 160);

    const seedFn = xmur3(String(seed));
    const rand = mulberry32(seedFn());

    const stars = [];

    // helper: maak coords met iets meer dichtheid rondom het midden
    function sampleXY() {
      // mix uniform + centre bias
      const u = rand();
      const v = rand();
      const bias = rand() < 0.45;

      if (!bias) {
        return { x: u * 100, y: v * 100 };
      }

      // centre biased
      const cx = 50 + (u - 0.5) * 70;
      const cy = 50 + (v - 0.5) * 90;
      return { x: clamp(cx, 0, 100), y: clamp(cy, 0, 100) };
    }

    function twinkle() {
      // variatie in glinstering
      const dur = 2.2 + rand() * 3.8; // 2.2s - 6s
      const delay = rand() * 4.0; // 0 - 4s
      const maxOpacity = 0.45 + rand() * 0.55; // 0.45 - 1
      const scale = 0.85 + rand() * 0.4; // 0.85 - 1.25
      return { dur, delay, maxOpacity, scale };
    }

    // SMALL stars (light blue)
    for (let i = 0; i < smallCount; i++) {
      const { x, y } = sampleXY();
      const t = twinkle();
      const size = 1 + rand() * 1.6; // 1 - 2.6px
      stars.push({
        kind: 'small',
        x,
        y,
        size,
        ...t
      });
    }

    // MEDIUM stars (brighter white)
    for (let i = 0; i < mediumCount; i++) {
      const { x, y } = sampleXY();
      const t = twinkle();
      const size = 1.8 + rand() * 2.2; // 1.8 - 4px
      stars.push({
        kind: 'medium',
        x,
        y,
        size,
        ...t
      });
    }

    // BIG stars (yellow star shape with points)
    for (let i = 0; i < bigCount; i++) {
      const { x, y } = sampleXY();
      const t = twinkle();
      const size = 6 + rand() * 10; // 6 - 16px
      stars.push({
        kind: 'big',
        x,
        y,
        size,
        ...t
      });
    }

    return stars;
  }

  $: stars = makeStars();
</script>

<div class="sky" aria-hidden="true">
  {#each stars as s, i (i)}
    {#if s.kind === 'big'}
      <span
        class="star big"
        style="
          left: {s.x}%;
          top: {s.y}%;
          width: {s.size}px;
          height: {s.size}px;
          --twDur: {s.dur}s;
          --twDelay: {s.delay}s;
          --twMax: {s.maxOpacity};
          --twScale: {s.scale};
        "></span>
    {:else if s.kind === 'medium'}
      <span
        class="star medium"
        style="
          left: {s.x}%;
          top: {s.y}%;
          width: {s.size}px;
          height: {s.size}px;
          --twDur: {s.dur}s;
          --twDelay: {s.delay}s;
          --twMax: {s.maxOpacity};
          --twScale: {s.scale};
        "></span>
    {:else}
      <span
        class="star small"
        style="
          left: {s.x}%;
          top: {s.y}%;
          width: {s.size}px;
          height: {s.size}px;
          --twDur: {s.dur}s;
          --twDelay: {s.delay}s;
          --twMax: {s.maxOpacity};
          --twScale: {s.scale};
        "></span>
    {/if}
  {/each}
</div>

<style>
  .sky {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;

    /* géén witte gloed overlay */
    background: linear-gradient(180deg, rgba(12, 20, 44, 1) 0%, rgba(7, 10, 22, 1) 100%);
  }

  .star {
    position: absolute;
    transform: translate(-50%, -50%);
    animation: twinkle var(--twDur) ease-in-out infinite;
    animation-delay: var(--twDelay);
    will-change: transform, opacity;
  }

  /* Small: licht blauw, subtiel */
  .star.small {
    border-radius: 999px;
    background: rgba(150, 205, 255, 0.85);
  }

  /* Medium: helderder, iets duidelijker */
  .star.medium {
    border-radius: 999px;
    background: rgba(245, 248, 255, 0.95);
    box-shadow: 0 0 6px rgba(245, 248, 255, 0.25);
  }

  /* Big: geel met punten */
  .star.big {
    background: rgba(255, 220, 140, 0.95);
    clip-path: polygon(
      50% 0%,
      60% 35%,
      100% 50%,
      60% 65%,
      50% 100%,
      40% 65%,
      0% 50%,
      40% 35%
    );
    box-shadow: 0 0 10px rgba(255, 220, 140, 0.22);
  }

  @keyframes twinkle {
    0% {
      opacity: 0.35;
      transform: translate(-50%, -50%) scale(0.9);
    }
    50% {
      opacity: var(--twMax);
      transform: translate(-50%, -50%) scale(var(--twScale));
    }
    100% {
      opacity: 0.4;
      transform: translate(-50%, -50%) scale(0.95);
    }
  }
</style>
