<script>
    import { secondsToHrsMin } from "$lib/utils/time.js";

    export let sleep;

    // Polar hypnogram codes (zoals in jouw JSON)
    // 0 = awake, 1 = light, 3 = deep, 4 = rem
    const STAGE = {
        awake: 0,
        light: 1,
        deep: 3,
        rem: 4,
    };

    $: hypnoEntries = sleep?.hypnogram ? Object.entries(sleep.hypnogram) : [];

    // hypnogram keys zijn HH:MM strings, we mappen dat naar minutes since midnight
    function toMinutes(hhmm) {
        const [h, m] = hhmm.split(":").map(Number);
        return h * 60 + m;
    }

    // compacte segments maken zodat we geen 2000 losse blokjes renderen
    function buildSegments(entries) {
        if (!entries.length) return [];

        const sorted = entries
            .map(([t, v]) => ({ t, v, min: toMinutes(t) }))
            .sort((a, b) => a.min - b.min);

        const segs = [];
        let start = sorted[0].min;
        let prev = sorted[0].min;
        let val = sorted[0].v;

        for (let i = 1; i < sorted.length; i++) {
            const cur = sorted[i];
            const gap = cur.min - prev;

            // als tijd springt of waarde verandert, segment afsluiten
            if (cur.v !== val || gap > 10) {
                segs.push({ from: start, to: prev + 2, v: val });
                start = cur.min;
                val = cur.v;
            }
            prev = cur.min;
        }

        segs.push({ from: start, to: prev + 2, v: val });

        // totale range
        const minStart = segs[0]?.from ?? 0;
        const maxEnd = segs[segs.length - 1]?.to ?? 1;

        return segs.map((s) => ({
            ...s,
            leftPct: ((s.from - minStart) / (maxEnd - minStart)) * 100,
            widthPct: ((s.to - s.from) / (maxEnd - minStart)) * 100,
        }));
    }

    $: segments = buildSegments(hypnoEntries);

    function isStage(v, stage) {
        return v === stage;
    }

    function stageSegments(stageCode) {
        // render alleen stukken waar de fase gelijk is aan stageCode
        return segments.filter((s) => isStage(s.v, stageCode));
    }

    $: lightText = secondsToHrsMin(sleep?.light_sleep ?? 0);
    $: deepText = secondsToHrsMin(sleep?.deep_sleep ?? 0);
    $: remText = secondsToHrsMin(sleep?.rem_sleep ?? 0);
</script>

<div class="wrap">
    <div class="row">
        <div class="rowTop">
            <div class="name">Light Sleep:</div>
            <div class="value">{lightText}</div>
        </div>
        <div class="bar">
            {#each stageSegments(STAGE.light) as s (s.from + "-" + s.to)}
                <span
                    class="seg light"
                    style="left: {s.leftPct}%; width: {Math.max(
                        s.widthPct,
                        0.6,
                    )}%;"
                />
            {/each}
        </div>
    </div>

    <div class="row">
        <div class="rowTop">
            <div class="name">Deep sleep:</div>
            <div class="value">{deepText}</div>
        </div>
        <div class="bar">
            {#each stageSegments(STAGE.deep) as s (s.from + "-" + s.to)}
                <span>
                    class="seg deep" style="left: {s.leftPct}%; width: {Math.max(
                        s.widthPct,
                        0.6,
                    )}%;"
                </span>
            {/each}
        </div>
    </div>

    <div class="row">
        <div class="rowTop">
            <div class="name">REM Sleep:</div>
            <div class="value">{remText}</div>
        </div>
        <div class="bar">
            {#each stageSegments(STAGE.rem) as s (s.from + "-" + s.to)}
                <span>
                    class="seg rem" style="left: {s.leftPct}%; width: {Math.max(
                        s.widthPct,
                        0.6,
                    )}%;"
                </span>
            {/each}
        </div>
    </div>
</div>

<style>
    .wrap {
        display: grid;
        gap: 14px;
        color: white;
    }

    .row {
        display: grid;
        gap: 8px;
    }

    .rowTop {
        display: flex;
        gap: 8px;
        align-items: baseline;
        font-size: 14px;
    }

    .name {
        opacity: 0.9;
    }

    .value {
        font-weight: 700;
    }

    .bar {
        position: relative;
        height: 26px;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.08);
        overflow: hidden;
    }

    .seg {
        position: absolute;
        top: 3px;
        height: 20px;
        border-radius: 6px;
        opacity: 0.95;
    }

    .seg.light {
        background: rgba(170, 160, 255, 0.9);
    }

    .seg.deep {
        background: rgba(110, 90, 255, 0.9);
    }

    .seg.rem {
        background: rgba(120, 190, 255, 0.9);
    }
</style>
