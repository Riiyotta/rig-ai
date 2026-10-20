# Changelog

## 1.0.0 - initial build

- Built from scratch, bottom-up: tokens -> primitives -> components -> sections -> template -> compatibility graph ->
  draft-07 schema -> real example -> semantic validator -> adversarial suite -> manifest / allowlist / docs.
- Every citation line number was derived by searching the real source for an anchor string; verify_all.py re-checks the
  anchor is inside the cited range and that each foundation token value appears at its cited line.
- Structural constraints encoded: internal-only hrefs (schema pattern + INTERNAL_HREF_ONLY / INTERNAL_ROUTE_EXISTS),
  protected real-company / third-party asset roles with pinned policies (schema enum + PROTECTED_ASSET_SOURCE +
  verify_all PINNED), dead internal routes /terms and /privacy (DEAD_ROUTES_FOOTER_ONLY; not templates).
- Corrections vs. pre-existing evidence recorded in extraction/measured-values.json#specCorrections (SPEC-1..SPEC-7) and
  #qaVerifiedCorrections; dist/ flagged as a stale build that still contains outbound links (outside this package's scope).
- Known source accessibility gaps recorded as `ungated-in-source` reduced-motion fallbacks (film grain, FAQ transition,
  footer blink) and `accessibilityGap` notes (hero watermark glitch, CTA glow/glitch, stepper auto-advance).
