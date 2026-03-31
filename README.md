# stones-pricing

**Status: active development — math model under calibration**

A rule-based pricing engine for custom stone work at [Les Pierres Technoprofil](https://technoprofil.ca). The goal is to transform an expert estimator's implicit pricing knowledge into a transparent, reproducible, and testable calculation model.

---

## Background

Technoprofil produces custom stone pieces (granite, limestone, Indiana stone) for institutional and heritage projects (Château Frontenac, Parliament, Harvard). Pricing estimates ("devis") are currently produced manually by a senior estimator following a set of implicit rules. This project encodes those rules into an auditable Python engine, validated against real examples provided by the customer.

The immediate objectives are:
1. **Reverse-engineer the pricing rules** from worked examples and the reference document ("étape de calcul.pdf")
2. **Build a unit-test suite** against those examples so the model can be iterated toward convergence
3. **Identify and resolve open questions** with the estimator (Raphaël) before locking constants

---

## Pricing Model

A piece is described by its geometry (thickness B, depth A, length C), material (stone family, price/pi³), finish, and client type. The price is computed in four steps.

### Inputs

| Variable | Description | Unit |
|:---------|:------------|:-----|
| `B_in` | Thickness | in |
| `A_in` | Depth | in |
| `C_in` | Length | in |
| `QTY` | Quantity | — |
| `P` | Material price | $/pi³ |
| `famille` | Stone family (`granit`, `calcaire`, `indiana`) | — |
| `fini` | Surface finish (`brule`, `poli_glace`, etc.) | — |
| `client` | Client type (`particulier`, `contracteur`, `distributeur`) | — |

> Dimensions in mm must be converted at input boundary: divide by 25.4 to get inches.

### Constants

| Variable | Value | Meaning |
|:---------|:------|:--------|
| `δ` | 0.25 in | Kerf loss per dimension (diamond blade) |
| `K` | 12.25 in/pi | Effective inches per foot with kerf |
| `η` | (K/12)² ≈ 1.0425 | Area yield/kerf factor |
| `Δt` | 0.5 in | Thickness calibration allowance |
| `α` | 0.85 | Base price overhead divisor |
| `β₁` | 0.95 | Machining overhead factor 1 |
| `β₂` | 0.90 | Machining overhead factor 2 |
| `γ` | 0.85 | Client divisor (particulier) |

### Step 1 — Base rate ($/pi²)

```
t_b     = ceil(min(A_in, B_in) + Δt, 0.5")   # bracketed thickness
MP      = P × (t_b / 12) × η                  # material cost
GS      = lookup_GS(famille, t_in)             # débitage (cutting)
PS      = lookup_PS(famille, t_in)             # sciage primaire
F       = lookup_FINI(famille, fini)            # surface finish
Base    = (MP + GS + PS + F) / α               # [$/pi²]
```

### Step 2 — Bounding box

```
A_brut  = ceil(A_in)          # round up to nearest inch
C_brut  = C_in + 1.0          # add 1" for saw entry/exit
S       = (A_brut × C_brut) / 144   # [pi²]
Cost_brut = S × Base
```

### Step 3 — Machining / angle 45° (if applicable)

```
S_angle        = A_brut / (sin(45°) × 12)
P_angle        = F × m_ext(t_in)              # ⚠️ multiplier rule TBD
Cost_angle_adj = (S_angle × P_angle) / (β₁ × β₂)
```

### Step 4 — Final price

```
ST          = Cost_brut + Cost_angle_adj
Price_unit  = ST / γ
Price_total = Price_unit × QTY
```

### Cross-validation status

| Ex. | Material | B | Model final | Reference | Δ |
|:----|:---------|:--|:------------|:----------|:--|
| 1 | Woodbury Thermal | 6" | 1 656 $ | 1 656 $ | 0% ✅ |
| 2 | Stanstead Thermal | 12" | — | 1 733 $ | — |
| 3 | Crystal Gold Brûlé | 2" | 518.60 $ | 518.64 $ | 0% ✅ |
| 4 | Crystal Gold Brûlé | 2" | ~512 $ | 512.18 $ | 0% ✅ |
| 5 | Cambrian Poli glacé | 1¼" | 809 $ | 809 $ | 0% ✅ |
| 6 | Caledonia Thermal | 13⅝" | 1 424 $ | 1 424.97 $ | 0% ✅ |

---

## Repository Layout

```
.
├── src/
│   ├── engine.py          # Current engine (structured, dataclass-based)
│   └── engine_legacy.py   # Earlier prototype (simpler, some rule differences)
├── docs/
│   ├── rules/compute.md         # Full formula specification with cross-validation notes
│   ├── rules/pseudo_rules.md    # Compact pseudocode reference
│   ├── industry/report.md       # Strategic context (Technoprofil competitive landscape)
│   └── examples/                # Real customer examples (ground truth for unit tests)
└── requirements.txt
```

### Engine comparison

Both engines share the same core formula but diverge on a few points:

| Point | `engine.py` | `engine_legacy.py` |
|:------|:------------|:-------------------|
| `t_b` rounding | `ceil((t_in + Δt) × 2) / 2` (nearest 0.5") | `B_in + Δt` (no rounding) |
| Machining `P_angle` | omitted | `F × 1.68` (empirical) |
| Lookup tables | `bisect_right` on threshold keys | Hardcoded bracket |

`engine.py` is the active branch. `engine_legacy.py` is kept for reference while open questions are being resolved.

---

## Open Questions

Items still requiring confirmation from Raphaël (ranked by impact):

| # | Variable | Impact | Question |
|:--|:---------|:-------|:---------|
| 1 | `F_brule` | 🔴 | Is `2.50 $/pi²` correct for standard granite Brûlé? (table says 3.50) |
| 2 | `P_angle` | 🔴 | How is the angle 45° unit price derived? (`4.20` observed, formula unknown) |
| 3 | `t_in = min(A,B)` | 🔴 | Is slab dimension always `min(A, B)`, or orientation-dependent? |
| 4 | `A_brut, C_brut` | 🟡 | Always `ceil(A)` and `C + 1"`? |
| 5 | `GS` thick pieces | 🟡 | For `t_in > 3.5"`: passes-based calculation? |
| 6 | `F` in Base vs. line item | 🟡 | When does finish go into Base vs. billed as separate `Bralage`? |
| 7 | `γ` cascade | 🟢 | Is `÷ 0.85` a shortcut for the full `÷ 0.95 ÷ 0.90 ÷ 0.80` cascade? |

Full details and hypotheses: [docs/compute.md](docs/compute.md).

---

## Roadmap

- [ ] Extract ground-truth values from all customer examples → unit test fixtures
- [ ] Wire unit tests against `engine.py` for each example
- [ ] Iterate on math model until all tests pass within tolerance
- [ ] Resolve open questions with Raphaël (see table above)
- [ ] Complete lookup tables (PS full range, machinage passes, `m_ext`)
- [ ] Add support for `contracteur` and `distributeur` client types
- [ ] CLI / web interface for estimator use

---

## Development

```bash
pip install -r requirements.txt

# Run the current engine on example 3
python src/engine.py
```

Tests will live in `tests/` (to be created). Each fixture will be a named example with expected intermediate values (MP, Base, Cost_brut, unit price) so regressions are caught at every step of the formula, not just the final number.
