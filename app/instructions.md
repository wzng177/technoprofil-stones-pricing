# Technoprofil — Estimateur

Stone pricing calculator for natural stone fabrication (granit, calcaire).

---

## Running locally

### Option A — simplest (single drag-and-drop)

Just open `index.html` directly in your browser.

> ⚠️ Chrome may block local `<script src="...">` imports when opened as a file.
> If the app appears blank, use Option B below.

### Option B — one-line local server (recommended)

You need Node.js installed once: https://nodejs.org

Then in a terminal, from the project folder:

```bash
npx serve .
```

Open http://localhost:3000 in your browser. Done.

**VS Code users:** install the "Live Server" extension, right-click `index.html` → "Open with Live Server".

---

## File structure

```
technoprofil/
├── index.html      — page structure & dropdowns (rarely touch this)
├── style.css       — all visual design (touch to tweak layout/colors)
├── tables.js       — all lookup data (THIS is what you edit for pricing)
├── calculator.js   — formula logic & SVG diagrams (touch for new formulas)
└── README.md       — this file
```

---

## How to edit lookup tables

All pricing data lives in **`tables.js`**. Open it in any text editor.

### Add a row to PS_TBL (primary sawing)

```js
const PS_TBL = {
  granit: [
    [2, 3.50], [3, 3.75], ...
    [40, 19.50],
    [44, 21.00],   // ← add new bracket here: [max_B_in_inches, rate_$/pi²]
  ],
  ...
};
```

Brackets are `[max_thickness_inches, rate_$/pi²]` and **must stay sorted ascending**.

### Add a row to PASS_TBL (débitage passes)

```js
const PASS_TBL = [
  [1, 4.50], [2, 5.20], ...
  [45, 37.50],
  [50, 41.00],   // ← [num_passes, rate_$/pi²], sorted ascending
];
```

### Add a new surface finish

1. Add the rate to `F_TBL` under the right stone family:
   ```js
   granit: {
     ...
     eclate: 18.00,   // new finish code → rate $/pi²
   }
   ```

2. Add a dropdown label to `FINISH_OPTIONS`:
   ```js
   ['Éclaté (18.00)', 'eclate'],
   ```

### Add a new client type

```js
const CLIENT_TYPES = [
  ...
  ['Grossiste — ÷0.80', 0.80],  // ← [label, gamma_divisor]
];
```

### Change model constants

`CONSTANTS` at the bottom of `tables.js` holds the formula parameters:

| Key    | Meaning                              | Default |
|--------|--------------------------------------|---------|
| delta  | Kerf allowance on A (inches)         | 0.25    |
| dB     | B calibration allowance (inches)     | 0.50    |
| alpha  | Base overhead divisor                | 0.85    |
| beta1  | Machining overhead factor 1          | 0.95    |
| beta2  | Machining overhead factor 2          | 0.90    |
| kappa  | Brûlage torch path factor            | 1.40    |
| C_entry| Entry/exit allowance on C (inches)   | 1.00    |

---

## Open questions (to confirm with client)

- `⚠️` **m_ext observed**: the ×1.25² factor for B≤3.5" does not appear in the official table. Used only when "Observed" mode is selected.
- `⚠️` **Brûlage rate**: the $/pi.lin rate is unconfirmed — flagged in the UI.
- `⚠️` **γ Particulier**: official cascade gives ÷0.684 but ÷0.85 is consistently observed. Both options available in the client-type dropdown.