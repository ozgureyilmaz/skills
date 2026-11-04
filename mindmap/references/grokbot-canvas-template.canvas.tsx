import { Page, Section, Text, Button, Select, Toggle, useGrokTheme, useState, useMemo, useRef, useEffect } from "grok/canvas";
import type { ReactNode, KeyboardEvent } from "grok/canvas";

// =====================================================================
// DATA: the ONLY part to replace. Paste a JSON object that follows
// references/data-schema.md (it is valid TypeScript as-is).
// Everything below the END DATA line is generic rendering code.
// =====================================================================
type LeafData = { label: string; value?: string };
type BranchData = { id: string; label: string; anchor: string; leaves: LeafData[]; hook: string };
type CardData = { deck: string; front: string; back: string | string[] };
type MindMapData = { title: string; subtitle?: string; root?: string[]; branches: BranchData[]; flashcards: CardData[] };

const DATA: MindMapData = {
  "title": "How HTTPS works",
  "subtitle": "Example dataset written from general knowledge, not from a source document.",
  "root": ["How HTTPS", "works"],
  "branches": [
    { "id": "tls", "label": "TLS handshake", "anchor": "RFC 8446 · TLS 1.3 (2018)", "leaves": [
      { "label": "ClientHello", "value": "ciphers + key share" },
      { "label": "ServerHello", "value": "picks cipher + key" },
      { "label": "Certificate", "value": "proves server identity" },
      { "label": "Finished", "value": "both verify transcript" },
      { "label": "1-RTT", "value": "one round trip in 1.3" }
    ], "hook": "hello · cert · keys · finished" },
    { "id": "crypto", "label": "Cryptography", "anchor": "Diffie & Hellman 1976", "leaves": [
      { "label": "ECDHE", "value": "ephemeral key exchange" },
      { "label": "Forward secrecy", "value": "old traffic stays safe" },
      { "label": "AES-GCM", "value": "bulk encryption" },
      { "label": "AEAD", "value": "encrypt + authenticate" }
    ], "hook": "exchange · encrypt · authenticate" },
    { "id": "pki", "label": "Certificates & PKI", "anchor": "X.509 certificates", "leaves": [
      { "label": "CA", "value": "signs the server's key" },
      { "label": "Chain", "value": "leaf → intermediate → root" },
      { "label": "Trust store", "value": "roots in OS / browser" },
      { "label": "SAN", "value": "hostnames the cert covers" },
      { "label": "Revocation", "value": "OCSP, CRL" }
    ], "hook": "leaf · intermediate · root" },
    { "id": "http", "label": "HTTP over TLS", "anchor": "Port 443 · https://", "leaves": [
      { "label": "SNI", "value": "hostname in the hello" },
      { "label": "ALPN", "value": "picks h2 or http/1.1" },
      { "label": "HSTS", "value": "force HTTPS next time" },
      { "label": "HTTP/3", "value": "QUIC over UDP" }
    ], "hook": "SNI · ALPN · HSTS" },
    { "id": "threats", "label": "Threats it stops", "anchor": "Model: network attacker", "leaves": [
      { "label": "Eavesdropping", "value": "traffic encrypted" },
      { "label": "Tampering", "value": "AEAD tag fails" },
      { "label": "Impersonation", "value": "cert check fails" },
      { "label": "Not stopped", "value": "hacked endpoint" }
    ], "hook": "read · change · pretend" }
  ],
  "flashcards": [
    { "deck": "tls", "front": "★ What does the ClientHello carry?", "back": "Supported TLS versions and cipher suites | A key share for the key exchange | SNI: the hostname it wants" },
    { "deck": "tls", "front": "How many round trips does a TLS 1.3 handshake take?", "back": "One (1-RTT); resumption can send data in 0-RTT." },
    { "deck": "tls", "front": "What does the Finished message prove?", "back": "Both sides saw the same handshake transcript, so nothing was altered." },
    { "deck": "crypto", "front": "★ Forward secrecy", "back": "Ephemeral keys mean a later key leak cannot decrypt past sessions." },
    { "deck": "crypto", "front": "Asymmetric vs symmetric in HTTPS", "back": "Asymmetric: key exchange and signatures | Symmetric (AES-GCM, ChaCha20): the bulk data" },
    { "deck": "pki", "front": "★ What does a CA do?", "back": "Signs a certificate binding a public key to a hostname." },
    { "deck": "pki", "front": "Order of a certificate chain", "back": "Leaf → intermediate → root (root lives in the trust store)." },
    { "deck": "http", "front": "What is SNI for?", "back": "Tells a shared server which site's certificate to present." },
    { "deck": "http", "front": "★ HSTS", "back": "A header telling the browser to use only HTTPS for this site from now on." },
    { "deck": "threats", "front": "★ The 3 attacks HTTPS stops", "back": "Eavesdropping | Tampering | Impersonation" },
    { "deck": "threats", "front": "What can HTTPS NOT protect against?", "back": "A compromised client or server: data is plaintext at the endpoints." }
  ]
};
// ============================= END DATA ==============================

type Card = { id: number; deck: string; front: string; back: string[] };
type Leaf = { t: string; r?: boolean };
type Branch = { id: string; label: string; leaves: Leaf[] };

const deckName = (d: string): string => {
  const b = DATA.branches.find((x: BranchData) => x.id === d || x.label === d);
  return b ? b.label : d;
};

const DECKS: string[] = DATA.branches.map((b: BranchData) => b.label);
DATA.flashcards.forEach((c: CardData) => {
  const n = deckName(c.deck);
  if (DECKS.indexOf(n) < 0) DECKS.push(n);
});

const CARDS: Card[] = [];
DECKS.forEach((d: string) => {
  DATA.flashcards
    .filter((c: CardData) => deckName(c.deck) === d)
    .forEach((c: CardData) => {
      CARDS.push({ id: CARDS.length, deck: d, front: c.front, back: Array.isArray(c.back) ? c.back : c.back.split(" | ") });
    });
  const b = DATA.branches.find((x: BranchData) => x.label === d);
  if (b) CARDS.push({ id: CARDS.length, deck: d, front: `Memory hook: ${b.label}`, back: [b.anchor, b.hook] });
});

const MAP: Branch[] = DATA.branches.map((b: BranchData) => ({
  id: b.id,
  label: b.label,
  leaves: [{ t: b.anchor, r: true } as Leaf]
    .concat(b.leaves.map((l: LeafData) => ({ t: l.value ? `${l.label}: ${l.value}` : l.label })))
    .concat([{ t: b.hook, r: true }]),
}));

function rootLines(): string[] {
  if (DATA.root && DATA.root.length > 0) return DATA.root.slice(0, 2);
  const words = DATA.title.split(" ");
  if (words.length < 2) return [DATA.title];
  let best = 1;
  let bestDiff = 1e9;
  for (let i = 1; i < words.length; i++) {
    const diff = Math.abs(words.slice(0, i).join(" ").length - words.slice(i).join(" ").length);
    if (diff < bestDiff) { bestDiff = diff; best = i; }
  }
  return [words.slice(0, best).join(" "), words.slice(best).join(" ")];
}

function shuffled(ids: number[]): number[] {
  const a = ids.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = a[i];
    a[i] = a[j];
    a[j] = tmp;
  }
  return a;
}

function Flashcards() {
  const t = useGrokTheme();
  const ink = t.text.primary;
  const faint = t.text.tertiary;
  const red = t.dataviz.negative;

  const [order, setOrder] = useState<number[]>(CARDS.map((c: Card) => c.id));
  const [deck, setDeck] = useState<string>("All");
  const [hideKnown, setHideKnown] = useState<boolean>(false);
  const [pos, setPos] = useState<number>(0);
  const [flipped, setFlipped] = useState<boolean>(false);
  const [marks, setMarks] = useState<Record<number, "know" | "review">>({});

  const inDeck = useMemo(() => CARDS.filter((c: Card) => deck === "All" || c.deck === deck), [deck]);
  const list = useMemo(
    () => order.map((id: number) => CARDS[id]).filter((c: Card) => (deck === "All" || c.deck === deck) && (!hideKnown || marks[c.id] !== "know")),
    [order, deck, hideKnown, marks]
  );
  const idx = list.length === 0 ? 0 : Math.min(pos, list.length - 1);
  const card: Card | undefined = list[idx];
  const known = inDeck.filter((c: Card) => marks[c.id] === "know").length;
  const review = inDeck.filter((c: Card) => marks[c.id] === "review").length;

  const go = (d: number) => {
    if (list.length === 0) return;
    setPos((idx + d + list.length) % list.length);
    setFlipped(false);
  };
  const mark = (m: "know" | "review") => {
    if (!card) return;
    setMarks({ ...marks, [card.id]: m });
    setFlipped(false);
    if (hideKnown && m === "know") return;
    if (list.length > 0) setPos((idx + 1) % list.length);
  };
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === " " || e.key === "Enter") { e.preventDefault(); setFlipped(!flipped); }
    else if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
  };

  const deckOptions = [{ value: "All", label: `All decks (${CARDS.length})` }].concat(
    DECKS.map((d: string) => ({ value: d, label: `${d} (${CARDS.filter((c: Card) => c.deck === d).length})` }))
  );

  const pct = inDeck.length === 0 ? 0 : Math.round((known / inDeck.length) * 100);
  const status = card ? marks[card.id] : undefined;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, fontFamily: t.font.family }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-end" }}>
        <div style={{ minWidth: 200 }}>
          <Select label="Deck" options={deckOptions} value={deck} onChange={(v: string) => { setDeck(v); setPos(0); setFlipped(false); }} />
        </div>
        <Toggle label="Hide cards I know" value={hideKnown} onChange={(v: boolean) => { setHideKnown(v); setPos(0); setFlipped(false); }} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 8, color: t.text.secondary, fontSize: t.font.label.fontSize }}>
          <span>Know it: {known} / {inDeck.length} · Review again: {review}</span>
          <span>{list.length > 0 ? `Card ${idx + 1} of ${list.length}` : ""}</span>
        </div>
        <div style={{ height: 6, borderRadius: 3, background: t.border.subtle, overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, height: "100%", background: t.dataviz.categorical[0], transition: "width 200ms" }} />
        </div>
      </div>

      {card ? (
        <div
          role="button"
          tabIndex={0}
          aria-label={flipped ? "Card back, click to show the question" : "Card front, click to show the answer"}
          onClick={() => setFlipped(!flipped)}
          onKeyDown={onKey}
          style={{ cursor: "pointer", minHeight: 250, padding: "20px 24px", borderRadius: 14, background: t.bg.subtle, border: `2px solid ${flipped ? red : t.border.strong}`, display: "flex", flexDirection: "column", gap: 14, outline: "none", userSelect: "none" }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 8, fontSize: t.font.label.fontSize, color: faint }}>
            <span>{card.deck} · {flipped ? "answer" : "question"}</span>
            <span style={{ color: status === "review" ? red : faint }}>{status === "know" ? "✓ know it" : status === "review" ? "↻ review again" : ""}</span>
          </div>
          {!flipped ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 14, textAlign: "center" }}>
              <div style={{ fontSize: 24, lineHeight: "32px", fontWeight: 600, color: ink }}>{card.front}</div>
              <div style={{ color: red, fontSize: 14, fontStyle: "italic" }}>click to flip ↻</div>
            </div>
          ) : (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ color: faint, fontSize: 14 }}>{card.front}</div>
              <div style={{ height: 2, width: 80, background: red, borderRadius: 1 }} />
              {card.back.map((line: string, i: number) => (
                <div key={i} style={{ display: "flex", gap: 8, fontSize: 16, lineHeight: "24px", color: ink }}>
                  <span style={{ color: red, fontWeight: 700 }}>–</span>
                  <span style={{ overflowWrap: "anywhere" }}>{line}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div style={{ padding: 24, borderRadius: 14, background: t.bg.subtle, border: `2px solid ${t.border.strong}`, color: ink, textAlign: "center" }}>
          Every card in this deck is marked "know it". Turn off "Hide cards I know" or reset the marks to go again.
        </div>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <Button label="← Previous" onClick={() => go(-1)} disabled={list.length === 0} />
        <Button label={flipped ? "Show question" : "Flip"} variant="primary" onClick={() => setFlipped(!flipped)} disabled={!card} />
        <Button label="Next →" onClick={() => go(1)} disabled={list.length === 0} />
        <Button label="Shuffle" onClick={() => { setOrder(shuffled(order)); setPos(0); setFlipped(false); }} />
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <Button label="✓ Know it" onClick={() => mark("know")} disabled={!card} />
        <Button label="↻ Review again" onClick={() => mark("review")} disabled={!card} />
        <Button label="Reset marks" onClick={() => { setMarks({}); setPos(0); setFlipped(false); }} />
        <Button label="Original order" onClick={() => { setOrder(CARDS.map((c: Card) => c.id)); setPos(0); setFlipped(false); }} />
      </div>
    </div>
  );
}

function MindMap() {
  const t = useGrokTheme();
  const ink = t.text.primary;
  const faint = t.text.tertiary;
  const red = t.dataviz.negative;
  const paper = t.bg.subtle;
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState<number>(700);
  const [open, setOpen] = useState<Record<string, boolean>>(() => {
    const o: Record<string, boolean> = {};
    MAP.forEach((b: Branch) => { o[b.id] = true; });
    return o;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((entries: ResizeObserverEntry[]) => {
      const cw = entries[0] ? entries[0].contentRect.width : 0;
      if (cw > 0) setW(Math.round(cw));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const toggle = (id: string) => setOpen({ ...open, [id]: !open[id] });
  const setAll = (v: boolean) => {
    const o: Record<string, boolean> = {};
    MAP.forEach((b: Branch) => { o[b.id] = v; });
    setOpen(o);
  };

  const wide = w >= 640;
  const W = Math.max(w, 300);
  const els: ReactNode[] = [];
  let H = 0;

  const leafText = (lf: Leaf, x: number, y: number, key: string) => (
    <g key={key}>
      <text x={x} y={y + 4.5} fill={lf.r ? red : ink} fontSize={13.5} fontWeight={lf.r ? 600 : 400}>{lf.t}</text>
      {lf.r ? <path d={`M ${x} ${y + 9} q ${(lf.t.length * 7) / 2} 3 ${lf.t.length * 7} 0`} fill="none" stroke={red} strokeWidth={1.4} strokeLinecap="round" /> : null}
    </g>
  );

  const branchNode = (b: Branch, x: number, y: number, bw: number, bh: number) => {
    const isOpen = open[b.id];
    return (
      <g key={"b" + b.id} onClick={() => toggle(b.id)} style={{ cursor: "pointer" }} role="button" aria-label={`${isOpen ? "Collapse" : "Expand"} ${b.label}`}>
        <rect x={x} y={y} width={bw} height={bh} rx={8} fill={paper} stroke={ink} strokeWidth={2} />
        <text x={x + 12} y={y + bh / 2 + 5} fill={ink} fontSize={14} fontWeight={600}>{(isOpen ? "− " : "+ ") + b.label}</text>
        {!isOpen ? <text x={x + bw - 10} y={y + bh / 2 + 5} textAnchor="end" fill={faint} fontSize={12}>{b.leaves.length}</text> : null}
      </g>
    );
  };

  if (wide) {
    const rowH = 25;
    const cx = 6, cw = 128, ch = 66;
    const bx = 156, bw = 182, bh = 32;
    const lx = 370;
    const lines = rootLines();
    const longest = Math.max(...lines.map((s: string) => s.length));
    const rfs = Math.min(15, Math.floor(118 / Math.max(1, longest * 0.58)));
    let y = 14;
    const pos: Array<{ b: Branch; by: number; leaves: number[] }> = [];
    MAP.forEach((b: Branch) => {
      const n = open[b.id] ? b.leaves.length : 0;
      const rows = Math.max(1, n);
      const by = y + (rows * rowH) / 2;
      const leaves: number[] = [];
      for (let j = 0; j < n; j++) leaves.push(y + j * rowH + rowH / 2);
      pos.push({ b, by, leaves });
      y += rows * rowH + 12;
    });
    H = y + 4;
    const cy = H / 2;
    pos.forEach((p: { b: Branch; by: number; leaves: number[] }) => {
      els.push(<path key={"c" + p.b.id} d={`M ${cx + cw} ${cy} C ${cx + cw + 16} ${cy}, ${bx - 16} ${p.by}, ${bx} ${p.by}`} fill="none" stroke={ink} strokeWidth={2} strokeLinecap="round" />);
      p.leaves.forEach((ly: number, j: number) => {
        els.push(<path key={`lc${p.b.id}${j}`} d={`M ${bx + bw} ${p.by} C ${bx + bw + 14} ${p.by}, ${lx - 24} ${ly}, ${lx - 10} ${ly}`} fill="none" stroke={faint} strokeWidth={1.3} />);
        els.push(<circle key={`ld${p.b.id}${j}`} cx={lx - 8} cy={ly} r={2.6} fill={p.b.leaves[j].r ? red : faint} />);
        els.push(leafText(p.b.leaves[j], lx, ly, `lt${p.b.id}${j}`));
      });
      els.push(branchNode(p.b, bx, p.by - bh / 2, bw, bh));
    });
    els.push(
      <g key="center">
        <rect x={cx - 3} y={cy - ch / 2 - 3} width={cw + 6} height={ch + 6} rx={14} fill="none" stroke={red} strokeWidth={1.6} />
        <rect x={cx} y={cy - ch / 2} width={cw} height={ch} rx={11} fill={paper} stroke={ink} strokeWidth={2.4} />
        {lines.length > 1 ? (
          <g>
            <text x={cx + cw / 2} y={cy - 4} textAnchor="middle" fill={ink} fontSize={rfs} fontWeight={700}>{lines[0]}</text>
            <text x={cx + cw / 2} y={cy + 16} textAnchor="middle" fill={ink} fontSize={rfs} fontWeight={700}>{lines[1]}</text>
          </g>
        ) : (
          <text x={cx + cw / 2} y={cy + 5} textAnchor="middle" fill={ink} fontSize={rfs} fontWeight={700}>{lines[0]}</text>
        )}
      </g>
    );
  } else {
    const rowH = 23;
    const trunkX = 18;
    const bx = 34, bw = Math.min(190, W - 44), bh = 30;
    const lx = 72;
    const rw = Math.min(Math.max(DATA.title.length * 8.8 + 28, 160), W - 10);
    els.push(
      <g key="center">
        <rect x={4} y={4} width={rw} height={40} rx={10} fill={paper} stroke={ink} strokeWidth={2.4} />
        <text x={16} y={29} fill={ink} fontSize={15} fontWeight={700}>{DATA.title}</text>
        <line x1={14} y1={46} x2={14 + Math.min(150, rw - 20)} y2={46} stroke={red} strokeWidth={1.6} strokeLinecap="round" />
      </g>
    );
    let y = 58;
    let lastBy = 58;
    MAP.forEach((b: Branch) => {
      const by = y + bh / 2;
      lastBy = by;
      els.push(<line key={"h" + b.id} x1={trunkX} y1={by} x2={bx} y2={by} stroke={ink} strokeWidth={2} />);
      els.push(branchNode(b, bx, y, bw, bh));
      y += bh + 6;
      if (open[b.id]) {
        const top = y;
        b.leaves.forEach((lf: Leaf, j: number) => {
          const ly = y + rowH / 2;
          els.push(<line key={`lt${b.id}${j}h`} x1={50} y1={ly} x2={lx - 8} y2={ly} stroke={faint} strokeWidth={1.3} />);
          els.push(leafText(lf, lx, ly, `lf${b.id}${j}`));
          y += rowH;
        });
        els.push(<line key={"v" + b.id} x1={50} y1={top - 6} x2={50} y2={y - rowH / 2} stroke={faint} strokeWidth={1.3} />);
      }
      y += 10;
    });
    els.unshift(<line key="trunk" x1={trunkX} y1={44} x2={trunkX} y2={lastBy} stroke={ink} strokeWidth={2} />);
    H = y + 4;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <Button label="Expand all" onClick={() => setAll(true)} />
        <Button label="Collapse all" onClick={() => setAll(false)} />
      </div>
      <div ref={ref} style={{ width: "100%" }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={`Mind map of ${DATA.title}`} style={{ display: "block" }} fontFamily={t.font.family}>
          <rect x={0.5} y={0.5} width={W - 1} height={H - 1} rx={12} fill="none" stroke={t.border.default} strokeWidth={1} />
          {els}
        </svg>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Page
      title={`Flashcards & Mind Map: ${DATA.title}`}
      summary={`${DATA.subtitle ? DATA.subtitle + " " : ""}One mind map of ${MAP.length} branches, then ${CARDS.length} flashcards in ${DECKS.length} decks, one per branch.`}
      width="column"
    >
      <Section heading="Mind map">
        <Text>Key facts and memory hooks. Click a branch to fold or open it.</Text>
        <MindMap />
      </Section>
      <Section heading="Flashcards">
        <Text>Click the card (or press Space) to flip it. Arrow keys move between cards. Mark each card "know it" or "review again", then turn on "Hide cards I know" to drill only the rest. Marks reset when you reload.</Text>
        <Flashcards />
      </Section>
    </Page>
  );
}
