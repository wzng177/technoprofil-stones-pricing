// ─────────────────────────────────────────────────────────────
// TECHNOPROFIL — Lookup tables
// Edit this file to add / update pricing data.
// All monetary values in CAD $/pi² or $/pi.lin as noted.
// ─────────────────────────────────────────────────────────────

// Surface finish rates [$/pi²] by stone family and finish code
const F_TBL = {
  granit: {
    brule_cg:    2.50,   // Brûlé Crystal Gold (observed)
    brule:       3.50,   // Brûlé — other granite
    jet_sable:   3.50,
    meule:       3.00,
    poli_glace:  5.00,
    bouchard_gros: 5.50,
  },
  calcaire: {
    brule_cg:    0,
    brule:       0,
    jet_sable:   2.50,
    meule:       0.75,
    poli_glace:  5.00,
    bouchard_gros: 3.50,
  },
};

// Primary sawing [$/pi²] — [max_B_inches, rate] brackets, per stone family
const PS_TBL = {
  granit: [
    [2, 3.50], [3, 3.75], [4.5, 4.00], [5.5, 4.50],
    [6.5, 5.50], [8, 6.00], [10, 7.00], [12, 7.50],
    [14, 8.00], [16, 8.50], [20, 9.50], [24, 10.50],
    [28, 12.50], [32, 14.50], [34, 16.50], [36, 17.50],
    [38, 18.50], [40, 19.50],
  ],
  calcaire: [
    [2, 2.50], [3, 3.00], [4.5, 3.50], [5.5, 4.00],
    [6.5, 5.00], [8, 5.00], [10, 6.50], [12, 7.00],
    [14, 7.50], [16, 8.00], [20, 8.50], [24, 10.00],
    [28, 12.50], [32, 14.00], [34, 16.00], [36, 17.00],
    [38, 18.00], [40, 19.00],
  ],
};

// Débitage pass count → rate [$/pi²]
// [num_passes, rate] — interpolated between rows
const PASS_TBL = [
  [1,  4.50], [2,  5.20], [3,  5.70], [4,  6.60],
  [5,  7.50], [10, 11.20],[15, 15.00],[20, 18.70],
  [25, 22.40],[30, 26.20],[35, 30.00],[40, 33.75],
  [45, 37.50],
];

// Inches removed per pass during débitage, by stone family
const DEBITAGE_INCHES_PER_PASS = {
  granit:   1.25,
  calcaire: 1.00,
};

// m_ext multiplier: converts $/pi² finish rate → $/pi.lin edge rate
// [max_B_inches, multiplier]
const M_EXT_TBL = [
  [3.5,  1.0],
  [6.0,  1.5],
  [8.0,  2.0],
  [10.0, 2.5],
  [12.0, 3.0],
];

// Model constants — change only if the base formula changes
const CONSTANTS = {
  delta:   0.25,  // kerf allowance on A dimension (inches)
  dB:      0.50,  // B calibration allowance (inches)
  alpha:   0.85,  // base overhead divisor  (≈ 0.95 × 0.90)
  beta1:   0.95,  // machining overhead factor 1
  beta2:   0.90,  // machining overhead factor 2
  kappa:   1.40,  // brûlage torch path factor
  C_entry: 1.00,  // entry/exit allowance on C dimension (inches)
};

// Client type presets  [label, gamma]
const CLIENT_TYPES = [
  ['Particulier — ÷0.85 (observed)',  0.85],
  ['Particulier — ÷0.684 (official)', 0.684],
  ['Distributeur — ÷0.855',           0.855],
  ['Contracteur >10k — ÷0.90',        0.90],
  ['Contracteur <3k — ÷0.70',         0.70],
];

// Surface finish dropdown options  [label, code]
const FINISH_OPTIONS = [
  ['Brûlé — Crystal Gold (2.50)', 'brule_cg'],
  ['Brûlé — autre granit (3.50)', 'brule'],
  ['Jet de sable (3.50)',          'jet_sable'],
  ['Meulé (3.00)',                 'meule'],
  ['Poli glacé (5.00)',            'poli_glace'],
  ['Bouchardé gros (5.50)',        'bouchard_gros'],
];

// Preset examples for quick testing
const PRESETS = {
  ex3: {
    label: 'Ex.3 — Crystal Gold sill',
    B: 2, A: 18.875, C: 27.5625, P: 53.50,
    famille: 'granit', fini: 'brule_cg',
    client: 0.85, QTY: 4,
    shape: 'chamfer', hasAngle: true, hasBrulage: false,
    brulRate: 3.00, mext: 'observed',
  },
  ex4: {
    label: 'Ex.4 — Spoerry nose',
    B: 2.008, A: 11.89, C: 39.33, P: 44,
    famille: 'granit', fini: 'brule_cg',
    client: 0.85, QTY: 1,
    shape: 'coping', hasAngle: false, hasBrulage: true,
    brulRate: 3.00, mext: 'observed',
  },
  ex2: {
    label: 'Ex.2 — ANCM coping',
    B: 12, A: 22.99, C: 86.17, P: 24.5,
    famille: 'granit', fini: 'brule',
    client: 0.855, QTY: 1,
    shape: 'coping', hasAngle: true, hasBrulage: true,
    brulRate: 5.00, mext: 'official',
  },
  ex1: {
    label: 'Ex.1 — Conway arch',
    B: 6, A: 23.25, C: 95.19, P: 69.75,
    famille: 'granit', fini: 'brule',
    client: 0.85, QTY: 5,
    shape: 'profile', hasAngle: true, hasBrulage: true,
    brulRate: 5.00, mext: 'official',
  },
};