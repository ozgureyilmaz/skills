#!/usr/bin/env python3
"""Fill the mindmap standalone HTML template with a data JSON file (stdlib only).

Usage:
    python3 scripts/build_html.py data.json [out.html]

Default output: <data name>.html next to the data file. The template is
references/standalone-template.html relative to this skill folder.
"""
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
TEMPLATE = os.path.join(HERE, "..", "references", "standalone-template.html")
START, END = "/*DATA_START*/", "/*DATA_END*/"


def fail(msg):
    sys.stderr.write("build_html: " + msg + "\n")
    sys.exit(1)


def validate(d):
    errs = []
    if not isinstance(d.get("title"), str) or not d["title"].strip():
        errs.append("title: required non-empty string")
    if "root" in d and not (isinstance(d["root"], list) and 1 <= len(d["root"]) <= 2):
        errs.append("root: optional list of 1-2 short strings")
    br = d.get("branches")
    if not isinstance(br, list) or not br:
        errs.append("branches: required non-empty list")
        br = []
    ids = set()
    for i, b in enumerate(br):
        p = "branches[%d]" % i
        for k in ("id", "label", "anchor", "hook"):
            if not isinstance(b.get(k), str) or not b[k].strip():
                errs.append("%s.%s: required string" % (p, k))
        if b.get("id") in ids:
            errs.append("%s.id: duplicate %r" % (p, b.get("id")))
        ids.add(b.get("id"))
        lv = b.get("leaves")
        if not isinstance(lv, list) or not lv:
            errs.append("%s.leaves: required non-empty list" % p)
            continue
        for j, l in enumerate(lv):
            if not isinstance(l, dict) or not isinstance(l.get("label"), str):
                errs.append("%s.leaves[%d].label: required string" % (p, j))
            elif "value" in l and not isinstance(l["value"], str):
                errs.append("%s.leaves[%d].value: must be a string" % (p, j))
    return errs


def warnings(d):
    w = []
    for b in d.get("branches", []):
        if len(b.get("label", "")) > 20:
            w.append("branch label > 20 chars may overflow its box: %r" % b["label"])
        n = len(b.get("leaves", []))
        if not 3 <= n <= 8:
            w.append("branch %r has %d middle leaves (aim for 3-8)" % (b.get("id"), n))
        for l in b.get("leaves", []):
            t = l.get("label", "") + (": " + l["value"] if l.get("value") else "")
            if len(t) > 42:
                w.append("leaf > 42 chars may run off the map: %r" % t)
        for k in ("anchor", "hook"):
            if len(b.get(k, "")) > 42:
                w.append("%s > 42 chars may run off the map: %r" % (k, b[k]))
    n = len(d.get("branches", []))
    if not 4 <= n <= 8:
        w.append("%d branches (aim for 4-8)" % n)
    return w


def build(data, template):
    if template.count(START) != 1 or template.count(END) != 1:
        fail("template is missing the DATA_START/DATA_END markers")
    blob = json.dumps(data, ensure_ascii=False, indent=2)
    blob = blob.replace("</", "<\\/")  # keep </script> inside strings from closing the block
    pre, rest = template.split(START, 1)
    _, post = rest.split(END, 1)
    title = re.sub(r"[<&>]", "", data["title"])
    pre = re.sub(r"<title>.*?</title>", "<title>Mind Map: " + title + "</title>", pre, count=1)
    return pre + START + blob + END + post


def main(argv):
    if len(argv) < 2 or argv[1] in ("-h", "--help"):
        print(__doc__)
        return 0 if len(argv) >= 2 else 1
    src = argv[1]
    out = argv[2] if len(argv) > 2 else os.path.splitext(src)[0] + ".html"
    try:
        with open(src, encoding="utf-8") as f:
            data = json.load(f)
    except (OSError, ValueError) as e:
        fail("cannot read %s: %s" % (src, e))
    if isinstance(data, dict) and "flashcards" in data:
        sys.stderr.write("warning: ignoring 'flashcards' key (this skill renders only the mind map)\n")
        data.pop("flashcards")
    if not isinstance(data, dict):
        fail("data must be a JSON object")
    errs = validate(data)
    if errs:
        fail("invalid data:\n  " + "\n  ".join(errs))
    for w in warnings(data):
        sys.stderr.write("warning: " + w + "\n")
    with open(TEMPLATE, encoding="utf-8") as f:
        html = build(data, f.read())
    with open(out, "w", encoding="utf-8") as f:
        f.write(html)
    print("wrote " + os.path.abspath(out))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
