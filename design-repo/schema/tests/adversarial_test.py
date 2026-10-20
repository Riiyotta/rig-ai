#!/usr/bin/env python3
"""Adversarial suite: every mutation of the real example must be REJECTED with the expected rule, and every control must
pass with zero errors. Exit 0 only if all cases behave as expected.

Usage: python3 schema/tests/adversarial_test.py
"""
import copy, json, os, sys
sys.dont_write_bytecode = True

HERE = os.path.dirname(os.path.abspath(__file__))
SCHEMA_DIR = os.path.dirname(HERE)
REPO = os.path.dirname(SCHEMA_DIR)
sys.path.insert(0, SCHEMA_DIR)
import semantic_validate as sv  # noqa: E402

with open(os.path.join(SCHEMA_DIR, "example.pagespec.json"), encoding="utf-8") as f:
    BASE = json.load(f)


def idx(spec, section):
    return next(i for i, n in enumerate(spec["nodes"]) if n["section"] == section)


def N(spec, section):
    return spec["nodes"][idx(spec, section)]


def mutate(fn):
    s = copy.deepcopy(BASE)
    fn(s)
    return s


def hero_cta(v):
    return lambda s: N(s, "hero.headline-ticker")["content"]["primaryCta"].__setitem__("href", v)


def swap(a, b):
    def f(s):
        i, j = idx(s, a), idx(s, b)
        s["nodes"][i], s["nodes"][j] = s["nodes"][j], s["nodes"][i]
    return f


def remove(section):
    return lambda s: s["nodes"].pop(idx(s, section))


def dup(section):
    def f(s):
        n = copy.deepcopy(N(s, section))
        n["id"] = n["id"] + "-2"
        s["nodes"].insert(idx(s, section) + 1, n)
    return f


# (name, mutation, expected rule-id or 'SCHEMA', needle that must appear in that error)
MUTATIONS = [
    # ---- external hrefs (no-outbound-links constraint)
    ("href-https", hero_cta("https://example.invalid/demo"), "INTERNAL_HREF_ONLY", "not an internal href"),
    ("href-http", hero_cta("http://example.invalid"), "INTERNAL_HREF_ONLY", "not an internal href"),
    ("href-protocol-relative", hero_cta("//example.invalid/demo"), "INTERNAL_HREF_ONLY", "not an internal href"),
    ("href-mailto", hero_cta("mailto:sales@example.invalid"), "INTERNAL_HREF_ONLY", "not an internal href"),
    ("href-tel", hero_cta("tel:+15555550100"), "INTERNAL_HREF_ONLY", "not an internal href"),
    ("href-javascript", hero_cta("javascript:alert(1)"), "INTERNAL_HREF_ONLY", "not an internal href"),
    ("href-data-uri", hero_cta("data:text/html,hi"), "INTERNAL_HREF_ONLY", "not an internal href"),
    ("href-backslash-trick", hero_cta("/\\example.invalid"), "INTERNAL_HREF_ONLY", "not an internal href"),
    ("href-ticker-external", lambda s: N(s, "hero.headline-ticker")["content"]["ticker"][0].__setitem__("href", "https://news.example.invalid/a"), "INTERNAL_HREF_ONLY", "ticker[0].href"),
    ("href-footer-social-external", lambda s: N(s, "shell.footer")["content"]["columns"][0]["links"][0].__setitem__("href", "https://social.example.invalid/rig"), "INTERNAL_HREF_ONLY", "links[0].href"),
    ("href-footer-logo-external", lambda s: N(s, "shell.footer")["content"].__setitem__("logoHref", "https://example.invalid"), "INTERNAL_HREF_ONLY", "logoHref"),
    ("href-unknown-internal-route", hero_cta("/pricing"), "INTERNAL_ROUTE_EXISTS", "'/pricing'"),
    ("href-dead-route-outside-footer", hero_cta("/terms"), "DEAD_ROUTES_FOOTER_ONLY", "'/terms'"),
    ("meta-canonical-added", lambda s: s["meta"].__setitem__("canonical", "https://example.invalid/"), "NO_EXTERNAL_META", "meta.canonical"),
    ("meta-jsonld-added", lambda s: s["meta"].__setitem__("jsonLd", {"@type": "FAQPage"}), "NO_EXTERNAL_META", "meta.jsonLd"),
    ("route-external", lambda s: s.__setitem__("route", "https://example.invalid/"), "INTERNAL_HREF_ONLY", "must be a root-relative path"),
    # ---- template cross-reference (declared template vs its REAL node list)
    ("template-unknown", lambda s: s.__setitem__("template", "template.pricing"), "TEMPLATE_NODE_SEQUENCE", "does not exist"),
    ("template-missing-required-faq", remove("faq.accordion"), "TEMPLATE_NODE_SEQUENCE", "requires 'faq.accordion'"),
    ("template-missing-required-stepper", remove("steps.stepper"), "TEMPLATE_NODE_SEQUENCE", "requires 'steps.stepper'"),
    ("template-wrong-order", swap("comparison.evidence", "steps.stepper"), "TEMPLATE_NODE_SEQUENCE", "does not follow"),
    ("template-repeated-section", dup("faq.accordion"), "TEMPLATE_NODE_SEQUENCE", "not repeatable"),
    ("template-region-mismatch", lambda s: N(s, "conversion.cta-glitch").__setitem__("region", "main"), "TEMPLATE_NODE_SEQUENCE", "region 'main'"),
    ("route-not-in-template", lambda s: s.__setitem__("route", "/pricing"), "ROUTE_MATCHES_TEMPLATE", "not a route of template.home"),
    ("overlays-not-first", swap("chrome.overlays", "hero.headline-ticker"), "OVERLAYS_FIRST", "first node"),
    ("two-heroes", dup("hero.headline-ticker"), "ONE_HERO", "exactly one hero"),
    ("footer-not-last", swap("conversion.cta-glitch", "shell.footer"), "FOOTER_LAST", "last node"),
    ("cta-not-before-footer", remove("conversion.cta-glitch"), "TEMPLATE_NODE_SEQUENCE", "requires 'conversion.cta-glitch'"),
    ("main-not-contiguous", lambda s: s["nodes"].insert(idx(s, "steps.stepper"), s["nodes"].pop(idx(s, "conversion.cta-glitch"))), "MAIN_REGION_CONTIGUOUS", "not contiguous"),
    # ---- schema-layer closure
    ("unknown-section-type", lambda s: N(s, "faq.accordion").__setitem__("section", "faq.tabs"), "SCHEMA", "is not one of"),
    ("unknown-content-field", lambda s: N(s, "faq.accordion")["content"].__setitem__("subtitle", "extra"), "SCHEMA", "Additional properties"),
    ("missing-required-content", lambda s: N(s, "faq.accordion")["content"].pop("items"), "SCHEMA", "'items' is a required property"),
    ("wrong-card-count", lambda s: N(s, "problem.funnel-cards")["content"]["cards"].pop(), "SCHEMA", "[minItems]"),
    ("missing-motion", lambda s: N(s, "faq.accordion").pop("motion"), "SCHEMA", "'motion' is a required property"),
    ("missing-reduced-motion-fallback", lambda s: N(s, "faq.accordion")["motion"].pop("reducedMotionFallback"), "SCHEMA", "'reducedMotionFallback' is a required property"),
    ("wrong-fallback-for-pattern", lambda s: N(s, "hero.headline-ticker")["motion"].__setitem__("reducedMotionFallback", "none"), "REDUCED_MOTION_FALLBACK_PINNED", "!= pinned 'ticker-static-scrollable'"),
    ("invented-motion-field", lambda s: N(s, "faq.accordion")["motion"].__setitem__("inventedAnimation", "spin"), "SCHEMA", "Additional properties"),
    ("motion-pattern-not-allowed", lambda s: N(s, "faq.accordion").__setitem__("motion", {"pattern": "walkthrough-autoplay", "reducedMotionFallback": "walkthrough-manual-full-scenes"}), "MOTION_PATTERN_ALLOWED", "not in"),
    ("unknown-motion-pattern", lambda s: N(s, "faq.accordion")["motion"].__setitem__("pattern", "parallax"), "SCHEMA", "is not one of"),
    ("extra-node-prop", lambda s: N(s, "faq.accordion").__setitem__("style", {"color": "#ff0000"}), "SCHEMA", "Additional properties"),
    # ---- tokens
    ("unknown-surface-token", lambda s: N(s, "faq.accordion").__setitem__("surface", "color.surface.neon"), "SURFACE_TOKEN_PINNED", "not in tokens/llm/token-catalog.json"),
    ("valid-but-wrong-surface", lambda s: N(s, "hero.headline-ticker").__setitem__("surface", "color.surface.page"), "SURFACE_TOKEN_PINNED", "!= pinned 'color.surface.hero'"),
    ("raw-color-as-surface", lambda s: N(s, "faq.accordion").__setitem__("surface", "#151e1d"), "SCHEMA", "does not match"),
    ("surface-on-overlays", lambda s: N(s, "chrome.overlays").__setitem__("surface", "color.surface.page"), "SCHEMA", "[not]"),
    # ---- asset roles / real-company content
    ("unknown-asset-role", lambda s: N(s, "problem.funnel-cards")["content"]["illustration"].__setitem__("assetRole", "illustration.stock-photo"), "SCHEMA", "is not one of"),
    ("fabricated-logo-role", lambda s: N(s, "hero.headline-ticker")["content"]["navLogo"].__setitem__("assetRole", "brand.generated-logo"), "SCHEMA", "is not one of"),
    ("fabricated-wordmark", lambda s: N(s, "hero.headline-ticker")["content"]["navLogo"].__setitem__("source", "generated-original"), "PROTECTED_ASSET_SOURCE", "not allowed for 'brand.wordmark'"),
    ("fabricated-tool-logo", lambda s: N(s, "setup.steps-stack")["content"]["stackGroups"][0]["items"][0].__setitem__("source", "generated-original"), "PROTECTED_ASSET_SOURCE", "not allowed for 'thirdparty.tool-logo'"),
    ("fabricated-news-headline", lambda s: N(s, "hero.headline-ticker")["content"]["ticker"][0].__setitem__("source", "generated-original"), "PROTECTED_ASSET_SOURCE", "not allowed for 'editorial.news-headline'"),
    ("fabricated-cta-mark", lambda s: N(s, "conversion.cta-glitch")["content"]["mark"].__setitem__("source", "generated-original"), "PROTECTED_ASSET_SOURCE", "not allowed for 'brand.mark'"),
    ("fabricated-og-image", lambda s: s["meta"]["ogImage"].__setitem__("source", "generated-original"), "PROTECTED_ASSET_SOURCE", "not allowed for 'meta.og-image'"),
    ("tool-logo-in-hero", lambda s: N(s, "hero.headline-ticker")["content"]["watermark"].__setitem__("assetRole", "thirdparty.tool-logo"), "ASSET_ROLE_ALLOWED_FOR_SECTION", "not allowed"),
    ("ticker-item-wrong-role", lambda s: N(s, "hero.headline-ticker")["content"]["ticker"][0].__setitem__("assetRole", "brand.mark"), "ASSET_ROLE_ALLOWED_FOR_SECTION", "must be 'editorial.news-headline'"),
    ("stack-item-role-swap-to-generatable", lambda s: N(s, "setup.steps-stack")["content"]["stackGroups"][0]["items"][0].update({"assetRole": "decor.badge-glyph", "source": "generated-original"}), "ASSET_ROLE_ALLOWED_FOR_SECTION", "must be 'thirdparty.tool-logo'"),
    ("og-image-wrong-role", lambda s: s["meta"]["ogImage"].__setitem__("assetRole", "decor.wave-grid"), "ASSET_ROLE_ALLOWED_FOR_SECTION", "must be 'meta.og-image'"),
    # ---- copy budgets
    ("maxwords-hero-headline", lambda s: N(s, "hero.headline-ticker")["content"]["headlineLines"].__setitem__(0, "Build Security Into Every Single Agent Loop"), "MAX_WORDS", "headlineLines[0]"),
    ("maxwords-faq-answer", lambda s: N(s, "faq.accordion")["content"]["items"][0].__setitem__("answer", " ".join(["word"] * 60)), "MAX_WORDS", "items[0].answer"),
    ("maxwords-cta-heading", lambda s: N(s, "conversion.cta-glitch")["content"].__setitem__("heading", "Ship Confidently With Rig Every Single Day Of The Week"), "MAX_WORDS", "heading"),
]


def CONTROLS():
    out = [("example-as-is", copy.deepcopy(BASE))]
    s = copy.deepcopy(BASE)
    for n in s["nodes"]:
        if "none" in sv.contracts()[n["section"]]["motion"]["allowedPatterns"]:
            n["motion"] = {"pattern": "none", "reducedMotionFallback": "none"}
    out.append(("all-motion-none", s))
    s = copy.deepcopy(BASE)
    N(s, "hero.headline-ticker")["content"]["primaryCta"]["href"] = "#setup-rig"
    N(s, "conversion.cta-glitch")["content"]["cta"]["href"] = "/"
    out.append(("internal-fragment-and-root-hrefs", s))
    s = copy.deepcopy(BASE)
    N(s, "hero.headline-ticker")["content"]["navLogo"]["source"] = "user-supplied-licensed"
    N(s, "setup.steps-stack")["content"]["stackGroups"][0]["items"][0]["source"] = "user-supplied-licensed"
    out.append(("user-supplied-licensed-protected-assets", s))
    s = copy.deepcopy(BASE)
    N(s, "faq.accordion")["content"]["items"] = N(s, "faq.accordion")["content"]["items"][:2]
    out.append(("shorter-faq-list", s))
    return out


def main():
    failures = 0
    print(f"MUTATIONS ({len(MUTATIONS)}) - each must be rejected by the expected rule")
    for name, fn, rule, needle in MUTATIONS:
        errs, _ = sv.check(mutate(fn))
        hit = [e for e in errs if e.startswith(rule + ":") and needle in e]
        ok = bool(hit)
        failures += not ok
        print(f"  {'REJECTED' if ok else 'MISSED  '}  {name:38} [{rule}] {hit[0][:110] if hit else (errs[:2] if errs else 'no errors')}")
    controls = CONTROLS()
    print(f"CONTROLS ({len(controls)}) - each must pass with 0 errors and 0 warnings")
    for name, spec in controls:
        errs, warns = sv.check(spec)
        ok = not errs and not warns
        failures += not ok
        print(f"  {'PASS' if ok else 'FAIL'}  {name}" + ("" if ok else f"  {errs[:3]} {warns[:3]}"))
    # the warn-severity rule must warn (not fail): exercised directly, since any page making the funnels adjacent also breaks
    # the single template's node order (an error).
    print("SEVERITY")
    sev_ok = any(r["id"] == "NO_ADJACENT_FUNNELS" and r["severity"] == "warn" for r in sv.load("compatibility/graph.json")["rules"])
    w_warns = []
    sv.r_no_adjacent_funnels({"nodes": [{"section": "problem.funnel-cards"}, {"section": "benefits.funnel-split"}]}, w_warns.append)
    sev_ok = sev_ok and bool(w_warns)
    failures += not sev_ok
    print(f"  {'PASS' if sev_ok else 'FAIL'}  NO_ADJACENT_FUNNELS is warn-severity and fires on adjacent funnels")
    total = len(MUTATIONS) + len(controls) + 1
    if failures:
        print(f"ADVERSARIAL SUITE FAILED: {failures} of {total} case(s) misbehaved")
        sys.exit(1)
    print(f"ADVERSARIAL SUITE PASSED: {len(MUTATIONS)}/{len(MUTATIONS)} mutations rejected, {len(controls)}/{len(controls)} controls clean, severity check ok")


if __name__ == "__main__":
    main()
