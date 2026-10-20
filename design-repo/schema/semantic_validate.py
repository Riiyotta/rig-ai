#!/usr/bin/env python3
"""Semantic validator for a Rig.ai-clone PageSpec.

Enforces, in order:
  1. JSON Schema draft-07 (schema/pagespec.schema.json) via `jsonschema` (required dependency).
  2. Every rule in compatibility/graph.json, respecting severity (error fails, warn is reported). Each rule id is
     implemented by exactly one function in RULES below; extraction/verify_all.py fails if the graph and RULES drift.
     The key rule, TEMPLATE_NODE_SEQUENCE, cross-references the spec's DECLARED template against that template's
     REAL node list in templates/templates.json (not nodes[] in isolation).

Usage:  python3 schema/semantic_validate.py <pagespec.json>   -> prints VALID / INVALID, exit 0/1
Import: check(spec) -> (errors, warnings)   each item is "RULE_ID: message"
"""
import json, os, re, sys
sys.dont_write_bytecode = True

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
_CACHE = {}


def load(rel):
    if rel not in _CACHE:
        with open(os.path.join(REPO, rel), encoding="utf-8") as f:
            _CACHE[rel] = json.load(f)
    return _CACHE[rel]


def contracts():
    if "__sections__" not in _CACHE:
        out = {}
        d = os.path.join(REPO, "sections")
        for f in sorted(os.listdir(d)):
            if f.endswith(".json"):
                c = load("sections/" + f)
                out[c["id"]] = c
        _CACHE["__sections__"] = out
    return _CACHE["__sections__"]


def words(s):
    return len(str(s).split())


HREF_RX = re.compile(r"^(#[A-Za-z0-9_-]*|/(?![/\\])[A-Za-z0-9._~/-]*)$")


def walk(o, path=""):
    """Yield (path, key, value) for every dict entry in the spec."""
    if isinstance(o, dict):
        for k, v in o.items():
            p = f"{path}.{k}" if path else k
            yield p, k, v
            yield from walk(v, p)
    elif isinstance(o, list):
        for i, v in enumerate(o):
            yield from walk(v, f"{path}[{i}]")


def objects(o, path=""):
    """Yield (path, dict) for EVERY dict in the tree, including dicts that are list items."""
    if isinstance(o, dict):
        yield path, o
        for k, v in o.items():
            yield from objects(v, f"{path}.{k}" if path else k)
    elif isinstance(o, list):
        for i, v in enumerate(o):
            yield from objects(v, f"{path}[{i}]")


def media_items(node):
    """Every object carrying an assetRole inside a node's content (dict fields AND list items)."""
    for p, v in objects(node.get("content", {})):
        if "assetRole" in v:
            yield p, v


def resolve_path(obj, path):
    """'cards[].title' -> list of (concrete_path, value)."""
    out = [("", obj)]
    for part in path.split("."):
        nxt = []
        is_list = part.endswith("[]")
        key = part[:-2] if is_list else part
        for p, o in out:
            if not isinstance(o, dict) or key not in o:
                continue
            v = o[key]
            q = f"{p}.{key}" if p else key
            if is_list:
                if isinstance(v, list):
                    nxt.extend((f"{q}[{i}]", x) for i, x in enumerate(v))
            else:
                nxt.append((q, v))
        out = nxt
    return out


# ------------------------------------------------------------------------------------------------ rules
def r_template_node_sequence(spec, E):
    tpls = load("templates/templates.json")["templates"]
    t = tpls.get(spec.get("template"))
    if t is None:
        E(f"declared template {spec.get('template')!r} does not exist")
        return
    want = [n["section"] for n in t["nodes"]]
    regions = {n["section"]: n["region"] for n in t["nodes"]}
    got = [n.get("section") for n in spec.get("nodes", [])]
    for s in got:
        if s not in want:
            E(f"section {s!r} is not part of {t['id']} (foreign section)")
    for n in t["nodes"]:
        if n["required"] and n["section"] not in got:
            E(f"{t['id']} requires {n['section']!r} but the spec omits it")
        if not n.get("repeatable") and got.count(n["section"]) > 1:
            E(f"{n['section']!r} is not repeatable in {t['id']} but appears {got.count(n['section'])}x")
    present = [s for s in got if s in want]
    expected_order = [s for s in want if s in present]
    dedup = list(dict.fromkeys(present))
    if dedup != expected_order:
        E(f"node order {dedup} does not follow {t['id']} order {expected_order}")
    for i, n in enumerate(spec.get("nodes", [])):
        s = n.get("section")
        if s in regions and n.get("region") != regions[s]:
            E(f"nodes[{i}] {s!r} region {n.get('region')!r} != template region {regions[s]!r}")


def r_route_matches_template(spec, E):
    t = load("templates/templates.json")["templates"].get(spec.get("template"))
    if t and spec.get("route") not in t["routes"]:
        E(f"route {spec.get('route')!r} is not a route of {t['id']} {t['routes']}")


def _secs(spec):
    return [n.get("section") for n in spec.get("nodes", [])]


def r_overlays_first(spec, E):
    s = _secs(spec)
    if not s or s[0] != "chrome.overlays":
        E("chrome.overlays must be the first node")


def r_one_hero(spec, E):
    s = _secs(spec)
    heroes = [i for i, x in enumerate(s) if x and x.startswith("hero.")]
    if len(heroes) != 1:
        E(f"exactly one hero required, found {len(heroes)}")
    elif heroes[0] != 1:
        E(f"hero must directly follow chrome.overlays (found at index {heroes[0]})")


def r_one_per_page(spec, E):
    s = _secs(spec)
    for x in sorted(set(s), key=str):
        if s.count(x) > 1 and contracts().get(x, {}).get("constraints", {}).get("onePerPage"):
            E(f"{x!r} is onePerPage but appears {s.count(x)}x")


def r_main_region_contiguous(spec, E):
    regs = [n.get("region") for n in spec.get("nodes", [])]
    idx = [i for i, r in enumerate(regs) if r == "main"]
    if idx and idx != list(range(idx[0], idx[-1] + 1)):
        E("region:'main' nodes are not contiguous")
    if idx:
        before = [r for r in regs[:idx[0]] if r not in ("chrome", "pre-main")]
        after = [r for r in regs[idx[-1] + 1:] if r != "post-main"]
        if before or after:
            E("main region must sit between pre-main (hero) and post-main (CTA, footer) nodes")


def r_cta_precedes_footer(spec, E):
    s = _secs(spec)
    if "conversion.cta-glitch" in s and "shell.footer" in s:
        if s.index("conversion.cta-glitch") + 1 != s.index("shell.footer"):
            E("conversion.cta-glitch must immediately precede shell.footer")


def r_footer_last(spec, E):
    s = _secs(spec)
    if not s or s[-1] != "shell.footer":
        E("shell.footer must be the last node")


def r_no_adjacent_funnels(spec, E):
    s = _secs(spec)
    pair = {"problem.funnel-cards", "benefits.funnel-split"}
    for a, b in zip(s, s[1:]):
        if {a, b} == pair:
            E("problem.funnel-cards and benefits.funnel-split are adjacent (shared review-funnel illustration)")


def r_motion_pattern_allowed(spec, E):
    for i, n in enumerate(spec.get("nodes", [])):
        c = contracts().get(n.get("section"))
        p = (n.get("motion") or {}).get("pattern")
        if c and p not in c["motion"]["allowedPatterns"]:
            E(f"nodes[{i}] {n['section']}: motion pattern {p!r} not in {c['motion']['allowedPatterns']}")


def r_reduced_motion_fallback_pinned(spec, E):
    pats = load("motion/motion-contract.json")["patterns"]
    for i, n in enumerate(spec.get("nodes", [])):
        m = n.get("motion") or {}
        p = pats.get(m.get("pattern"))
        if p is None:
            E(f"nodes[{i}]: unknown motion pattern {m.get('pattern')!r}")
        elif m.get("reducedMotionFallback") != p["reducedMotionFallback"]:
            E(f"nodes[{i}]: reducedMotionFallback {m.get('reducedMotionFallback')!r} != pinned {p['reducedMotionFallback']!r} for {m.get('pattern')!r}")


def r_max_words(spec, E):
    for i, n in enumerate(spec.get("nodes", [])):
        c = contracts().get(n.get("section"))
        if not c:
            continue
        for fpath, b in c["content"]["maxWords"].items():
            for p, v in resolve_path(n.get("content", {}), fpath):
                if isinstance(v, str) and words(v) > b["maxWords"]:
                    E(f"nodes[{i}] {n['section']}.{p}: {words(v)} words > maxWords {b['maxWords']}")


def _hrefs(spec):
    for p, k, v in walk(spec):
        if k in ("href", "logoHref"):
            yield p, v


def r_internal_href_only(spec, E):
    for p, v in _hrefs(spec):
        if not isinstance(v, str) or not HREF_RX.match(v):
            E(f"{p}: {v!r} is not an internal href (only '#', '#frag' or root-relative paths)")
    r = spec.get("route")
    if isinstance(r, str) and not r.startswith("/"):
        E(f"route {r!r} must be a root-relative path")


def _route_ok(v):
    t = load("templates/templates.json")
    path = v.split("#")[0]
    return path in t["routes"] or path in t["deadInternalRoutes"]


def r_internal_route_exists(spec, E):
    for p, v in _hrefs(spec):
        if isinstance(v, str) and HREF_RX.match(v) and v.startswith("/") and not _route_ok(v):
            E(f"{p}: {v!r} is neither a template route nor a declared dead internal route")


def r_dead_routes_footer_only(spec, E):
    dead = load("templates/templates.json")["deadInternalRoutes"]
    for i, n in enumerate(spec.get("nodes", [])):
        for p, k, v in walk(n):
            if k in ("href", "logoHref") and isinstance(v, str) and v.split("#")[0] in dead and n.get("section") != "shell.footer":
                E(f"nodes[{i}] {n.get('section')}.{p}: dead internal route {v!r} may only be linked from shell.footer")


def r_asset_role_allowed(spec, E):
    roles = load("assets/asset-roles.json")["roles"]
    for i, n in enumerate(spec.get("nodes", [])):
        c = contracts().get(n.get("section"))
        for p, m in media_items(n):
            r = m.get("assetRole")
            if r not in roles:
                E(f"nodes[{i}].content.{p}: unknown assetRole {r!r}")
            elif c and r not in c["assetRoles"]:
                E(f"nodes[{i}] {n['section']}.{p}: assetRole {r!r} not allowed (allowed {c['assetRoles']})")
    og = (spec.get("meta") or {}).get("ogImage") or {}
    if og and og.get("assetRole") != "meta.og-image":
        E(f"meta.ogImage: assetRole must be 'meta.og-image', got {og.get('assetRole')!r}")
    # field-specific roles: the ticker only carries headlines, the stack only carries tool logos
    for i, n in enumerate(spec.get("nodes", [])):
        for t in (n.get("content") or {}).get("ticker", []) if isinstance((n.get("content") or {}).get("ticker"), list) else []:
            if isinstance(t, dict) and t.get("assetRole") != "editorial.news-headline":
                E(f"nodes[{i}] ticker item assetRole must be 'editorial.news-headline', got {t.get('assetRole')!r}")
        for g in (n.get("content") or {}).get("stackGroups", []) if isinstance((n.get("content") or {}).get("stackGroups"), list) else []:
            for it in g.get("items", []) if isinstance(g, dict) else []:
                if isinstance(it, dict) and it.get("assetRole") != "thirdparty.tool-logo":
                    E(f"nodes[{i}] stack item assetRole must be 'thirdparty.tool-logo', got {it.get('assetRole')!r}")


def r_protected_asset_source(spec, E):
    roles = load("assets/asset-roles.json")["roles"]
    items = [(f"nodes[{i}].content.{p}", m) for i, n in enumerate(spec.get("nodes", [])) for p, m in media_items(n)]
    og = (spec.get("meta") or {}).get("ogImage")
    if isinstance(og, dict):
        items.append(("meta.ogImage", og))
    for p, m in items:
        role = roles.get(m.get("assetRole"))
        if role and m.get("source") not in role["allowedSources"]:
            E(f"{p}: source {m.get('source')!r} not allowed for {m.get('assetRole')!r} ({role['generationPolicy']}; allowed {role['allowedSources']})")


def r_surface_token_pinned(spec, E):
    cat = set(load("tokens/llm/token-catalog.json")["surfaces"])
    for i, n in enumerate(spec.get("nodes", [])):
        c = contracts().get(n.get("section"))
        s = n.get("surface")
        if c is None:
            continue
        if c["surfaceToken"] is None:
            if s is not None:
                E(f"nodes[{i}] {n['section']}: takes no surface token, got {s!r}")
            continue
        if s not in cat:
            E(f"nodes[{i}] {n['section']}: surface {s!r} is not in tokens/llm/token-catalog.json surfaces {sorted(cat)}")
        elif s != c["surfaceToken"]:
            E(f"nodes[{i}] {n['section']}: surface {s!r} != pinned {c['surfaceToken']!r}")


def r_no_external_meta(spec, E):
    meta = spec.get("meta") or {}
    for k in meta:
        if k not in ("title", "description", "ogImage"):
            E(f"meta.{k}: not allowed (no canonical / og:url / JSON-LD in this clone)")


RULES = {
    "TEMPLATE_NODE_SEQUENCE": r_template_node_sequence, "ROUTE_MATCHES_TEMPLATE": r_route_matches_template,
    "OVERLAYS_FIRST": r_overlays_first, "ONE_HERO": r_one_hero, "ONE_PER_PAGE": r_one_per_page,
    "MAIN_REGION_CONTIGUOUS": r_main_region_contiguous, "CTA_PRECEDES_FOOTER": r_cta_precedes_footer, "FOOTER_LAST": r_footer_last,
    "NO_ADJACENT_FUNNELS": r_no_adjacent_funnels, "MOTION_PATTERN_ALLOWED": r_motion_pattern_allowed,
    "REDUCED_MOTION_FALLBACK_PINNED": r_reduced_motion_fallback_pinned, "MAX_WORDS": r_max_words,
    "INTERNAL_HREF_ONLY": r_internal_href_only, "INTERNAL_ROUTE_EXISTS": r_internal_route_exists,
    "DEAD_ROUTES_FOOTER_ONLY": r_dead_routes_footer_only, "ASSET_ROLE_ALLOWED_FOR_SECTION": r_asset_role_allowed,
    "PROTECTED_ASSET_SOURCE": r_protected_asset_source, "SURFACE_TOKEN_PINNED": r_surface_token_pinned,
    "NO_EXTERNAL_META": r_no_external_meta,
}


def schema_errors(spec):
    from jsonschema import Draft7Validator
    v = Draft7Validator(load("schema/pagespec.schema.json"))
    def short(m):
        return m if len(m) <= 240 else m[:150] + " ... " + m[-85:]
    return [f"SCHEMA: {'/'.join(map(str, e.absolute_path)) or '<root>'}: [{e.validator}] {short(e.message)}"
            for e in sorted(v.iter_errors(spec), key=lambda e: list(map(str, e.absolute_path)))]


def check(spec):
    errors = schema_errors(spec)
    warnings = []
    graph = {r["id"]: r for r in load("compatibility/graph.json")["rules"]}
    for rid, rule in graph.items():
        fn = RULES.get(rid)
        if fn is None:
            errors.append(f"{rid}: rule declared in compatibility/graph.json has no implementation")
            continue
        sink = errors if rule["severity"] == "error" else warnings
        try:
            fn(spec, lambda msg, rid=rid, sink=sink: sink.append(f"{rid}: {msg}"))
        except Exception as ex:  # malformed spec already reported by SCHEMA; never crash
            if not errors:
                errors.append(f"{rid}: could not evaluate ({type(ex).__name__}: {ex})")
    return errors, warnings


def main():
    if len(sys.argv) != 2:
        print(__doc__)
        sys.exit(2)
    with open(sys.argv[1], encoding="utf-8") as f:
        spec = json.load(f)
    errors, warnings = check(spec)
    for w in warnings:
        print("WARN ", w)
    for e in errors:
        print("ERROR", e)
    print("VALID" if not errors else f"INVALID ({len(errors)} error(s))")
    sys.exit(0 if not errors else 1)


if __name__ == "__main__":
    main()
