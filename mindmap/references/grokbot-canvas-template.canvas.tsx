import { Page, Text, Button, useGrokTheme, useState, useRef, useEffect } from "grok/canvas";
import type { ReactNode } from "grok/canvas";

// =====================================================================
// DATA: the ONLY part to replace. Paste a JSON object that follows
// references/data-schema.md (it is valid TypeScript as-is).
// Everything below the END DATA line is generic rendering code.
// =====================================================================
type LeafData = { label: string; value?: string };
type BranchData = { id: string; label: string; anchor: string; leaves: LeafData[]; hook: string };
type MindMapData = { title: string; subtitle?: string; root?: string[]; branches: BranchData[] };

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
  ]
};
// ============================= END DATA ==============================

type Leaf = { t: string; r?: boolean };
type Branch = { id: string; label: string; leaves: Leaf[] };

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
      title={`Mind Map: ${DATA.title}`}
      summary={`${DATA.subtitle ? DATA.subtitle + " " : ""}One mind map of ${MAP.length} branches.`}
      width="column"
    >
      <Text>Key facts and memory hooks. Click a branch to fold or open it.</Text>
      <MindMap />
    </Page>
  );
}
