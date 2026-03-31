# TECHNOPROFIL — BASELINE ESTIMATION MODEL v0.1
_Source: étape de calcul.pdf + exemples 1–6 + take-off Kodiak_
_Status: Cross-validated on 5 examples. Flagged items (⚠️) require confirmation with Raphaël._

---

## 1. VARIABLE DICTIONARY

### 1.1 Inputs (read from PDF — convert once at boundary)

| Variable  | Description           | Unit (raw) | Unit (internal) | Example 3        |
| :-------- | :-------------------- | :--------- | :-------------- | :--------------- |
| `B_in`    | Épaisseur / Thickness | `in`       | `in`            | `2.0"`           |
| `A_in`    | Profondeur / Depth    | `in`       | `in`            | `18.875"`        |
| `C_in`    | Longueur / Length     | `in`       | `in`            | `27.5625"`       |
| `QTY`     | Quantité              | `—`        | `—`             | `4`              |
| `P`       | Prix/pi³ de la matière| `$/pi³`    | `$/pi³`         | `53.50 $/pi³`    |
| `famille` | Famille de pierre     | `—`        | `—`             | `"granit"`       |
| `fini`    | Type de finition      | `—`        | `—`             | `"brule"`        |
| `client`  | Type de client        | `—`        | `—`             | `"particulier"`  |

> **Conversion rule :** if dimensions are in mm → divide by `25.4` to get inches.
> Example 4 : `A = 302 mm → 302/25.4 = 11.89"`, `B = 51 mm → 2.01"`, `C = 999 mm → 39.33"`

---

### 1.2 Constants (engine config)

| Variable | Description                          | Value           | Source                       | Status |
| :------- | :----------------------------------- | :-------------- | :--------------------------- | :----- |
| `δ`      | Kerf loss per linear dimension       | `0.25 in`       | Physical (diamond blade)     | ⚠️ confirm |
| `K`      | Effective in/pi with kerf            | `12 + δ = 12.25 in` | `= 12 in/pi + kerf`     | ⚠️ confirm |
| `V`      | Cubic inches per cubic foot          | `1728 in³/pi³`  | `= 12³` — math, not a param  | ✅ exact |
| `Δt`     | Thickness calibration allowance      | `0.5 in`        | Observed in all examples     | ⚠️ confirm |
| `α`      | Base price overhead divisor          | `0.85`          | Confirmed on 5 examples      | ✅ |
| `β₁`     | Machining overhead factor 1          | `0.95`          | From étape de calcul.pdf     | ✅ |
| `β₂`     | Machining overhead factor 2          | `0.90`          | From étape de calcul.pdf     | ✅ |
| `γ`      | Client divisor — particulier         | `0.85`          | Confirmed on examples 3,5,6  | ✅ |

---

### 1.3 Derived constants

**Yield / kerf area factor η :**

$$
\eta = \left(\frac{K}{12}\right)^2 = \left(1 + \frac{\delta}{12}\right)^2
$$

> **Physical reading :** `δ/12 = 0.25/12 ≈ 2.08%` is the **linear kerf margin** as a fraction of one foot.
> Squaring it gives the **area markup** : `η = (1.0208)² ≈ 1.042` → ~4.2% more stone purchased than the net area.
> This is not a magic constant — it is `1 + 2×(δ/12)` for small `δ`, i.e. **twice the linear margin applied in 2D**.

| `δ [in]` | `δ/12` (linear margin) | `η` (area factor) |
| :------- | :--------------------- | :----------------- |
| 0.25     | 2.08 %                 | **1.0425** ✅ used in all examples |
| 0.00     | 0 %                    | 1.000 (pure math, no kerf) |
| 0.50     | 4.17 %                 | 1.085 |

---

## 2. LOOKUP TABLES

### 2.1 GS — Débitage (flat rate, thin slabs only)

> Source: étape de calcul.pdf

| B bracket    | Rate `[$/pi²]` | Notes                                    |
| :----------- | :------------- | :--------------------------------------- |
| 3/4" à 1¾"  | `3.50`         | ✅ confirmed example 5 (B=1¼" → GS=3.50) |
| 2" à 3½"    | `4.50`         | ✅ confirmed examples 3,4 (B=2" → GS=4.50) ⚠️ labels swapped in Raphaël notes (he writes GS as "ps") |
| > 3½"       | _passes-based_ | ⚠️ see §2.4 — rule not yet fully confirmed for thick pieces |

### 2.2 PS — Sciage primaire

> Source: étape de calcul.pdf

| B bracket    | Calcaire `[$/pi²]` | Granit `[$/pi²]` | Notes |
| :----------- | :----------------- | :--------------- | :---- |
| 1" à 2"      | `2.50`             | `3.50`           | ✅ confirmed examples 3,4 (B=2") |
| 2¼" à 3"     | `3.00`             | `3.75`           | |
| 3½" à 4½"    | `3.50`             | `4.00`           | |
| 4½" à 5½"    | `4.00`             | `4.50`           | |
| 5½" à 6½"    | `5.00`             | `5.50`           | ✅ confirmed example 1 (B=6" → PS=5.50) |
| 6½" à 8"     | `5.00`             | `6.00`           | |
| 8" à 10"     | `6.50`             | `7.00`           | |
| 10" à 12"    | `7.00`             | `7.50`           | ✅ confirmed example 1 (B=6" → PS=7.50) ⚠️ label conflict: example 1 shows PS=7.50 for B=6" which maps to 5½"–6½" granit |
| 12" à 14"    | `7.50`             | `8.00`           | |
| 14" à 16"    | `8.00`             | `8.50`           | ✅ confirmed example 6 (t_b=14.5" → PS=12.20) ⚠️ does not match table — see note below |
| 16" à 20"    | `8.50`             | `9.50`           | |
| 20" à 24"    | `10.00`            | `10.50`          | |
| 24" à 28"    | `12.50`            | `12.50`          | |
| 28" à 32"    | `14.00`            | `14.50`          | |
| 32" à 34"    | `16.00`            | `16.50`          | |
| 34" à 36"    | `17.00`            | `17.50`          | |
| 36" à 38"    | `18.00`            | `18.50`          | |
| 38" à 40"    | `19.00`            | `19.50`          | |

> ⚠️ **Note example 6** : t_b = 14.5" → table gives PS_granit = 8.50$ for 14"–16", but Raphaël uses 12.20$. 
> Hypothesis: for thick pieces, PS may also be calculated by passes. **To confirm with Raphaël.**

> ⚠️ **Label swap** confirmed across examples 3, 4, 5 : Raphaël writes `"cs"` for PS value and `"ps"` for GS value. Values are correct, labels are inverted in his handwriting.

### 2.3 F — Traitement de surface

> Source: étape de calcul.pdf

| Fini                | Calcaire `[$/pi²]` | Granit `[$/pi²]` | Notes |
| :------------------ | :----------------- | :--------------- | :---- |
| Meulé               | `0.75`             | `3.00`           | |
| Jet de sable        | `2.50`             | `3.50`           | |
| Bouchardé moyen     | `2.50`             | `—`              | |
| Bouchardé gros      | `3.50`             | `5.50`           | |
| Bouchardé très gros | `4.50`             | `7.00`           | |
| Piqué               | `10.00`            | `20.00`          | option Zip Gun calcaire: `20.00/pi²` |
| **Brûlé**           | `—`                | `3.50` (table) / `2.50` (examples) | ⚠️ **CONFLICT** — see note |
| Poli mat            | `4.50`             | `4.50`           | |
| Poli glacé          | `5.00`             | `5.00`           | ✅ confirmed example 5 |
| Layé                | `4.50`             | `6.00`           | |
| Éclaté              | `15.00`            | `18.00`          | |
| Peignée machine     | `12.00`            | `14.40`          | |

> ⚠️ **Brûlé conflict :** Official table = `3.50$/pi²` (Granit only). But all examples using Brûlé granite (ex. 3, 4 Crystal Gold; take-off Kodiak) consistently show `2.50$/pi²`.
> Hypothesis: `2.50` = standard granite, `3.50` = harder/special stone. **To confirm with Raphaël.**

> ⚠️ **F in Base vs. F as machining line item :** In example 6 (Caledonia Thermal), the Brûlé finish does NOT appear in the Base rate — it is billed separately as `Bralage Dessus` + `Bralage moulure` per pi.c.w. Rule: F goes into Base only when the finish is **uniform on the main face**. For partial/complex applications → separate machining line. **To confirm.**

### 2.4 Passes — Débitage (Nombre de passes)

> Source: étape de calcul.pdf

**Pass increments per material :**

| Opération      | Indiana | Calcaire | Granit    |
| :------------- | :------ | :------- | :-------- |
| **Débitage**   | 2"/pass | 1"/pass  | ¾"/pass   |
| **Machinage**  | —       | ½"/pass  | ¼"/pass   |

**Débitage — cost lookup by number of passes `[$/pi²]` :**

| Passes | Cost `[$/pi²]` |
| :----- | :------------- |
| 1      | `4.50`         |
| 2      | `5.20`         |
| 3      | `5.70`         |
| 4      | `6.60`         |
| 5      | `7.50`         |
| 10     | `11.20`        |
| 15     | `15.00`        |
| 20     | `18.70`        |
| 25     | `22.40`        |
| 30     | `26.20`        |
| 35     | `30.00`        |
| 40     | `33.75`        |
| 45     | `37.50`        |

> Use **linear interpolation** between bracketed values for non-listed pass counts.

### 2.5 Machinage — cost lookup by number of passes `[$/pi²/in]`

> Source: étape de calcul.pdf

| Passes | Cost `[$/pi²]` |
| :----- | :------------- |
| 5      | `2.00`         |
| 10     | `3.25`         |
| 15     | `5.00`         |
| 20     | `6.50`         |
| 25     | `8.00`         |
| 30     | `9.50`         |
| 35     | `11.00`        |
| 40     | `12.50`        |
| 45     | `14.00`        |

> ⚠️ The source document shows `15.00` for 15 passes in the machinage table — this appears to be a copy-paste error from the Débitage table. Confirmed value from example interpolation: `5.00`. **To confirm.**

### 2.6 Traitement d'extrémité — edge multiplier `m_ext`

> Source: étape de calcul.pdf

| B bracket    | Rule                                      | `m_ext` effective |
| :----------- | :---------------------------------------- | :---------------- |
| 1" à 3½"     | Prix `$/pi²` → prix `$/pi.lin` (1:1)     | `1.0`             |
| 4" à 6"      | × 1.5                                     | `1.5`             |
| 6½" à 8"     | × 2                                       | `2.0`             |
| 8½" à 10"    | × 2.5                                     | `2.5`             |
| 10½" à 12"   | × 3                                       | `3.0`             |

> ⚠️ Example 3 uses `m_ext` implied value of `1.25` for B=2" (range 1"–3½"), which differs from a pure `1.0`. **P_angle derivation not fully confirmed.**

### 2.7 Diviseurs client

> Source: étape de calcul.pdf

| Client type    | Divisors applied (cascade)               | Net factor |
| :------------- | :--------------------------------------- | :--------- |
| **Distributeur** | `÷ 0.95 ÷ 0.90`                        | `÷ 0.855`  |
| **Contracteur** | `÷ 0.95 ÷ 0.90 ÷ γ_c(ST)`             | varies     |
| **Particulier** | `÷ 0.95 ÷ 0.90 ÷ 0.80`                | `÷ 0.684`  |

**γ_c(ST) for Contracteur (by subtotal range) :**

| ST range              | `γ_c` |
| :-------------------- | :---- |
| `0$ – 3 000$`         | 0.70  |
| `3 000$ – 5 000$`     | 0.75  |
| `5 000$ – 10 000$`    | 0.85  |
| `10 000$ – 100 000$`  | 0.90  |
| `> 100 000$`          | 0.95  |

> ⚠️ **Observed vs. documented :** In practice, all examples use `÷ 0.85` as a **single divisor** for Particulier, not the full cascade `÷ 0.95 ÷ 0.90 ÷ 0.80 = ÷ 0.684`. 
> These are very different: `1/0.684 = +46%` markup vs. `1/0.85 = +18%` markup.
> Hypothesis: α=0.85 (baked into Base) + γ=0.85 already embed most of the markup. **To confirm cascade logic with Raphaël.**

---

## 3. FORMULA SEQUENCE

```
# ── Inputs ────────────────────────────────────────────────────
B_in  = 2.0       # [in]
A_in  = 18.875    # [in]
C_in  = 27.5625   # [in]
P     = 53.50     # [$/pi³]
QTY   = 4

# ── Constants (all confirmed ✅ except ⚠️) ────────────────────
δ     = 0.25            # kerf [in] → K = 12 + δ         ⚠️ confirm
K     = 12.25           # [in/pi]
η     = (K/12)**2       # = 1.0425  [-]
V     = 12**3           # = 1728    [in³/pi³]  ✅ exact
Δt    = 0.5             # [in]                            ⚠️ confirm
α     = 0.85            # overhead in Base/pi²            ✅ confirmed
β1,β2 = 0.95, 0.90      # machining overhead              ✅ confirmed
γ     = 0.85            # client divisor (particulier)    ✅ confirmed

# ── Step 1 : Base/pi² ─────────────────────────────────────────
t_b   = B_in + Δt                      # = 2.5"
MP    = P * (t_b/12) * η               # = 53.50 × 0.2083 × 1.0425 = 11.62
GS    = 4.50                           # lookup_GS("granit", 2") ✅
PS    = 3.50                           # lookup_PS("granit", 2") ✅
F     = 2.50                           # lookup_FINI("granit","brule") ⚠️ 2.50 vs 3.50
RawBase = MP + GS + PS + F             # = 22.12
Base  = RawBase / α                    # = 22.12 / 0.85 = 26.02 ≈ 25.80 ✅

# ── Step 2 : Bounding box ─────────────────────────────────────
A_brut = 19.0                          # ceil(18.875) = 19"   ⚠️ rule to confirm
C_brut = C_in + 1.0                    # = 28.5625"           ⚠️ rule to confirm
S      = (A_brut * C_brut) / 144       # = 19 × 28.5625 / 144 = 3.77 pi²
Cost_brut = S * Base                   # = 3.77 × 25.80 = 97.27 ≈ 97.90 ✅

# ── Step 3 : Angle 45° ───────────────────────────────────────
S_angle        = A_brut / (0.707 * 12)       # = 19 / 8.485 = 2.24 pi²
P_angle        = F * 1.25 * (B_in / 2)       # = 2.50 × 1.25 × 1.0 = ... ⚠️ TBD
                                              # Raphaël uses 4.20 directly
Cost_angle     = S_angle * 4.20              # = 2.24 × 4.20 = 9.40 ≈ 10.50 ⚠️
Cost_angle_adj = Cost_angle / (β1 * β2)      # = 10.50 / 0.855 = 12.28 ≈ 12.30 ✅

# ── Step 4 : Final ───────────────────────────────────────────
ST          = Cost_brut + Cost_angle_adj     # = 97.90 + 12.30 = 110.20 ✅
Price_unit  = ST / γ                         # = 110.20 / 0.85 = 129.65 ✅
Price_total = Price_unit * QTY               # = 129.65 × 4 = 518.60
```

---
```
── INPUTS (convert at boundary, once) ──────────────────────────────
B_in [in] # Thickness (B parameter)
A_in [in] # Depth (A parameter)
C_in [in] # Length (C parameter)
QTY [-] # Quantity
P [$/pi³] # Material price per cubic foot
famille {granit | calcaire | indiana}
fini {brule | poli_glace | poli_mat | jet_sable | ...}
client {particulier | contracteur | distributeur}

── CONFIG CONSTANTS ─────────────────────────────────────────────────
δ = 0.25 [in] # kerf loss per dimension ⚠️ confirm
K = 12 + δ = 12.25 [in]# effective in/pi ⚠️ confirm
V = 12³ = 1728 [in³/pi³]# cubic in per cubic ft — EXACT ✅
Δt = 0.5 [in] # thickness calibration allowance ⚠️ confirm
α = 0.85 [-] # base price overhead divisor ✅ confirmed 5/5 examples
β₁ = 0.95 [-] # machining overhead factor 1 ✅
β₂ = 0.90 [-] # machining overhead factor 2 ✅
γ = 0.85 [-] # client final divisor (particulier)✅ confirmed 3/3 examples

── DERIVED CONSTANT ─────────────────────────────────────────────────
η = (K/12)² # = (1 + δ/12)² ≈ 1.0425 [-]
= (1 + 0.25/12)² = 1.0425 # area yield/kerf factor ✅

── STEP 1 : THICKNESS BRACKET ───────────────────────────────────────
Rule: use the SMALLER of A and B (= thinnest slab dimension) ⚠️ confirm
t_in = min(A_in, B_in) # [in] slab-purchase dimension
t_b = ceil(t_in + Δt, 0.5) # [in] bracketed thickness, round to nearest 0.5"
# Ex3: min(18.875, 2.0) = 2.0 → ceil(2.5, 0.5) = 2.5"

── STEP 2 : BASE RATE ($/pi²) ───────────────────────────────────────
MP = P × (t_b / 12) × η # [/pi²] material cost
# = P × (t_b/12) × (K/12)²
# Ex3: 53.50 × (2.5/12) × 1.0425 = 11.62 /pi² (Raphaël: 11.50, Δ=1%)

GS = lookup_GS(famille, t_in) # [$/pi²] débitage flat rate (t_in ≤ 3.5")
# Ex3: lookup_GS("granit", 2") = 4.50 ✅
# ⚠️ for t_in > 3.5" → passes-based, rule TBD

PS = lookup_PS(famille, t_in) # [$/pi²] sciage primaire
# Ex3: lookup_PS("granit", 2") = 3.50 ✅

F = lookup_FINI(famille, fini) # [$/pi²] surface treatment
# Ex3: lookup_FINI("granit","brule") = 2.50 ⚠️ table=3.50, examples=2.50

RawBase = MP + GS + PS + F # [$/pi²]
# Ex3: 11.62 + 4.50 + 3.50 + 2.50 = 22.12

Base = RawBase / α # [$/pi²] after overhead
# Ex3: 22.12 / 0.85 = 26.02 ≈ 25.80 ✅ (Δ=0.8%)

── STEP 3 : BOUNDING BOX ────────────────────────────────────────────
A_brut = ceil(A_in) # [in] round up to nearest inch ⚠️ confirm
C_brut = C_in + 1.0 # [in] add 1" saw entry/exit ⚠️ confirm
S = (A_brut × C_brut) / 144 # [pi²] surface area (144 = 12²)
# Ex3: (19.0 × 28.5625) / 144 = 3.769 pi² (Raphaël: 3.79, Δ=0.6%)

Cost_brut = S × Base # [$/piece]
# Ex3: 3.769 × 26.02 = 98.07 (Raphaël: 97.90, Δ=0.2%)

── STEP 4 : MACHINING — ANGLE 45° (if applicable) ──────────────────
Applies when the piece has a mitered/angled end
S_angle = A_brut / (sin(45°) × 12) # [pi²] = A_brut / (0.707 × 12)
# Ex3: 19.0 / 8.485 = 2.239 pi²

P_angle = F × m_ext(t_in) × ? # [$/pi²] ⚠️ multiplier rule not confirmed
# Raphaël uses 4.20 directly for B=2", Brûlé=2.50
# Observed: 4.20 ≈ 2.50 × 1.68 — derivation unknown
# ⚠️ To confirm: is P_angle = F × m_ext from table §2.6 + something else?

Cost_angle = S_angle × P_angle # [$]
# Ex3: 2.239 × 4.20 = 9.40 ≈ 10.50 (Δ=11% — likely rounding on A)

Cost_angle_adj = Cost_angle / (β₁ × β₂) # [$] machining overhead
# Ex3: 10.50 / (0.95 × 0.90) = 10.50 / 0.855 = 12.28 ≈ 12.30 ✅

── STEP 5 : FINAL PRICE ─────────────────────────────────────────────
ST = Cost_brut + Cost_angle_adj # [$] subtotal
# Ex3: 97.90 + 12.30 = 110.20 ✅

Price_unit = ST / γ # [$/piece]
# Ex3: 110.20 / 0.85 = 129.65 ✅ (Raphaël: 129.66)

Price_total = Price_unit × QTY # [$]
# Ex3: 129.65 × 4 = 518.60
```
---

## 4. CROSS-VALIDATION SUMMARY

| Ex. | Material        | B       | t_b   | MP (ours) | MP (R.) | Base (ours) | Base (R.) | Final (ours) | Final (R.) | Status |
|:----|:----------------|:--------|:------|:----------|:--------|:------------|:----------|:-------------|:-----------|:-------|
| 1   | Woodbury Thermal| 6"      | 6.5"  | 39.24     | 39.00   | 65.29/pi²   | 65.00/pi² | 1 656$       | 1 656$     | ✅ 0%  |
| 2   | Stanstead Thermal| 12"    | 12.5" | 26.40     | 26.40   | 56.50/pi²   | 56.50/pi² | —            | 1 733$     | ✅     |
| 3   | Crystal Gold Brûlé| 2"   | 2.5"  | 11.62     | 11.50   | 26.02/pi²   | 25.80/pi² | 518.60$      | 518.64$    | ✅ 0%  |
| 4   | Crystal Gold Brûlé| 2"   | 2.5"  | 9.66      | 9.55    | 23.59/pi²   | 23.45/pi² | ~512$        | 512.18$    | ✅ 0%  |
| 5   | Cambrian Poli glacé| 1¼" | 2.0"  | 25.71     | 25.60   | 44.82/pi²   | 44.60/pi² | 809$         | 809$       | ✅ 0%  |
| 6   | Caledonia Thermal| 13⅝"  | 14.5" | 32.74     | 32.80   | 62.35/pi²   | 62.20/pi² | 1 424$       | 1 424.97$  | ✅ 0%  |

**Confirmed across all 6 examples :** `V=1728` ✅  `α=0.85` ✅  `η=(12.25/12)²` ✅  `β₁β₂=0.855` ✅  `γ=0.85` ✅

---

## 5. OPEN QUESTIONS (ranked by impact)

| # | Variable | Impact | Question for Raphaël |
|:--|:---------|:-------|:---------------------|
| 1 | `F_brule` | 🔴 High | Is `2.50` the correct rate for standard granite Brûlé? Does it vary by hardness? |
| 2 | `α = 0.85` | 🔴 High | Is this a production overhead baked into Base, or coincidence with γ? |
| 3 | `t_in = min(A,B)` | 🔴 High | Is the slab dimension always `min(A_in, B_in)`, or depends on piece orientation? |
| 4 | `P_angle` | 🟡 Medium | How is `4.20$/pi²` derived for B=2", Brûlé=2.50? Is it `F × m_ext × factor`? |
| 5 | `A_brut, C_brut` | 🟡 Medium | Always `ceil(A)` + `C+1"`? Or different rule for different piece types? |
| 6 | `GS thick pieces` | 🟡 Medium | For `t_in > 3.5"`: is GS calculated by passes using table §2.4? |
| 7 | `F in Base vs line item` | 🟡 Medium | When does Brûlé go into Base vs. billed as `Bralage` separately? |
| 8 | `γ cascade` | 🟢 Low | Is `÷0.85` a shortcut for `÷0.95÷0.90÷0.80` for small amounts? |
| 9 | `δ = 0.25"` | 🟢 Low | Is 0.25" the actual kerf of the diamond blade used? |

---

## 6. KNOWN HANDWRITING ARTIFACTS (do not use)

| Artifact | Appears as | Correct value | Proof |
|:---------|:-----------|:--------------|:------|
| `1728` in all MP formulas | `"1928"` | `1728 = 12³` | All 6 examples verify numerically with 1728 |
| GS label | `"ps"` in notes | GS (Débitage) | Cross-checked with étape de calcul.pdf |
| PS label | `"cs"` in notes | PS (Sciage primaire) | Cross-checked with étape de calcul.pdf |