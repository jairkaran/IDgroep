<script>
  export let percent = 0;        // 0..100
  export let size = 180;
  export let moonSrc = "/moon.png";
  export let label = "Recharged";

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  $: p = clamp(percent, 0, 100) / 100;

  // Terminator position (0 = left, 1 = right)
  $: x = p * 100;

  // text sizes
  $: pctSize = Math.round(size * 0.20);
  $: lblSize = Math.round(size * 0.095);

  // unique ids
  const uid = Math.random().toString(36).slice(2);
</script>

<div
  class="wrap"
  style={`width:${size}px; height:${size}px; --pctSize:${pctSize}px; --lblSize:${lblSize}px`}
>
  <svg
    width={size}
    height={size}
    viewBox={`0 0 ${size} ${size}`}
    class="svg"
  >
    <defs>
      <!-- perfect circle mask -->
      <clipPath id={`clip-${uid}`}>
        <circle cx={size / 2} cy={size / 2} r={size / 2} />
      </clipPath>

      <!-- Figma-style terminator -->
<linearGradient id={`shade-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
  <stop offset={`${x - 2}%`} stop-color="rgba(6,12,32,0)" />
  <stop offset={`${x}%`} stop-color="rgba(6,12,32,0.88)" />
  <stop offset="100%" stop-color="rgba(6,12,32,0.96)" />
</linearGradient>


      <!-- subtle light rim on edge -->
      <linearGradient id={`rim-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset={`${x - 1}%`} stop-color="rgba(255,255,255,0)" />
        <stop offset={`${x}%`} stop-color="rgba(255,255,255,0.18)" />
        <stop offset={`${x + 1}%`} stop-color="rgba(255,255,255,0)" />
      </linearGradient>
    </defs>

    <g clip-path={`url(#clip-${uid})`}>
      <!-- moon -->
      <image
        href={moonSrc}
        width={size}
        height={size}
        preserveAspectRatio="xMidYMid slice"
      />

      <!-- dark side -->
      <rect
        width={size}
        height={size}
        fill={`url(#shade-${uid})`}
      />

      <!-- rim light -->
      <rect
        width={size}
        height={size}
        fill={`url(#rim-${uid})`}
        opacity="0.6"
      />
    </g>
  </svg>

  <div class="text">
    <div class="moonPct">{Math.round(p * 100)}%</div>
    <div class="moonLbl">{label}</div>
  </div>
</div>

<style>
  .wrap {
    position: relative;
    display: grid;
    place-items: center;
  }

  .svg {
    display: block;
    border-radius: 50%;
    overflow: hidden;
  }

  .text {
    position: absolute;
    text-align: center;
    color: rgba(255,255,255,0.92);
    pointer-events: none;
    font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
  }

  .moonPct {
    font-size: var(--pctSize);
    font-weight: 650;
    line-height: 1;
  }

  .moonLbl {
    font-size: var(--lblSize);
    opacity: 0.8;
    margin-top: 2px;
  }
</style>
