# Mind map data schema

One JSON object drives both renderers:

- `references/grokbot-canvas-template.canvas.tsx`: paste it as the value of `const DATA: MindMapData = ...`
- `references/standalone-template.html`: paste it between `/*DATA_START*/` and `/*DATA_END*/`, or run `scripts/build_html.py`

## Shape

```ts
{
  title: string;            // the topic, e.g. "How HTTPS works". Page title becomes "Mind Map: <title>".
                            // Also the root box text on phones (keep it under ~26 chars).
  subtitle?: string;        // one sentence: what this covers and where it came from
                            // ("From lecture slides 1-5." / "Written from general knowledge, not from a source.")
  root?: string[];          // 1-2 short lines for the desktop centre box (each <= ~14 chars).
                            // Omit to split `title` automatically.
  branches: Array<{         // 4-8 branches, in reading order
    id: string;             // short unique slug, e.g. "tls"
    label: string;          // branch box text, <= 20 chars
    anchor: string;         // FIRST leaf, red + underlined: source / author / year / key anchor
    leaves: Array<{         // 3-8 middle leaves (anchor and hook are added around them)
      label: string;        // term, <= ~16 chars
      value?: string;       // short fact; rendered "label: value". Whole line <= ~40 chars
    }>;
    hook: string;           // LAST leaf, red + underlined: compressed memory hook, "a · b · c"
  }>;
}
```

The renderer draws each branch as `anchor`, then every leaf, then `hook`, so the folded count is leaves + 2. Any other keys are ignored. `build_html.py` warns about a stray `flashcards` key and drops it.

## Example (trimmed)

```json
{
  "title": "How HTTPS works",
  "subtitle": "Written from general knowledge, not from a source document.",
  "root": ["How HTTPS", "works"],
  "branches": [
    {
      "id": "tls",
      "label": "TLS handshake",
      "anchor": "RFC 8446 · TLS 1.3 (2018)",
      "leaves": [
        { "label": "ClientHello", "value": "ciphers + key share" },
        { "label": "Certificate", "value": "proves server identity" },
        { "label": "Finished", "value": "both verify transcript" }
      ],
      "hook": "hello · cert · keys · finished"
    }
  ]
}
```

The full example is `references/example-data.json`.
