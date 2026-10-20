# Local clone of https://rig.ai/ at /Users/riyaghosh/V3/rig.ai (React 18 + Vite + Tailwind v3)

Source: Local clone of https://rig.ai/ at /Users/riyaghosh/V3/rig.ai (React 18 + Vite + Tailwind v3)
Status: **measured-from-clone** · production approved: **false**
1 routes · 1 templates · 15 unique sections

> Generated from `ia.json` by `build.mjs`. Edit the JSON, not this file.

## Shape of the site

The largest 1 template (Home (marketing landing page)) accounts for 1 of 1 routes (100%). The remaining 0 routes span 0 templates.

| template | routes | share |
|---|---:|---:|
| Home (marketing landing page) | 1 | 100% |

## Page chrome

**1 routes carry chrome = `full`** — Home (marketing landing page).

## Sections by reuse

How widely a section is shared determines whether it belongs in a shared
component library or stays local to its page.

| section | category | templates | routes | implementation | scope |
|---|---|---:|---:|---|---|
| `shell.overlays` | SHELL | 1 | 1 | `src/components/Overlays.jsx + .content-lines in src/App.jsx` | Present on the 1 route, rendered once at the top of App. |
| `shell.site-header` | SHELL | 1 | 1 | `src/components/Hero.jsx > header.site-header` | Present on the 1 route, inside the hero section. |
| `hero.headline` | HERO | 1 | 1 | `src/components/Hero.jsx > section.hero` | Present on the 1 route as the first content block. |
| `hero.news-ticker` | HERO | 1 | 1 | `src/components/Hero.jsx > div.hero-ticker` | Present on the 1 route, pinned to the bottom edge of the hero. |
| `shell.section-divider` | SHELL | 1 | 1 | `src/App.jsx > div.section-divider` | Present on the 1 route, repeated between each of the 7 main sections. |
| `narrative.problem` | NARRATIVE | 1 | 1 | `src/components/ProblemSection.jsx (+ problem/ProblemFunnel.jsx)` | Present on the 1 route, first section inside main. |
| `demo.agent-walkthrough` | DEMO | 1 | 1 | `src/components/IntroRig.jsx (+ intro-rig/useWalkthrough.js)` | Present on the 1 route (#intro-rig). |
| `narrative.difference` | NARRATIVE | 1 | 1 | `src/components/Difference.jsx` | Present on the 1 route (#runtime-evidence). |
| `demo.how-stepper` | DEMO | 1 | 1 | `src/components/HowItWorks.jsx (+ how-it-works/useHowStepper.js, schematic-stage-{1,2,3}.svg)` | Present on the 1 route (#our-approach). |
| `narrative.benefits` | NARRATIVE | 1 | 1 | `src/components/Benefits.jsx (+ benefits/RigFunnel.jsx)` | Present on the 1 route, after the how-it-works stepper. |
| `onboarding.setup-steps` | ONBOARDING | 1 | 1 | `src/components/GetStarted.jsx > ol.setup-steps + .cli-note` | Present on the 1 route (#setup-rig). |
| `onboarding.stack-strip` | ONBOARDING | 1 | 1 | `src/components/GetStarted.jsx > div.stack-strip (+ get-started/StackIcons.jsx)` | Present on the 1 route, closing the get-started section. |
| `support.faq` | SUPPORT | 1 | 1 | `src/components/Faq.jsx` | Present on the 1 route, last section inside main. |
| `conversion.closing-cta` | CONVERSION | 1 | 1 | `src/components/Cta.jsx (+ cta/flowPaths.js, cta/logoPaths.js)` | Present on the 1 route, outside main, directly above the footer. |
| `shell.footer` | SHELL | 1 | 1 | `src/components/Footer.jsx` | Present on the 1 route as the final block. |

**0 shared sections** appear in more than one template and belong in a component library.

**15 single-use sections** appear in exactly one template. Building these
as "reusable" components up front would be speculative — keep them page-local
until a second caller actually appears.

## Templates

### Home (marketing landing page) — `template.home`

1 route · `/` · chrome: **full**

| # | category | section | |
|---:|---|---|---|
| 1 | SHELL | `shell.overlays` | page-local |
| 2 | SHELL | `shell.site-header` | page-local |
| 3 | HERO | `hero.headline` | page-local |
| 4 | HERO | `hero.news-ticker` | page-local |
| 5 | NARRATIVE | `narrative.problem` | page-local |
| 6 | SHELL | `shell.section-divider` | page-local |
| 7 | DEMO | `demo.agent-walkthrough` | page-local |
| 8 | NARRATIVE | `narrative.difference` | page-local |
| 9 | DEMO | `demo.how-stepper` | page-local |
| 10 | NARRATIVE | `narrative.benefits` | page-local |
| 11 | ONBOARDING | `onboarding.setup-steps` | page-local |
| 12 | ONBOARDING | `onboarding.stack-strip` | page-local |
| 13 | SUPPORT | `support.faq` | page-local |
| 14 | CONVERSION | `conversion.closing-cta` | page-local |
| 15 | SHELL | `shell.footer` | page-local |

## Section reference

### SHELL

_Page-wide chrome and fixed decoration: overlays, site header/nav, footer, section rhythm._

**`shell.overlays`** — Fixed, non-interactive full-viewport layers stacked above content: animated film grain (SVG #grainy feTurbulence filter, seed 0→100 over 10s), scanlines, RGB colour fringe, plus the two vertical guide lines at the 1200px container edges (div.content-lines).

· Present on the 1 route, rendered once at the top of App. · appears on 1 routes · implemented by `src/components/Overlays.jsx + .content-lines in src/App.jsx`

**`shell.site-header`** — Non-sticky top navigation inside the hero: Rig wordmark linking to '/' and a chamfered dark 'Get a Demo' button (href '#'). No mobile menu at any width.

· Present on the 1 route, inside the hero section. · appears on 1 routes · implemented by `src/components/Hero.jsx > header.site-header`

**`shell.section-divider`** — Thin horizontal rule plus 4rem spacers placed between consecutive main-content sections; owned by App, not by any section component.

· Present on the 1 route, repeated between each of the 7 main sections. · appears on 1 routes · implemented by `src/App.jsx > div.section-divider`

**`shell.footer`** — #0a0a0a footer: logo + tagline, Connect column (social links neutralised to '#'), Legal column (/terms, /privacy — unbuilt), copyright row and a blinking 'All systems local' status.

· Present on the 1 route as the final block. · appears on 1 routes · implemented by `src/components/Footer.jsx`

### HERO

_Above-the-fold opening block and its attached news ticker._

**`hero.headline`** — Blue (#2981e0) opening panel: two-line Chalet H1, supporting paragraph, chamfered CTA button (href '#'), and a faded Rig-mark watermark that glitches on a 4s loop.

· Present on the 1 route as the first content block. · appears on 1 routes · implemented by `src/components/Hero.jsx > section.hero`

**`hero.news-ticker`** — Horizontally scrolling strip of third-party AI-security news headlines in Geist Pixel at 30px/s; pauses on hover/focus and when the hero is off-screen. Links neutralised to '#'.

· Present on the 1 route, pinned to the bottom edge of the hero. · appears on 1 routes · implemented by `src/components/Hero.jsx > div.hero-ticker`

### NARRATIVE

_Problem framing and product explanation blocks that tell the story in sequence._

**`narrative.problem`** — 'The problem' block: badge, display headline, and a 3-column grid pairing a looping 12s CSS review-funnel SVG (backlog building up) with four numbered problem cards.

· Present on the 1 route, first section inside main. · appears on 1 routes · implemented by `src/components/ProblemSection.jsx (+ problem/ProblemFunnel.jsx)`

**`narrative.difference`** — 'The Difference' block: static-analysis vs runtime-testing two-panel comparison figure, followed by three numbered evidence points. No motion.

· Present on the 1 route (#runtime-evidence). · appears on 1 routes · implemented by `src/components/Difference.jsx`

**`narrative.benefits`** — 'Benefits' block: a second review-funnel animation (flow with Rig) beside the benefits headline and copy, then a three-column row of outcome statements.

· Present on the 1 route, after the how-it-works stepper. · appears on 1 routes · implemented by `src/components/Benefits.jsx (+ benefits/RigFunnel.jsx)`

### DEMO

_Interactive or self-playing product demonstrations and schematic animations._

**`demo.agent-walkthrough`** — 'Introducing Rig' block: heading and copy over a fake IDE + agent-chat panel that self-plays 4 steps × 10s (1.8s sub-phases) once ≥35% visible, with step markers, prev/next/play controls and a two-column step caption.

· Present on the 1 route (#intro-rig). · appears on 1 routes · implemented by `src/components/IntroRig.jsx (+ intro-rig/useWalkthrough.js)`

**`demo.how-stepper`** — 'How it Works' block: intro heading/copy and a three-step accordion that auto-advances every 6s with a progress bar, pauses on hover, and swaps between three animated schematic SVGs.

· Present on the 1 route (#our-approach). · appears on 1 routes · implemented by `src/components/HowItWorks.jsx (+ how-it-works/useHowStepper.js, schematic-stage-{1,2,3}.svg)`

### ONBOARDING

_Setup steps and integration/stack information._

**`onboarding.setup-steps`** — 'Get started' block: badge, two-line heading, three numbered setup steps in an ordered list, and a CLI note.

· Present on the 1 route (#setup-rig). · appears on 1 routes · implemented by `src/components/GetStarted.jsx > ol.setup-steps + .cli-note`

**`onboarding.stack-strip`** — 'Works with your stack' strip: 4 labelled groups holding 10 third-party tool icons (inline SVG brand marks).

· Present on the 1 route, closing the get-started section. · appears on 1 routes · implemented by `src/components/GetStarted.jsx > div.stack-strip (+ get-started/StackIcons.jsx)`

### SUPPORT

_Question-and-answer content._

**`support.faq`** — Numbered list of 6 native details/summary questions with chevrons; answers open with a 0.3s grid-rows transition.

· Present on the 1 route, last section inside main. · appears on 1 routes · implemented by `src/components/Faq.jsx`

### CONVERSION

_Closing call-to-action block._

**`conversion.closing-cta`** — 'Ship Confidently' block: animated wave grid with glowing dots flowing along 8 paths (14/16/18s), oversized outline mark, pulsing glow logo, glitch heading and a 500px chamfered 'Book a Demo' button (href '#').

· Present on the 1 route, outside main, directly above the footer. · appears on 1 routes · implemented by `src/components/Cta.jsx (+ cta/flowPaths.js, cta/logoPaths.js)`
