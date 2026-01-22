<script>
    import { onMount } from "svelte";
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import StarBackground from "$lib/components/StarBackground.svelte";
    import SleepRecapSlide from "$lib/components/SleepRecapSlide.svelte";

    let loading = true;
    let errorMsg = "";
    let sleep = null;

    let recapEl;

    // actieve slide index voor progress bar
    let activeIndex = 0;

    const pad2 = (n) => String(n).padStart(2, "0");
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

    function toIsoDate(d) {
        const yyyy = d.getFullYear();
        const mm = pad2(d.getMonth() + 1);
        const dd = pad2(d.getDate());
        return `${yyyy}-${mm}-${dd}`;
    }

    function addDays(dateStr, delta) {
        const d = new Date(`${dateStr}T00:00:00`);
        d.setDate(d.getDate() + delta);
        return toIsoDate(d);
    }

    function weekdayLabel(dateStr) {
        const d = new Date(`${dateStr}T00:00:00`);
        return d.toLocaleDateString("nl-NL", { weekday: "long" });
    }

    function prettyDate(dateStr) {
        const d = new Date(`${dateStr}T00:00:00`);
        return d.toLocaleDateString("nl-NL", {
            day: "numeric",
            month: "numeric",
            year: "numeric",
        });
    }

    function toHrsMin(seconds) {
        const s = Math.max(0, Number(seconds) || 0);
        const h = Math.floor(s / 3600);
        const m = Math.round((s % 3600) / 60);
        return `${h} hrs ${m} min`;
    }

    $: date = $page.params.date ?? "2025-12-02";

    async function loadSleep(forDate) {
        loading = true;
        errorMsg = "";
        sleep = null;

        try {
            const res = await fetch(`/api/bin/sleep/${forDate}`, {
                cache: "no-store",
            });
            if (!res.ok) throw new Error(`Sleep fetch failed (${res.status})`);
            const payload = await res.json();
            sleep = payload?.data ?? payload;
            if (!sleep) throw new Error("No sleep data found");
        } catch (e) {
            errorMsg = e?.message ?? "Unknown error";
        } finally {
            loading = false;

            // reset naar begin
            activeIndex = 0;
            if (recapEl) recapEl.scrollTo({ top: 0, behavior: "instant" });
        }
    }

    $: if (date) loadSleep(date);

    // seconds voor sterren
    $: lightSeconds = Number(sleep?.light_sleep) || 0;
    $: deepSeconds = Number(sleep?.deep_sleep) || 0;
    $: remSeconds = Number(sleep?.rem_sleep) || 0;

    $: totalSeconds = lightSeconds + deepSeconds + remSeconds;

    // interruption (min)
    $: interruptionMin =
        Number(sleep?.sleep_interruptions_minutes) ||
        Number(sleep?.interruptions_minutes) ||
        Number(sleep?.interruption_minutes) ||
        0;

    // aantal slides: 5 recap slides + 1 end slide
    $: slidesCount = 6;

    // progress bar vult per slide: 1/6 .. 6/6
    $: progress = slidesCount > 0 ? (activeIndex + 1) / slidesCount : 0;

    // placeholders voor "than normal" (later vervangen door baseline)
    const totalDelta = null;
    const deepDelta = null;
    const lightDelta = null;
    const remDelta = null;
    const interruptionDelta = null;

    function handleScroll() {
        if (!recapEl) return;
        const h = recapEl.clientHeight || 1;
        const idx = Math.round(recapEl.scrollTop / h);
        activeIndex = clamp(idx, 0, slidesCount - 1);
    }

    function scrollToIndex(idx) {
        if (!recapEl) return;
        const h = recapEl.clientHeight || 1;
        recapEl.scrollTo({ top: idx * h, behavior: "smooth" });
    }

    function scrollNext() {
        scrollToIndex(Math.min(slidesCount - 1, activeIndex + 1));
    }

    async function goPrev() {
        await goto(`/day/${addDays(date, -1)}/recap`, { invalidateAll: true });
    }

    async function goNext() {
        await goto(`/day/${addDays(date, +1)}/recap`, { invalidateAll: true });
    }

    async function goDetail() {
        await goto(`/day/${date}/detail`);
    }

    function openStars() {
        goto(`/day/${date}/stars`, { invalidateAll: true });
    }

    onMount(() => {
        // bij refresh op een gescrollde positie meteen goed zetten
        setTimeout(handleScroll, 0);
    });
</script>

<div class="page">
    <StarBackground {lightSeconds} {deepSeconds} {remSeconds} />

    <div class="topbar">
        <button class="nav" on:click={goPrev} aria-label="Vorige dag">‹</button>

        <div class="dateBlock">
            <div class="weekday">{weekdayLabel(date)}</div>
            <div class="date">{prettyDate(date)}</div>
        </div>

        <button class="nav" on:click={goNext} aria-label="Volgende dag"
            >›</button
        >
    </div>

    {#if loading}
        <div class="state">Loading…</div>
    {:else if errorMsg}
        <div class="state error">{errorMsg}</div>
    {:else}
        <main class="recap" bind:this={recapEl} on:scroll={handleScroll}>
            <section class="slideWrap">
                <SleepRecapSlide
                    top="You slept"
                    big={toHrsMin(totalSeconds)}
                    bottom="tonight"
                    deltaMin={totalDelta}
                />
            </section>

            <section class="slideWrap">
                <SleepRecapSlide
                    top="You had"
                    big={toHrsMin(deepSeconds)}
                    label="Deep sleep"
                    deltaMin={deepDelta}
                />
            </section>

            <section class="slideWrap">
                <SleepRecapSlide
                    top="You had"
                    big={toHrsMin(lightSeconds)}
                    label="Light sleep"
                    deltaMin={lightDelta}
                />
            </section>

            <section class="slideWrap">
                <SleepRecapSlide
                    top="You had"
                    big={toHrsMin(remSeconds)}
                    label="REM sleep"
                    deltaMin={remDelta}
                />
            </section>

            <section class="slideWrap">
                <SleepRecapSlide
                    top="You had"
                    big={`${interruptionMin} min`}
                    label="of interruption"
                    deltaMin={interruptionDelta}
                />
            </section>

            <!-- END SLIDE (zoals vorige versie) -->
            <section class="slideWrap endSlide">
                <div class="endCard">
                    <div class="endTitle">Your sleep details</div>
                    <div class="endSub">
                        View the full breakdown for this night
                    </div>
                    <button class="btn" on:click={goDetail}>Open detail</button>

                    <div class="starButton">
                        <button class="btn" on:click={openStars} aria-label="Stars">View your ★</button>
                    </div>
                </div>
            </section>
        </main>

        <!-- GLOBAL progress bar -->
        <div class="progressDock">
            <div class="track">
                <div
                    class="fill"
                    style={`width:${Math.max(0, Math.min(1, progress)) * 100}%`}
                ></div>
            </div>
            <button
                class="arrowBtn"
                on:click={scrollNext}
                aria-label="Next slide">›</button
            >
        </div>
    {/if}
</div>

<style>
    .page {
        position: relative;
        min-height: 100dvh;
        overflow: hidden;
    }

    .topbar {
        position: fixed;
        z-index: 4;
        top: 10px;
        left: 0;
        right: 0;
        display: grid;
        grid-template-columns: 44px 1fr 44px;
        align-items: center;
        padding: 0 14px;
        pointer-events: none;
    }

    .nav {
        pointer-events: auto;
        width: 40px;
        height: 40px;
        border-radius: 999px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        background: rgba(0, 0, 0, 0.22);
        color: rgba(255, 255, 255, 0.95);
        font-size: 20px;
        cursor: pointer;
    }

    .dateBlock {
        pointer-events: none;
        text-align: center;
        color: rgba(255, 255, 255, 0.92);
        line-height: 1.1;
    }

    .weekday {
        font-size: 12px;
        opacity: 0.85;
        text-transform: lowercase;
    }

    .date {
        font-size: 12px;
        opacity: 0.85;
        margin-top: 4px;
    }

    .recap {
        position: relative;
        z-index: 2;
        height: 100dvh;
        overflow-y: auto;
        scroll-snap-type: y mandatory;
        scroll-behavior: smooth;
    }

    .slideWrap {
        height: 100dvh;
        scroll-snap-align: start;
        display: grid;
    }

    /* END SLIDE */
    .endSlide {
        place-items: center;
    }

    .endCard {
        width: min(520px, 92vw);
        border-radius: 18px;
        padding: 18px 16px;
        background: rgba(0, 0, 0, 0.28);
        border: 1px solid rgba(255, 255, 255, 0.1);
        text-align: center;
        color: rgba(255, 255, 255, 0.92);
    }

    .endTitle {
        font-size: 18px;
        font-weight: 720;
    }

    .endSub {
        margin-top: 10px;
        font-size: 13px;
        opacity: 0.8;
    }

    .btn {
        margin-top: 14px;
        padding: 10px 14px;
        border-radius: 999px;
        border: 1px solid rgba(255, 255, 255, 0.16);
        background: rgba(0, 0, 0, 0.22);
        color: rgba(255, 255, 255, 0.92);
        cursor: pointer;
    }

    .btn:hover {
        background: rgba(0, 0, 0, 0.32);
    }

    /* bottom progress dock */
    .progressDock {
        position: fixed;
        z-index: 5;
        left: 18px;
        right: 18px;
        bottom: 18px;
        display: grid;
        grid-template-columns: 1fr auto;
        align-items: center;
        gap: 12px;
        pointer-events: none;
    }

    .track {
        height: 14px;
        border-radius: 999px;
        border: 2px solid rgba(255, 255, 255, 0.92);
        overflow: hidden;
        background: rgba(255, 255, 255, 0.08);
    }

    .fill {
        height: 100%;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.95);
        width: 0%;
        transition: width 220ms ease;
    }

    .arrowBtn {
        pointer-events: auto;
        width: 34px;
        height: 34px;
        border-radius: 999px;
        border: 1px solid rgba(255, 255, 255, 0.18);
        background: rgba(0, 0, 0, 0.18);
        color: rgba(255, 255, 255, 0.95);
        font-size: 22px;
        cursor: pointer;
        display: grid;
        place-items: center;
        transform: translateY(-1px);
    }

    .arrowBtn:hover {
        background: rgba(0, 0, 0, 0.28);
    }

    .state {
        position: relative;
        z-index: 2;
        margin-top: 88px;
        text-align: center;
        color: rgba(255, 255, 255, 0.88);
    }

    .state.error {
        color: rgba(255, 140, 140, 0.95);
    }
</style>
