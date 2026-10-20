# rig.ai clone — information architecture

`ia.json` is the only hand-edited file. `IA.md` and `matrix.csv` are **generated** — don't edit them; they are overwritten on every build.

```bash
node validate.mjs && node build.mjs
```

Source: transcribed from this clone's own code (`src/App.jsx` render order, `src/components/*.jsx`), cross-checked against `CLONE_SPEC.md` and the captured original markup in `recon/source/`. Every section carries `implementedBy`, pointing at the component that renders it.

## What the data shows

- **One route, one template.** The site is a single landing page (`/`) made of 15 sections in 7 categories; `validate.mjs` reconciles with no hard failures.
- **All 15 sections are single-use**, so nothing yet justifies a shared component library beyond the global primitives in `src/index.css` (buttons, badge, container, display type). Keep sections page-local until a second page appears.
- **Motion is concentrated in 5 sections** — `hero.headline`/`hero.news-ticker`, `demo.agent-walkthrough`, `demo.how-stepper`, `conversion.closing-cta` — plus the always-on `shell.overlays`. The rest are static or loop-only CSS.
- **`shell.section-divider` appears once in the template list but renders 7 times** (between main sections, owned by `App.jsx`). The validator's "scope mentions 7, computed = 1" note is about that repeat count, not a route mismatch — don't "fix" either number.

## Deliberately not modeled

- `/terms` and `/privacy` are linked from the footer but do not exist in this clone (dead internal routes). They are not templates.
- External links were removed from the clone on request: all outbound hrefs are `#`; no canonical/og:url/JSON-LD.
- Third-party content (news headlines in the ticker, 10 tool brand icons, the Rig marks) belongs to its owners — treat as placeholders to replace in any reuse.
