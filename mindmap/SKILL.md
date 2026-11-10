---
name: mindmap
description: >-
  Turn any complex topic into a collapsible-tree mind map, in one fixed look (root box, foldable branch boxes, short "Label: value" leaves, red-underlined source anchor first and memory hook last, Expand all / Collapse all, vertical tree on phones, light and dark). Use when the user wants to understand, study or revise a topic, a course, lecture slides, a paper, a book chapter, a codebase concept or any document set, or asks for a mind map, a study map, a concept map or "help me see how this fits together". Renders as a Grok Bot Page (canvas) or, in any other agent (Claude Code, Cursor, etc.), as one self-contained HTML file.
---

# Mind map

Produce the same output every time: one collapsible tree mind map built from one JSON dataset. Only the data changes between topics; never restyle the renderers. The output is the mind map only, so don't add flashcards, quizzes or notes unless the user asks for them separately.

Files in this skill:

- `references/data-schema.md`: the JSON shape and the size limits.
- `references/example-data.json`: a complete example ("How HTTPS works").
- `references/grokbot-canvas-template.canvas.tsx`: the Grok Bot Page renderer. Replace only `DATA`.
- `references/standalone-template.html`: the HTML renderer for every other agent. Replace only the JSON block.
- `scripts/build_html.py`: fills the HTML template from a JSON file and checks it (Python 3 stdlib only).

## Workflow

### 1. Gather the source

- Files the user gives: read them all. For slides (`.pptx`), PDFs or docs, extract the text first (for example `python-pptx`, `pdftotext`, `markitdown`, or unzip the pptx and read `ppt/slides/*.xml`). Keep the speaker notes.
- URLs: fetch and read them.
- A codebase concept: read the relevant files and use real names (modules, functions, config keys).
- No source: you may write from your own knowledge, but say so in `subtitle` ("Written from general knowledge, not from a source document.") and keep to well-established facts.

### 2. Decompose into branches

- 4-8 branches, ordered the way the topic is taught or the way it flows. One lecture, chapter, stage or subsystem per branch; split a dense one into `a`/`b` branches rather than overfilling it.
- Each branch has 3-8 middle leaves.
- The first leaf (`anchor`) is the source anchor: the author, year, standard, book, or the one key definition the branch hangs on ("Selye 1935", "RFC 8446 · TLS 1.3 (2018)").
- The last leaf (`hook`) is a compressed memory hook: the branch's sequence or core set as 2-6 words joined with ` · ` ("alarm · resistance · exhaustion", "leaf · intermediate · root"). Only write a hook you can derive from the branch itself.
- Leaf writing rules:
  - Write a fact, not a heading: `label` is the term, `value` is the fact ("Moderate: selective inattention"). A leaf with no natural label can be `label` only.
  - Keep a whole leaf to about 40 characters and a branch label to 20.
  - Keep names, numbers, years and counts exactly as the source has them. Keep source-language terms when the user studies in that language, with a translation in brackets if it fits.
  - When working from a source, never add facts that aren't in it. If you add context, mark it ("(general note) ...").
  - Use no filler, no full sentences, and don't repeat the branch label.

Save the dataset as `<topic-slug>.mindmap.json` (schema: `references/data-schema.md`).

### 3. Render

**A. In Grok Bot (or any host with `WriteCanvas`)**: write a Page.

1. Read `references/grokbot-canvas-template.canvas.tsx`.
2. Replace the object after `const DATA: MindMapData =` (between the `DATA` banner and `END DATA`) with your JSON. JSON is valid TypeScript here. Don't touch anything else.
3. Call `WriteCanvas` with the full source and the title `Mind Map: <title>`. If it reports a type error, fix it with `EditCanvas` (usually a stray quote or a wrong field type in the data).
4. Send the user the `url` the tool returned as a markdown link. Pages start private, and the user publishes one with the share button on the Page.

**B. In any other agent (Claude Code, Cursor, Gemini CLI, etc.)**: write one HTML file.

1. Save the JSON, then run:
   `python3 <skill-dir>/scripts/build_html.py <topic-slug>.mindmap.json <topic-slug>-mindmap.html`
   This validates the data, prints warnings for over-long labels or branch counts outside 4-8, and writes the HTML. With no Python, copy `references/standalone-template.html` and replace the JSON between `/*DATA_START*/` and `/*DATA_END*/` yourself (write `</` inside strings as `<\/`).
2. The file is fully self-contained, with no network, fonts or CDNs. Open it directly (`open file.html`, `xdg-open`, or `python3 -m http.server`).
3. Tell the user the file path. If you can, take a headless screenshot (`chrome --headless=new --screenshot=out.png --window-size=800,1250 file://...`) and look at it before you report.

### 4. Quality checklist (check before you deliver)

- [ ] 4-8 branches, and each has 3-8 middle leaves plus an anchor and a hook.
- [ ] Every anchor is a real source, author, year or key definition, and every hook is a short ` · ` sequence taken from its branch.
- [ ] No leaf is longer than about 40 characters and no branch label is longer than 20 (`build_html.py` warns about both).
- [ ] Facts match the source word for word on names, numbers and years. Nothing is invented, and knowledge-only content is flagged in `subtitle`.
- [ ] The renderer code is unchanged and only the data was replaced.
- [ ] The Page link or HTML path is delivered. Folding a branch shows `+` and its hidden count, and Expand all / Collapse all both work.

## What the output looks like (do not change)

- The page has a title (`Mind Map: <title>`), a one-line summary and the intro line "Key facts and memory hooks. Click a branch to fold or open it." Under it are the **Expand all** and **Collapse all** buttons, then the map.
- On desktop, the root box sits on the left with a bold rounded outline and a red outer ring. Thick curved connectors run to the branch boxes, and thin connectors with dots run to the leaves.
- Branch boxes start with `−` when open and `+` when folded, and a folded box shows the number of hidden leaves.
- The anchor and the hook are drawn in red with a hand-drawn red underline. Every other leaf is plain ink.
- Below 640 px the map becomes a vertical tree: the root box with a red underline, a trunk, and branches with their leaves indented underneath.
- Light and dark themes both read well. The Page follows the host theme, and the HTML follows `prefers-color-scheme`.
