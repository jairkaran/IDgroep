<script>
  // 0..100
  export let percent = 0;
  export let size = 170;
  export let label = "Recharged";

  // Pad naar je moon image (bijv. static/moon.png)
  export let moonSrc = "C:\Users\jkara\Documents\IDgroep\polarAPI\static\moon.png";

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  $: p = clamp(Number(percent) || 0, 0, 100) / 100;

  // SVG geometry
  $: r = size / 2;

  // Shadow circle shift: hoger p => shadow verder naar rechts => minder donker zichtbaar
  // Deze waarde bepaalt hoe “sterk” de curve is. 1.7–2.0 voelt meestal goed.
  $: dx = (p * 2 - 1) * r * 1.85;

  // Bij lage vulling wat donkerder, bij hoge vulling zachter
  $: shadowOpacity = 0.75 - p * 0.35; // 0.75..0.40

  // Unieke ids voor gradients/masks zodat meerdere gauges op 1 page veilig zijn
  $: uid = Math.random().toString(36).slice(2);
  $: clipId = `clip_${uid}`;
  $: shadowGradId = `shadowGrad_${uid}`;
  $: blurId = `blur_${uid}`;
</script>

<div class="wrap" style="width:{size}px; height:{size}px;">
  <svg
    class="svg"
    width={size}
    height={size}
    viewBox={`0 0 ${size} ${size}`}
    aria-label="Moon gauge"
  >
    <defs>
      <clipPath id={clipId}>
        <circle cx={r} cy={r} r={r} />
      </clipPath>

      <!-- Soft shadow gradient so the terminator edge feels realistic -->
      <radialGradient id={shadowGradId} cx="35%" cy="50%" r="70%">
        <stop offset="0%" stop-color="rgba(0,0,0,0.0)" />
        <stop offset="55%" stop-color={`rgba(0,0,0,${shadowOpacity * 0.65})`} />
        <stop offset="100%" stop-color={`rgba(0,0,0,${shadowOpacity})`} />
      </radialGradient>

      <filter id={blurId} x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="1.6" />
      </filter>
    </defs>

    <!-- Moon image -->
    <g clip-path={`url(#${clipId})`}>
      <image
        href={moonSrc}
        x="0"
        y="0"
        width={size}
        height={size}
        preserveAspectRatio="xMidYMid slice"
      />

      <!-- Dynamic shadow: a shifted circle with gradient + blur -->
      <circle
        cx={r + dx}
        cy={r}
        r={r * 1.18}
        fill={`url(#${shadowGradId})`}
        filter={`url(#${blurId})`}
      />

      <!-- Subtle rim light to match “real” moon contrast, not a glow -->
      <circle
        cx={r}
        cy={r}
        r={r - 0.5}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        stroke-width="1"
      />
    </g>
  </svg>

  <div class="text">
    <div class="pct">{Math.round(p * 100)}%</div>
    <div class="lbl">{label}</div>
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
    border-radius: 999px;
    overflow: hidden;

    /* geen glow, wel diepte */
    box-shadow: 0 10px 28px rgba(0, 0, 0, 0.35);
  }

  .text {
    position: absolute;
    text-align: center;
    color: rgba(255, 255, 255, 0.92);
    font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
    user-select: none;
    pointer-events: none;
  }

  .pct {
    font-size: 44px;
    line-height: 1;
    font-weight: 700;
    letter-spacing: 0.2px;
  }

  .lbl {
    margin-top: 4px;
    font-size: 14px;
    opacity: 0.9;
    letter-spacing: 0.2px;
  }
</style>
