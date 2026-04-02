# TECHNOPROFIL — Conceptual Clarifications
_Answers to five foundational questions about the estimation model_

---

## Q1 — How is "nombre de passes" determined?

### The physical constraint

A stone saw blade can only cut a limited depth in a single traversal. If you need to cut through a slab thicker than that limit, you make multiple passes — the blade goes back and forth, cutting a bit deeper each time. The number of passes is therefore:

```
nombre_de_passes = B / (inches_per_pass)
```

Where `inches_per_pass` is a machine+material constant: how deep the blade can bite per traversal without breaking, overheating, or losing precision.

### The lookup

From the source table (étape_de_calcul.pdf p.2):

| Operation | Indiana | Calcaire | Granit |
|:--|:--|:--|:--|
| Débitage | 2"/pass | 1"/pass | **1.25"/pass** |
| Machinage 2D/3D | — | 0.5"/pass | **0.25"/pass** |

Granit is harder than calcaire, so the blade can remove less per pass → more passes needed → higher cost. 2D/3D profiling uses even finer passes because the tool must follow a curved path precisely.

### Example — B=6" granit débitage

```
passes = 6" / 1.25 "/pass = 4.8 passes
```

Since you can't do 0.8 of a pass, you round up to 5. Then look up 5 passes in the table → **7.50$/pi²**.

In practice the Client often rounds to the nearest listed value rather than interpolating. Ex.1 confirms: B=6" → 5 passes → 7.50$.

### Example — B=12" granit débitage

```
passes = 12" / 1.25 "/pass = 9.6 passes → round to 10 passes → 11.20$/pi²
```

Observed in Ex.2 as ~11.75$ (slight upward rounding). ✅

### Example — B=2" granit machinage 2D/3D (Ex.4)

```
passes = 2" / 0.25 "/pass = 8 passes → between 5 (2.00$) and 10 (3.25$)
```

But Ex.4 actually uses 0.125"/pass (= 1/8") → 16 passes → 15.00$ from table.
⚠️ 0.125"/pass is finer than the table's stated 0.25"/pass. Likely a sub-operation requiring extra precision (thin nose profile, fine finish). Confirm with Client.

---

## Q2 — Is the bounding box always a rectangle, even for curved shapes?

### Yes — always a rectangle

The bounding box is always the **smallest rectangle that fully contains the net shape**, regardless of how curved or irregular the piece is. This is because:

1. The raw stone block you buy from the quarry is rectangular.
2. The saw makes straight cuts. You cannot buy or cut a curved-outline block.
3. Every bit of stone inside the bounding rectangle must be purchased and paid for, even if much of it ends up as waste chips carved away during profiling.

### How it works for straight pieces

For a simple rectangular sill (Ex.3 — Z-D1):
```
Net shape:  18.875" × 27.5625"  (what the drawing shows)
Bounding box = net shape itself (it's already a rectangle)
Brut: A_brut = 18.875"  (+ δ if needed)
      C_brut = 27.5625 + 1.0" = 28.5625"
```

The bounding box equals the net shape plus small kerf/entry allowances.

### How it works for curved pieces

For a curved coping piece (Ex.2 — ANCM, 584mm × 2188mm net arc):

```
The net piece is not a rectangle — it has curved edges and tapered ends.
Step 1: find the smallest rectangle that contains the entire net shape.
         → this is what the drawing dimensions A and C define: the overall
            width and length of the shape's envelope.
Step 2: add allowances on top of that envelope.
         → A_brut = 614mm  (= 584 + 30mm extra — for saw entry and curve clearance)
         → C_brut = 2220mm (= 2188 + 32mm extra)
Step 3: pay for that rectangle.
         → S = 614 × 2220 / 25.4² / 144 = 14.65 pi²
```

The fact that half the stone inside that rectangle gets carved away during profiling is irrelevant for pricing — you bought the block, you pay for the block.

### Visual summary

```
┌─────────────────────────────────────┐  ← C_brut
│                                     │
│      ╭─────────────────────╮        │  ← curved net shape
│     ╱                       ╲       │
│    │       WASTE  │  PIECE   │      │  A_brut
│     ╲                       ╱       │
│      ╰─────────────────────╯        │
│                                     │
└─────────────────────────────────────┘
         You pay for the whole rectangle.
         The waste is the cost of the shape.
```

---

## Q3 — If γ = 0.80, does that mean a 25% margin?

### Yes, exactly

Dividing by a number less than 1 is equivalent to multiplying by its reciprocal:

```
÷ 0.80  =  × (1/0.80)  =  × 1.25   →  +25% on top of cost
÷ 0.85  =  × (1/0.85)  =  × 1.176  →  +17.6% on top of cost
÷ 0.95  =  × (1/0.95)  =  × 1.053  →  +5.3% on top of cost
```

### The full Particulier cascade

The official cascade is ÷0.95 ÷0.90 ÷0.80. Let's trace what this does to a $100 cost:

```
Cost:                  100.00$
÷ 0.95  (embedded α):  105.26$   (+5.3%)
÷ 0.90  (embedded α):  116.96$   (+11.1% on top of previous)
÷ 0.80  (γ final):     146.20$   (+25% on top of previous)
─────────────────────────────────
Total markup: +46.2%   (÷ 0.684 net)
```

### Why the model uses α = 0.85 instead of the two-step ÷0.95÷0.90

The first two divisors are applied in the Base formula:
```
Base = (MP + GS + PS + F) / α    where α = 0.85 ≈ 0.95 × 0.90
```

This is a simplification: 0.95 × 0.90 = 0.855, and the model rounds this to 0.85. The remaining step (÷0.80 for Particulier) should then be applied as γ at the end.

### What the examples actually show

In all four examples, the final divisor applied is **÷0.85**, not ÷0.80. This makes the effective final markup **+17.6%** instead of **+25%**. 

⚠️ Either the Client uses ÷0.85 in practice as a blanket Particulier rate (skipping the ÷0.80 step), or the Base α already absorbs part of the γ. **This needs confirmation — it is a meaningful price difference on every Particulier job.**

---

## Q4 — Why 45°? What is the angle calculation actually doing?

### What the angle cut is physically

The "angle" in these examples is a **chamfered or bevelled edge** cut diagonally across one face of the piece — typically on the front vertical face (A dimension) of a coping or step, to create a sloped drip edge or a decorative bevel.

```
                  ┌──────────────────────────┐  ← top face
                 /│                          │
                / │  A                       │
               /  │                          │
              /45°│                          │
             └────┴──────────────────────────┘
             ↑
         The diagonal cut — this is what's being priced
```

### Why 45° specifically

45° is the **conventional default** for a chamfer cut in stone work — it produces a symmetric bevel and is the easiest angle to set up on a saw. In these examples, 45° is assumed because:

1. The drawings do not specify a different angle.
2. The Client's calculations consistently use ÷ sin(45°) = ÷ 0.707.

The formula is general: if the angle were θ instead of 45°, you would use sin(θ). At 45°, sin(45°) = √2/2 ≈ 0.707.

### What sin(45°) is doing geometrically

The angled cut is a diagonal across the A dimension. Its length is **longer** than A because it travels diagonally:

```
          A
        ──────
       │╲     
       │  ╲  diagonal = A / sin(45°) = A × √2
       │    ╲
       │  45° ╲

If A = 19":
  diagonal = 19 / sin(45°) = 19 / 0.707 = 26.87"  → 26.87/12 = 2.24 pi.lin
```

This diagonal length is what the blade must traverse. You are paying for **blade path length**, not for A itself. At 45°, the path is √2 ≈ 1.414× longer than A. This is why the formula divides by sin(45°): to convert the A dimension into the actual length of the cut.

### Why pi.lin and not pi²

The edge treatment is priced per **lineal foot** of edge, not per square foot. This is because the edge is a 1D feature — it runs along the length of the piece. The area of the edge face (width × length) is already captured by m_ext (see Q5). The $/pi.lin rate times the length of the cut gives the total machining cost for that edge.

---

## Q5 — What is m_ext(B) actually doing?

### The problem it solves

The surface finish rate F is expressed in **$/pi²** (per square foot of face area). But an edge treatment is measured in **pi.lin** (per lineal foot of edge length). These are different units. You need a conversion.

The conversion depends on **how tall the edge face is** — which is determined by B (the thickness of the piece). A thicker piece has a taller edge face, so one lineal foot of edge contains more surface area.

### The unit conversion without m_ext

For a simple 1" thick piece, one lineal foot of edge has an area of:
```
1 pi.lin × (1"/12) = 1/12 pi²  →  cost = F [$/pi²] × (1/12) pi² = F/12  per pi.lin
```

But the table expresses m_ext as "1:1" for the 1"–3½" range — meaning the $/pi² rate is used directly as a $/pi.lin rate, without any dimensional correction. This is a deliberate simplification (or it absorbs the /12 factor into the F rate definition). The table then scales up for thicker pieces.

### What the multipliers represent

| B | m_ext | Physical reading |
|:--|:--|:--|
| 1"–3½" | 1.0× | Thin pieces: edge is small, rate is 1:1 by convention |
| 4"–6" | 1.5× | Edge face is ~1.5× larger than the reference |
| 6½"–8" | 2.0× | Edge face is ~2× larger |
| 8½"–10" | 2.5× | Edge face is ~2.5× larger |
| 10½"–12" | 3.0× | Edge face is ~3× larger |

The multiplier is roughly proportional to B: a 12" piece has a 12× taller edge than a 1" piece, but the table only goes to 3×. The table is therefore not a pure geometric conversion — it is a **pricing schedule** that grows with B but less steeply than B itself (the thicker pieces get a partial discount on edge finishing per unit area, likely because the saw setup cost is amortized).

### Concrete example — Ex.3 (B=2", F_brûlé=2.50$/pi²)

```
m_ext(B=2") = 1.0  per table  →  P_angle = 2.50 × 1.0 = 2.50 $/pi.lin

But observed: Client uses 2.50 × 1.25 × 1.25 = 3.91 $/pi.lin  ⚠️
```

The double ×1.25 observed in Ex.3 is not in the official table. It may be a secondary adjustment for pieces where the angle is on both the face and the side simultaneously (two directions), effectively squaring the factor.

### Concrete example — Ex.1 (B=6", F_brûlé=3.50$/pi²)

```
m_ext(B=6") = 1.5  per table  →  P_angle = 3.50 × 1.5 = 5.25 $/pi.lin
```

But in Ex.1 the Client uses 6.00$/pi.lin directly for the angle. This is close to 5.25 but not exact. ⚠️ The B=6" piece in Ex.1 may be using a flat rate rather than the m_ext formula.

### Summary: what m_ext does in one sentence

**m_ext converts the face finish rate [$/pi²] into an edge machining rate [$/pi.lin] by scaling up proportionally with piece thickness, because thicker pieces have more edge area per lineal foot to finish.**