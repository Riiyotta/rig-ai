Source: https://rig.ai/

# Rig.ai homepage: clone spec

Measured live with Playwright (Chromium) on 2026-10-20 at 1440x900, 1280x800, 768x1024 and 390x844. All numbers are computed values (getComputedStyle / getBoundingClientRect). `y` is the absolute document offset. Where the computed value came out mid-transition (buttons have `transition: all .2s`), the CSS source value is given instead and flagged as such.

The site is built with Astro. It uses vanilla JS, a small bundled Motion (motion.dev `animate`) used once, and PostHog. No GSAP, Lenis, Framer, Webflow IX, Lottie, canvas or WebGL is active on this page.

## Recon artifacts (read these, don't re-derive)

| Path | What |
|---|---|
| `recon/source/index.pretty.html` | Live HTML, prettified. It's the canonical markup and copy. Line refs below point into it |
| `recon/source/slug.pretty.css` | Global CSS: tokens, buttons, badge, overlays, container, breakpoints |
| `recon/source/index.pretty.css` | All section CSS (Astro scoped `[data-astro-cid-*]`; drop the attribute selectors when porting) |
| `recon/source/index.pretty.html` L194-351 | Inline `<style>`: nav + footer CSS |
| `recon/source/*.pretty.js` | Page scripts (ticker, walkthrough, how-stepper, visibility observer) |
| `recon/svg/*` | Every inline SVG, de-Astro'd and ready to paste. Also the 3 SVG files |
| `recon/assets/*` | Downloaded fonts, SVGs, OG PNG, favicon |
| `recon/measurements/rig-measure-{1440,1280,1200,768,390}.json` | Raw computed-style and rect dump for about 175 selectors at each width |
| `recon/screenshots/full-1440.png` | Full page at 1440 (1440x8582). The walkthrough and how-stepper are mid-autoplay in it |
| `assets-manifest.json` | Asset URLs, mapped to `public/assets/...` |

---

## 0. Global

### Tokens (`:root`, verbatim, with sRGB hex conversions measured via canvas)

| Token | Value | Hex |
|---|---|---|
| `--blue` = `--primary` | `oklch(0.6014 0.1657 253.83)` | `#2981e0` |
| `--blue-dim` = `--primary-glow` | blue / 15% | `#2981e026` |
| `--yellow` = `--secondary` | `oklch(0.6973 0.1443 72.87)` | `#d38d14` |
| `--red` = `--tertiary` | `oklch(0.6329 0.2075 31.49)` | `#ed462d` |
| `--red-glow` | red / 40% | |
| `--green` | `oklch(0.8003 0.1821 151.71)` | `#4ade80` |
| `--ink` = `--background` | `oklch(0.225 0.013 188.03)` | `#151e1d` (page bg) |
| `--paper` = `--foreground` = `--text` | `oklch(0.8946 0.0155 90.24)` | `#e0dcd1` (text) |
| `--paper-dim` | paper / 75% | renders `#adaca4` on ink. Body copy |
| `--paper-faint` | paper / 8% | |
| `--border` | paper / 18% | renders `#39403d` on ink. All hairlines |
| `--border-dim` | paper / 14% | |
| `--paper-70 … --paper-02` | `rgba(240,237,230,α)` with α .7 .6 .5 .45 .4 .35 .3 .25 .2 .15 .12 .06 .04 .02 | |
| `--text-muted` / `--text-tertiary` / `--text-faint` | paper-40 / paper-35 / paper-25 | |
| `--chamfer` | `14px` | |

Other literal colors:
- Footer bg: `#0a0a0a`.
- Badge bg: `#0a0a0ae0` (rgba(10,10,10,.88)).
- Product-demo palette: see §3.
- Hero ticker border: `rgba(10,10,10,.15)`.
- CTA grid glow: `oklch(0.7132 0.1431 253.83)`, which is `#5ea5f9`.
- Flow-dot glow: `oklch(0.952739 0.066525 92.42)`, which is `#ffefbd`.
- Wave-grid SVG fill: `#2981E0`.

Note that the HTML comments say "RED hero", but the hero is now **blue** (`--primary` = blue). Red `#ed462d` is used for accents: tertiary, file-tab top border, favicon.

### Fonts (`@font-face` verbatim in `slug.pretty.css` L1-58)

- **Chalet** (`/fonts/chalet_londonnineteensixty.woff2`)
  - Only a 400 face exists.
  - Every `h1`/`h2`/`h3` set in Chalet renders at UA-default **font-weight 700, i.e. synthesized faux-bold**. Computed fontWeight was 700 everywhere.
  - **Tailwind preflight resets heading weight to `inherit`, so Build must set `font-weight:700` explicitly on those headings and keep `font-synthesis` at its default.**
  - FAQ question text is a `<span>`, so it stays 400.
- **Instrument Sans**: variable 400-700, latin + latin-ext. This is the body font: `font-family: "Instrument Sans", system-ui, sans-serif`.
- **Chivo Mono**: variable 400-800, latin + latin-ext. Stack: `"Chivo Mono", monospace`.
- **Geist Pixel Square**: ticker only. Stack: `"Geist Pixel Square", monospace`.
- All faces use `font-display: swap`. Preload these four: chalet, GeistPixel, InstrumentSans-latin, ChivoMono-latin.
- Display stack: `Chalet, Inter, sans-serif` (hero h1, CTA h2, `.display`) or `Chalet, sans-serif` (the others).
- `.display` uses letter-spacing -0.03em; `.display-heavy` uses -0.02em.
- `.step-number`, `.stack-group h4` and `.cli-note` first span use the plain generic `monospace` (not Chivo), so they render in the system mono.

### Base

- `* {box-sizing:border-box; margin:0; padding:0}`
- `html {overflow-y:scroll; scrollbar-gutter:stable; scroll-behavior:smooth}`
- `body {background: ink; color: paper; -webkit-font-smoothing:antialiased; overflow-x:hidden}`
- Root font-size is 16px.
- `::selection {background: yellow; color: ink}`

### Fixed full-viewport overlays (pointer-events:none, all on every page)

1. `.content-lines` (z 9999): two 1px vertical `--border` lines.
   - Default: `left: calc(50% - 600px)` and `right: calc(50% - 600px)`, so x=120 and x=1320 at 1440.
   - ≤1280: 5% each side.
   - ≤768: 1.25rem each side.
   - These lines are hidden behind the hero, the CTA and the footer, which all sit at z-index 10000.
2. `.noise` (z 10001): an empty div with `opacity:.08; filter:url(#grainy)`. The `#grainy` SVG filter (`recon/svg/grainy-filter.svg`) is `feTurbulence fractalNoise baseFrequency .4 numOctaves 4` whose `seed` is animated 0→100 over 10s, infinitely, followed by an feColorMatrix that turns it into white alpha noise. This produces animated film grain over everything.
3. `.scanlines` (z 10002): `repeating-linear-gradient(0deg, transparent 0 2px, rgba(0,0,0,.08) 2px 4px)`, 100vw×100vh.
4. `.rgb-fringe` (z 10003): `linear-gradient(90deg,#e5332a05,#2b4fff04,#e5332a05)` with background-size 3px 100%.

### Layout system

- `.container`: `max-width:1200px; margin:0 auto; padding:0 3rem`. At 1440 that gives box x 120→1320 and content x 168→1272 (1104 wide).
  - ≤1280: `max-width:90%; padding-left/right:0`. At 1280 the box is 64→1216 (1152).
  - ≤1024: padding 0 2rem.
  - ≤768: padding 0 1.25rem. At 768, box 38.4→729.6 with content from 58.4. At 390, box 19.5→370.5 with content from 39.5.
  - Several sections override padding with `padding-inline: clamp(1.25rem, 4vw, 3rem)`: #intro-rig, #runtime-evidence and setup. At 768 this computes to 30.72px.
- `.section-divider`: 1px `--border`, max-width 1200, margin auto. ≤1280: 90%. ≤768: calc(100% - 2.5rem) with 1.25rem side margins.
- Breakpoints used: **1280, 1024, 1000, 901/900, 769/768, 700**, plus `prefers-reduced-motion`.
- `.badge` (section eyebrow pill):
  - Box: `display:flex; width:fit-content; margin:0 auto 2rem; gap:.6rem (9.6px); padding:.5rem 1rem`.
  - Fill and border: bg `#0a0a0ae0`, `1px solid --border`, `backdrop-filter: blur(8px)`.
  - Type: Chivo Mono 12px, letter-spacing .12em (1.44px), uppercase, color primary.
  - Rendered height is 34px with a 16px pixel-art icon (fill primary) or 32.5px without an icon.
- `.section-title`: Chalet `clamp(2.5rem,4vw,3.5rem)`, line-height .92, letter-spacing -.03em.

### Buttons (`.btn-chamfer`, slug.pretty.css L177-310)

- Box and type: `inline-flex; gap:.5rem; padding:1rem 2rem; Chivo Mono 700 .85rem (13.6px); transition: all .2s cubic-bezier(.25,1,.5,1)`.
- Shape: `clip-path: polygon(14px 0,100% 0,100% calc(100% - 14px),calc(100% - 14px) 100%,0 100%,0 14px)`. This chamfers the top-left and bottom-right corners.
- ≤768: padding .75rem 1.5rem, font-size .8rem.
- `.btn-dark` (nav + hero): bg ink, text paper.
  - Hover: `text-shadow:-1px 0 rgba(43,79,255,.35), 1px 0 rgba(237,70,45,.35); box-shadow:4px 4px 0 var(--primary); animation: btn-glitch .3s ease-in-out`.
  - Measured during hover: animation `0.3s ease-in-out btn-glitch`, text-shadow ≈ ±1.48px mid-keyframe.
  - The box-shadow is fully clipped by the clip-path, so it is invisible. Keep the rule anyway.
- `.btn-cta` (bottom CTA): bg primary, text ink. Same hover as btn-dark, but the box-shadow color is `--secondary`.
- `@keyframes btn-glitch`:

  | Step | transform | text-shadow | opacity |
  |---|---|---|---|
  | 0% | 0 | none | 1 |
  | 12% | translate(-1px,.5px) | ∓1.5px blue/red @.4 | .8 |
  | 24% | translate(1px,-.5px) | ±1px @.3 | .92 |
  | 36% | translate(-.5px) | none | .85 |
  | 50% to 100% | rest | none | 1 |

---

## 1. Hero (`section.hero`, HTML L383-672)

**Layout**
- `section.hero`:
  - Sizing: `min-height:50vh; width:100vw; margin-left:calc(-50vw + 50%)`.
  - Fill and layout: bg primary `#2981e0`, `display:flex; flex-direction:column`.
  - Stacking: `position:relative; overflow:hidden; z-index:10000`.
  - Measured height: 651.3 @1440, 632.4 @1280, 697 @768, 646.6 @390. Height is driven by content, not by 50vh.
- **Header/nav** (`header.site-header[data-variant=hero] > nav.site-nav`):
  - Box: `max-width:calc(1200px + 6rem)` = 1296; `padding:1.5rem 3rem`; flex, space-between, align center, gap 1rem.
  - Height: 88.9 @1440. ≤768 padding is 1rem 1.25rem, giving height 70.5 @390.
  - The nav is **not sticky or fixed**. It scrolls away with the hero, nothing changes on scroll, and there is no mobile menu or hamburger at any width (logo + CTA only).
  - Logo: `<a href="/" aria-label="Rig — Home"><img src="/assets/rig-wordmark.svg" width=60 height=22 alt="">`, CSS height 22px, `filter: brightness(0)` (renders black). It sits at x=120 @1440, x=48 @1280 (the nav ignores the 90% rule; only `.hero-content` gets it), and x=20 @768/390.
  - CTA: `a#nav-join-btn.btn-chamfer.btn-dark.site-nav-cta` reading "Get a Demo".
    - Link: href `https://cal.com/adampatarino/demo?overlayCalendar=true&utm_source=website&utm_content=nav`.
    - Type: Chivo Mono 700, .75rem (12px), letter-spacing .05em (0.6px), nowrap.
    - Box: padding 16/32, giving 142×46.5 @1280. ≤768 padding 12/24, giving 126×38.5.
- **Watermark** `svg.hero-watermark` (`recon/svg/hero-watermark.svg`, viewBox 0 0 163 160, fill currentColor = paper):
  - `position:absolute; right:-5%; top:50%; transform:translateY(-50%); width:55%; opacity:.08`, with `animation: watermark-glitch 4s infinite linear`.
  - Measured 792×777 at x=720, y=-63 @1440.
  - ≤768: width 80%, right -10%.
  - The keyframes are verbatim in index.pretty.css L164-265. Glitch bursts hit at 2-5%, 15.5-18%, 40.3-41.5% and 65.2-66.5%, combining translate/skew/scaleX with hue-rotate/saturate/brightness filters and opacity .04-.2.
- **`.hero-content`**:
  - flex column, justify center, align flex-start; padding 0 3rem; max-width 1296; z 10. Width 1296 at x 72 @1440.
  - ≤1280: max-width 90%, padding 0. ≤1024: padding 0 2rem. ≤768: padding 0 1.25rem.

**Typography / copy**

| Element | Copy | Font | Size / line-height | Color | Spacing |
|---|---|---|---|---|---|
| `h1` (inline `style="margin-top:2rem"`) | "Build Security Into`<br>`The Agent Loop" | Chalet 700 (faux) | `clamp(3.5rem,8vw,7rem)` with line-height .88: 112/98.56 @1440, 102.4/90.11 @1280, 92.16 @768, 56/49.28 @390 (≤768 uses `clamp(3.5rem,12vw,7rem)`) | paper | margin-bottom 2rem. Box 934×197 @1440 |
| `p.hero-sub` | "Find vulnerabilities as agents work, guide them through fixes, and verify the results, before findings turn into tickets." | Instrument Sans 600 | 24px / 1.6 (38.4px); ≤768 16px / 25.6px | paper | opacity .85, max-width 580, margin-bottom 2.5rem |

The h1 has no letter-spacing set (normal).

- `.hero-actions`: flex, gap 1rem, margin-bottom 3rem.
  - Contains `a#hero-join-btn.btn-chamfer.btn-dark` reading "Get a Demo", href `...&utm_content=hero`.
  - Box: 13.6px font, padding 16/32, giving 145.6×48.5 @1280.
  - ≤768: the button is `flex:1 1 100%; justify-content:center; padding:1.25rem 2rem; font-size:1rem`, giving 160×59 @390. The hero-actions container is not full-width, so the button is not stretched.

**News ticker** (`.hero-ticker`, aria-label "Latest news")
- `.hero-ticker`: border-top `1px solid rgba(10,10,10,.15)`, padding .75rem 0, height 42.
- `.hero-ticker-inner`:
  - Layout: `display:flex; width:max-content; white-space:nowrap`.
  - Animation: `animation: ticker var(--ticker-duration) linear infinite`, with `@keyframes ticker {to {transform:translate(-50%)}}`.
  - Type: Geist Pixel Square .8rem (12.8px), letter-spacing .1em (1.28px), uppercase, color ink, opacity .7, `-webkit-text-stroke: .5px ink`.
- 2× `.hero-ticker-group`: flex, gap 4rem, `padding-right:4rem`, min-width 100vw. The second group is `aria-hidden` with `tabindex=-1` links. ≤768: gap and padding become 2rem.
  - Group width: 4994.5px @1440, 4546.5 @768.
- Speed is set by JS: `--ticker-duration = groupWidth/30 + "s"`, which is **30 px/s**. That is 166.5s @1440. A ResizeObserver updates it.
- Pause rules:
  - Hover or focus-within on the ticker sets `animation-play-state: paused`.
  - The ticker is also paused when `.hero` lacks `.is-visible` (see the global observer in §9).
- Link hover/focus: `opacity:1; text-decoration:underline; text-underline-offset:.25em`.
- Reduced motion: the animation is removed, `overflow-x:auto`, and the duplicate group is hidden.
- Items, in order, each followed by `<span class="hero-ticker-separator" aria-hidden>&bull;</span>`:
  1. "OpenAI says its AI technology acted on its own in an ‘unprecedented’ hack of another company": https://apnews.com/article/openai-gpt56-sol-hugging-face-63ab84fed5612af04d8a160d60f6def3
  2. "Anthropic says its AI models hacked 3 organizations during testing": https://apnews.com/article/anthropic-ai-models-hack-cybersecurity-b0a2c284b981de79c55e2a33712f4bec
  3. "Vercel Incident Linked to AI Tool": https://thecyberexpress.com/vercel-security-incident-linked-to-ai-tool/
  4. "North Korean Hackers Weaponize AI, Driving 66% of 2026 Crypto Thefts at $643 Million": https://finance.biggo.com/news/29ca075c-0c34-4aa2-bc7b-dc3c351e92a9
  5. "Braintrust security incident raises concerns over AI supply chain risks": https://securityaffairs.com/191888/data-breach/braintrust-security-incident-raises-concerns-over-ai-supply-chain-risks.html
  6. "Russian hackers turn to AI as old tactics fail, Ukrainian CERT says": https://therecord.media/russian-hackers-turn-to-ai-ukraine-cert
  7. "Gemini Hacked Three Companies in First Known Breakout by Google’s AI": https://www.wsj.com/tech/ai/gemini-hacked-three-companies-in-first-known-breakout-by-googles-ai-5c0baba2

---

## 2. `main.content` and "The problem" (HTML L674-1041)

- `main.content`: bg ink, position relative.
- First child: `<div style="padding-bottom:4rem"><div class="section-divider" style="position:relative;top:4rem"></div></div>`. This is a 64px spacer with a hairline at y=715 @1440.
- `section.problem-section` (padding 0) > `.container.problem-container` (padding 0, so the box is 1200 wide at x 120) > `.problem-outer` (border-bottom 1px border, overflow hidden).
- **`.problem-top`**: padding 3rem 3rem 2.5rem. ≤768: 1.5rem 1.25rem. 769-1024: 2rem.
  - `.badge.problem-badge` (margin-bottom 2rem): icon `recon/svg/badge-problem.svg`, text "The problem". It is centered, 154.6×34.
  - `h2.display.problem-headline` reads "AI is an Asset and a Risk".
    - Type: Chalet 700, `clamp(3rem,5vw,4.5rem)` with line-height .92: 72/66.24 @1440, 64 @1280, 48/44.16 @768/390. Letter-spacing -.03em (-2.16px @72).
    - **Left-aligned**, even though the badge above is centered.
- `.problem-divider`: border-top 1px border.
- **`.problem-grid`**: `grid-template-columns:1fr 1fr 1fr; grid-template-rows:1fr 1fr; min-height:420px`, giving 400/400/400 by 420 @1440.
  - Col 1 `.problem-checkpoint-col`: `grid-row:1/3`, border-right, flex-centered.
    - It contains `figure.review-funnel` (max-width 480, width 100%, **SVG viewBox 0 0 480 500**). Markup is in `recon/svg/review-funnel-problem.html`, CSS in index.pretty.css L266-507. Rendered 399×415.6 @1440.
  - 4× `.problem-card` (padding 2rem). Cards 2 and 4 have border-right; cards 2 and 3 have border-bottom.
    - Header: flex, baseline, space-between, margin-bottom .75rem.
      - `.mono.problem-card-label`: Chivo Mono .65rem (10.4px), ls .1em, uppercase, primary.
      - `.mono.problem-card-number`: .6rem (9.6px), ls .2em, paper-20.
    - `h3.display-heavy`: Chalet 700, 1.35rem (21.6px) / 1.05, ls -.02em, mb .75rem.
    - `p`: Instrument 12.8px / 1.6 (20.48), paper-dim.
  - Copy:

    | Label | # | h3 | p |
    |---|---|---|---|
    | Bottleneck | 001 | More to Review | The new bottle neck is your team's ability to review all the code agents create. |
    | Exposure | 002 | Hackers Are More Dangerous | With AI, bad actors can exploit vulnerabilities faster and more easily than ever before. |
    | Volume | 003 | Your Backlog is Growing | Dev teams are forced to slow down to deal with vulnerability backlogs growing from dozens of static scanning tools. |
    | Noise | 004 | False Positives Obscure the Reality | Tools of the past can't keep up with the speed of modern teams. False positives sap valuable dev time or cause alert blindness. |

  - ≤768: a single column. The checkpoint col gets min-height 280 and a border-bottom. Cards get padding 1.25rem and border-bottom, except the last.
- **Funnel animation** (pure CSS, 12s loops, verbatim in CSS L336-487):
  - Six `.queued` PR boxes (44×30 rects rx2, fill ink, stroke currentColor at .6) at (160|320, 222|174|126).
    - `queue-build 12s var(--delay) infinite`, with delays 0, .9, 1.8, 2.7, 3.6, 4.5s and default ease.
    - Keyframes: 0% opacity 0 at translateY(-30px); 10-86% opacity .8 at translateY(0); 100% opacity 0.
  - One `.rework-pr` runs `rework 12s linear`. Its path, as translate values:
    - (240,119) at 0% (opacity 0) → opacity 1 at 5% → (240,303) over 18-28%.
    - It turns red (`--tertiary`) at 32%, moves to (398,303) by 40%, up to (398,119) by 52%, and back to (240,119) over 62-69%.
    - It returns to paper at 73%, reaches (240,303) over 84-90%, and ends at (240,425) with opacity 0 over 98-100%.
  - `.risk-mark` is visible from 32% to 69%.
  - The "VULNERABILITY FOUND" label (10px, tertiary) is visible from 32% to 40%.
  - Labels: Chivo Mono 12px, ls .1em, fill paper-70. "REVIEW" is 10px primary; "REWORK" is 10px tertiary, rotated -90°.
  - Gates: stroke primary, fill primary at .07.
  - The rework track is a tertiary stroke at .4 opacity, dash 3 5.

---

## 3. "Introducing Rig" (`section.offline-section#intro-rig`, HTML L1044-1763)

- Section: padding 8rem 0 (128px; ≤768 4rem), overflow hidden. Its `:before` center line is hidden.
- The container uses padding-inline `clamp(1.25rem,4vw,3rem)`.
- **`.intro-headline-wrap`**: max-width 720, margin 0 auto 4rem (≤700: 2.5rem), centered.
  - `.badge` (mb 1.75rem): "Introducing Rig", no icon.
  - `h2.display.intro-title` reads "Automated Security`<br>`Inside the Loop".
    - Chalet 700, `clamp(3rem,5vw,4.5rem)` with line-height .96: 72/69.12 @1440, 64 @1280, 48 @768.
    - ≤700: `clamp(2.7rem,10vw,3.8rem)`, which is 43.2 @390.
    - ls -.03em, mb 1.5rem.
  - `p.intro-desc` reads "Rig checks the application when the coding agent finishes its work. Findings go straight back to the agent, while the code and context are still fresh."
    - 1.05rem (16.8px) / 1.7, paper-dim, max-width 620, `text-wrap:pretty`. ≤700: .95rem.
- **`.walkthrough`** (flex column, gap 2rem; ≤700 1.5rem): `figure.product-demo`, then `.walkthrough-copy`.

### `figure.product-demo` (fake IDE + agent chat)

- Frame: `border:1px solid #363a3e; background:#101214; color:#edf0f2; border-radius:8px; box-shadow:0 24px 70px #0002; overflow:hidden`. Size 1104×506.6 @1440.
- ≥901px: grid with 2 equal columns (551 each @1440) and rows `auto auto 1fr auto`.
  - figcaption spans both columns.
  - `.editor-bar` and `.code-editor` sit in col 1.
  - `.demo-conversation` sits in col 2, rows 2-3, with border-left `#2b2e32`.
  - The footer spans both columns.
- ≤900px: everything stacks.
- **figcaption**: padding 1rem 1.2rem; Chivo Mono .65rem (10.4px); `#a0a6ae`; border-bottom `#2b2e32`; gap .6rem.
  - Contents: a 6px circle `.demo-dot` (`#969fa9`), then "workspace / search-api".
  - ≤700: padding .9rem, font .55rem.
- **`.editor-bar`**: bg `#171a1e`, Chivo Mono .65rem.
  - `.file-tab` reads "⌘ &nbsp; routes/search.ts". Padding .85rem 1.2rem, bg `#101214`, border-top `1px solid #ed462d`.
  - `.file-status` reads "modified", `#949ba5`, margin-left auto, padding-right 1.2rem.
- **`.code-editor`**: padding 1.4rem 0 .8rem; ≥901 padding-top 2rem.
  - `.code-line`: flex, Chivo Mono .68rem/24px. ≥901: .78rem (12.48px)/28px with min-height 28. ≤700: .59rem.
  - The gutter span is 3.5rem wide (2.25rem ≤700), centered, `#646b76`.
  - Syntax colors: `b` → `#c4b2ec` (weight 400); `em` → `#baceab` (not italic).
  - Lines 12-19 (verbatim, HTML L1085-1176):

    | Line | Vulnerable version | Fixed version (`.fixed-query`, shown when `data-fix-applied="true"`) |
    |---|---|---|
    | 12 | `app.get('/search', async (req, res) => {` | (same) |
    | 13 | `const name = req.query.name;` | (same) |
    | 14 | `const users = await db.query(` | ``const users = await db.query(`` |
    | 15 | `` `SELECT * FROM users `` | `'SELECT * FROM users` |
    | 16 | ``WHERE name = '${name}'` `` | `WHERE name = $1', [name]` |
    | 17 | `);` | `);` |
    | 18 | `res.json(users.rows);` | (same) |
    | 19 | `});` | (same) |

  - Fixed lines get `background:#98c69f12; box-shadow:inset 2px 0 #98c69f; animation: fix-reveal 1s ease both`, which fades the bg from `#98c69f44` to `#98c69f12`.
  - When `data-step="1"`: `.input-line` gets bg `#ed462d14` and `.query-line` gets bg `#ed462d20`, both with `inset 2px 0 #ed462d`.
  - `.code-note` (padding .7rem 1.2rem 0 3.5rem; Chivo .62rem; `#94ba9c`) reads "+ Search endpoint added". After the fix it reads "✓ Query parameterized".
- **`.demo-conversation`**: bg `#15181b`.
  - `.chat-header`: padding .75rem 1.2rem; border-bottom `#262a30`; Instrument 500 .75rem; gap .55rem.
    - `.agent-avatar` "›_": 22×22, radius 4, bg `#2a2e35`, Chivo .7rem.
    - "Agent chat".
    - `.chat-session` "search-api": `#8d96a3`, Chivo .58rem, margin-left auto.
  - `.chat-thread`:
    - Box: padding 1rem 1.2rem .5rem; **height 322px** (357 at ≤700).
    - Scrolling: overflow-y auto, thin scrollbar `#424b58`. JS auto-scrolls it to the bottom (smooth while playing).
  - `.user-message`: right-aligned, max-width 90%, padding .55rem .8rem, border `#353a43`, radius `8px 8px 2px`, bg `#22262d`.
    - "You" label .58rem `#969fac`.
    - `p` reads "Add a search endpoint for users.", .75rem `#d9dde3`.
  - Assistant message:
    - `.message-author` "Agent": Instrument 600 .65rem `#e4e8ee`.
    - `p`: .78rem / 1.6, `#c9cfd7`.
  - `.tool-message`: border `#343941`, radius 5.
    - `.tool-heading`: padding .55rem .7rem; bg `#1c2026`; Chivo .65rem `#d3d9e1`. It contains the chevron "⌄" (`#909ba9`), "Rig", `.tool-action` (.58rem `#9aa4b2`) and `.tool-state` (.55rem, margin-left auto). State colors: running `#aeb9c8`, finding `#f0ae8d`, passed `#a8dcb1`.
    - `.tool-body`: padding .65rem .8rem. `strong` is .76rem / 500. `p` is .73rem / 1.6 `#aeb8c5`. `code` is Chivo .62rem `#c7d2e0`.
  - `.chat-progress`: 2px track `#303741`. Its bar `i` is 28% wide, `#97a8bf`, `animation: chat-progress 2.5s ease-in-out infinite` (translate -100% → 460%).
  - `.conversation-progress`: "thinking" row.
    - Three 4px dots `#afbed2`, `thinking-dot 1.1s ease-in-out infinite`, delays 0/.15/.3s. Keyframes: 0/70/100% opacity .3 at y 0; 35% opacity 1 at y -3px.
    - `strong`: Instrument 500 .76rem. `p`: .68rem `#8996a7`.
  - Messages appear with `scene-reveal .35s ease both` (opacity .4 → 1, translateY 4px → 0).
  - `.chat-composer`: margin 0 1.2rem 1rem; padding .65rem .8rem; border `#363c46` radius 6; .72rem `#8e99a8`. Text "Message your agent…", then a 20×20 "↑" chip (bg `#303741`, `#b4bfcd`, radius 4).
  - Chat scenes, copy verbatim in HTML L1204-1446:

    | Scene | Messages |
    |---|---|
    | 0 | Agent "Done. I added the search endpoint." + tool "Rig · completion hook · Running/Started" with "Starting the application locally and checking the change…" and a progress bar. Thinking text: "Agent thinking… / Finishing the search endpoint" |
    | 1 | Agent "The endpoint is ready. The security check is running." + tool "check result · 1 finding": **SQL injection confirmed**, `routes/search.ts:16`, "Test input reached the SQL query and changed its execution." Thinking text: "Rig running… / Testing input through the running application" |
    | 2 | tool "fix instructions · SQL injection" (`routes/search.ts:16`; "Use a parameterized query. Replace the interpolated input with `$1` and pass `[name]` separately.") + Agent "I’ve bound the input as a query parameter. The fix is ready for Rig to recheck." with "✓ Edited routes/search.ts". Thinking text: "Agent thinking… / Reviewing the finding and updating the query" |
    | 3 | tool "recheck result · Passed": **Retest passed**, `routes/search.ts:16`, "The reported SQL injection no longer reproduces with the updated query." + Agent "The fix passed Rig’s recheck. The search endpoint now uses a parameterized query." Thinking text: "Rig rechecking… / Running the same test against the updated code" |

- **`.demo-footer`**: padding .65rem 1.2rem; border-top `#2b2e32`; `#949ba5`; Chivo .5rem (8px); ls .08em. Contents: a 4px `.local-dot` (`#a8dcb1`), "LOCAL WORKSPACE", and "AGENT + RIG" right-aligned.

### `.walkthrough-copy`

- Flex column, gap 2rem.
- `.walkthrough-controls` has `order:-1`, so it renders **above** the copy.
  - Layout: flex, gap 2rem (1.25rem ≤900; `display:block` ≤700).
  - `.step-markers`: flex 1, gap 1.5rem (.8rem ≤900, .65rem ≤700). Four buttons, each 197.8×40.1 @1440:
    - Style: `border-top:2px solid --border; padding:.8rem 0; color: paper-60; Chivo .65rem; display:flex; justify-content:space-between`.
    - Labels: "01 Hook", "02 Test", "03 Fix", "04 Retest".
    - `[aria-current]`: border primary, color text.
  - `.transport`: gap .5rem.
    - "←" and "→" buttons: 44×44, border 1px border, Chivo 1rem.
    - `[data-play]` button: min-width 105, padding 0 1rem, .72rem, space-between. Its label is "Play ▶", "Pause Ⅱ" or "Replay ↻".
    - ≤700: margin-top .75rem; the play button gets margin-left auto.
  - Hover on any of these buttons: `background: color-mix(in srgb, var(--primary) 8%, transparent)`. Focus-visible: 2px primary outline, offset 4px.
- `.step-copy-stack` is a grid with all four `.step-copy` stacked in `grid-area:1/1`.
  - Each `.step-copy` is a 2-column grid (512/512 @1440, gap `clamp(2rem,6vw,5rem)` = 80px). It starts at opacity 0 / visibility hidden with `transition: opacity .3s ease`; `[aria-hidden=false]` makes it visible.
  - ≤700: one column, gap 1rem.
  - `.step-kicker`: Chivo .7rem (11.2px), ls .13em, primary, e.g. "THE LOOP / 01".
  - `h3`: Instrument Sans **500**, `clamp(1.5rem,2.4vw,2rem)` / 1.18 (32/37.76 @1440), ls -.035em, mt .85rem. ≤700: 1.7rem.
  - `p`: 1rem / 1.75, paper-dim, padding-top 1.7rem (0 ≤700), max-width 62ch.
  - Copy:
    1. THE LOOP / 01: "The agent finishes a change. Rig starts a check." / "Rig connects to the agent’s completion hook. The check starts automatically, without a developer remembering to run a scan."
    2. THE LOOP / 02: "Rig tests the running application." / "Rig runs the application locally and tracks how input moves through its code. It confirms a vulnerable execution path before reporting a finding."
    3. THE LOOP / 03: "The agent gets evidence and fix instructions." / "Each finding identifies the code location, explains the vulnerability, and gives the agent guidance for fixing it. The same agent working on the feature can act on that feedback."
    4. THE LOOP / 04: "Rig checks the updated code." / "After the agent makes a fix, Rig retests the reported vulnerability. The result shows whether the check passed, the issue remains, or testing could not complete."

### Walkthrough state machine (inline script, HTML L1637-1763; port to a React hook)

- **State**:
  - `step e` (0-3)
  - `playing a`: initially `!prefersReducedMotion`, so autoplay is on
  - `visible p`: the IntersectionObserver on `.product-demo` with **threshold .35**, AND `!document.hidden`
  - `elapsed s` in ms
- **Clock**: a `setInterval` every 100ms adds the real delta to `s` while `a && p`.
- **Phase**: `t = s<1800 ? 0 : s<3600 ? 1 : s<5400 ? 2 : 3`.
- **Advance**: when `s >= 10000`, go to the next step. After step 3, stop and show "Replay ↻".
- **Scene rendering for phase `t`**:
  - Scenes with index > e are hidden.
  - In the current scene, message #A (assistant/tool children, in order) shows when `t >= A+1`.
  - The thinking row shows only in the current scene and only while `t < 2`.
  - Earlier scenes get `data-complete=true`, which hides their progress bar, and the running tool state reads "Started".
- **Fix flag**: `data-fix-applied = (e===3 || (e===2 && t>=2))`.
- **Playing flag**: `data-playing = a && p`. When it is false, the progress bar and dot animations pause.
- **Clicks**:
  - Clicking a marker or prev/next sets the step, stops autoplay, sets `s = 10000` (the full scene is shown immediately), and sets aria-live polite.
  - The Play button toggles. If the walkthrough is finished at step 3, Play restarts from step 0.
- **Reduced motion**: always `s = 10000`, and the thinking rows are hidden.

---

## 4. "The Difference" (`section.evidence-section#runtime-evidence`, HTML L1766-1953)

- Section: padding 7rem 0 (112; ≤768 4rem). Container padding-inline clamp as in §0.
- `header` (centered):
  - `.badge` (mb 1.5rem): icon `badge-difference.svg`, text "The Difference".
  - `h2#evidence-title` reads "Static analysis reads the code.`<br><span>`Rig tests what it does.`</span>`".
    - Chalet 700, `clamp(2.2rem,4.5vw,3.6rem)` / 1.06: 57.6/61.06 @1440, 35.2 @768/390. ls -.03em.
  - `p.intro` reads "Static analysis finds potential vulnerabilities in source code. Rig adds evidence from the running application, separating what could happen from what happened during a test."
    - max-width 700, margin 1.5rem auto 0, 1rem / 1.7, paper-dim.
- **`figure.comparison`**: 2-column grid (552/552 @1440), margin 3rem 0. ≤768: one column, margin 2rem 0.
  - Both panels: padding 1.75rem (1.25rem ≤1000), border 1px border, height 299.8 @1440.
  - `.runtime-panel`: no left border, `background: linear-gradient(135deg, var(--paper-04), transparent)`, `box-shadow: inset 0 2px var(--primary)`, which draws a 2px blue top line. ≤768 it gets a left border and no top border.
  - `.panel-label`: flex, space-between; Chivo .6rem (9.6px); ls .06em; paper-dim. ≤1000 column; ≤768 row at .55rem.
    - Panel 1 reads "01 / STATIC ANALYSIS" with "Source code".
    - Panel 2 reads "02 / RIG RUNTIME TESTING" with a `.live-label` (a 5×5 square in primary, then "Running app").
  - `.code-sample` (height 165, 150 ≤768; flex column, centered, gap .65rem): rows contain a `.line-number` (Chivo .65rem, paper-40) and `code` (Chivo .78rem = 12.48px, paper-dim; .65rem ≤1000).
    - Rows: "12 input = request.query", "13 query = buildQuery(input)", and "14 database.execute(query)".
    - The `.flagged-line` code is yellow, with a "◇" marker pushed right.
  - `.execution-path` (height 165, centered, gap .75rem): three `.path-node`s (column, gap .7rem, Chivo .65rem).
    - Each `.node-symbol` is 48×48, border 1px primary, color primary, 1.3rem, bg ink.
    - Nodes: "↳ Test input", "{ } App code", and "! Database". The Database node is `.sink`: tertiary color and border.
    - Between nodes is a `.path-link`: flex 1, max-width 60, border-top 1px primary, margin-bottom 1.4rem, with a 5px rotated-45° chevron arrowhead drawn by `:after`.
  - `.panel-result`: flex, gap .85rem, padding-top 1.25rem, border-top border.
    - `.result-icon`: 28×28, border 1px currentColor, Chivo .9rem. "?" is yellow (`.potential`); "✓" is primary (`.confirmed`).
    - `strong` (.9rem / 500): "A potential vulnerability" or "A confirmed execution path".
    - `p` (.8rem / 1.5, paper-dim, mt .35rem): "Identified by analyzing the code." or "Observed while testing the application."
- **`.evidence-points`**: 3-column grid, gap 2rem. ≤768: one column; each article gets border-top and padding-top 1.5rem.
  - `.point-number`: Chivo .7rem, primary, mb 1rem.
  - `h3`: Chalet 700, 1.5rem / 1.15, ls -.02em, mb 1rem.
  - `p`: .9rem / 1.7, paper-dim.
  - Copy:
    1. 01 "Reachability, confirmed.": "Static analysis can identify a potentially vulnerable path. Rig confirms that the path actually executes in the running application before reporting a finding."
    2. 02 "Runtime context, included.": "Static analysis models how code may behave. Rig observes how it behaves with the inputs, configuration, and dependencies present during the test."
    3. 03 "Evidence, ready to act on.": "A static finding can leave developers checking whether an issue is reachable. Rig includes execution evidence and the code location, giving developers and agents concrete fix instructions."

---

## 5. "How it Works" (`section.how-section#our-approach`, HTML L1956-2775)

- Section: padding 8rem 0 0 (≤768 4rem 0 0).
- Container: padding 0 (1.25rem ≤768), so the content is the full 1200 box, x 120-1320.
- `.how-intro` (centered, padding 0 3rem, mb 1rem):
  - `.badge` (mb 1.5rem, icon `badge-how.svg`): "How it Works".
  - `h2.section-title` reads "Runtime and Inline". It is 56/51.52 @1440, 51.2 @1280, 40 @768.
  - `p` reads "Rig understands your application so it can thoroughly test it for vulnerabilities." It is 1rem / 1.6, paper-dim, max-width 620, mt 1.5rem.
- **`.how-stepper`**:
  - Grid `2fr 3fr` (480/720 @1440), mt 3rem, align start.
  - 769-1024: 1fr 1fr.
  - ≤768: one column, with the illustration first (order 1) and the steps second.
- Left: three `button.how-step` elements.
  - Box: padding 1.5rem 2rem 1.5rem 1.25rem; border-top border (the last one also has border-bottom); text-left. ≤768: padding 1.25rem 1.25rem 1.25rem 1rem plus border-right.
  - `.how-step-progress`: absolute left 0, 2px wide, full height, bg paper-faint. Its fill is primary, height 0 → 100%.
  - `.how-step-num`: Chivo .6rem, ls .2em, uppercase. Color paper-25, primary when active, with a .3s ease transition.
  - `h3`: Chalet 700, `clamp(1.5rem,2.5vw,2rem)` / 1.05, ls -.02em. Color paper-35, paper when active, .3s transition.
  - `.how-step-body`: `display:grid; grid-template-rows:0fr→1fr; opacity 0→1` with `transition: grid-template-rows .4s ease, opacity .3s ease`.
    - Its `p`: .9rem / 1.7, paper-dim, mt 1rem.
  - Copy:
    1. "Step 01" "Runtime Discovery": "Rig uses advanced algorithms to develop a detailed map of of your application including entry points, code paths, and sinks." ("of of" is the site's own typo; keep it.)
    2. "Step 02" "Inline Tainting": "Rig runs your application and automates testing and tainting to track how data flows through your source code."
    3. "Step 03" "Proven Exploitability" (aria-label "Step 3: Static tools predict. Rig proves"): "Rig's runtime testing confirms the vulnerable path before reporting it, and reports exactly where vulnerabilities are located, and should be fixed."
- Right: `.how-illustration`.
  - Box: min-height 680 (500 at 769-1024, 400 ≤768); border 1px border with no right border (≤768 it has one); bg ink; flex-centered.
  - `#howCard.how-graphic`: width 90%, max-width 400. It holds three `.card-content` blocks, and only `.active` is displayed.
  - Each block holds an `svg.schematic.stage-N` (viewBox 0 0 400 380, rendered 400×380): `recon/svg/how-schematic-stage-{1,2,3}.svg`.
  - Schematic CSS (index.pretty.css L1966-2093):
    - Base: stroke-width 1.25; guides paper-12; labels Chivo 9px, ls 1.2px, fill paper-50; branches paper-30.
    - Primary strokes: route, nodes, icons and sink. The route stroke is 1.75.
    - `.discovery` is tertiary with `discover 3s ease-in-out infinite` (opacity .45↔1).
    - Stage 1: `.route` runs `map-route 3s ease-out both` (dasharray 100, dashoffset 100 → 0, i.e. it draws on).
    - Stages 2/3: branches at .35 and node icons hidden.
    - Stage 2: `.data-stream` is yellow, width 3, dasharray 2 23, `track-data 3s linear infinite` (dashoffset → -100).
    - Stage 3: the sink and evidence frame are tertiary; `.confirmed` text is tertiary, 9px, ls 1.8px.
- **Stepper JS** (bundled at the end of `index_1_lang.BP02SbqZ.pretty.js`):
  - The active step's fill runs `howProgressFill 6s linear forwards` (height 0→100%). On `animationend` it advances 1→2→3→1 and loops forever.
  - The fill is paused (animation-play-state) unless the section is ≥10% visible (IntersectionObserver threshold .1) **and** the mouse is not over `.how-stepper`. Hovering the stepper pauses it.
  - The first activation happens when the section first intersects.
  - Clicking calls `setHowStep(n)`.
  - On step change, `#howCard`'s height animates from the old to the new value with Motion `animate(el,{height:[from,to]},{duration:.4, easing:[.25,.1,.25,1]})`. Plain CSS or a WAAPI height tween is equivalent.
- `.how-bottom` CSS exists, but no element is rendered.

---

## 6. Benefits (`section.offline-section`, inline `style="padding:0"`, HTML L2779-3020)

- `.container.offline-main-container` (position relative). Its `:before` draws a 1px `--border` vertical line at left 50%, full height (hidden ≤768).
- `.offline-layout`:
  - Grid: 2 columns (520/520 @1440), gap 4rem (2rem ≤1280), align center.
  - Box: min-height 560, padding 3rem 0. Height 596 @1440.
  - ≤768: one column, gap 2.5rem, with the content first (order 1, centered text) and the visual second.
- Left `.offline-visual` holds `figure.review-funnel.with-rig` (480×500 viewBox, `recon/svg/review-funnel-with-rig.html`).
  - Three `.flow-pr` boxes, each with a primary check `.passed-mark` (stroke 2).
  - Animation: `flow 12s var(--delay) linear infinite`, delays 0, -4s, -8s.
  - Keyframes, as translate values: (240,119) at opacity 0 → opacity 1 by 6% → (240,303) over 49-57% (the pause at review) → (240,425) at 90% → (240,440) at opacity 0 over 98-100%.
- Right `.offline-content`:
  - `.badge.offline-badge` (left-aligned, inline mb 1.5rem, icon `badge-benefits.svg`): "Benefits". Note that `.badge` defaults to `margin:0 auto`, but `.offline-badge` sets `margin:0 0 1.5rem`.
  - `h2` reads "Fewer Vulnerabilities Reach Review". Chalet 700, `clamp(2.5rem,5vw,3.5rem)` / .9 (56/50.4 @1440; 40/36 ≤768), ls -.03em, mb 1.5rem.
  - `p` reads "Find and fix vulnerabilities while agents work in minutes, not weeks or months." 1rem / 1.7, paper-dim, max-width 440, mb 2.5rem.
- A `.section-divider`, then the `.container.three-col-container` (padding 0).
  - `.three-col-grid`: `1fr 1px 1fr 1px 1fr`, align center. The dividers are 1px `--border` with align-self stretch. ≤768: one column, and the dividers become 1px horizontal lines.
  - Each cell: padding 0 2rem, flex-centered. Inner: padding 2rem 0, text centered. Height 149.9 @1440.
  - `h3.three-col-heading`: Chalet 700, `clamp(1.5rem,2.5vw,2rem)` / .95, ls -.03em, mb .75rem.
  - `p`: .85rem / 1.6, paper-dim.
  - Copy:
    - "Catch More": "Catch more vulnerabilities before they make it to review or production."
    - "Chase Less": "Stop distracting developers with false positives so they can stay on task."
    - "Ship More": "Your developers spend more time shipping and less time managing vulnerability findings."

---

## 7. "Get started" (`section.setup-section#setup-rig`, HTML L3023-3328)

- Section: padding 7rem 0 (4rem ≤768). Container padding-inline clamp.
- `header.setup-heading` (centered, mb 3.5rem; 2.5rem ≤768):
  - `.badge` (mb 1.5rem, icon `badge-get-started.svg`): "Get started".
  - `h2#setup-title` reads "Set up Rig where`<br>`the code gets written.". Chalet 700, `clamp(2.5rem,5vw,4rem)` / .98 (64/62.72 @1440; 40 ≤768), ls -.03em.
- `ol.setup-steps`: 3-column grid, gap 2rem (1.25rem ≤1000; one column with gap 2.5rem ≤768), list-style none.
  - Each `li`: border-top border, padding-top 1.5rem.
  - `.step-number`: generic monospace .7rem, ls .09em, primary, mb .85rem.
  - `h3`: Chalet 700, `clamp(1.3rem,2vw,1.65rem)` / 1.1 (26.4 @1440, 25.6 @1280, 1.65rem ≤768), ls -.02em, mb 1rem.
  - `p`: .95rem / 1.7, paper-dim.
  - Copy:
    1. "01 / INSTALL" "Install the CLI.": "Rig runs on the developer’s computer, alongside the application being tested."
    2. "02 / CONNECT" "Connect the coding agent.": "Connect Rig to the agent’s completion hook so a finished task triggers a security check."
    3. "03 / CHECK" "Run the first check.": "Check the application and review the result, Rig checks subsequent work through the agent workflow."
- `p.cli-note`:
  - Layout: flex, centered, gap 1rem; padding 1.5rem (inline 0 and align flex-start ≤768); margin-top 2.5rem; `border-block:1px solid border`.
  - Type: .9rem / 1.6, paper-dim.
  - Contents: "›_" (generic monospace, 1.25rem, paper), then "Need feedback outside an agent session? Developers can also run a check directly from the CLI."
- `.stack-strip` (padding-top 2.5rem):
  - `h3` reads "Works with your stack." Chalet 700, 1.1rem / 1.1, centered, mb 3rem.
  - `.stack-grid`: `1.25fr 1fr 1.25fr 1fr`, gap 1.5rem. ≤1000: 2 columns with gap 2rem.
  - Each group's `h4`: generic monospace .65rem, 400, uppercase, ls .08em, paper-dim, centered, mb 1rem.
  - `.stack-items`: flex, centered, wrap, gap 1rem.
  - `.stack-item`: column, gap .5rem, .65rem, paper-dim. Its `svg` is 24×24, fill paper, opacity .8.
  - Groups:
    - Agents: Codex, Claude Code, OpenCode
    - Editors & terminal: VS Code, Terminal
    - Languages: Python, JavaScript, Rust
    - CI / CD: GitHub, GitLab
  - Icons: `recon/svg/stack-*.svg`.

---

## 8. FAQ (`section.faq-section`, HTML L3334-3652)

- Section: padding 8rem 0 0 (4rem 0 ≤768). It includes FAQPage JSON-LD (copy in HTML L3335-3390).
- `.badge.faq-badge` (icon `badge-faq.svg`): "FAQ".
- `h2.section-title.faq-title` reads "Frequently asked questions." Centered, mb 4rem (2rem ≤768); 56px @1440.
- Six `details.faq-item`:
  - Item: padding 0 1.5rem, border-top border (the last also has border-bottom).
  - `summary.faq-question`: flex, center, gap 1.25rem, padding 1.5rem 0, no marker. ≤768: padding 1.25rem 0, gap 1rem.
    - `.faq-question-number.mono-label`: Chivo .7rem **700**, primary, ls .15em.
    - `.faq-question-text`: Chalet **400**, 1.2rem / 1.2, ls -.02em (1.05rem ≤768).
    - `.faq-chevron`: 20×20 polyline svg, stroke 2, color paper-35, `transition: transform .3s ease, color .3s ease`. When `[open]` it rotates 180° and turns primary.
  - Hover: question text → `--text` (no visible change); chevron → paper-50.
  - `.faq-answer-wrap`: grid-template-rows 0fr → 1fr when `[open]`, with a `.3s ease` transition.
    - Note: the native `<details>` closes instantly, so only the opening animates in Chromium.
    - Answer `p`: padding 0 0 1.5rem 2.25rem (2.5rem ≤768), .9rem / 1.7 (.85rem ≤768), paper-dim, max-width 600.
- Q/A:
  1. Does Rig work with my existing coding agents?: Rig connects to a supported coding agent through its completion hook. During the demo, we’ll review the team’s agent and application to confirm fit.
  2. Who makes the code changes / fixes to reported vulnerabilities?: Your existing coding agent makes the fix. Rig supplies the finding, code location, and fix guidance, then checks the updated code.
  3. Is Rig checking every keystroke?: No. The automatic check starts when the agent signals that it has finished its work. Developers can also run a check manually through the CL (sic: the live rendered text really ends in "CL" with no period; copy it verbatim).
  4. What happens if a fix does not work?: Rig reports that the vulnerability remains. If testing cannot complete, that is reported separately from a passed check.
  5. Does a clean scan mean the entire application is secure?: No. It means Rig completed the checks within that scan’s scope without confirming a vulnerability. Untested paths are not proven safe, and incomplete checks are reported separately.
  6. Will Rig Collect my Data?: No, Rig is committed to being the most secure and private security testing tool available.. Our telemetry is limited. Tests run on device and code and conversations never leave the machine. (The double period is the site's own.)
- After the FAQ: a `.section-divider`, then `<div style="padding-top:4rem"><div class="section-divider" style="position:relative;top:-4rem">`. `main` ends here.

---

## 9. CTA (`section.cta-section`, outside `main`, HTML L3662-~4110)

- Section box:
  - Position and paint: `position:relative; z-index:10000; border-top:1px solid border; clip-path: inset(0 -100vw -100vw -100vw)`.
  - Text and spacing: `text-align:center; padding:12rem 0 16rem`. That is 192/256, giving a height of 878.7 @1440.
  - Responsive padding: 769-1024 8rem 0 10rem; ≤768 6rem 0 8rem.
- The section has no background of its own, so it shows the body's ink.
- `.cta-grid-wrap` (absolute inset 0, overflow hidden): `mask-image: linear-gradient(to bottom, transparent, black 16%, black 85%, transparent)`.
  - It contains `svg.cta-grid` (viewBox 0 0 2372 814; `recon/svg/cta-grid.svg`).
    - Position: absolute, left 50%, bottom 0, `width:max(135%,1450px)`, translate(-50%). Rendered 1944×667 at x -252 @1440; width 1250 ≤768.
    - `<image href=/assets/cta-wave-grid.svg>` with class `.grid-lines` and `filter: drop-shadow(1px 1px 3px oklch(0.7132 0.1431 253.83 / .5))`. Opacity .5 ≤768.
  - **8 flow groups**, each holding the same path 4×: `.flow-tail`, `.flow-dot.flow-halo`, `.flow-dot`, `.flow-dot.flow-core`.
    - Path attrs: `pathLength=100`, `vector-effect:non-scaling-stroke`, round caps, yellow stroke.
    - Per-group timing (`--flow-delay` / `--flow-duration`):

      | Group | Delay | Duration |
      |---|---|---|
      | 1 | 0s | 14s |
      | 2 | -2.3s | 16s |
      | 3 | -4.6s | 18s |
      | 4 | -6.9s | 14s |
      | 5 | -9.2s | 16s |
      | 6 | -11.5s | 18s |
      | 7 | -13.8s | 14s |
      | 8 | -16.1s | 16s |

    - `.flow-dot`: width 4, `stroke-dasharray:.04 199.96`, `filter: drop-shadow(0 0 5px #ffefbd) drop-shadow(0 0 2px yellow)`. Animation `dot-flow` (dashoffset 1 → -101, linear infinite).
    - `.flow-core`: stroke paper, width 2, no filter.
    - `.flow-tail`: width 2, dasharray 1.4 198.6, opacity .3. Animation `tail-flow` (2.4 → -99.6).
    - These are paused when the section isn't `.is-visible`, and hidden under reduced motion.
- `svg.cta-oversized-svg` (`recon/svg/cta-oversized-logo-outline.svg`): the logo outline drawn with stroke `rgba(240,237,230,.08)` at width .3.
  - Position: absolute, bottom -120, right -100, 900×900, opacity .04.
  - Hidden ≤768.
- `.container.cta-container` (z 2):
  - Hidden `svg.cta-bloom-filter` defines `#bloom`: two feGaussianBlur (stdDev 10 and 3) arithmetic-composited (k2 1, k3 .5 / .3). The file is `recon/svg/cta-bloom-filter.svg`.
  - `.cta-logo-wrap`: 65×64, margin 0 auto 3rem.
    - `svg.cta-logo-glow`: height 64, fill primary, `filter:url(#bloom)`, `animation: hdr-glow-pulse 3s ease-in-out infinite`. Keyframes: opacity .4 at blur 8px ↔ .7 at blur 12px.
    - `svg.cta-logo` sits on top: 65.2×64, fill primary (`recon/svg/cta-logo.svg`).
  - `.cta-heading-wrap` (inline-block, relative):
    - `.cta-heading-blur`: absolute, top 20%, left 50%, translate(-50%,-50%), 375%×600%, `radial-gradient(ellipse, ink 25%, transparent 60%)`, opacity .6, blur 8px, z -1. This is a dark halo behind the heading that knocks back the grid.
    - `h2.glitch-text[data-text="Ship Confidently"]` reads "Ship Confidently".
      - Type: Chalet 700, `clamp(4rem,8vw,7rem)` / .9 (112/100.8 @1440, 102.4 @1280; ≤768 `clamp(2.5rem,8vw,7rem)`, which is 61.4 @768 and 40 @390). ls -.03em.
      - Box: max-width 600, mb 3rem. It wraps to 2 lines at ≥1280 (600×201.6).
    - **Glitch pseudo-elements**: `::before`/`::after` with `content: attr(data-text)`, absolute, overlaid, opacity .6, no background (the CTA isn't inside `.hero`/`.content`).
      - `::before`: left +.5px, `text-shadow:-.5px 0 rgba(43,79,255,.2)`, `clip: rect(...)` animated by `glitch-subtle-1 5s infinite linear alternate-reverse`.
      - `::after`: left -.5px, `text-shadow:.5px 0 rgba(237,70,45,.2)`, `glitch-subtle-2 4.5s ...`.
      - Keyframes are in slug.pretty.css L311-386.
  - `.cta-btn-wrap` (flex center) contains `a.btn-chamfer.btn-cta.cta-btn` reading "Book a Demo".
    - Link: href `https://cal.com/adampatarino/demo?overlayCalendar=true`.
    - Arrow icon: `recon/svg/cta-btn-arrow.svg`, 18×18, stroke 2.5.
    - CSS source values: padding 2rem 3rem (32/48), font 1.3rem (20.8px), width 100%, max-width 500, centered, gap .75rem, `box-shadow:0 0 40px var(--primary-glow)` (clipped by the chamfer). Computed 500×88.5 @1280.
    - ≤768: padding 1.25rem 2rem, font 1rem, giving 311×59 @390.
  - `.cta-fine-print` CSS exists but no element is rendered.

---

## 10. Footer (`footer`, inline style L237-351)

- Box: `border-top:1px border; padding:4rem 0 10rem; background:#0a0a0a; position:relative; z-index:10000; overflow:hidden`. ≤768 padding 3rem 0 6rem. Height 429.2 @1440.
- `.container`:
  - `.footer-grid`: `2fr 1fr 1fr` (520/260/260 @1440), gap 2rem, z 2. ≤1024: 2 columns with the brand spanning the full row. ≤768: one column.
  - Brand: `a[href=/] > img.footer-logo[src=/assets/logo-white.svg alt=Rig]` at height 24 (98.7 wide).
    - `p` reads "Realtime Security Verification`<br>`for Coding Agents". .85rem / 1.6, paper-40, max-width 280, mt 1rem.
  - Columns: `h3.mono-label` is Chivo .75rem, 700 (UA default), ls .15em, uppercase, paper-40, mb 1.25rem.
    - "Connect": Twitter → https://x.com/rig_code and LinkedIn → https://www.linkedin.com/company/get-rig/ (both `target=_blank rel="noopener noreferrer"`).
    - "Legal": Terms of Service → /terms and Privacy Policy → /privacy.
    - `ul` has no list-style; `li` mb .6rem.
    - `a`: .85rem, paper-50, no underline, `transition: color .2s`. **Hover: color primary.**
  - `.footer-bottom`: flex, space-between, center; mt 4rem; pt 2rem; border-top border; z 2. ≤768: column, gap 1rem, align flex-start.
    - `span.mono-label` reads "© 2026 Rig AI Inc. All rights reserved." Chivo 12px, ls .1em, uppercase, paper-35.
    - `.status.footer-status` (Chivo .75rem uppercase, ls .12em, paper-50, gap .6rem): a 6×6 square `.footer-status-dot` in primary with `animation: blink 1.5s step-end infinite` (opacity 1/0/1), then "All systems local".

---

## 11. Motion summary and global scripts

- **No entrance or scroll-reveal animations.** Nothing fades or slides in on load or scroll.
- One global IntersectionObserver (threshold 0, rootMargin `200px 0px`) toggles `.is-visible` on every `section`, `.hero` and `footer`. It is used only to pause off-screen CSS animations: hero watermark and ticker, intro demo, and CTA flow dots.
- Always-running CSS loops:

  | Loop | Timing |
  |---|---|
  | Grain seed | 10s |
  | Hero watermark glitch | 4s linear |
  | Ticker | 30px/s |
  | Problem funnel | 12s |
  | Benefits funnel | 12s, staggered -4s / -8s |
  | Schematic discover | 3s |
  | Schematic data-stream | 3s |
  | Schematic route draw | 3s, runs once per stage-1 show |
  | Chat progress | 2.5s |
  | Thinking dots | 1.1s, stagger .15s |
  | CTA flow dots | 14/16/18s |
  | CTA logo glow pulse | 3s |
  | CTA glitch clip | 5s / 4.5s alternate-reverse |
  | Footer status blink | 1.5s step-end |

- JS-driven behaviors: §3 walkthrough (10s per step, 35% visibility gate), §5 stepper (6s per step, 10% visibility gate, hover pause, 0.4s height tween), and the ticker duration.
- Hover/focus states:
  - btn-dark and btn-cta: glitch.
  - Ticker links: underline, and the ticker pauses.
  - Walkthrough buttons: 8% primary tint.
  - FAQ chevron: paper-50.
  - Footer links: turn primary.
  - Focus-visible: 2px primary outlines (offset 2px on buttons and FAQ, 4px on walkthrough buttons, -2px on how-step).
- `prefers-reduced-motion` handling exists for every loop (see the CSS). Mirror it.
- Navbar: static. No scroll state and no mobile menu.

## 12. Hard-to-replicate notes for Build

1. Chalet headings are **synthesized bold** from a 400-only face. Tailwind preflight will un-bold them unless `font-weight:700` is set explicitly.
2. The film grain needs the inline `#grainy` SVG filter with its `<animate attributeName="seed">`. Applying a CSS `filter:url(#grainy)` to an empty fixed div is the trick.
3. The CTA flow dots rely on `pathLength=100` plus tiny dasharrays (`.04 199.96`) and `vector-effect:non-scaling-stroke`. Copy the paths from `recon/svg/cta-grid.svg` verbatim.
4. The CTA section uses `clip-path: inset(0 -100vw -100vw -100vw)` so its oversized children (a 2250px-wide heading blur) don't bleed above the top border. With `body{overflow-x:hidden}` the page doesn't scroll horizontally, but body.scrollWidth is 1845. Full-page screenshots needed `.cta-section{overflow:hidden}` to come out at 1440 wide.
5. The walkthrough and how-stepper timing logic must be ported exactly (§3, §5). Prefer porting the original JS into React effects over rewriting it.
6. Container math switches at 1280 to `max-width:90%` with zero padding. Some sections then re-add `padding-inline: clamp(1.25rem,4vw,3rem)`. At 1280 the content box is 1152 wide at x=64 (or 1056 at x=112 for sections with the inner clamp padding).
