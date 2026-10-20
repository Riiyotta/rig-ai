# Rig.ai clone - design-repo

An AI-ready, machine-validated description of the cloned **rig.ai** homepage: tokens, primitives, components, section
contracts, one page template, a compatibility graph, a draft-07 PageSpec schema, a real example, a semantic validator and
adversarial tests. A generator composes a `PageSpec` JSON; `schema/semantic_validate.py` decides whether it is admissible.

> **Status: `design-review-pending`, `productionApproved: false`. Do not publish this repository.**
> Rig (Rig AI Inc.) is a real, live company. The repo contains its proprietary marketing copy and describes its brand marks,
> ten real third-party tool logos and real third-party news headlines. See *Real-company content* below.

## Layout

```
README.md  CHANGELOG.md  registry.manifest.json
tokens/00-foundation/   color, typography, spacing, radius, breakpoint, elevation, icon-size, motion (verbatim CSS values + citations)
tokens/10-semantic/     color / typography / motion roles -> foundation refs
tokens/20-component/    button, badge, faq, stepper, ticker, footer
tokens/30-layout/       container, nav, guide lines, divider, hero
tokens/themes/dark.json the only theme (semantic -> resolved value)
tokens/llm/             token-catalog (referenceable), token-policy, component-allowlist (versioned, closed)
assets/asset-roles.json closed assetRole vocabulary + generation/licensing policy (protected roles pinned)
motion/motion-contract.json  closed motion patterns + pinned reduced-motion fallbacks
primitives/  components/  sections/   one JSON contract each
templates/templates.json    template.home (route "/"), dead internal routes
compatibility/graph.json    rules (error|warn), each implemented in semantic_validate.py
schema/                     pagespec.schema.json, example.pagespec.json, semantic_validate.py, tests/adversarial_test.py
extraction/                 measured-values.json (external citation ledger), verify_all.py, prove_drift.py
```

## Counts (recomputed from disk by `extraction/verify_all.py`, check COUNTS)

| count | value |
|---|---|
| `tokensFoundation` | 177 |
| `tokensSemantic` | 36 |
| `tokensComponent` | 48 |
| `tokensLayout` | 11 |
| `tokensTotal` | 272 |
| `primitives` | 10 |
| `components` | 16 |
| `sections` | 11 |
| `templates` | 1 |
| `routes` | 1 |
| `deadInternalRoutes` | 2 |
| `assetRoles` | 11 |
| `motionPatterns` | 9 |
| `graphRules` | 19 |

## Run

Requires python3 (>= 3.9) and `jsonschema`.

```
python3 extraction/verify_all.py                       # every structural / parity / citation check
python3 schema/tests/adversarial_test.py               # every mutation rejected, every control passes
python3 extraction/prove_drift.py --workdir <empty dir> # proves verify_all.py catches each drift class
python3 schema/semantic_validate.py <pagespec.json>    # validate a generated page
```

When `design-repo/` sits inside the cloned project, citations (`{path, lines, anchor}`) are resolved against the real
source (file exists, range in bounds, anchor text inside the range) and every foundation token value is checked against
its cited line. Standalone (e.g. unzipped elsewhere) those checks degrade to warnings; everything else still runs.

## Structural constraints (read before generating)

1. **No external links.** All outbound links were removed from the clone on request: every anchor is `#`, `/`, `/terms`
   or `/privacy`; there is no `og:url`, canonical or JSON-LD, and `og:image` is local. The schema's `internalHref`
   pattern and rules `INTERNAL_HREF_ONLY` / `INTERNAL_ROUTE_EXISTS` reject `http(s)://`, protocol-relative `//`,
   `mailto:`, `tel:`, `javascript:`, `data:` and unknown internal routes. `meta` has no canonical / jsonLd field.
2. **Real-company content.** Asset/content roles are a closed enum (`assets/asset-roles.json`). Protected roles -
   `brand.wordmark`, `brand.logo`, `brand.mark`, `meta.og-image`, `thirdparty.tool-logo`, `editorial.news-headline` - accept
   only `placeholder` or `user-supplied-licensed` sources. Generators must never fabricate or reproduce real logos, brand
   marks, third-party tool logos or integration claims, or real news headlines/attributions. Proprietary illustrations
   (funnels, schematics, product demo, wave grid, badge glyphs) may only be generated as original work.
   The example PageSpec therefore uses placeholders for the ticker, the stack logos and all brand marks.
3. **Dead internal routes.** `/terms` and `/privacy` are linked from the footer but no such pages exist (single route,
   no router). They are recorded in `templates.json#deadInternalRoutes`, allowed only in `shell.footer`, and must not be
   recreated as templates.
4. **Preserved typos.** "map of of", "bottle neck", FAQ 3 ending "CL" and FAQ 6 "available.." are the live site's own
   copy and are kept verbatim in contracts and the example.

## Key design facts

- Dark single theme: ink page `oklch(0.225 0.013 188.03)`, blue hero `oklch(0.6014 0.1657 253.83)`, paper text.
- Chalet (display) ships only a 400 face: every Chalet h1-h3 renders synthesized bold, so `font-weight: 700` must be set
  explicitly (Tailwind preflight is disabled; the original reset is used). FAQ question text stays Chalet 400.
- Instrument Sans (body, variable 400-700), Chivo Mono (labels/buttons/code, variable 400-800), Geist Pixel Square
  (hero ticker only).
- Desktop-first: container 1200px + 3rem padding; 90% / 0 padding <=1280; 2rem <=1024; 1.25rem <=768.
- Square chrome: no border-radius; buttons use a 14px chamfer clip-path.
- Motion: no entrance animations. Off-screen pausing only for hero, #intro-rig demo and CTA (funnels keep running).
  Walkthrough 10s steps / 1.8s phases / 35% gate; stepper 6s auto-advance (also under reduced motion); ticker 30px/s;
  CTA flow loops 14/16/18s; how-it-works height tween 0.4s cubic-bezier(.25,.1,.25,1); FAQ open 0.3s grid rows.

## Evidence and corrections

`extraction/measured-values.json` is the citation ledger for evidence outside this package (clone source, recon
measurements, CLONE_SPEC.md). It records QA-verified corrections and the CLONE_SPEC / assets-manifest claims that were
found wrong (walkthrough hover tint, CTA hover shadow, "reduced motion handled for every loop", mid-transition button
measurements, wrong asset paths, the accidental 1200px dump, superseded outbound links) plus the stale `dist/` build.
