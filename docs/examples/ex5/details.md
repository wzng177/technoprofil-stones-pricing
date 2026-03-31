Voici l'analyse structurée pour l'**Exemple 5 (Comptoir Cambrian)**, basée sur les notes manuscrites et la fiche de production `exemple 5.pdf`.

## 1. Inputs
| Variable | Value | Unit | Source |
| :--- | :--- | :--- | :--- |
| `Ref` | `W-01` | — | PDF `exemple 5.pdf` |
| `QTY` | `1` | — | PDF `exemple 5.pdf` |
| `B_in` | `1.25` | `in` | `1 1/4" THK` |
| `A_in` | `22.75` | `in` | `22 3/4"` |
| `C_in` | `52.0` | `in` | `52"` |
| `P` | `148.00` | `$/pi³` | Notes Raphaël (Cambrian Absolute Black) |
| `famille` | `"granit"` | — | Cambrian Absolute Black |
| `fini` | `"poli_glace"` | — | "POLI GLACÉ" |
| `client` | `"particulier"` | — | Notes Raphaël |

## 2. Computation
| Step | Formula | Calculation | Result | Raphaël | Δ |
|:---|:---|:---|:---|:---|:---|
| `t_b` | `B_in + 0.5` | `1.25 + 0.5` | `1.75"` (→2.0") | `2.0"` | ✅ |
| `MP` | `P × (t_b/12) × η` | `148.0 × (2/12) × 1.0425` | `25.71` | `25.60` | 0.4% ✅ |
| `GS` | `lookup_GS` | bracket `3/4"–1.75"` | `3.50` | `3.50` | ✅ |
| `PS` | `lookup_PS` | bracket `1"–2"` | `3.50` | `4.50` | **⚠️** |
| `F` | `lookup_FINI` | table | `5.00` | `4.50` | **⚠️** |
| `RawBase` | `MP+GS+PS+F` | `25.60+3.50+4.50+4.50` | `38.10` | `38.10` | ✅ |
| `α` | `RawBase / Base` | `38.10 / 44.60` | `0.854` | — | — |
| `Base` | `RawBase / 0.85` | `38.10 / 0.85` | `44.82` | `44.60` | 0.5% ✅ |
| `S` | `(A_brut × C_brut) / 144` | `(23.0 × 52.0) / 144` | `8.31` | `8.31` | ✅ |
| `Cost_brut` | `S × Base` | `8.31 × 44.60` | `370.63` | `372.21` | 0.4% ✅ |
| `Mach_Adj` | `(Mach + Pol) / β₁β₂` | `(138.75 + 131.00) / 0.855` | `315.50` | `315.00` | 0.2% ✅ |
| `ST` | `Cost_brut + Mach_Adj` | `372.21 + 315.00` | `687.21` | `687.20` | ✅ |
| `Price_u` | `ST / γ` | `687.20 / 0.85` | `808.47` | `809.00` | 0.06% ✅ |

## 3. Analysis of Differences

### `PS` (Sciage primaire)
- **Observed:** Raphaël utilise `4.50` pour `B=1.25"`.
- **Table value:** `3.50` (pour le bracket `1"–2"`).
- **Hypothèse:** Une majoration de `1.00$` est appliquée pour les pierres noires (Absolute Black) en raison de la fragilité/rareté, ou la table de sciage est sous-estimée pour ce matériau.
- **Status:** ⚠️ À valider avec Raphaël.

### `F` (Poli glacé)
- **Observed:** Raphaël utilise `4.50`.
- **Table value:** `5.00`.
- **Hypothèse:** Le prix `4.50` correspond au "Poli mat" (indiqué au même tarif dans la table). Il est possible que pour le Cambrian, Raphaël applique le tarif mat par défaut.
- **Status:** ⚠️ À valider si le Cambrian requiert une spécification de poli différente.

### `S` (Bounding Box)
- **Observed:** Raphaël utilise `23" x 52"`.
- **Règle:** `A_brut = ceil(22.75) = 23"`. `C_brut = 52"` (pas de +1" pour la longueur, contrairement à l'Exemple 3).
- **Hypothèse:** La règle d'ajout de 1" sur `C` ne s'applique pas aux comptoirs (pièces finies sans scie d'entrée/sortie apparente).
- **Status:** ✅ Règle affinée : ajout `+1"` uniquement pour les coupes architecturales (bases, corniches).

### `α` (Overhead)
- **Observed:** `0.85` confirmé.
- **Status:** ✅ Locked.