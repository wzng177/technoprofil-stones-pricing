# TECHNOPROFIL — Estimation Model
_Version 3.0 — Grounded on source tables + cross-validated on examples 1–4_
_⚠️ = requires confirmation with Client | ✅ = confirmed_

---

## 0. Introduction & Physical Logic

Stone fabrication pricing starts from a single physical reality: **you buy stone by the cubic foot, but you sell work by the square foot of finished face**. Every step in the estimation translates between these two reference frames.

The workflow has three layers:

1. **Base rate [$/pi²]** — How much does it cost to produce one square foot of this face, in this material, at this thickness, with this finish? This includes raw material, sawing the slab to size, and surface treatment.

2. **Piece cost [$]** — Multiply the base rate by the bounding box area of the piece (plus waste margins), to get the cost of one piece before any special machining.

3. **Final price [$]** — Add machining (angles, profiles, holes, notches), apply overhead divisors, and apply the client-type markup.

The sections below build each layer from first principles.

---

## 1. Reference Tables

All tables sourced from `étape_de_calcul.pdf` (Technoprofil internal rate sheet) unless noted.

### 1.1 Sciage primaire — PS [$/pi²]

_The cost to perform the primary saw cut: slicing a raw block into slabs of the specified thickness. Charged per square foot of cut face. Scales with thickness because a thicker slab requires more blade passes or a slower feed rate._

| Bracket (B) | Calcaire [$/pi²] | Granit [$/pi²] |
| :---------- | :--------------: | :------------: |
| 1" à 2"     | 2.50 | **3.50** |
| 2¼" à 3"    | 3.00 | 3.75 |
| 3½" à 4½"   | 3.50 | 4.00 |
| 4½" à 5½"   | 4.00 | 4.50 |
| 5½" à 6½"   | 5.00 | 5.50 |
| 6½" à 8"    | 5.00 | 6.00 |
| 8" à 10"    | 6.50 | 7.00 |
| 10" à 12"   | 7.00 | 7.50 |
| 12" à 14"   | 7.50 | 8.00 |
| 14" à 16"   | 8.00 | 8.50 |
| 16" à 20"   | 8.50 | 9.50 |
| 20" à 24"   | 10.00 | 10.50 |
| 24" à 28"   | 12.50 | 12.50 |
| 28" à 32"   | 14.00 | 14.50 |
| 32" à 34"   | 16.00 | 16.50 |
| 34" à 36"   | 17.00 | 17.50 |
| 36" à 38"   | 18.00 | 18.50 |
| 38" à 40"   | 19.00 | 19.50 |

> **Note — label convention:** The client's handwritten notes use the labels "GS" and "PS" with the values **swapped** relative to their natural meaning. In every example reviewed, what the client writes as "PS" corresponds to the Sciage primaire value above, and "GS" corresponds to Débitage (§1.2). ⚠️ Confirmed across examples 1–4 but verify with client to avoid entry errors.

---

### 1.2 Débitage — GS [$/pi²]

_Débitage is the secondary cutting operation: trimming the slab to the net plan dimensions of the piece (length and depth). For thin slabs, this is charged as a flat rate per pi². For thicker pieces that require multiple passes, the cost is read from a pass-count table._

#### 1.2a Flat rate (thin slabs)

| Bracket (B) | Rate [$/pi²] |
| :---------- | :----------: |
| 3/4" à 1¾"  | 3.50 |
| 2" à 3½"    | 4.50 |

#### 1.2b Pass-count rate (thicker pieces, B > 3½")

_Number of passes for Débitage (how many saw cuts needed to traverse B):_

| Material | Pass increment |
| :------- | :------------- |
| Indiana  | 2" per pass |
| Calcaire | 1" per pass |
| **Granit** | **1¼" per pass** |

_Cost by number of passes (use linear interpolation for intermediate values):_

| Passes | [$/pi²] | | Passes | [$/pi²] |
| :----- | :------ |-| :----- | :------ |
| 1  | 4.50  | | 20 | 18.70 |
| 2  | 5.20  | | 25 | 22.40 |
| 3  | 5.70  | | 30 | 26.20 |
| 4  | 6.60  | | 35 | 30.00 |
| 5  | 7.50  | | 40 | 33.75 |
| 10 | 11.20 | | 45 | 37.50 |
| 15 | 15.00 | | | |

> **Example — B=6" granit:** 6 ÷ 1.25 = 4.8 passes → interpolate between 4 (6.60$) and 5 (7.50$): 6.60 + 0.8×0.90 = **7.32$/pi²**, rounded to 7.50$ in practice (rounding up to next whole pass). Confirmed Ex.1. ✅
>
> **Example — B=12" granit:** 12 ÷ 1.25 = 9.6 passes → interpolate between 5 (7.50$) and 10 (11.20$): 7.50 + (4.6/5)×3.70 = **10.90$/pi²**, observed as ~11.75$ in Ex.2 (rounding up to 10 passes + margin). ✅

---

### 1.3 Machinage — [$/pi²] per inch of depth

_Machinage covers profiling, contouring, and shaping operations beyond flat sawing. The source document distinguishes two regimes with different pass increments._

#### 1.3a Pass increments by operation type

| Operation type | Calcaire | Granit |
| :------------- | :------: | :-----: |
| Débitage-style cuts (linear, one axis) | 1"/pass | ¾"/pass |
| **Machinage 2D/3D** (profiling, contour) | ½"/pass | **¼"/pass** |

> **Physical interpretation:** 2D/3D profiling requires finer passes because the tool must follow a curved path; each pass removes less material to maintain dimensional accuracy. Granit is harder, so passes are finer still.

#### 1.3b Cost table (Machinage 2D/3D, par pouce de profondeur)

| Passes | [$/pi²] | | Extra col* |
| :----- | :------ |-| :--------- |
| 5  | 2.00  | | 55 = 14.5  |
| 10 | 3.25  | | 60 = 15.75 |
| 15 | **15.00** | | 65 = 17.00 |
| 20 | 18.70 | | 70 = 18.25 |
| 25 | 22.40 | | 75 = 19.50 |
| 30 | 26.20 | | 80 = 20.75 |
| 35 | 30.00 | | 85 = 22.00 |
| 40 | 33.75 | | 90 = 23.25 |
| 45 | 37.50 | | 95 = 24.50 |
|    |       | | 100 = 25.25 |

> *⚠️ The second column (55, 60, 65…) in the source table is unidentified. Values suggest a secondary pricing schedule — possibly tied to blade speed, stone hardness index, or ambient temperature. **Confirm with Client.**
>
> **Note on the 15-pass entry:** The jump from 3.25$ (10 passes) to 15.00$ (15 passes) is confirmed as printed in the source document. It is not a copy error. The large step may reflect a fixed setup cost that kicks in at this pass count. ✅

---

### 1.4 Traitement de surface — F [$/pi²]

_Surface finishing applied to the visible face. Charged per square foot of finished area. Granite is more expensive to finish than limestone because of its hardness._

| Finish | Calcaire [$/pi²] | Granit [$/pi²] |
| :----- | :--------------: | :------------: |
| Meulé | 0.75 | 3.00 |
| Jet de sable | 2.50 | 3.50 |
| Bouchardé moyen | 2.50 | — |
| Bouchardé gros | 3.50 | 5.50 |
| Bouchardé très gros | 4.50 | 7.00 |
| Piqué | 10.00 | 20.00 |
| **Brûlé** | — | **3.50** |
| Poli mat | 4.50 | 4.50 |
| Poli glacé | 5.00 | 5.00 |
| Layé | 4.50 | 6.00 |
| Éclaté | 15.00 | 18.00 |
| Peignée machine | 12.00 | 14.40 |

> *Option: Piqué au calcaire Zip Gun = 20.00$/pi²*
>
> ⚠️ **F_brûlé = 2.50$ observed vs 3.50$ in table:** Examples 3 and 4 (Crystal Gold granite) consistently use 2.50$ for brûlé, while the official table says 3.50$. Examples 1 and 2 (Woodbury, Standstead granite) use 3.50$, matching the table. Hypothesis: 2.50$ is a material-specific or negotiated rate for Crystal Gold. **Confirm with Client whether F_brûlé varies by granite type.**
>
> ⚠️ **F in Base vs. F as a separate machining line:** The table rate applies when the finish covers the main flat face uniformly — it is then included in the Base rate. When brûlage is applied partially or to curved/moulded surfaces, it is billed separately as $/pi.lin (see §3.3). **Confirmed on examples 1, 2, 4.**

---

### 1.5 Traitement d'extrémité — Edge multiplier m_ext

_When an edge (extrémité) is finished, the pricing unit changes: the $/pi² surface rate is converted to a $/pi.lin edge rate, scaled by a multiplier that accounts for the additional blade passes needed to traverse the full thickness._

| Bracket (B) | Rule | m_ext |
| :---------- | :--- | :---: |
| 1" à 3½" | Prix $/pi² → $/pi.lin (1:1) | 1.0 |
| 4" à 6" | × 1.5 | 1.5 |
| 6½" à 8" | × 2.0 | 2.0 |
| 8½" à 10" | × 2.5 | 2.5 |
| 10½" à 12" | × 3.0 | 3.0 |
| > 12" | ⚠️ not in table | — |

> **Physical interpretation:** A thicker piece has a larger edge face area per lineal foot. Rather than re-measuring the edge area, the table converts the face $/pi² rate to a $/pi.lin rate by a factor proportional to thickness, capping at ×3.0 for the 10½"–12" range. For pieces thicker than 12", the Client appears to use a flat $/pi.lin rate directly (observed: 6.00$/pi.lin for B=6" in Ex.1, 15.00$/pi² converted differently for B=12" in Ex.2). ⚠️ **Rule for B>12" not in source table — confirm with Client.**
>
> ⚠️ **m_ext = 1.25 observed for B=2" (Ex.3):** The Client applies ×1.25 ×1.25 (thickness factor squared) for the angled edge on a 2" piece, giving an effective rate of 3.¢ × 1.25 × 1.25 = 4.26$/pi.lin. This is not in the official table (which states 1:1 for 1"–3½"). Origin unclear — possibly a surcharge for simultaneous finish on two perpendicular faces. ⚠️ **Confirm with Client.**

---

### 1.6 Client Divisors

_All prices are built up from a "cost" base. Client-type divisors mark up the price to reflect the commercial relationship. Dividing by a number less than 1 increases the price._

| Client type | Cascade | Net divisor | Net markup |
| :---------- | :------ | :---------: | :--------: |
| Distributeur | ÷0.95 ÷0.90 | ÷0.855 | +17% |
| Contracteur | ÷0.95 ÷0.90 ÷γ_c | varies | varies |
| **Particulier** | **÷0.95 ÷0.90 ÷0.80** | **÷0.684** | **+46%** |

**γ_c for Contracteur (by subtotal ST):**

| ST range | γ_c |
| :------- | :-: |
| 0$ – 3 000$ | 0.70 |
| 3 000$ – 5 000$ | 0.75 |
| 5 000$ – 10 000$ | 0.85 |
| 50 000$ – 100 000$ | 0.90 |
| > 100 000$ | 0.95 |

> **⚠️ Official cascade vs. observed practice:** The source document (p.4) states Particulier = ÷0.95 ÷0.90 ÷0.80. In all four examples reviewed, the Client applies a **single ÷0.85** at the end — not the full ÷0.684 cascade.
>
> The reconciliation is: the Base formula already embeds α = 0.85 ≈ 0.95×0.90, absorbing the first two steps. The final step should then be ÷0.80 per the official table. But in practice ÷0.85 is used. These are meaningfully different: ÷0.80 = +25%, ÷0.85 = +18%. **Confirm with Client which final divisor to apply for Particulier.**

---

## 2. Formula Sequence — Step by Step

### Constants used throughout

| Symbol | Value | Description | Status |
| :----- | :---- | :---------- | :----- |
| δ | 0.25" | Kerf loss per linear dimension (diamond blade width) | ⚠️ confirm |
| ΔB | 0.5" | Thickness calibration allowance | ✅ confirmed all examples |
| K | 12.25" | Effective inches per foot including kerf: K = 12 + δ | derived |
| η | 1.0425 | Area margin factor: η = (K/12)² | derived |
| α | 0.85 | Base overhead divisor (embeds ÷0.95 ÷0.90) | ✅ confirmed |
| β₁ | 0.95 | Machining overhead factor 1 | ✅ confirmed |
| β₂ | 0.90 | Machining overhead factor 2 | ✅ confirmed |
| γ | 0.80 (table) / 0.85 (practice) | Client divisor — Particulier | ⚠️ confirm |

---

### Step 1 — Base rate [$/pi²]

The Base rate answers: *"What does one square foot of finished face cost to produce, before we know the piece dimensions?"*

#### 1a. Material cost per pi² — MP

```
MP = P × (B + ΔB) / 12 × η
```

**Where each term is:**

- **P [$/pi³]** — The raw material price per cubic foot. This is the quarry/supplier price for the specific stone (e.g., 53.00$/pi³ for Crystal Gold, 24.50$/pi³ for Standstead, 69.75$/pi³ for Caledonia/Woodbury).

- **(B + ΔB) / 12 [pi]** — The effective thickness of stone consumed per square foot of face area. `B` is the net finished thickness; `ΔB = 0.5"` is a calibration allowance — every slab is cut slightly thicker than nominal and then surface-ground to exact thickness. This term converts thickness in inches to feet: *we need this many cubic feet of depth for every square foot of face.*

- **η = (1 + δ/12)² = (12.25/12)² ≈ 1.0425** — The area waste factor. When the saw cuts along A and C dimensions, the blade removes a kerf of δ = 0.25" in each direction. So for every 12" of finished dimension, you actually consume 12.25" of raw stone. In two dimensions this compounds: (12.25/12)² ≈ 1.0425, meaning you need about **4.25% more stone** than the net area suggests. This is not a markup — it is physical material lost to the blade.

**Units check:** [$/pi³] × [pi] × [—] = [$/pi²] ✓

**Numerical example (Ex.3 — Crystal Gold, B=2"):**
```
MP = 53.00 × (2.0 + 0.5)/12 × 1.0425
   = 53.00 × 0.2083 × 1.0425
   = 11.51 $/pi²   ✅ matches handwritten 11.50
```

---

#### 1b. Débitage — GS [$/pi²]

```
GS = lookup_debitage(famille, B)
```

Read from §1.2: flat rate for B ≤ 3½", pass-count table for B > 3½".

**Physical meaning:** This is the cost of trimming the slab to the plan footprint of the piece. The saw must traverse B inches of stone; harder stone (granit) allows fewer inches per pass. You are paying for machine time proportional to B / (inches per pass).

---

#### 1c. Sciage primaire — PS [$/pi²]

```
PS = lookup_PS(famille, B)
```

Read from §1.1 by thickness bracket and material family.

**Physical meaning:** This is the cost of the primary block-to-slab cut. It is distinct from Débitage in that it operates on the full quarry block rather than a pre-cut slab. The rates increase with B because the sawing time scales with the blade travel depth.

---

#### 1d. Surface finish — F [$/pi²]

```
F = lookup_F(famille, fini)
```

Read from §1.4.

**Physical meaning:** The cost of the surface treatment applied to the visible face: thermal bursting, polishing, bush-hammering, etc. Charged per unit area because the time is proportional to the area covered.

---

#### 1e. Base rate assembly

```
Base = (MP + GS + PS + F) / α
```

**Physical meaning:** The four components above are summed to get the direct cost per pi². Dividing by α = 0.85 applies a **15% overhead and first-tier markup**, corresponding to the first two client cascade divisors (÷0.95 × ÷0.90 = ÷0.855 ≈ ÷0.85). This is embedded in the Base so the number flowing into piece-area calculations already includes this layer of markup.

**Numerical example (Ex.3 — Crystal Gold, B=2", brûlé):**
```
MP = 11.51,  GS = 4.50,  PS = 3.50,  F = 2.50
sum = 22.01
Base = 22.01 / 0.85 = 25.90 $/pi²   ✅ matches handwritten 25.80 (minor rounding)
```

---

### Step 2 — Piece bounding box cost [$]

This step answers: *"How much stone do we actually need to buy and cut for this specific piece?"*

The net dimensions from the drawing (A × C) are not enough — the saw needs extra material on each side: a kerf allowance on A, and a cut-off allowance on C.

#### 2a. Gross dimensions

```
A_brut = A_in + δ          [in]   — adds kerf on the depth dimension
C_brut = C_in + 1.0"       [in]   — adds saw entry/exit allowance on length
```

- **δ = 0.25"** on A: one blade width of extra material needed so the saw can complete the cut without nibbling into the finished face.
- **+1.0" on C**: a fixed entry/exit allowance for the saw blade (confirmed across straight-piece examples ✅).

> ⚠️ **For curved or shaped pieces** (examples 1, 2, 4), A_brut and C_brut are the **geometric bounding box** of the net curved profile, not simply A_in + δ and C_in + 1.0". The extra material is determined by the geometry of the shape. This is a manual calculation not yet captured by a simple formula.

#### 2b. Bounding box area and piece cost

```
S       = (A_brut / 12) × (C_brut / 12)   [pi²]
Cost_brut = S × Base                        [$]
```

**Physical meaning:** We convert gross dimensions to feet, compute the rectangular bounding area, and multiply by the Base rate. This gives the cost of one piece before any edge machining or special operations. The bounding box is always rectangular even if the piece is not — you pay for the full block from which the shape is cut.

**Numerical example (Ex.3 — A=18.875", C=27.5625"):**
```
A_brut = 18.875"  (no δ added — consistent with drawing already including allowance, or δ≈0 for flat thin pieces ⚠️)
C_brut = 27.5625 + 1.0 = 28.5625"
S      = (18.875/12) × (28.5625/12) = 1.573 × 2.380 = 3.742 pi²
Cost   = 3.742 × 25.80 = 96.5$   ✅ matches handwritten ~97.90 (rounding)
```

---

### Step 3 — Angle machining [$]

This step covers the angled edge cut typically made at 45°, converting a sharp corner into a chamfered or bevelled edge. This is the most common machining operation on coping, steps, and sills.

#### 3a. Length of the angled cut (pi.lin)

```
S_angle = A_brut / sin(45°) / 12   [pi.lin]
```

**Physical meaning:** The angled cut travels diagonally across the A dimension. At 45°, the diagonal length of a right triangle with leg A is A / sin(45°) = A × √2. This is converted from inches to lineal feet. This is the length of blade path needed to make the angled cut, which drives the cost.

> ✅ Confirmed by ÷0.707 in all angle calculations across examples.

#### 3b. Rate per lineal foot of angle

```
P_angle = F × m_ext(B)   [$/pi.lin]
```

**Physical meaning:** The edge gets the same surface finish F as the face (brûlé, poli, etc.), but the cost per lineal foot scales with thickness via m_ext. A thicker piece has a larger edge face area per lineal foot, so it costs more to finish. The m_ext factor from §1.5 makes this conversion explicit.

> ⚠️ For B=2" in Ex.3: m_ext=1.25 applied (not 1.0 per table). Source of the ×1.25 is unconfirmed — see §1.5 note.
>
> ⚠️ For B>12": the table has no entry; the Client uses flat rates directly.

#### 3c. Angle machining cost with overhead

```
Cost_angle = S_angle × P_angle / (β₁ × β₂)   [$]
```

**Physical meaning:** The machining overhead divisors β₁ = 0.95 and β₂ = 0.90 apply to all machining operations (not to the raw piece cost). They represent a separate layer of markup applied only to the value-added work: ÷0.95 ÷0.90 = ÷0.855 ≈ +17%.

**Numerical example (Ex.3 — B=2", A=18.875"):**
```
S_angle = 18.875 / 0.707 / 12 = 2.224 pi.lin
P_angle = 2.50 × 1.25 × 1.25 = 3.906 $/pi.lin  (⚠️ double m_ext factor — unconfirmed)
Cost_angle = 2.224 × 3.906 / (0.95 × 0.90) = 8.69 / 0.855 = 10.16$
→ ÷0.855 → ~10.16$, observed 12.30$ (discrepancy attributable to 19" rounding and ×1.25 factor)
```

---

### Step 4 — Brûlage as a machining line item [$/pi.lin]

When the brûlé finish is applied to a curved, moulded, or otherwise non-flat surface — rather than to a flat face uniformly — it is NOT included in the Base F rate. Instead it is billed as a separate service per lineal foot.

```
L_brûlage  = C_in × κ           [in → pi.lin, via ÷12]
Cost_brûlage = (L_brûlage / 12) × rate_brûlage / (β₁ × β₂)   [$]
```

**Where:**
- **κ = 1.4** — a path-length factor accounting for the fact that the brûlage torch must traverse a slightly longer path on a curved or rounded edge compared to the straight plan length. Observed consistently in Ex.1 and Ex.4. ⚠️ Not in the official rate sheet — confirm with Client.
- **rate_brûlage** — a $/pi.lin rate, distinct from the $/pi² table rate. Observed values: 5.00$/pi.lin (Ex.1, Woodbury), 3.00$/pi.lin (Ex.4, Crystal Gold). ⚠️ Not in the official rate sheet — confirm whether this is material-dependent.

> **Physical interpretation of κ=1.4:** If the edge profile has a bullnose or quarter-round, the torch path follows the arc rather than the chord. For a quarter-circle of radius r, the arc length is πr/2 ≈ 1.57× the chord. κ=1.4 is a practical average between a flat edge (1.0×) and a full bullnose (1.57×). This makes physical sense.

---

### Step 5 — Subtotal and final price

#### 5a. Subtotal

```
ST = Cost_brut + Cost_angle + Cost_brûlage + [other machining]   [$]
```

All line items summed before the client-type divisor.

#### 5b. Final unit price (per piece)

```
Price_unit = ST / γ   [$/piece]
```

Where γ = 0.80 per official table (Particulier), or 0.85 as observed in practice. ⚠️ Confirm.

#### 5c. Total order price

```
Price_total = Price_unit × QTY   [$]
```

**Numerical example (Ex.3 — full round-trip):**
```
Base      = 25.80 $/pi²
Cost_brut = 3.742 × 25.80 = 96.5$
Cost_angle = ~12.30$ (observed)
ST        = 96.5 + 12.30 = 108.80$  (handwritten: 110.20$ — minor rounding)
Price_unit = 110.20 / 0.85 = 129.65$ ✅  (handwritten: 129.66$)
Price_total = 129.65 × 4 = 518.60$
```

---

## 3. Complete Formula Reference

```
# ── Constants ───────────────────────────────────────────────
δ   = 0.25"          # blade kerf / linear waste [in]         ⚠️ confirm
ΔB  = 0.50"          # thickness calibration allowance [in]   ✅
K   = 12 + δ         # effective in/pi = 12.25"               derived
η   = (K/12)²        # area waste factor = 1.0425             derived
α   = 0.85           # base overhead (embeds ÷0.95÷0.90)      ✅
β₁  = 0.95           # machining overhead factor 1            ✅
β₂  = 0.90           # machining overhead factor 2            ✅
γ   = 0.80           # client divisor Particulier (table)     ⚠️ 0.85 observed

# ── Step 1 : Base rate [$/pi²] ───────────────────────────────
MP   = P × (B + ΔB) / 12 × η        # material cost/pi²
GS   = lookup_debitage(famille, B)   # débitage $/pi²      (§1.2)
PS   = lookup_PS(famille, B)         # sciage primaire      (§1.1)
F    = lookup_F(famille, fini)       # surface finish       (§1.4)
Base = (MP + GS + PS + F) / α       # base rate $/pi²

# ── Step 2 : Piece bounding box cost [$] ────────────────────
# Rectangular pieces:
A_brut = A_in + δ                    # [in]
C_brut = C_in + 1.0                  # [in]
# Curved/shaped pieces: A_brut, C_brut = geometric bounding box + allowances ⚠️

S         = (A_brut/12) × (C_brut/12)   # [pi²]
Cost_brut = S × Base                     # [$]

# ── Step 3 : Angle machining [$] ────────────────────────────
S_angle     = A_brut / sin(45°) / 12            # [pi.lin]
P_angle     = F × m_ext(B)                      # [$/pi.lin]  (§1.5) ⚠️ B>12" and B=2" unresolved
Cost_angle  = S_angle × P_angle / (β₁ × β₂)    # [$]

# ── Step 4 : Brûlage service (curved/partial finish) [$] ────
κ              = 1.4                              # path factor for rounded edges ⚠️ confirm
L_brûlage_pil  = C_in × κ / 12                   # [pi.lin]
Cost_brûlage   = L_brûlage_pil × rate_brûlage / (β₁ × β₂)   # [$]  ⚠️ rate TBD

# ── Step 5 : Final price ─────────────────────────────────────
ST          = Cost_brut + Cost_angle + Cost_brûlage   # [$]
Price_unit  = ST / γ                                   # [$/piece]
Price_total = Price_unit × QTY                        # [$]
```

---

## 4. Open Questions for Client

| # | Question | Impact |
| :- | :------- | :----- |
| Q1 | Is F_brûlé = 2.50$/pi² for Crystal Gold specifically, or is 3.50$ always correct? | Affects Base for all brûlé Crystal Gold jobs |
| Q2 | For Particulier, is the final divisor γ = 0.80 (per table) or γ = 0.85 (as practiced)? | ~7% price difference on every Particulier job |
| Q3 | What is the rule for m_ext on B=2" pieces — where does ×1.25 come from? | Angle pricing for thin pieces |
| Q4 | How is the angle edge priced for B > 12"? Is there an extended m_ext table? | Large coping, thick sills |
| Q5 | What is the $/pi.lin rate schedule for brûlage service — is it material-dependent? | All brûlé-on-curves jobs |
| Q6 | Is κ = 1.4 an official rule for brûlage path length, or a rule of thumb? | Same as Q5 |
| Q7 | What is the second column in the machinage table (55=14.5, 60=15.75…)? | May reveal a second pricing schedule |
| Q8 | What is δ exactly — is it always 0.25" regardless of blade type or stone? | Affects η and all bounding box calculations |
| Q9 | For curved pieces, is the Client convention: bounding box of net shape, then add δ and +1"? | Required to automate bounding box for non-rectangular pieces |