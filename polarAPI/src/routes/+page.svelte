<script>
    import { goto } from "$app/navigation";
    import StarBackground from "$lib/components/StarBackground.svelte";

    function start() {
        goto("/day/2025-12-01/detail");
    }
</script>

<div class="page">
    <!-- rustige sterren, geen data nodig -->
    <StarBackground lightSeconds={0} deepSeconds={0} remSeconds={0} />

    <div class="content">
        <div class="hero">
            <img src="/moon.png" alt="Moon" class="moonImg" />

            <div class="card">
                <div class="kicker">Bin Yu AffecViz</div>

                <h1 class="title">
                    Your sleep
                    <br />
                    as a nightly universe
                </h1>

                <p class="desc">
                    Explore how your night recharged you and how your Light Deep
                    and REM sleep shaped the stars you earned.
                </p>

                <button
                    class="cta"
                    on:click={start}
                    aria-label="Start to first day detail"
                >
                    Start recap
                    <span class="arrow">›</span>
                </button>

                <div class="hint">Opens 1 December 2025</div>
            </div>
        </div>
    </div>
</div>

<style>
    .page {
        position: relative;
        min-height: 100dvh;
        overflow: hidden;
    }

    .content {
        position: relative;
        z-index: 1;
        min-height: 100dvh;
        display: grid;
        place-items: center;
        padding: 22px 18px 24px;
        color: rgba(255, 255, 255, 0.92);
    }

    .hero {
        width: min(520px, 94vw);
        display: grid;
        gap: 18px;
        place-items: center;
    }

    /* simpele "hero moon" die bij jullie theme past */
    .moonImg {
        width: 220px;
        height: 220px;
        object-fit: cover;
        border-radius: 999px;
    }

    .card {
        width: 100%;
        border-radius: 22px;
        padding: 18px 16px 16px;
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .kicker {
        font-size: 12px;
        opacity: 0.8;
        letter-spacing: 0.3px;
    }

    .title {
        margin: 10px 0 10px;
        font-size: 30px;
        line-height: 1.08;
        font-weight: 750;
        letter-spacing: 0.2px;
    }

    .desc {
        margin: 0 0 14px;
        font-size: 13px;
        line-height: 1.5;
        opacity: 0.86;
    }

    .cta {
        width: 100%;
        height: 46px;
        border-radius: 999px;
        border: 1px solid rgba(255, 255, 255, 0.14);
        background: rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.92);
        font-size: 14px;
        font-weight: 650;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
    }

    .cta:hover {
        background: rgba(255, 255, 255, 0.12);
    }

    .arrow {
        font-size: 18px;
        line-height: 1;
        opacity: 0.9;
    }

    .hint {
        margin-top: 10px;
        font-size: 11px;
        opacity: 0.7;
        text-align: center;
    }
</style>
