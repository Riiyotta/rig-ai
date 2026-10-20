#!/usr/bin/env python3
"""Prove extraction/verify_all.py actually catches drift (not just that it passes on a correct repo).

For each drift class: copy this design-repo into <workdir>/<case>/design-repo, inject the defect, run verify_all.py there and
require (a) a non-zero exit and (b) the expected check name + message fragment in its output. Then run the unmodified copy
and require it to pass. Citation/measurement/token-value cases need the evidence tree (the cloned project containing this
package); in standalone mode they are reported as SKIP, never as passes.

Usage: python3 extraction/prove_drift.py --workdir <empty scratch directory>   (default: a fresh tempfile.mkdtemp())
"""
import argparse, json, os, re, shutil, subprocess, sys, tempfile
sys.dont_write_bytecode = True

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
sys.path.insert(0, HERE)
import verify_all  # noqa: E402  (only for its evidence-root detection)

EVIDENCE = verify_all.EVIDENCE


def jload(root, rel):
    with open(os.path.join(root, rel), encoding="utf-8") as f:
        return json.load(f)


def jsave(root, rel, obj):
    with open(os.path.join(root, rel), "w", encoding="utf-8") as f:
        json.dump(obj, f, indent=2, ensure_ascii=False)


def edit_json(rel, fn):
    def apply(root):
        d = jload(root, rel)
        fn(d)
        jsave(root, rel, d)
    return apply


def edit_text(rel, fn):
    def apply(root):
        p = os.path.join(root, rel)
        with open(p, encoding="utf-8") as f:
            t = f.read()
        with open(p, "w", encoding="utf-8") as f:
            f.write(fn(t))
    return apply


def first_citation(d):
    stack = [d]
    while stack:
        o = stack.pop(0)
        if isinstance(o, dict):
            if {"path", "lines", "anchor"} <= set(o):
                return o
            stack.extend(o.values())
        elif isinstance(o, list):
            stack.extend(o)


def shift_citation(d):
    c = first_citation(d)
    c["lines"] = [c["lines"][0] + 3, c["lines"][1] + 3]   # in range, but no longer on the anchored code


def oob_citation(d):
    first_citation(d)["lines"] = [99990, 99999]


ABS = "/" + "Users/someone/projects/rig.ai/design-repo"
CASES = [
    # (name, injector, expected check, message fragment, needs evidence tree)
    ("phantom-allowlist-section", edit_json("tokens/llm/component-allowlist.json", lambda d: d["sections"].append({"id": "pricing.tiers", "contentFields": [], "allowedPatterns": [], "assetRoles": []})), "ALLOWLIST_PARITY", "phantom", False),
    ("orphan-section-file", edit_json("tokens/llm/component-allowlist.json", lambda d: d["sections"].pop()), "ALLOWLIST_PARITY", "orphan", False),
    ("phantom-allowlist-primitive", edit_json("tokens/llm/component-allowlist.json", lambda d: d["primitives"].append("avatar")), "ALLOWLIST_PARITY", "phantom", False),
    ("allowlist-content-field-drift", edit_json("tokens/llm/component-allowlist.json", lambda d: d["sections"][8]["contentFields"].append("subtitle")), "ALLOWLIST_PARITY", "content fields disagree", False),
    ("allowlist-version-drift", edit_json("tokens/llm/component-allowlist.json", lambda d: d.__setitem__("version", "1.0.1")), "VERSION_PARITY", "allowlistVersion", False),
    ("manifest-count-drift", edit_json("registry.manifest.json", lambda d: d["counts"].__setitem__("sections", 12)), "COUNTS", "counts.sections", False),
    ("readme-count-drift", edit_text("README.md", lambda t: re.sub(r"\| `sections` \| \d+ \|", "| `sections` | 99 |", t)), "COUNTS", "README counts table `sections`", False),
    ("entrypoint-outside-package", edit_json("registry.manifest.json", lambda d: d["entryPoints"].__setitem__("spec", "../CLONE_SPEC.md")), "ENTRYPOINTS", "outside the package", False),
    ("absolute-path-in-readme", edit_text("README.md", lambda t: t + f"\nSource: {ABS}\n"), "NO_ABSOLUTE_PATHS", "absolute path", False),
    ("external-url-in-contract", edit_json("sections/faq.accordion.json", lambda d: d["notes"].append("see https://example.invalid/faq")), "NO_EXTERNAL_URLS", "external URL", False),
    ("graph-rule-without-validator", edit_json("compatibility/graph.json", lambda d: d["rules"].append({"id": "MAX_TWO_BADGES", "severity": "error", "rule": "invented"})), "GRAPH_VALIDATOR_PARITY", "MAX_TWO_BADGES", False),
    ("validator-rule-without-graph", edit_json("compatibility/graph.json", lambda d: d.__setitem__("rules", [r for r in d["rules"] if r["id"] != "FOOTER_LAST"])), "GRAPH_VALIDATOR_PARITY", "FOOTER_LAST", False),
    ("pinned-policy-valid-but-wrong", edit_json("assets/asset-roles.json", lambda d: d["roles"]["thirdparty.tool-logo"].__setitem__("generationPolicy", "generate-original-only")), "ASSET_ROLES", "!= pinned", False),
    ("pinned-policy-both-places", edit_json("assets/asset-roles.json", lambda d: (d["roles"]["editorial.news-headline"].__setitem__("generationPolicy", "generate-original-only"), d["pinnedPolicies"].__setitem__("editorial.news-headline", "generate-original-only"))), "ASSET_ROLES", "editorial.news-headline", False),
    ("protected-role-allows-generation", edit_json("assets/asset-roles.json", lambda d: d["roles"]["brand.wordmark"]["allowedSources"].append("generated-original")), "ASSET_ROLES", "never include 'generated-original'", False),
    ("schema-section-enum-drift", edit_json("schema/pagespec.schema.json", lambda d: d["definitions"]["node"]["properties"]["section"]["enum"].append("pricing.tiers")), "ENUM_PARITY", "schema section enum", False),
    ("broken-token-ref", edit_json("tokens/20-component/badge.json", lambda d: d["badge"].__setitem__("fg", {"$value": "{color.accent.neon}"})), "TOKEN_REFS", "does not resolve", False),
    ("template-claim-drift", edit_json("sections/shell.footer.json", lambda d: d["constraints"].__setitem__("mustBeFirst", True)), "TEMPLATES", "claims mustBeFirst", False),
    ("junk-ds-store", lambda root: open(os.path.join(root, "sections", ".DS_Store"), "w").close(), "NO_JUNK", ".DS_Store", False),
    ("example-made-invalid", edit_json("schema/example.pagespec.json", lambda d: d["nodes"][1]["content"]["primaryCta"].__setitem__("href", "https://example.invalid")), "EXAMPLE_VALID", "INTERNAL_HREF_ONLY", False),
    ("citation-out-of-range", edit_json("sections/faq.accordion.json", oob_citation), "CITATIONS", "out of range", True),
    ("citation-in-range-wrong-code", edit_json("sections/faq.accordion.json", shift_citation), "CITATIONS", "does not contain anchor", True),
    ("citation-missing-file", edit_json("sections/faq.accordion.json", lambda d: first_citation(d).__setitem__("path", "src/components/Pricing.jsx")), "CITATIONS", "does not exist", True),
    ("token-value-drift", edit_json("tokens/00-foundation/color.json", lambda d: d["color"]["blue"].__setitem__("$value", "oklch(0.6 0.2 250)")), "TOKEN_VALUES", "color.blue", True),
    ("measurement-drift", edit_json("extraction/measured-values.json", lambda d: d["measurements"][0].__setitem__("value", 68.1)), "MEASUREMENTS", "recorded 68.1", True),
]


def run_verify(root):
    env = dict(os.environ)
    if EVIDENCE:
        env["DESIGN_REPO_EVIDENCE_ROOT"] = EVIDENCE
    env["PYTHONDONTWRITEBYTECODE"] = "1"
    r = subprocess.run([sys.executable, os.path.join(root, "extraction", "verify_all.py")], capture_output=True, text=True, env=env)
    return r.returncode, r.stdout + r.stderr


def fresh_copy(workdir, name):
    dst = os.path.join(workdir, name, "design-repo")
    shutil.copytree(REPO, dst, ignore=shutil.ignore_patterns("__pycache__", "*.pyc", ".DS_Store"))
    return dst


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--workdir", default=None)
    a = ap.parse_args()
    workdir = a.workdir or tempfile.mkdtemp(prefix="dr-drift-")
    os.makedirs(workdir, exist_ok=True)
    print(f"evidence tree: {'present' if EVIDENCE else 'ABSENT (citation cases will SKIP)'}")
    bad = skipped = 0
    root = fresh_copy(workdir, "control")
    code, out = run_verify(root)
    ok = code == 0
    bad += not ok
    print(f"  {'PASS  ' if ok else 'FAIL  '} control (unmodified copy passes verify_all)" + ("" if ok else "\n" + out[-800:]))
    for name, inject, check, frag, needs_ev in CASES:
        if needs_ev and not EVIDENCE:
            skipped += 1
            print(f"  SKIP   {name:34} needs the evidence tree")
            continue
        root = fresh_copy(workdir, name)
        inject(root)
        code, out = run_verify(root)
        hit = code != 0 and re.search(r"^FAIL\s+" + check + r"$", out, re.M) and frag in out
        bad += not hit
        line = next((l.strip() for l in out.splitlines() if frag in l), "")
        print(f"  {'CAUGHT' if hit else 'MISSED'} {name:34} [{check}] {line[:110]}")
    shutil.rmtree(workdir, ignore_errors=True) if a.workdir is None else None
    ran = len(CASES) - skipped
    if bad:
        print(f"DRIFT PROOF FAILED: {bad} case(s) not caught")
        sys.exit(1)
    print(f"DRIFT PROOF PASSED: control clean, {ran}/{ran} injected drifts caught" + (f", {skipped} skipped (no evidence tree)" if skipped else ""))


if __name__ == "__main__":
    main()
