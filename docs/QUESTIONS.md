# TECHNOPROFIL — Open Questions for Client
_To be updated as answers are obtained_
_⬜ = unanswered | ✅ = confirmed | ❌ = ruled out_

---

## How to use this file

Each question has:
- A **context** paragraph explaining where the discrepancy was found
- The **specific question** to ask
- The **impact** on the estimation model if the answer changes things
- A **status** tag

---

## Q1 — F_brûlé: 2.50 or 3.50 for Crystal Gold? ⬜

**Context:**
The official rate sheet (`étape_de_calcul.pdf` p.3) lists Brûlé granit at **3.50$/pi²**. Examples 1 and 2 (Woodbury and Standstead granite) use 3.50, matching the table. But Examples 3 and 4 (Crystal Gold granite) consistently use **2.50$/pi²**.

**Question:**
Is 2.50$/pi² a material-specific rate for Crystal Gold (or similar fine-grain granites), or is it a negotiated/client-specific rate? Should the model use 3.50 as the universal default and allow a manual override for specific stones?

**Impact:**
Every Crystal Gold brûlé job is priced ~28% lower on the F component if 2.50 is used instead of 3.50. This flows directly into the Base rate and therefore into the final price.

---

## Q2 — P_angle for thin pieces: where does 4.20$/pi.lin come from? ⬜

**Context:**
In Example 3 (B=2", Crystal Gold), the Client uses a P_angle rate of approximately **4.20$/pi.lin** for the angle cut. The model formula says:

```
P_angle = F × m_ext(B)
```

For B=2", the official m_ext table gives m_ext=1.0 (1:1 conversion), which would give:
```
P_angle = 2.50 × 1.0 = 2.50$/pi.lin
```

Retro-engineering from 4.20: `m_ext = 4.20 / 2.50 = 1.68`. This is close to `1.296²` but not a clean number. However the handwriting may show **4.26** (not 4.20), which would give:
```
2.50 × 1.25 × 1.25 = 3.906 ≈ 3.91  (still not exactly 4.26)
```

Three hypotheses:
1. The base used is not F=2.50 but a different rate (e.g. 3.00 or 3.50), with a single ×1.25 applied
2. m_ext for B≤3½" is actually **1.25** (not 1.0 per table), and a second ×1.25 is a separate thickness surcharge for thin pieces
3. The 4.20/4.26 is a flat rate the Client uses for thin granit chamfers, unrelated to the F×m_ext formula

**Question:**
For a B=2" piece with brûlé finish, how is the angle rate ($/pi.lin) calculated exactly? Is it F × some factor, or a flat rate? What does the ×1.25 "Épaisseur" factor in the handwriting represent?

**Impact:**
Angle cost for thin pieces (B≤3.5") could be off by 40–70% depending on the answer. This is one of the most common piece types.

---

## Q3 — γ for Particulier: 0.80 (table) or 0.85 (practice)? ⬜

**Context:**
The official rate sheet (`étape_de_calcul.pdf` p.4) states the Particulier cascade as:
```
÷0.95  ÷0.90  ÷0.80
```
Net divisor = 0.684, net markup = +46%.

However, the Base formula already embeds α=0.85 ≈ 0.95×0.90, absorbing the first two steps. The final step should therefore be ÷0.80 (+25%). But in **all four examples reviewed**, the Client applies only **÷0.85** (+17.6%) as the final step.

**Question:**
For a Particulier client, what is the final divisor applied after the Base rate calculation — is it ÷0.80 (per the official table) or ÷0.85 (as observed in practice)? Is there a threshold (order size, piece type) that changes the rule?

**Impact:**
Approximately 7% price difference on every Particulier job. On a $1,000 subtotal this is $70 per order.

---

## Q4 — m_ext for B > 12": is there an extended table? ⬜

**Context:**
The official m_ext table (`étape_de_calcul.pdf` p.3) stops at B=10½"–12" with a multiplier of ×3.0. There is no entry for pieces thicker than 12". In Example 2 (B=12", ANCM coping), the angle is priced at a flat **15$/pi²** rate applied differently — not via the m_ext formula at all.

**Question:**
For pieces with B > 12", how is the angle edge priced? Is there an extended m_ext table, or does the Client switch to a flat $/pi.lin rate? If flat, what are the rates by thickness bracket?

**Impact:**
Required to price large coping, thick sills, and monumental pieces correctly.

---

## Q5 — Brûlage service rate: is there a rate card? ⬜

**Context:**
When brûlé finish is applied to a curved, moulded, or non-flat surface, it is billed separately as a $/pi.lin service rather than included in the Base F rate. Two different rates have been observed:
- Example 1 (Woodbury granite): **5.00$/pi.lin**
- Example 4 (Crystal Gold granite): **3.00$/pi.lin**

It is unclear whether the difference is due to material (granite type), piece geometry, or something else entirely.

**Question:**
Is there a formal rate schedule for brûlage as a service ($/pi.lin)? Does the rate vary by granite type, piece profile, or other factors?

**Impact:**
All jobs with curved or moulded brûlé finish. Currently the model requires manual rate entry; a table would allow automation.

---

## Q6 — κ=1.4 path factor for brûlage: official or rule of thumb? ⬜

**Context:**
In Examples 1 and 4, the Client multiplies the plan length C by **1.4** before dividing by 12 to get the brûlage path in pi.lin:
```
L_brûlage = C × 1.4 / 12
```
This factor accounts for the torch following the arc of a rounded edge rather than the straight plan length. The value 1.4 makes physical sense — it sits between a flat edge (1.0×) and a full quarter-round bullnose (π/2 ≈ 1.57×) — but it does not appear in the official rate sheet.

**Question:**
Is κ=1.4 a fixed rule, or does it vary by profile type (flat chamfer vs. bullnose vs. ogee)? Is it in an internal document not yet shared?

**Impact:**
Brûlage cost scales linearly with κ. If κ varies by profile, it needs to be a selectable parameter.

---

## Q7 — Machinage second column: what are the numbers 55, 60, 65…? ⬜

**Context:**
The machinage table in `étape_de_calcul.pdf` p.2 has a second column of values alongside the standard pass-count prices:
```
5 passes   2.00$    55 = 14.5
10 passes  3.25$    60 = 15.75
15 passes  15.00$   65 = 17.00
...
```
The numbers 55, 60, 65… (in steps of 5, going to 100) do not correspond to any known parameter in the model. Possible interpretations: stone hardness index, blade temperature threshold, ambient temperature range, or a secondary pricing schedule for a different operation type.

**Question:**
What do the numbers 55, 60, 65… in the right column of the machinage table represent, and when are the associated dollar values used?

**Impact:**
May reveal an entirely separate pricing schedule applicable to certain operations or conditions. Currently ignored in the model.

---

## Q8 — δ (blade kerf): always 0.25" regardless of blade or stone? ⬜

**Context:**
The model uses δ=0.25" as the blade kerf loss per linear dimension, derived from observation of the bounding box calculations. This value affects η (area waste factor) and A_brut. It has not been explicitly confirmed from a source document.

**Question:**
Is δ=0.25" a fixed constant for all operations and materials, or does it vary by blade type, stone hardness, or cut depth?

**Impact:**
δ appears squared in η = ((12+δ)/12)², so even small changes compound. A δ of 0.375" instead of 0.25" would change η from 1.042 to 1.063 — about 2% more stone purchased on every job.

---

## Q9 — Bounding box for curved pieces: what is the convention? ⬜

**Context:**
For rectangular pieces, the bounding box is trivial: A_brut = A + δ, C_brut = C + 1.0". For curved or shaped pieces (Examples 1, 2, 4), the Client uses a bounding box derived from the geometry of the net shape. The allowances observed are larger than δ and +1.0":
- Example 2: +30mm on A (≈1.18"), +32mm on C (≈1.26")
- Example 4: +73mm on A (≈2.87"), +76mm on C (≈2.99")

It is unclear whether these are computed geometrically from the curve, read off the drawing, or follow a rule based on profile type.

**Question:**
For curved or shaped pieces, how are A_brut and C_brut determined? Is it: (a) bounding box of net shape + δ and +1.0", (b) bounding box of net shape + a larger fixed allowance, or (c) a manual judgment call per piece?

**Impact:**
Required to automate pricing for non-rectangular pieces. Currently a manual step.

---

## Q10 — GS for B=6" (Example 1): why 51.65$/pi²? ⬜

**Context:**
In Example 1 (B=6", Woodbury granite), the Client writes a GS value of **51.65$/pi²**. This is far above what the pass-based débitage formula would give:
```
B=6", granit: 6 / 1.25 = 4.8 passes → round to 5 → 7.50$/pi²
```
51.65 cannot be explained by any combination of pass counts from the table. It may represent a composite value (GS + machinage together), a different operation being billed under the GS label, or a price that includes setup costs for a large curved piece.

**Question:**
In Example 1, what does the 51.65$/pi² figure under GS represent? Is it pure débitage, or does it include other operations (machinage, setup)?

**Impact:**
If GS can include composite costs, the model's separation of GS / machinage / setup is incomplete for complex pieces.

---

## Q11 — Label swap GS/PS: is this intentional or a notation habit? ⬜

**Context:**
In all four examples reviewed, the Client writes the labels "GS" and "PS" with their values swapped relative to the rate sheet:
- What the Client labels "PS" → matches the Sciage primaire table (PS in the model)
- What the Client labels "GS" → matches the Débitage table (GS in the model)

This is consistent across examples, suggesting it is a stable personal convention rather than an error.

**Question:**
Is the GS/PS label swap intentional (a longstanding internal convention) or accidental? Confirming this will prevent data entry errors when transcribing handwritten calculations.

**Impact:**
No impact on calculations, but critical for correctly reading any handwritten notes provided by the Client.

---

## Summary table

| # | Topic | Status | Price impact |
|:--|:--|:--|:--|
| Q1 | F_brûlé: 2.50 vs 3.50 for Crystal Gold | ⬜ | High — ~28% on F component |
| Q2 | P_angle for thin pieces (B≤3.5") | ⬜ | High — angle cost off by 40–70% |
| Q3 | γ Particulier: 0.80 vs 0.85 | ⬜ | Medium — ~7% on every Particulier job |
| Q4 | m_ext for B > 12" | ⬜ | High for thick pieces |
| Q5 | Brûlage $/pi.lin rate schedule | ⬜ | Medium — all curved brûlé jobs |
| Q6 | κ=1.4 path factor: fixed or variable? | ⬜ | Medium — scales brûlage cost linearly |
| Q7 | Machinage second column (55, 60, 65…) | ⬜ | Unknown — may be large |
| Q8 | δ=0.25" blade kerf: always constant? | ⬜ | Low-medium — compounds via η² |
| Q9 | Bounding box convention for curved pieces | ⬜ | High for non-rectangular pieces |
| Q10 | GS=51.65 in Example 1: what is it? | ⬜ | High for complex/thick pieces |
| Q11 | GS/PS label swap: intentional? | ⬜ | None (notation only) |