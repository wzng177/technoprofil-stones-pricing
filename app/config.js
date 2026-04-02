// config.js — environment settings
// Edit this file to point at a different server without touching application logic.
//
// Expected response shape from /extract (all fields optional — missing ones
// keep their current form value):
//   { B, A, C, P, QTY, famille, fini, gamma, shape,
//     hasAngle, hasBrulage, brulRate }
// Aliases also accepted: thickness/depth/length/price/qty/family/finish/…
const CONFIG = {
  extractApiUrl: 'http://localhost:8000/extract',
};
