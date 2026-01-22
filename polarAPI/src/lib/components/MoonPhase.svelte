<script>
  export let percent = 77;
  export let size = 128;
  export let moonSrc = "static/moon.png";

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  $: p = clamp(Number(percent) || 0, 0, 100) / 100;

  $: r = size / 2;
  $: dx = (p * 2 - 1) * r * 1.85;
  $: shadowOpacity = 0.78 - p * 0.38;

  $: uid = Math.random().toString(36).slice(2);
  $: clipId = `clip_${uid}`;
  $: shadowGradId = `shadowGrad_${uid}`;
  $: blurId = `blur_${uid}`;
</script>

<svg
  class="moon"
  width={size}
  height={size}
  viewBox={`0 0 ${size} ${size}`}
  aria-label="Moon phase"
>
  <defs>
    <clipPath id={clipId}>
      <circle cx={r} cy={r} r={r} />
    </clipPath>

    <radialGradient id={shadowGradId} cx="35%" cy="50%" r="70%">
      <stop offset="0%" stop-color="rgba(0,0,0,0.0)" />
      <stop offset="55%" stop-color={`rgba(0,0,0,${shadowOpacity * 0.65})`} />
      <stop offset="100%" stop-color={`rgba(0,0,0,${shadowOpacity})`} />
    </radialGradient>

    <filter id={blurId} x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="1.4" />
    </filter>
  </defs>

  <g clip-path={`url(#${clipId})`}>
    <image
      href={moonSrc}
      x="0"
      y="0"
      width={size}
      height={size}
      preserveAspectRatio="xMidYMid slice"
    />

    <circle
      cx={r + dx}
      cy={r}
      r={r * 1.18}
      fill={`url(#${shadowGradId})`}
      filter={`url(#${blurId})`}
    />

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

<style>
  .moon {
    display: block;
    border-radius: 999px;
    overflow: hidden;
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.4);
  }
</style>
