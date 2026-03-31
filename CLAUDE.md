# CLAUDE.md — Project context for AI sessions

This file is loaded automatically by Claude Code at the start of every conversation in this directory. It gives a new session enough context to be useful immediately without re-reading all docs.

---

## What this project is

A rule-based pricing engine for **Les Pierres Technoprofil**, a Quebec stone fabricator specializing in heritage/institutional custom work (granite, limestone, Indiana stone).

The business problem: pricing estimates ("devis") are produced manually by a senior estimator (Raphaël) using rules that live only in his head and on paper. This project reverse-engineers those rules into a transparent, scientific, and reproducible Python model — calibrated against real customer examples.

**The current phase:** extract ground-truth unit tests from customer examples, then iterate on the math model until the engine converges to Raphaël's outputs.

---

## The pricing model (4 steps)

Piece inputs: `B_in` (thickness), `A_in` (depth), `C_in` (length), `QTY`, `P` ($/pi³), `famille`, `fini`, `client`.

```
# Step 1 — Base rate [$/pi²]
t_in  = min(A_in, B_in)
t_b   = ceil(t_in + 0.5", nearest 0.5")   # calibration bracket
MP    = P × (t_b/12) × (12.25/12)²        # material cost with kerf factor η
GS    = lookup_GS(famille, t_in)           # débitage
PS    = lookup_PS(famille, t_in)           # sciage primaire
F     = lookup_FINI(famille, fini)         # surface finish
Base  = (MP + GS + PS + F) / 0.85         # overhead divisor α

# Step 2 — Bounding box
S         = ceil(A_in) × (C_in + 1.0) / 144   # [pi²]
Cost_brut = S × Base

# Step 3 — Machining: angle 45° (if applicable)
S_angle        = ceil(A_in) / (sin(45°) × 12)
P_angle        = F × m_ext(t_in)              # ⚠️ exact rule TBD
Cost_angle_adj = (S_angle × P_angle) / (0.95 × 0.90)

# Step 4 — Final price
Price_unit  = (Cost_brut + Cost_angle_adj) / 0.85   # γ = 0.85 for "particulier"
Price_total = Price_unit × QTY
```

Key constants confirmed across all 6 examples: `α=0.85`, `η≈1.0425`, `β₁β₂=0.855`, `γ=0.85`.

---

## Codebase map

```
src/
  engine.py          ← active engine (dataclass-based, bisect lookups)
  engine_legacy.py   ← earlier prototype — kept for reference

docs/
  rules/compute.md         ← full formula spec, lookup tables, cross-validation
  rules/pseudo_rules.md    ← compact pseudocode
  industry/report.md       ← strategic context (competitive landscape, AI tech)
  examples/                ← real customer examples (ground truth)
```

The two engines share the same formula but diverge on:
- `t_b` rounding: `engine.py` rounds to nearest 0.5"; `engine_legacy.py` does not
- Machining step: present in `engine_legacy.py` (empirical factor 1.68), absent in `engine.py`
- Lookup tables: `engine.py` uses proper bisect; `engine_legacy.py` hardcodes brackets

---

## Validated examples (ground truth)

| Ex. | Material | B | Reference unit price |
|:----|:---------|:--|:---------------------|
| 1 | Woodbury Thermal | 6" | 1 656 $ |
| 2 | Stanstead Thermal | 12" | 1 733 $ |
| 3 | Crystal Gold Brûlé | 2" | 129.66 $ (unit), 518.64 $ (×4) |
| 4 | Crystal Gold Brûlé | 2" | 512.18 $ |
| 5 | Cambrian Poli glacé | 1¼" | 809 $ |
| 6 | Caledonia Thermal | 13⅝" | 1 424.97 $ |

Unit tests will assert both intermediate values (MP, Base, Cost_brut) and final price within ~1% tolerance.

---

## Open questions (must be confirmed with Raphaël)

| Priority | Variable | Issue |
|:---------|:---------|:------|
| 🔴 | `F_brule` | Examples use 2.50 $/pi², table says 3.50 — which is correct? |
| 🔴 | `P_angle` | How is the 45° machining unit price derived? (4.20 observed, formula unknown) |
| 🔴 | `t_in` | Always `min(A, B)`? Or orientation-dependent? |
| 🟡 | `A_brut`, `C_brut` | Always `ceil(A)` and `C + 1"`? |
| 🟡 | GS thick pieces | `t_in > 3.5"` → passes-based cost? |
| 🟡 | `F` placement | Into Base vs. separate `Bralage` line item — what's the rule? |
| 🟢 | `γ` cascade | Is `÷0.85` a shortcut for `÷0.95÷0.90÷0.80`? |

Full details: `docs/rules/compute.md` §5.

---

## Session roles (planned)

Future work will be split into focused session roles, each with its own memory context:

- **engine** — math model, formula logic, lookup tables
- **unittest** — test fixtures, parameterization, tolerance strategy
- **takeoff** (future) — PDF/CAD dimension extraction
- **interface** (future) — estimator-facing UI

When those role files exist, load the relevant one at the start of a focused session.

---

## Conventions

- Dimensions are always in **inches** internally. Convert mm at input boundary (`÷ 25.4`).
- Areas in **pi²** (square feet), volumes in **pi³** (cubic feet). `1 pi² = 144 in²`, `1 pi³ = 1728 in³`.
- Stone family: `granit` | `calcaire` | `indiana` (French strings, match lookup tables exactly).
- Do not change confirmed constants (`α`, `β₁`, `β₂`, `γ`, `η`) without a failing test justification.
- Prefer failing tests over silent approximations — intermediate values matter, not just the final price.
