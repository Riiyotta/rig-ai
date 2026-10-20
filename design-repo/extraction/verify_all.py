#!/usr/bin/env python3
"""One-shot verification of this design-repo. Exit 0 only if every check passes.

Checks (each printed as PASS / FAIL / WARN):
  JSON_PARSE            every .json file parses
  NO_JUNK               no .DS_Store / __MACOSX / __pycache__ / *.pyc inside the package
  NO_ABSOLUTE_PATHS     no absolute machine paths in any file
  NO_EXTERNAL_URLS      no external URLs in any contract/doc (only the draft-07 meta-schema URI; test fixtures exempt)
  SCHEMA_META           schema/pagespec.schema.json is a valid draft-07 schema
  EXAMPLE_VALID         schema/example.pagespec.json -> semantic_validate.check(): 0 errors, 0 warnings
  ALLOWLIST_PARITY      tokens/llm/component-allowlist.json <-> sections/, primitives/, components/ files AND <-> schema node/content properties
  ENUM_PARITY           schema enums (section, assetRole, motion pattern, fallback) <-> sections/, assets/asset-roles.json, motion/motion-contract.json
  VERSION_PARITY        registry.manifest.json allowlistVersion == component-allowlist.json version (machine-enforced)
  COUNTS                registry.manifest.json counts and the README counts table == recomputed from disk
  ENTRYPOINTS           every manifest entry point exists INSIDE this package (no '..', no absolute paths)
  GRAPH_VALIDATOR_PARITY compatibility/graph.json rule ids == schema/semantic_validate.py RULES; severities error|warn
  TEMPLATES             template nodes reference real sections, regions agree with contracts, routes map 1:1, dead routes are not routes,
                        mustBeFirst/mustBeLast contract claims agree with the template's real node order
  TOKEN_REFS            every {ref} in semantic/component/layout/theme tokens and every primitive/component/catalog token resolves;
                        theme resolutions equal foundation values; token-policy categories are real foundation categories
  ASSET_ROLES           closed policy/source vocabularies; protected roles PINNED to exact policies (independent copy below), never 'generated-original'
  MOTION                section motion patterns/fallbacks agree with motion/motion-contract.json
  CITATIONS             every {path, lines, anchor} citation resolves against the evidence tree: file exists, range within file, anchor inside range
  MEASUREMENTS          every recon measurement citation resolves to the recorded value
  TOKEN_VALUES          every foundation token's literal value is found inside its cited source range

Evidence tree = the cloned-site project root that contains design-repo/ (or $DESIGN_REPO_EVIDENCE_ROOT). When absent (standalone
package), CITATIONS / MEASUREMENTS / TOKEN_VALUES degrade to warnings instead of failing.
Drift-proofing: extraction/prove_drift.py injects each class of drift into a scratch copy and asserts this script FAILS.
"""
import json, os, re, sys
sys.dont_write_bytecode = True

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
sys.path.insert(0, os.path.join(REPO, "schema"))

# Independent copy of the protected-role pins. Deliberately NOT read from assets/asset-roles.json, so editing both the role and
# the file's own pinnedPolicies block still fails here.
PINNED = {"brand.wordmark": "placeholder-or-user-supplied-licensed-only", "brand.logo": "placeholder-or-user-supplied-licensed-only",
          "brand.mark": "placeholder-or-user-supplied-licensed-only", "meta.og-image": "placeholder-or-user-supplied-licensed-only",
          "thirdparty.tool-logo": "placeholder-or-user-supplied-licensed-only", "editorial.news-headline": "must-not-fabricate"}

RESULTS = []  # (check, status, detail)


def _evidence_root():
    env = os.environ.get("DESIGN_REPO_EVIDENCE_ROOT")
    if env:
        return env if os.path.isdir(env) else None
    parent = os.path.dirname(REPO)
    if os.path.isfile(os.path.join(parent, "src", "App.jsx")) and os.path.isfile(os.path.join(parent, "CLONE_SPEC.md")):
        return parent
    return None


EVIDENCE = _evidence_root()


def J(rel):
    with open(os.path.join(REPO, rel), encoding="utf-8") as f:
        return json.load(f)


def all_files():
    for root, dirs, files in os.walk(REPO):
        for d in dirs:
            yield os.path.relpath(os.path.join(root, d), REPO) + "/"
        for f in files:
            yield os.path.relpath(os.path.join(root, f), REPO)


def json_files(sub=""):
    base = os.path.join(REPO, sub)
    out = []
    for root, _, files in os.walk(base):
        for f in files:
            if f.endswith(".json"):
                out.append(os.path.relpath(os.path.join(root, f), REPO))
    return sorted(out)


def ids_in(d):
    return sorted(f[:-5] for f in os.listdir(os.path.join(REPO, d)) if f.endswith(".json"))


def walk(o, fn):
    if isinstance(o, dict):
        fn(o)
        for v in o.values():
            walk(v, fn)
    elif isinstance(o, list):
        for v in o:
            walk(v, fn)


def check(name):
    def deco(fn):
        def run():
            errs, warns = [], []
            try:
                fn(errs, warns)
            except Exception as ex:
                errs.append(f"crashed: {type(ex).__name__}: {ex}")
            RESULTS.append((name, "FAIL" if errs else ("WARN" if warns else "PASS"), errs, warns))
        run.__name__ = name
        CHECKS.append(run)
        return run
    return deco


CHECKS = []


@check("JSON_PARSE")
def c_json(E, W):
    for rel in json_files():
        try:
            J(rel)
        except Exception as ex:
            E.append(f"{rel}: {ex}")


@check("NO_JUNK")
def c_junk(E, W):
    for rel in all_files():
        base = rel.rstrip("/").split("/")[-1]
        if base in (".DS_Store", "__MACOSX", "__pycache__") or base.endswith(".pyc"):
            E.append(f"junk in package: {rel}")


TEXT_EXT = (".json", ".md", ".py", ".txt")
ABS = [re.compile(p) for p in ("/" + "Users/", "/" + "home/[a-z]", "/" + "private/" + "tmp", r"[A-Za-z]:\\\\" + "Users")]


@check("NO_ABSOLUTE_PATHS")
def c_abs(E, W):
    for rel in all_files():
        if rel.endswith(TEXT_EXT):
            txt = open(os.path.join(REPO, rel), encoding="utf-8").read()
            for rx in ABS:
                for m in rx.finditer(txt):
                    E.append(f"{rel}: absolute path fragment {m.group(0)!r} at offset {m.start()}")


URL_RX = re.compile(r"[a-z][a-z0-9+.-]*://[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+")
URL_EXEMPT = {"schema/tests/adversarial_test.py", "extraction/prove_drift.py", "extraction/verify_all.py"}


@check("NO_EXTERNAL_URLS")
def c_urls(E, W):
    for rel in all_files():
        if rel.endswith(TEXT_EXT) and rel not in URL_EXEMPT:
            txt = open(os.path.join(REPO, rel), encoding="utf-8").read()
            for m in URL_RX.finditer(txt):
                if m.group(0) == "http" + "://json-schema.org" and rel == "schema/pagespec.schema.json":
                    continue
                E.append(f"{rel}: external URL {m.group(0)!r}")


@check("SCHEMA_META")
def c_schema_meta(E, W):
    from jsonschema import Draft7Validator
    Draft7Validator.check_schema(J("schema/pagespec.schema.json"))


@check("EXAMPLE_VALID")
def c_example(E, W):
    import semantic_validate as sv
    errs, warns = sv.check(J("schema/example.pagespec.json"))
    E.extend(errs)
    E.extend("(warning not allowed in example) " + w for w in warns)


@check("ALLOWLIST_PARITY")
def c_allow(E, W):
    al = J("tokens/llm/component-allowlist.json")
    sch = J("schema/pagespec.schema.json")
    for kind in ("sections", "primitives", "components"):
        listed = sorted(x["id"] if isinstance(x, dict) else x for x in al[kind])
        files = ids_in(kind)
        for x in sorted(set(listed) - set(files)):
            E.append(f"{kind}: allowlist entry {x!r} has no contract file (phantom)")
        for x in sorted(set(files) - set(listed)):
            E.append(f"{kind}: contract file {x}.json has no allowlist entry (orphan)")
        for x in files:
            if J(f"{kind}/{x}.json").get("id") != x:
                E.append(f"{kind}/{x}.json: id field != filename")
    node_props = sorted(sch["definitions"]["node"]["properties"])
    if sorted(al["nodeSettableProps"]) != node_props:
        E.append(f"nodeSettableProps {sorted(al['nodeSettableProps'])} != schema node properties {node_props}")
    for entry in al["sections"]:
        sid = entry["id"]
        if not os.path.isfile(os.path.join(REPO, "sections", sid + ".json")):
            continue
        c = J(f"sections/{sid}.json")
        cdef = sch["definitions"].get("content_" + sid.replace(".", "_").replace("-", "_"), {})
        trio = (sorted(entry["contentFields"]), sorted(c["content"]["fields"]), sorted(cdef.get("properties", {})))
        if not (trio[0] == trio[1] == trio[2]):
            E.append(f"{sid}: content fields disagree allowlist={trio[0]} contract={trio[1]} schema={trio[2]}")
        if entry["allowedPatterns"] != c["motion"]["allowedPatterns"]:
            E.append(f"{sid}: allowlist allowedPatterns != contract")
        if entry["assetRoles"] != c["assetRoles"]:
            E.append(f"{sid}: allowlist assetRoles != contract")
    prims, comps, secs = set(ids_in("primitives")), set(ids_in("components")), set(ids_in("sections"))
    tpls = set(J("templates/templates.json")["templates"])
    for s in secs:
        for x in J(f"sections/{s}.json").get("componentsUsed", []):
            if x not in comps:
                E.append(f"sections/{s}.json: componentsUsed {x!r} has no component contract")
    for kind in ("primitives", "components"):
        for x in ids_in(kind):
            d = J(f"{kind}/{x}.json")
            for u in d.get("usedBy", []):
                if u not in secs | tpls:
                    E.append(f"{kind}/{x}.json: usedBy {u!r} is not a section or template")
            for p in d.get("composes", []):
                if p not in prims:
                    E.append(f"{kind}/{x}.json: composes {p!r} is not a primitive")


def _schema_enum_sections(sch):
    return sorted(sch["definitions"]["node"]["properties"]["section"]["enum"])


@check("ENUM_PARITY")
def c_enum(E, W):
    sch = J("schema/pagespec.schema.json")
    roles = sorted(J("assets/asset-roles.json")["roles"])
    pats = J("motion/motion-contract.json")["patterns"]
    al = J("tokens/llm/component-allowlist.json")
    if _schema_enum_sections(sch) != ids_in("sections"):
        E.append(f"schema section enum {_schema_enum_sections(sch)} != sections/ {ids_in('sections')}")
    for d in ("media", "tickerItem", "stackItem"):
        if sorted(sch["definitions"][d]["properties"]["assetRole"]["enum"]) != roles:
            E.append(f"schema {d}.assetRole enum != assets/asset-roles.json roles")
    if sorted(sch["definitions"]["motion"]["properties"]["pattern"]["enum"]) != sorted(pats):
        E.append("schema motion pattern enum != motion-contract patterns")
    consts = {b["if"]["properties"]["pattern"]["const"]: b["then"]["properties"]["reducedMotionFallback"]["const"] for b in sch["definitions"]["motion"]["allOf"]}
    if consts != {p: v["reducedMotionFallback"] for p, v in pats.items()}:
        E.append("schema pattern->fallback consts != motion-contract fallbacks")
    if sorted(al["assetRoles"]) != roles:
        E.append("allowlist assetRoles != asset-roles.json")
    if sorted(al["motionPatterns"]) != sorted(pats):
        E.append("allowlist motionPatterns != motion-contract")
    tpl_enum = sorted(sch["properties"]["template"]["enum"])
    if tpl_enum != sorted(J("templates/templates.json")["templates"]):
        E.append(f"schema template enum {tpl_enum} != templates.json")


@check("VERSION_PARITY")
def c_version(E, W):
    m = J("registry.manifest.json")
    al = J("tokens/llm/component-allowlist.json")
    if m.get("allowlistVersion") != al.get("version"):
        E.append(f"manifest allowlistVersion {m.get('allowlistVersion')!r} != component-allowlist version {al.get('version')!r}")


def count_tokens():
    n = {"foundation": 0, "semantic": 0, "component": 0, "layout": 0}

    def cnt(o):
        c = 0
        def fn(d):
            nonlocal c
            if "$value" in d:
                c += 1
        walk(o, fn)
        return c
    for rel in json_files("tokens/00-foundation"):
        n["foundation"] += cnt(J(rel))
    for rel in json_files("tokens/10-semantic"):
        d = J(rel)
        n["semantic"] += cnt(d) + sum(len(v) for k, v in d.items() if k == "typography")
    for rel in json_files("tokens/20-component"):
        n["component"] += cnt(J(rel))
    for rel in json_files("tokens/30-layout"):
        n["layout"] += cnt(J(rel))
    n["total"] = sum(n.values())
    return n


def recount():
    t = J("templates/templates.json")
    tok = count_tokens()
    return {"tokensFoundation": tok["foundation"], "tokensSemantic": tok["semantic"], "tokensComponent": tok["component"], "tokensLayout": tok["layout"],
            "tokensTotal": tok["total"], "primitives": len(ids_in("primitives")), "components": len(ids_in("components")), "sections": len(ids_in("sections")),
            "templates": len(t["templates"]), "routes": len(t["routes"]), "deadInternalRoutes": len(t["deadInternalRoutes"]),
            "assetRoles": len(J("assets/asset-roles.json")["roles"]), "motionPatterns": len(J("motion/motion-contract.json")["patterns"]),
            "graphRules": len(J("compatibility/graph.json")["rules"])}


@check("COUNTS")
def c_counts(E, W):
    real = recount()
    stated = J("registry.manifest.json").get("counts", {})
    for k, v in real.items():
        if stated.get(k) != v:
            E.append(f"manifest counts.{k} = {stated.get(k)!r}, recomputed {v}")
    for k in stated:
        if k not in real:
            E.append(f"manifest counts.{k} is not a recomputed count")
    readme = open(os.path.join(REPO, "README.md"), encoding="utf-8").read()
    for k, v in real.items():
        m = re.search(r"^\| `" + re.escape(k) + r"` \| (\d+) \|", readme, re.M)
        if not m:
            E.append(f"README counts table lacks `{k}`")
        elif int(m.group(1)) != v:
            E.append(f"README counts table `{k}` = {m.group(1)}, recomputed {v}")


@check("ENTRYPOINTS")
def c_entry(E, W):
    m = J("registry.manifest.json")
    eps = m.get("entryPoints", {})
    flat = []
    for v in eps.values():
        flat.extend(v if isinstance(v, list) else [v])
    if not flat:
        E.append("no entryPoints")
    for p in flat:
        if os.path.isabs(p) or ".." in p.split("/") or p.startswith("~"):
            E.append(f"entryPoint {p!r} points outside the package")
        elif not os.path.isfile(os.path.join(REPO, p)):
            E.append(f"entryPoint {p!r} does not exist")


@check("GRAPH_VALIDATOR_PARITY")
def c_graph(E, W):
    import semantic_validate as sv
    rules = J("compatibility/graph.json")["rules"]
    ids = [r["id"] for r in rules]
    if len(ids) != len(set(ids)):
        E.append("duplicate rule ids in graph.json")
    for r in rules:
        if r.get("severity") not in ("error", "warn"):
            E.append(f"{r['id']}: severity must be error|warn")
    for x in sorted(set(ids) - set(sv.RULES)):
        E.append(f"graph rule {x} has no implementation in semantic_validate.RULES")
    for x in sorted(set(sv.RULES) - set(ids)):
        E.append(f"semantic_validate rule {x} is not declared in compatibility/graph.json")


@check("TEMPLATES")
def c_templates(E, W):
    t = J("templates/templates.json")
    secs = set(ids_in("sections"))
    covered = {}
    for tid, tp in t["templates"].items():
        order = [n["section"] for n in tp["nodes"]]
        for n in tp["nodes"]:
            if n["section"] not in secs:
                E.append(f"{tid}: node section {n['section']!r} has no contract")
                continue
            c = J(f"sections/{n['section']}.json")
            if c["region"] != n["region"]:
                E.append(f"{tid}: {n['section']} region {n['region']} != contract region {c['region']}")
            k = c.get("constraints", {})
            if k.get("mustBeFirst") and order[0] != n["section"]:
                E.append(f"{n['section']} claims mustBeFirst but {tid} starts with {order[0]}")
            if k.get("mustBeLast") and order[-1] != n["section"]:
                E.append(f"{n['section']} claims mustBeLast but {tid} ends with {order[-1]}")
            if k.get("mustPrecede") and order.index(n["section"]) + 1 < len(order) and order[order.index(n["section"]) + 1] != k["mustPrecede"]:
                E.append(f"{n['section']} claims mustPrecede {k['mustPrecede']} but {tid} disagrees")
            if k.get("mustFollow") and order.index(n["section"]) > 0 and order[order.index(n["section"]) - 1] != k["mustFollow"]:
                E.append(f"{n['section']} claims mustFollow {k['mustFollow']} but {tid} disagrees")
        for r in tp["routes"]:
            covered.setdefault(r, []).append(tid)
    for r, tids in covered.items():
        if len(tids) != 1:
            E.append(f"route {r} assigned to {tids}")
        if t["routes"].get(r) != tids[0]:
            E.append(f"routes map disagrees for {r}")
    for r in t["routes"]:
        if r not in covered:
            E.append(f"route {r} not covered by any template")
    for r in t["deadInternalRoutes"]:
        if r in t["routes"] or r in covered:
            E.append(f"dead internal route {r} must not be a template route")
    used = {n["section"] for tp in t["templates"].values() for n in tp["nodes"]}
    for s in sorted(secs - used):
        E.append(f"section {s} is not used by any template")


FOUND_NS = {"tokens/00-foundation/color.json": "color", "tokens/00-foundation/typography.json": None, "tokens/00-foundation/spacing.json": "spacing",
            "tokens/00-foundation/radius.json": "radius", "tokens/00-foundation/breakpoint.json": "breakpoint", "tokens/00-foundation/elevation.json": "elevation",
            "tokens/00-foundation/icon-size.json": "iconSize", "tokens/00-foundation/motion.json": "motion"}


def token_index():
    found, sem, comp = {}, {}, {}
    for rel in json_files("tokens/00-foundation"):
        d = J(rel)
        for cat, v in d.items():
            if isinstance(v, dict) and cat not in ("knownBroken", "fontFiles") and not cat.startswith("$"):
                for k, t in v.items():
                    if isinstance(t, dict) and "$value" in t:
                        found[f"{cat}.{k}"] = t
    for rel in json_files("tokens/10-semantic"):
        for cat, v in J(rel).items():
            if isinstance(v, dict):
                for k, t in v.items():
                    sem[f"{cat}.{k}"] = t
    for rel in json_files("tokens/20-component") + json_files("tokens/30-layout"):
        for cat, v in J(rel).items():
            if isinstance(v, dict):
                for k, t in v.items():
                    comp[f"{cat}.{k}"] = t
    return found, sem, comp


def resolve(ref, idx, depth=0):
    found, sem, comp = idx
    if depth > 8:
        return None
    for table in (sem, comp, found):
        if ref in table:
            t = table[ref]
            v = t.get("$value") if isinstance(t, dict) and "$value" in t else t
            if isinstance(v, str) and v.startswith("{") and v.endswith("}"):
                return resolve(v[1:-1], idx, depth + 1)
            return v
    return None


@check("TOKEN_REFS")
def c_refs(E, W):
    idx = token_index()
    refs = []
    for rel in json_files("tokens/10-semantic") + json_files("tokens/20-component") + json_files("tokens/30-layout"):
        def fn(d, rel=rel):
            for v in d.values():
                if isinstance(v, str):
                    refs.extend((rel, x) for x in re.findall(r"\{([^{}]+)\}", v))
        walk(J(rel), fn)
    for kind in ("primitives", "components"):
        for x in ids_in(kind):
            refs.extend((f"{kind}/{x}.json", r) for r in J(f"{kind}/{x}.json").get("tokens", []))
    cat = J("tokens/llm/token-catalog.json")
    for k in ("color", "typography", "motion", "surfaces"):
        refs.extend(("tokens/llm/token-catalog.json", r) for r in cat[k])
    for rel, r in refs:
        if resolve(r, idx) is None:
            E.append(f"{rel}: token ref {{{r}}} does not resolve")
    found = idx[0]
    th = J("tokens/themes/dark.json")
    for k, v in th["color"].items():
        real = resolve(v["ref"].strip("{}"), idx)
        if real != v["resolved"]:
            E.append(f"themes/dark.json {k}: resolved {v['resolved']!r} != {real!r}")
        if "color." + k not in idx[1]:
            E.append(f"themes/dark.json {k}: not a semantic color role")
    surfaces = sorted({J(f"sections/{s}.json")["surfaceToken"] for s in ids_in("sections")} - {None})
    if sorted(cat["surfaces"]) != surfaces:
        E.append(f"token-catalog surfaces {cat['surfaces']} != section surfaceTokens {surfaces}")
    cats = {k.split(".")[0] for k in found}
    for k in J("tokens/llm/token-policy.json")["rawValueRestrictions"]:
        if k not in cats:
            E.append(f"token-policy rawValueRestrictions key {k!r} is not a real foundation category {sorted(cats)}")


@check("ASSET_ROLES")
def c_assets(E, W):
    a = J("assets/asset-roles.json")
    pols, srcs, roles = set(a["generationPolicies"]), set(a["sources"]), a["roles"]
    for rid, r in roles.items():
        if r["generationPolicy"] not in pols:
            E.append(f"{rid}: generationPolicy {r['generationPolicy']!r} not in closed set")
        if not set(r["allowedSources"]) <= srcs:
            E.append(f"{rid}: allowedSources outside closed set")
        if not r.get("guidance"):
            E.append(f"{rid}: missing AI-generation guidance")
    for rid, pol in PINNED.items():
        r = roles.get(rid)
        if r is None:
            E.append(f"protected role {rid} missing")
            continue
        if r["generationPolicy"] != pol:
            E.append(f"protected role {rid}: generationPolicy {r['generationPolicy']!r} != pinned {pol!r}")
        if not r.get("protected"):
            E.append(f"protected role {rid}: protected flag is not true")
        if "generated-original" in r["allowedSources"]:
            E.append(f"protected role {rid}: allowedSources must never include 'generated-original'")
    if a.get("pinnedPolicies") != PINNED:
        E.append("assets/asset-roles.json pinnedPolicies != verify_all PINNED")
    for s in ids_in("sections"):
        for r in J(f"sections/{s}.json")["assetRoles"]:
            if r not in roles:
                E.append(f"sections/{s}.json: unknown assetRole {r}")
    for c in ids_in("components"):
        r = J(f"components/{c}.json").get("assetRole") or J(f"components/{c}.json").get("contentRole")
        if r and r not in roles:
            E.append(f"components/{c}.json: unknown role {r}")


@check("MOTION")
def c_motion(E, W):
    pats = J("motion/motion-contract.json")["patterns"]
    for s in ids_in("sections"):
        m = J(f"sections/{s}.json")["motion"]
        for p in m["allowedPatterns"]:
            if p not in pats:
                E.append(f"{s}: unknown motion pattern {p}")
            elif m["reducedMotionFallbacks"].get(p) != pats[p]["reducedMotionFallback"]:
                E.append(f"{s}: fallback for {p} != motion-contract")
        if m["primaryPattern"] not in m["allowedPatterns"]:
            E.append(f"{s}: primaryPattern not allowed")


def citations():
    out = []
    for rel in json_files():
        def fn(d, rel=rel):
            if {"path", "lines", "anchor"} <= set(d):
                out.append((rel, d))
        walk(J(rel), fn)
    return out


_SRC = {}


def src_lines(path):
    if path not in _SRC:
        with open(os.path.join(EVIDENCE, path), encoding="utf-8") as f:
            _SRC[path] = f.read().split("\n")
    return _SRC[path]


def norm(s):
    return " ".join(str(s).split())


@check("CITATIONS")
def c_cites(E, W):
    cs = citations()
    if not cs:
        E.append("no citations found")
        return
    if EVIDENCE is None:
        W.append(f"evidence tree absent: {len(cs)} citations not resolved (standalone package)")
        return
    for rel, c in cs:
        p = os.path.join(EVIDENCE, c["path"])
        if os.path.isabs(c["path"]) or ".." in c["path"].split("/"):
            E.append(f"{rel}: citation path {c['path']!r} must be project-relative")
            continue
        if not os.path.isfile(p):
            E.append(f"{rel}: cited file {c['path']} does not exist")
            continue
        L = src_lines(c["path"])
        a, b = c["lines"]
        if not (1 <= a <= b <= len(L)):
            E.append(f"{rel}: {c['path']}:{a}-{b} out of range (file has {len(L)} lines)")
            continue
        if norm(c["anchor"]) not in norm(" ".join(L[a - 1:b])):
            E.append(f"{rel}: {c['path']}:{a}-{b} does not contain anchor {c['anchor'][:60]!r}")


@check("MEASUREMENTS")
def c_meas(E, W):
    ms = []
    walk(J("extraction/measured-values.json"), lambda d: ms.append(d) if "measurement" in d and "selector" in d else None)
    if not ms:
        E.append("no measurement citations")
        return
    if EVIDENCE is None:
        W.append(f"evidence tree absent: {len(ms)} measurement citations not resolved")
        return
    for m in ms:
        p = os.path.join(EVIDENCE, m["measurement"])
        if not os.path.isfile(p):
            E.append(f"measurement file {m['measurement']} missing")
            continue
        d = json.load(open(p, encoding="utf-8"))
        v = d.get(m["selector"]) if m.get("field") is None else (d.get(m["selector"]) or {}).get(m["field"])
        if v != m["value"]:
            E.append(f"{m['measurement']}#{m['selector']}.{m.get('field')}: recorded {m['value']!r}, file has {v!r}")


@check("TOKEN_VALUES")
def c_values(E, W):
    found = token_index()[0]
    pairs = [(k, t) for k, t in found.items() if isinstance(t.get("source"), dict) and "path" in t["source"]]
    if EVIDENCE is None:
        W.append(f"evidence tree absent: {len(pairs)} token values not checked against source")
        return
    for k, t in pairs:
        s = t["source"]
        if not os.path.isfile(os.path.join(EVIDENCE, s["path"])):
            continue  # reported by CITATIONS
        L = src_lines(s["path"])
        a, b = s["lines"]
        if norm(t["$value"]) not in norm(" ".join(L[max(a, 1) - 1:b])):
            E.append(f"{k}: value {t['$value']!r} not found in {s['path']}:{a}-{b}")


def main():
    print(f"design-repo: {os.path.basename(REPO)}  evidence tree: {'present' if EVIDENCE else 'ABSENT (standalone mode)'}")
    for c in CHECKS:
        c()
    nfail = 0
    nwarn = 0
    for name, status, errs, warns in RESULTS:
        print(f"{status:4}  {name}")
        for e in errs[:25]:
            print(f"        - {e}")
        if len(errs) > 25:
            print(f"        ... {len(errs) - 25} more")
        for w in warns:
            print(f"        ~ {w}")
        nfail += status == "FAIL"
        nwarn += len(warns)
    if nfail:
        print(f"VERIFY FAILED: {nfail} check(s) failed")
        sys.exit(1)
    print(f"ALL {len(RESULTS)} CHECKS PASSED ({nwarn} warning(s))")


if __name__ == "__main__":
    main()
