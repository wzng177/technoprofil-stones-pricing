// ─────────────────────────────────────────────────────────────
// TECHNOPROFIL — Calculator logic & DOM rendering
// Depends on: tables.js (loaded first in index.html)
// ─────────────────────────────────────────────────────────────

// ── State ────────────────────────────────────────────────────
let SHAPE     = 'chamfer';
let MEXT_MODE = 'observed';

// ── Lookup helpers ───────────────────────────────────────────

function lookupBracket(tbl, value) {
  for (const [max, rate] of tbl) {
    if (value <= max) return rate;
  }
  return tbl[tbl.length - 1][1];
}

function lookupPassInterp(passes) {
  const t = PASS_TBL;
  if (passes <= t[0][0]) return t[0][1];
  for (let i = 1; i < t.length; i++) {
    if (passes <= t[i][0]) {
      const [n0, c0] = t[i - 1];
      const [n1, c1] = t[i];
      return c0 + (passes - n0) / (n1 - n0) * (c1 - c0);
    }
  }
  return t[t.length - 1][1];
}

function mExt(B) {
  return lookupBracket(M_EXT_TBL, B);
}

function debitage(famille, B) {
  if (B <= 1.75) return { flat: true, rate: 3.50, label: 'flat rate (B ≤ 1¾")' };
  if (B <= 3.5)  return { flat: true, rate: 4.50, label: 'flat rate (2"–3½")' };
  const inc  = DEBITAGE_INCHES_PER_PASS[famille];
  const raw  = B / inc;
  const p    = Math.ceil(raw);
  const rate = lookupPassInterp(p);
  return { flat: false, inc, raw, p, rate };
}

// ── Format helpers ───────────────────────────────────────────

const nd  = (v, d = 2) => parseFloat(v.toFixed(d)).toString();
const $d  = v          => '$' + v.toFixed(2);

// ── Core calculation ─────────────────────────────────────────

function calculate(inputs) {
  const { B, A, C, P, famille, fini, gamma, QTY,
          hasAngle, hasBrulage, brulRate } = inputs;
  const { delta, dB, alpha, beta1, beta2, kappa, C_entry } = CONSTANTS;

  const eta      = Math.pow((12 + delta) / 12, 2);
  const F        = (F_TBL[famille]?.[fini]) ?? 0;
  const MP       = P * (B + dB) / 12 * eta;
  const deb      = debitage(famille, B);
  const GS       = deb.rate;
  const PS       = lookupBracket(PS_TBL[famille], B);
  const rawBase  = MP + GS + PS + F;
  const Base     = rawBase / alpha;

  const A_b      = A + delta;
  const C_b      = C + C_entry;
  const S        = (A_b / 12) * (C_b / 12);
  const Cost_brut = S * Base;

  const m_table  = mExt(B);
  const m_obs    = B <= 3.5 ? 1.25 * 1.25 : m_table;
  const m_used   = MEXT_MODE === 'observed' ? m_obs : m_table;
  const S_angle  = A_b / Math.sin(Math.PI / 4) / 12;
  const P_angle  = F * m_used;
  const Cost_angle  = hasAngle  ? S_angle * P_angle / (beta1 * beta2) : 0;

  const L_brul   = C * kappa / 12;
  const Cost_brul = hasBrulage ? L_brul * brulRate / (beta1 * beta2) : 0;

  const Cost_mach = Cost_angle + Cost_brul;
  const ST        = Cost_brut + Cost_mach;
  const unit      = ST / gamma;
  const total     = unit * QTY;

  return {
    eta, F, MP, deb, GS, PS, rawBase, Base,
    A_b, C_b, S, Cost_brut,
    m_table, m_obs, m_used, S_angle, P_angle, Cost_angle,
    L_brul, Cost_brul, Cost_mach, ST, unit, total,
    // passthrough inputs for display
    B, A, C, P, famille, fini, gamma, QTY,
    hasAngle, hasBrulage, brulRate,
    delta, dB, alpha, beta1, beta2, kappa,
  };
}

// ── SVG diagram helpers ──────────────────────────────────────

const C_DIM  = '#4A90D9';
const C_WARN = '#E05C3A';
const C_OK   = '#1D9E75';
const C_MUTED = '#888';

function svgWrap(content, h = 130) {
  return `<svg width="100%" viewBox="0 0 260 ${h}" xmlns="http://www.w3.org/2000/svg" style="display:block;margin-top:4px">
    <defs>
      <marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
        <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </marker>
    </defs>
    ${content}
  </svg>`;
}

function tx(x, y, s, anchor = 'middle', col = '#888', fs = 9.5, extra = '') {
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="${fs}" fill="${col}" font-family="'IBM Plex Mono', monospace" ${extra}>${s}</text>`;
}

// ── Diagram functions ─────────────────────────────────────────

function diagMP(r) {
  const { B, dB, P, MP, delta } = r;
  const bx = 30, by = 28, bw = 130, bh = 55;
  const dw = Math.min(bw * 0.13, 16);
  return svgWrap(
    tx(115, 14, 'Stone block cross-section (side view)')
    + `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" fill="#f4f1eb" stroke="#ccc" stroke-width="1"/>`
    + `<rect x="${bx}" y="${by}" width="${dw}" height="${bh}" fill="#e8e2d6" stroke="none" opacity=".7"/>`
    + `<line x1="${bx+dw}" y1="${by-4}" x2="${bx+dw}" y2="${by+bh+4}" stroke="${C_WARN}" stroke-width=".8" stroke-dasharray="3 2"/>`
    + `<line x1="${bx}" y1="${by+bh+14}" x2="${bx+dw}" y2="${by+bh+14}" stroke="${C_WARN}" stroke-width=".75" marker-start="url(#arr)" marker-end="url(#arr)"/>`
    + `<line x1="${bx+dw}" y1="${by+bh+14}" x2="${bx+bw}" y2="${by+bh+14}" stroke="${C_DIM}" stroke-width=".75" marker-start="url(#arr)" marker-end="url(#arr)"/>`
    + tx(bx + dw / 2, by + bh + 24, `δ=¼"`, 'middle', C_WARN)
    + tx(bx + dw + (bw - dw) / 2, by + bh + 24, `B+ΔB=${nd(B + dB, 2)}"`, 'middle', C_DIM)
    + `<line x1="${bx+bw+12}" y1="${by}" x2="${bx+bw+12}" y2="${by+bh}" stroke="#bbb" stroke-width=".75" marker-start="url(#arr)" marker-end="url(#arr)"/>`
    + tx(bx + bw + 18, by + bh / 2 - 5, '1 pi² face', 'start', C_MUTED, 9)
    + tx(196, by + bh / 1.5 + 13, `P=${$d(P)}/pi³`, 'start', C_MUTED, 9)
    + tx(196, by + bh / 1 + 13, `→ ${$d(MP)}/pi²`, 'start', C_OK, 9)
  , 110);
}

function diagGS(r) {
  const { B, deb, GS } = r;
  const passes = deb.flat ? 1 : Math.min(deb.p, 12);
  const sw = 160, sh = 55, sx = 30, sy = 32, ph = sh / (passes + 1);
  let lines = '';
  for (let i = 1; i <= passes; i++) {
    const py = sy + i * ph, last = i === passes;
    lines += `<line x1="${sx}" y1="${py}" x2="${sx+sw}" y2="${py}" stroke="${last ? C_WARN : '#ccc'}" stroke-width="${last ? 1.2 : .5}" stroke-dasharray="${last ? 'none' : '5 3'}"/>`;
  }
  return svgWrap(
    tx(115, 16, 'Blade passes through B')
    + `<rect x="${sx}" y="${sy}" width="${sw}" height="${sh}" fill="#f4f1eb" stroke="#ccc" stroke-width="1"/>`
    + lines
    + `<line x1="${sx-14}" y1="${sy}" x2="${sx-14}" y2="${sy+sh}" stroke="${C_DIM}" stroke-width=".75" marker-start="url(#arr)" marker-end="url(#arr)"/>`
    + tx(sx - 18, sy + sh / 2, `B=${nd(B)}"`, 'middle', C_DIM, 9, `transform="rotate(-90,${sx-18},${sy+sh/2})"`)
    + tx(sx + sw + 4, sy + passes * ph, `pass ${passes}`, 'start', C_WARN, 9)
    + tx(115, sy + sh + 16, deb.flat ? 'flat rate' : `${deb.p} passes → ${$d(GS)}/pi²`)
  , sy + sh + 28);
}

function diagPS(r) {
  const { famille, B, PS } = r;
  const tbl = PS_TBL[famille];
  let rows = '', ry = 30;
  const show = Math.min(tbl.length, 9);
  for (let i = 0; i < show; i++) {
    const lo = i === 0 ? 1 : tbl[i-1][0];
    const matched = B <= tbl[i][0] && (i === 0 || B > tbl[i-1][0]);
    const bg = matched ? '#ddeeff' : 'none';
    const fc = matched ? C_DIM : C_MUTED;
    rows += `<rect x="20" y="${ry-11}" width="220" height="15" fill="${bg}" rx="2"/>`;
    rows += tx(24, ry, `${lo}"–${tbl[i][0]}"`, 'start', fc);
    rows += tx(238, ry, `$${tbl[i][1].toFixed(2)}`, 'end', fc);
    ry += 17;
  }
  return svgWrap(
    tx(130, 14, `PS table (${famille})`)
    + tx(24, 26, 'Bracket', 'start', C_MUTED, 8.5)
    + tx(238, 26, '$/pi²', 'end', C_MUTED, 8.5)
    + `<line x1="20" y1="28" x2="240" y2="28" stroke="#ddd" stroke-width=".5"/>`
    + rows
  , ry + 8);
}

function diagF(r) {
  const { famille, fini } = r;
  const tbl = F_TBL[famille] || {};
  const labelFor = key => {
    const opt = FINISH_OPTIONS.find(([, k]) => k === key);
    return opt ? opt[0].replace(/\s*\(\d+(\.\d+)?\)$/, '') : key;
  };
  let rows = '', ry = 30;
  for (const [key, v] of Object.entries(tbl)) {
    const matched = key === fini;
    const na = v === 0;
    const bg = matched ? '#ddeeff' : 'none';
    const fc = matched ? C_DIM : (na ? '#bbb' : C_MUTED);
    rows += `<rect x="20" y="${ry-11}" width="220" height="15" fill="${bg}" rx="2"/>`;
    rows += tx(24, ry, labelFor(key), 'start', fc);
    rows += tx(238, ry, na ? '—' : `$${v.toFixed(2)}`, 'end', fc);
    ry += 17;
  }
  return svgWrap(
    tx(130, 14, `F table (${famille})`)
    + tx(24, 26, 'Finish', 'start', C_MUTED, 8.5)
    + tx(238, 26, '$/pi²', 'end', C_MUTED, 8.5)
    + `<line x1="20" y1="28" x2="240" y2="28" stroke="#ddd" stroke-width=".5"/>`
    + rows
  , ry + 8);
}

function diagBase(r) {
  const { MP, GS, PS, F, rawBase, Base, alpha } = r;
  const comps = [['MP', MP, '#4A90D9'], ['GS', GS, '#1D9E75'], ['PS', PS, '#BA7517'], ['F', F, '#993556']];
  const bw = 150, bh = 20, bx = 20, by = 38;
  let cx = bx, bars = '', lbls = '';
  comps.forEach(([lbl, v, col]) => {
    const w = v / rawBase * bw;
    bars += `<rect x="${cx}" y="${by}" width="${w}" height="${bh}" fill="${col}" opacity=".75"/>`;
    if (w > 16) lbls += tx(cx + w / 2, by + bh / 2 + 4, lbl, 'middle', '#fff', 8.5);
    cx += w;
  });
  const sw = bw / alpha;
  return svgWrap(
    tx(130, 16, 'Cost components → Base rate')
    + tx(20, 28, `Raw sum: ${nd(rawBase, 2)}/pi²`, 'start', C_MUTED, 8.5)
    + bars + lbls
    + `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" fill="none" stroke="#bbb" stroke-width=".5"/>`
    + `<line x1="${bx+bw}" y1="${by+bh/2}" x2="${bx+sw}" y2="${by+bh/2}" stroke="${C_WARN}" stroke-width=".75" marker-end="url(#arr)"/>`
    + `<rect x="${bx}" y="${by+bh+10}" width="${sw}" height="${bh}" fill="${C_WARN}" opacity=".15" stroke="${C_WARN}" stroke-width=".5" stroke-dasharray="3 2"/>`
    + tx(bx + sw / 2, by + bh + 10 + bh / 2 + 4, `Base = ${$d(Base)}/pi²`, 'middle', C_WARN)
    + tx(bx + bw + 4, by + bh / 2 - 3, '÷α', 'start', C_WARN, 8.5)
  , by + bh + 10 + bh + 18);
}

function diagBBox(r) {
  const { A, C, A_b, C_b } = r;
  const shape = SHAPE;
  const pw = 170, ph = 90, ox = 16, oy = 18;
  const sc = Math.min(pw / (C_b || 1), ph / (A_b || 1));
  const bw = C_b * sc, bh = A_b * sc, nw = C * sc, nh = A * sc;
  const bx = ox, by = oy, nx = bx + (bw - nw) / 2, ny = by + (bh - nh) / 2;
  let net, waste = '';
  if (shape === 'rect') {
    net = `M${nx} ${ny} L${nx+nw} ${ny} L${nx+nw} ${ny+nh} L${nx} ${ny+nh} Z`;
  } else if (shape === 'chamfer') {
    const ch = Math.min(nh * .35, nw * .28);
    net = `M${nx+ch} ${ny} L${nx+nw} ${ny} L${nx+nw} ${ny+nh} L${nx} ${ny+nh} L${nx} ${ny+ch} Z`;
    waste = `<path d="M${nx} ${ny} L${nx+ch} ${ny} L${nx} ${ny+ch} Z" fill="#e8e2d6" opacity=".5"/>`;
  } else if (shape === 'coping') {
    net = `M${nx} ${ny+nh*.28} Q${nx+nw/2} ${ny} ${nx+nw} ${ny+nh*.28} L${nx+nw} ${ny+nh*.72} Q${nx+nw/2} ${ny+nh} ${nx} ${ny+nh*.72} Z`;
    waste = `<path d="M${bx} ${by} L${bx+bw} ${by} L${nx+nw} ${ny+nh*.28} Q${nx+nw/2} ${ny} ${nx} ${ny+nh*.28} Z" fill="#e8e2d6" opacity=".4"/>`
           + `<path d="M${bx} ${by+bh} L${bx+bw} ${by+bh} L${nx+nw} ${ny+nh*.72} Q${nx+nw/2} ${ny+nh} ${nx} ${ny+nh*.72} Z" fill="#e8e2d6" opacity=".4"/>`;
  } else {
    const tap = nw * .2;
    net = `M${nx+tap} ${ny} L${nx+nw} ${ny} L${nx+nw} ${ny+nh} L${nx} ${ny+nh} L${nx} ${ny+nh*.42} Z`;
    waste = `<path d="M${nx} ${ny} L${nx+tap} ${ny} L${nx} ${ny+nh*.42} Z" fill="#e8e2d6" opacity=".5"/>`;
  }
  const h = oy + bh + 46;
  return svgWrap(
    `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" fill="none" stroke="${C_WARN}" stroke-width=".75" stroke-dasharray="3 2" rx="1"/>`
    + waste
    + `<path d="${net}" fill="#f4f1eb" stroke="#bbb" stroke-width="1"/>`
    + `<line x1="${bx}" y1="${by+bh+12}" x2="${bx+bw}" y2="${by+bh+12}" stroke="${C_DIM}" stroke-width=".75" marker-start="url(#arr)" marker-end="url(#arr)"/>`
    + tx(bx + bw / 2, by + bh + 22, `C_brut = ${nd(C_b, 2)}"`, 'middle', C_DIM)
    + `<line x1="${bx+bw+14}" y1="${by}" x2="${bx+bw+14}" y2="${by+bh}" stroke="${C_DIM}" stroke-width=".75" marker-start="url(#arr)" marker-end="url(#arr)"/>`
    + tx(bx + bw + 18, by + bh / 2 - 5, 'A_brut', 'start', C_DIM)
    + tx(bx + bw + 18, by + bh / 2 + 7, `${nd(A_b, 2)}"`, 'start', C_DIM)
    + tx(bx + bw / 2, by + bh + 34, 'you pay for the whole dashed box', 'middle', C_MUTED, 8.5)
  , h);
}

function diagAngle(r) {
  const { A_b, S_angle, P_angle, Cost_angle, m_used, B, F } = r;
  const ax = 40, ay = 20, aw = 80, ah = 90, chX = aw * .4, chY = ah * .4;
  const rotStr = `transform="rotate(-90,${ax-16},${ay+ah/2})"`;
  return svgWrap(
    tx(130, 12, '45° chamfer — blade path')
    + `<rect x="${ax}" y="${ay}" width="${aw}" height="${ah}" fill="#f4f1eb" stroke="#ccc" stroke-width=".75"/>`
    + `<path d="M${ax} ${ay} L${ax+chX} ${ay} L${ax} ${ay+chY} Z" fill="#e8e2d6" opacity=".6"/>`
    + `<line x1="${ax+chX}" y1="${ay}" x2="${ax}" y2="${ay+chY}" stroke="${C_WARN}" stroke-width="1.5"/>`
    + `<line x1="${ax-12}" y1="${ay}" x2="${ax-12}" y2="${ay+ah}" stroke="${C_DIM}" stroke-width=".75" marker-start="url(#arr)" marker-end="url(#arr)"/>`
    + tx(ax - 16, ay + ah / 2, 'A_b', 'middle', C_DIM, 8.5, rotStr)
    + tx(130, ay + 25, `path = A_b / sin45° = ${nd(S_angle, 2)} pi.lin`, 'middle', C_WARN, 9)
    + tx(130, ay + 39, `P_angle = F(${nd(F,2)}) × m(${nd(m_used,3)}) = ${nd(P_angle,2)}/pi.lin`, 'middle', C_MUTED, 9)
    + tx(130, ay + 53, `÷ (β₁×β₂=0.855) → ${$d(Cost_angle)}`, 'middle', C_OK, 9)
    + `<line x1="20" y1="${ay+62}" x2="240" y2="${ay+62}" stroke="#ddd" stroke-width=".4"/>`
    + tx(20, ay + 75, `m_ext for B=${nd(B, 2)}"`, 'start', C_MUTED, 8.5)
    + tx(20, ay + 87, `table: ×${nd(mExt(B),1)}   observed: ×1.25² = ×${nd(1.5625,3)}`, 'start', C_MUTED, 8.5)
  , ay + ah + 72);
}

function diagBrulage(r) {
  const { C, L_brul, brulRate, Cost_brul, kappa } = r;
  const lx = 20, ly = 28, lw = 180, lh = 16;
  return svgWrap(
    tx(130, 14, 'Brûlage path (plan view)')
    + `<line x1="${lx}" y1="${ly+lh/2}" x2="${lx+lw}" y2="${ly+lh/2}" stroke="#ddd" stroke-width="1" stroke-dasharray="3 2"/>`
    + tx(lx + lw / 2, ly + lh / 2 + 14, `C = ${nd(C, 2)}"`, 'middle', C_MUTED, 8.5)
    + `<path d="M${lx} ${ly+lh+30} Q${lx+lw/2} ${ly+lh+14} ${lx+lw} ${ly+lh+30}" fill="none" stroke="${C_WARN}" stroke-width="1.5"/>`
    + tx(lx + lw / 2, ly + lh + 50, `torch path = C × κ(${kappa}) / 12 = ${nd(L_brul, 3)} pi.lin`, 'middle', C_WARN, 9)
    + tx(lx + lw / 2, ly + lh + 63, `${nd(L_brul, 3)} × ${$d(brulRate)} / 0.855 = ${$d(Cost_brul)}`, 'middle', C_OK, 9)
    + `<line x1="20" y1="${ly+lh+76}" x2="240" y2="${ly+lh+76}" stroke="#ddd" stroke-width=".4"/>`
    + tx(20, ly + lh + 88, `⚠️ rate (${$d(brulRate)}/pi.lin) is unconfirmed`, 'start', C_WARN, 8.5)
  , ly + lh + 100);
}

function diagFinal(r) {
  const { Cost_brut, Cost_angle, Cost_brul, ST, unit, gamma, hasAngle, hasBrulage } = r;
  const items = [['Cost brut', Cost_brut, '#4A90D9']];
  if (hasAngle)   items.push(['Angle',    Cost_angle, '#BA7517']);
  if (hasBrulage) items.push(['Brûlage',  Cost_brul,  '#993556']);
  const maxV = unit * 1.05, bw = 160, bx = 60, bh = 16;
  let by = 28, out = '';
  items.forEach(([lbl, v, col]) => {
    const w = v / maxV * bw;
    out += `<rect x="${bx}" y="${by-12}" width="${w}" height="${bh}" fill="${col}" opacity=".6" rx="2"/>`;
    out += tx(bx - 4, by, lbl, 'end', C_MUTED, 9);
    out += tx(bx + w + 4, by, `$${v.toFixed(2)}`, 'start', C_MUTED, 9);
    by += 22;
  });
  const stW = ST / maxV * bw, uW = unit / maxV * bw;
  out += `<line x1="${bx}" y1="${by-4}" x2="${bx+stW}" y2="${by-4}" stroke="#ddd" stroke-width=".5"/>`;
  out += tx(bx - 4, by + 6, 'ST', 'end', C_MUTED, 9);
  out += tx(bx + stW + 4, by + 6, `$${ST.toFixed(2)}`, 'start', C_MUTED, 9);
  by += 22;
  out += `<rect x="${bx}" y="${by-12}" width="${uW}" height="${bh}" fill="${C_WARN}" opacity=".2" rx="2"/>`;
  out += `<rect x="${bx}" y="${by-12}" width="${stW}" height="${bh}" fill="none" stroke="${C_WARN}" stroke-width=".5" stroke-dasharray="3 2" rx="2"/>`;
  out += tx(bx - 4, by, '÷γ', 'end', C_WARN, 9);
  out += tx(bx + uW + 4, by, `$${unit.toFixed(2)}/piece`, 'start', C_WARN, 9);
  return svgWrap(out, by + 20);
}

// ── Step card builder ─────────────────────────────────────────

function makeStep(idx, name, result, badge, formulaLines, insight, kvs, diagFn, startOpen = false) {
  const div = document.createElement('div');
  div.className = 'step-card' + (startOpen ? ' open' : '');
  const badgeHtml = badge ? `<span class="step-badge">${badge}</span>` : '';
  const kvHtml = kvs.map(([k, v, warn]) =>
    `<div class="kv${warn ? ' warn' : ''}"><span>${k}</span><span>${v}</span></div>`
  ).join('');
  div.innerHTML = `
    <div class="step-head" onclick="this.closest('.step-card').classList.toggle('open')">
      <div class="step-idx">${idx}</div>
      <div class="step-name">${name}${badgeHtml}</div>
      <div class="step-result">${result}</div>
    </div>
    <div class="step-body">
      <div class="step-inner">
        <div>
          <div class="formula-box">${formulaLines}</div>
          <div class="insight-box">${insight}</div>
          ${kvHtml}
        </div>
        <div id="diag-${idx}"></div>
      </div>
    </div>`;
  return { el: div, diagId: `diag-${idx}`, diagFn };
}

// ── Main render ───────────────────────────────────────────────

function render() {
  const inputs = {
    B:          parseFloat(document.getElementById('B').value) || 0,
    A:          parseFloat(document.getElementById('A').value) || 0,
    C:          parseFloat(document.getElementById('C').value) || 0,
    P:          parseFloat(document.getElementById('P').value) || 0,
    famille:    document.getElementById('famille').value,
    fini:       document.getElementById('fini').value,
    gamma:      parseFloat(document.getElementById('client').value) || 0.85,
    QTY:        parseInt(document.getElementById('QTY').value) || 1,
    hasAngle:   document.getElementById('hasAngle').checked,
    hasBrulage: document.getElementById('hasBrulage').checked,
    brulRate:   parseFloat(document.getElementById('brulRate').value) || 3.00,
  };

  const r = calculate(inputs);
  const { Cost_brut, Cost_mach, unit, total, QTY,
          hasAngle, hasBrulage,
          A_b, S_angle, P_angle, Cost_angle, m_used, m_table,
          L_brul, Cost_brul, brulRate,
          ST, gamma, beta1, beta2,
          MP, GS, PS, F, rawBase, Base,
          deb, B, A, C, delta, alpha } = r;

  // Totals bar
  document.getElementById('t-brut').textContent  = $d(Cost_brut);
  document.getElementById('t-mach').textContent  = $d(Cost_mach);
  document.getElementById('t-unit').textContent  = $d(unit);
  document.getElementById('t-total').textContent = $d(total);
  document.getElementById('t-qty').textContent   = `${QTY} × ${$d(unit)}`;

  // mext toggle opacity
  const mextPick = document.getElementById('mext-pick');
  mextPick.style.opacity       = hasAngle ? '1' : '0.4';
  mextPick.style.pointerEvents = hasAngle ? '' : 'none';

  // Build steps
  const steps = [];
  let idx = 1;

  // 1 — MP
  steps.push(makeStep(idx++, 'MP — material cost per pi²', `${$d(MP)}/pi²`, '',
    `MP = P × (B + ΔB) / 12 × η\n   = ${nd(r.P)} × (${nd(B)} + 0.5) / 12 × ${nd(r.eta,4)}\n   = ${$d(MP)}/pi²`,
    `You buy stone at ${$d(r.P)}/pi³. Each pi² of face requires <b>${nd((B + r.dB)/12, 4)} pi</b> of depth. η=${nd(r.eta,4)} adds ${nd((r.eta-1)*100,1)}% for blade kerf.`,
    [['P', `${$d(r.P)}/pi³`], ['B + ΔB', `${nd(B+r.dB,2)}" = ${nd((B+r.dB)/12,4)} pi`], ['η (kerf factor)', nd(r.eta,4)], ['→ MP', `${$d(MP)}/pi²`]],
    () => diagMP(r), true));

  // 2 — GS
  steps.push(makeStep(idx++, 'GS — débitage (trimming to plan)', `${$d(GS)}/pi²`, '',
    deb.flat
      ? `B=${nd(B)}" → flat rate bracket\nGS = ${$d(GS)}/pi²`
      : `inc = ${nd(deb.inc,2)}"/pass (${r.famille} débitage)\npasses = ${nd(B)}" ÷ ${nd(deb.inc,2)} = ${nd(deb.raw,2)}\n→ round up to ${deb.p} passes\nGS = lookup(${deb.p}) = ${$d(GS)}/pi²`,
    deb.flat
      ? `B=${nd(B)}" is in the flat-rate bracket. No pass count needed.`
      : `Blade removes <b>${nd(deb.inc,2)}"/pass</b>. B=${nd(B)}" takes ${nd(deb.raw,2)} passes, rounded up to <b>${deb.p}</b>.`,
    deb.flat
      ? [['Bracket', 'B ≤ 3½"'], ['→ GS', `${$d(GS)}/pi²`]]
      : [['Inches/pass', `${nd(deb.inc,2)}"`], ['Raw passes', nd(deb.raw,2)], ['Rounded up', `${deb.p} passes`], ['→ GS', `${$d(GS)}/pi²`]],
    () => diagGS(r)));

  // 3 — PS
  steps.push(makeStep(idx++, 'PS — sciage primaire (block → slab)', `${$d(PS)}/pi²`, '',
    `PS = table_lookup(${r.famille}, B=${nd(B)}")\n   = ${$d(PS)}/pi²`,
    'Primary cut: slicing the quarry block into slabs. Granit costs more; thicker pieces need more saw time.',
    [['Material', r.famille], ['B', `${nd(B)}"`], ['→ PS', `${$d(PS)}/pi²`]],
    () => diagPS(r)));

  // 4 — F
  steps.push(makeStep(idx++, 'F — traitement de surface', `${$d(F)}/pi²`, '',
    `F = table_lookup(${r.famille}, "${r.fini}")\n  = ${$d(F)}/pi²`,
    'Applied to every pi² of visible face. Harder processes cost more.',
    [['Material', r.famille], ['Finish', r.fini], ['→ F', `${$d(F)}/pi²`]],
    () => diagF(r)));

  // 5 — BASE
  steps.push(makeStep(idx++, 'Base — assembled rate per pi²', `${$d(Base)}/pi²`, '',
    `Base = (MP + GS + PS + F) / α\n     = (${nd(MP,2)} + ${nd(GS,2)} + ${nd(PS,2)} + ${nd(F,2)}) / ${alpha}\n     = ${nd(rawBase,2)} / ${alpha} = ${$d(Base)}/pi²`,
    `Sum the four costs then divide by α=0.85 (×${nd(1/alpha,3)}, adding <b>${nd((1/alpha-1)*100,1)}% overhead</b>).`,
    [['MP+GS+PS+F', `${nd(rawBase,2)}/pi²`], [`÷ α (${alpha})`, `+${nd((1/alpha-1)*100,1)}%`], ['→ Base', `${$d(Base)}/pi²`]],
    () => diagBase(r)));

  // 6 — BOUNDING BOX
  steps.push(makeStep(idx++, 'Bounding box — piece area & brut cost', $d(Cost_brut), '',
    `A_brut = ${nd(A)}" + δ(${delta}") = ${nd(A_b,3)}"\nC_brut = ${nd(C)}" + 1.0" = ${nd(r.C_b,3)}"\nS = (${nd(A_b,3)}/12)×(${nd(r.C_b,3)}/12) = ${nd(r.S,3)} pi²\nCost_brut = ${nd(r.S,3)}×${$d(Base)} = ${$d(Cost_brut)}`,
    'The piece is always priced from the <b>smallest rectangle enclosing it</b>. Waste carved away is the cost of the shape.',
    [['A_brut', `${nd(A_b,3)}"`], ['C_brut', `${nd(r.C_b,3)}"`], ['S', `${nd(r.S,3)} pi²`], ['× Base', `${$d(Base)}/pi²`], ['→ Cost_brut', $d(Cost_brut)]],
    () => diagBBox(r)));

  // 7 — ANGLE (optional)
  if (hasAngle) {
    const mextWarn = B <= 3.5 && MEXT_MODE === 'observed';
    const mLabel = MEXT_MODE === 'observed'
      ? (B <= 3.5 ? '×1.25² (observed, Ex.3)' : `×${nd(m_table,1)} (table)`)
      : `×${nd(m_table,1)} (table)`;
    steps.push(makeStep(idx++, 'Angle cut — 45° chamfer', $d(Cost_angle), mextWarn ? '⚠️ unconfirmed' : '',
      `S_angle = A_brut / sin(45°) / 12\n        = ${nd(A_b,3)} / 0.7071 / 12 = ${nd(S_angle,3)} pi.lin\nP_angle = F × m_ext = ${$d(F)} × ${nd(m_used,4)} = ${$d(P_angle)}/pi.lin\nCost = ${nd(S_angle,3)} × ${$d(P_angle)} / (${beta1}×${beta2})\n     = ${$d(Cost_angle)}`,
      'The chamfer blade travels diagonally across A — at 45° the path is A×√2. m_ext converts $/pi² → $/pi.lin scaled by thickness.',
      [['S_angle', `${nd(S_angle,3)} pi.lin`], [`m_ext (${MEXT_MODE})`, mLabel, mextWarn], ['P_angle', `${$d(P_angle)}/pi.lin`], ['÷ β₁×β₂', `÷${nd(beta1*beta2,3)}`], ['→ Cost_angle', $d(Cost_angle)]],
      () => diagAngle(r)));
  }

  // 8 — BRÛLAGE (optional)
  if (hasBrulage) {
    steps.push(makeStep(idx++, 'Brûlage service — curved edge finish', $d(Cost_brul), '⚠️ rate unconfirmed',
      `L_brûlage = C × κ / 12\n         = ${nd(C,2)}" × ${r.kappa} / 12 = ${nd(L_brul,3)} pi.lin\nCost = ${nd(L_brul,3)} × ${$d(brulRate)} / (${beta1}×${beta2})\n     = ${$d(Cost_brul)}`,
      `Brûlé on a curved edge billed per lineal foot. κ=1.4 path-length factor: the torch follows the arc, ~1.4× the plan length.`,
      [['C (length)', `${nd(C,2)}"`], ['κ (path factor)', r.kappa], ['L_brûlage', `${nd(L_brul,3)} pi.lin`], ['Rate', `${$d(brulRate)}/pi.lin`, true], ['÷ β₁×β₂', `÷${nd(beta1*beta2,3)}`], ['→ Cost_brul', $d(Cost_brul)]],
      () => diagBrulage(r)));
  }

  // FINAL
  steps.push(makeStep(idx++, 'Final price — client markup', `${$d(unit)}/piece`, '',
    `ST = ${$d(Cost_brut)}${hasAngle ? ' + ' + $d(Cost_angle) : ''}${hasBrulage ? ' + ' + $d(Cost_brul) : ''}\n   = ${$d(ST)}\nPrice = ST / γ = ${$d(ST)} / ${gamma} = ${$d(unit)}\nTotal = ${$d(unit)} × ${QTY} = ${$d(total)}`,
    `Dividing by γ=${gamma} = ×${nd(1/gamma,3)}, adding <b>${nd((1/gamma-1)*100,1)}% margin</b>. Official Particulier cascade = ÷0.684 (+46%), but ÷0.85 (+18%) is consistently observed.`,
    [['Cost_brut', $d(Cost_brut)], ['Machining', $d(Cost_mach)], ['ST', $d(ST)], [`÷ γ (${gamma})`, `+${nd((1/gamma-1)*100,1)}%`], ['→ Unit', $d(unit)], [`× ${QTY}`, $d(total)]],
    () => diagFinal(r), true));

  // Render
  const col = document.getElementById('steps-col');
  col.innerHTML = '';
  steps.forEach(s => {
    col.appendChild(s.el);
    try {
      const el = document.getElementById(s.diagId);
      if (el) el.innerHTML = s.diagFn();
    } catch (e) {
      const el = document.getElementById(s.diagId);
      if (el) el.innerHTML = `<p style="font-size:10px;color:#999;padding:8px">diagram error: ${e.message}</p>`;
    }
  });
}

// ── UI actions ────────────────────────────────────────────────

function setShape(s, el) {
  SHAPE = s;
  document.querySelectorAll('.sh-btn').forEach(b => b.classList.remove('on'));
  el.classList.add('on');
  render();
}

function setMext(m, el) {
  MEXT_MODE = m;
  document.querySelectorAll('.mext-opt').forEach(b => b.classList.remove('on'));
  el.classList.add('on');
  render();
}

function toggleBrulage(cb) {
  document.getElementById('brulage-fields').style.display = cb.checked ? 'block' : 'none';
  render();
}

function applyPreset(key, chipEl) {
  const p = PRESETS[key];
  document.getElementById('B').value       = p.B;
  document.getElementById('A').value       = p.A;
  document.getElementById('C').value       = p.C;
  document.getElementById('P').value       = p.P;
  document.getElementById('famille').value = p.famille;
  document.getElementById('fini').value    = p.fini;
  document.getElementById('client').value  = p.client;
  document.getElementById('QTY').value     = p.QTY;
  document.getElementById('hasAngle').checked   = p.hasAngle;
  document.getElementById('hasBrulage').checked = p.hasBrulage;
  document.getElementById('brulRate').value     = p.brulRate;
  document.getElementById('brulage-fields').style.display = p.hasBrulage ? 'block' : 'none';

  SHAPE     = p.shape;
  MEXT_MODE = p.mext;

  const shMap = { rect: 'Rectangular slab', chamfer: 'Angled step / sill', coping: 'Curved coping', profile: 'Shaped profile' };
  document.querySelectorAll('.sh-btn').forEach(b => {
    b.classList.toggle('on', b.querySelector('span').textContent === shMap[p.shape]);
  });
  document.querySelectorAll('.mext-opt').forEach(b => {
    b.classList.toggle('on',
      (p.mext === 'official' && b.dataset.mext === 'official') ||
      (p.mext === 'observed' && b.dataset.mext === 'observed'));
  });
  document.querySelectorAll('.chip').forEach(b => b.classList.remove('on'));
  chipEl.classList.add('on');
  render();
}

// ── Init ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', render);