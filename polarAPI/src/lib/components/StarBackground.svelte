<script>
    import { mulberry32, hashStringToSeed } from "$lib/utils/seededRandom.js";

    export let sleep; // jouw sleep JSON
    export let seedKey = ""; // bijv. date "2025-12-01" voor stabiele layout
    export let density = 1; // optioneel, 1 = normaal, 1.2 = iets meer sterren

    function clamp(n, min, max) {
        return Math.max(min, Math.min(max, n));
    }

    // seconden -> minuten
    function mins(sec) {
        return Math.round((sec ?? 0) / 60);
    }

    // Sterren tellen obv slaapduur, met caps zodat het rustig blijft
    function computeCounts(s) {
        const lightM = mins(s?.light_sleep);
        const deepM = mins(s?.deep_sleep);
        const remM = mins(s?.rem_sleep);

        // 1 ster per X minuten (tweakbaar)
        const small = clamp(Math.round((lightM / 8) * density), 12, 120);
        const medium = clamp(Math.round((deepM / 10) * density), 8, 80);
        const large = clamp(Math.round((remM / 12) * density), 4, 45);

        return { small, medium, large };
    }

    function makeStars({ small, medium, large }, seedStr) {
        const seed = hashStringToSeed(seedStr || "default-seed");
        const rnd = mulberry32(seed);

        const stars = [];
        const pushStars = (count, kind) => {
            for (let i = 0; i < count; i++) {
                const x = rnd() * 100;
                const y = rnd() * 100;

                // Kleine variatie in helderheid en grootte binnen de categorie
                const twinkle = rnd(); // 0..1
                const alpha = 0.35 + rnd() * 0.55; // 0.35..0.9

                // Size ranges per type (in px)
                let size;
                if (kind === "small") size = 0.8 + rnd() * 1.4; // 0.8..2.2
                if (kind === "medium") size = 1.6 + rnd() * 2.2; // 1.6..3.8
                if (kind === "large") size = 2.6 + rnd() * 3.6; // 2.6..6.2

                // Soms een “glow” bij large sterren
                const glow = kind === "large" ? (rnd() < 0.35 ? 1 : 0) : 0;

                // Twinkle speed iets anders per type
                const speed =
                    kind === "small"
                        ? 2.8 + rnd() * 2.2
                        : kind === "medium"
                          ? 3.6 + rnd() * 2.8
                          : 4.4 + rnd() * 3.6;

                const delay = rnd() * 2.5;

                stars.push({
                    id: `${kind}-${i}`,
                    kind,
                    x,
                    y,
                    size,
                    alpha,
                    glow,
                    speed,
                    delay,
                    twinkle,
                });
            }
        };

        pushStars(small, "small");
        pushStars(medium, "medium");
        pushStars(large, "large");

        // Optioneel: beetje sorteren zodat grote sterren niet allemaal “bovenop” liggen
        // (niet echt overlap-preventie, wel visueel rustiger)
        return stars.sort((a, b) => a.size - b.size);
    }

    $: counts = computeCounts(sleep);
    $: stars = makeStars(counts, seedKey || sleep?.date || "");
</script>

<div class="stars" aria-hidden="true">
    {#each stars as s (s.id)}
        <span>
            class="star {s.kind}
            {s.glow ? "glow" : ""}" style=" left: {s.x}%; top: {s.y}%; width: {s.size}px;
            height: {s.size}px; opacity: {s.alpha}; animation-duration: {s.speed}s;
            animation-delay: {s.delay}s; "
        </span>
    {/each}
</div>

<style>
    .stars {
        position: absolute;
        inset: 0;
        overflow: hidden;
        pointer-events: none;
        z-index: 0;
    }

    .star {
        position: absolute;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.95);
        transform: translate(-50%, -50%);
        animation-name: twinkle;
        animation-iteration-count: infinite;
        animation-timing-function: ease-in-out;
    }

    .star.small {
        filter: blur(0px);
    }

    .star.medium {
        filter: blur(0.2px);
    }

    .star.large {
        filter: blur(0.25px);
    }

    .star.glow {
        box-shadow:
            0 0 10px rgba(255, 255, 255, 0.35),
            0 0 18px rgba(170, 160, 255, 0.18);
    }

    @keyframes twinkle {
        0% {
            transform: translate(-50%, -50%) scale(0.92);
            opacity: 0.45;
        }
        50% {
            transform: translate(-50%, -50%) scale(1.08);
            opacity: 0.95;
        }
        100% {
            transform: translate(-50%, -50%) scale(0.92);
            opacity: 0.45;
        }
    }
</style>
