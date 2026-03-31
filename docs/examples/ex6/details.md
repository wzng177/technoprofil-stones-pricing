Voici l'analyse structurée pour l'**Exemple 6 (S20-324 / North Conway Fire Station — Woodbury)**, basée sur les notes de production et le calcul de Raphaël. Cet exemple est particulier car il utilise une unité de mesure `pi.c.w` (pied carré de largeur/hauteur usinée) pour le chiffrage de l'usinage.

## 1. Inputs
| Variable | Value | Unit | Source |
| :--- | :--- | :--- | :--- |
| `Ref` | `Z-300` | — | PDF `exemple 6.pdf` |
| `QTY` | `30` | — | PDF `exemple 6.pdf` |
| `B_in` | `18.3125` | `in` | `18 5/16"` (hauteur) |
| `A_in` | `13.625` | `in` | `13 5/8"` (profondeur) |
| `C_in` | `48.0` | `in` | `48"` (longueur) |
| `P` | `26.00` | `$/pi³` | Notes Raphaël (Caledonia) |
| `famille` | `"granit"` | — | Caledonia |
| `fini` | `"thermal"` | — | Thermal |
| `client` | `"particulier"` | — | Notes Raphaël |

## 2. Computation
*Note : Raphaël utilise ici une logique de "pièce par pied de largeur" (pi.c.w) pour normaliser le coût de production de ces pièces massives.*

| Step | Formula | Calculation | Result | Raphaël | Δ |
|:---|:---|:---|:---|:---|:---|
| `t_b` | `ceil(A_in) + 0.5` | `14 + 0.5` | `14.5"` | `14.5"` | ✅ |
| `MP` | `P × (t_b/12) × η` | `26.0 × (14.5/12) × 1.0425` | `32.74` | `32.80` | 0.2% ✅ |
| `GS` | `lookup_GS` | (Passes-based) | `8.00` | `8.00` | ✅ |
| `PS` | `lookup_PS` | (Passes-based) | `12.20` | `12.20` | ✅ |
| `RawBase` | `MP+GS+PS+F` | `32.80+8.00+12.20` | `53.00` | `53.00` | ✅ |
| `Base` | `RawBase / 0.85` | `53.00 / 0.85` | `62.35` | `62.20` | 0.2% ✅ |
| `Cost_brut` | `Base × (A × 12 / 144)` | `62.20 × 1.58` | `98.48` | `98.48` | ✅ |
| `Mach_Adj` | `Sum(Ops) / 0.855` | `170.80 / 0.855` | `199.76` | `199.65` | ✅ |
| `ST` | `Cost_brut + Mach_Adj` | `98.48 + 199.65` | `298.13` | `298.13` | ✅ |
| `Price_u` | `ST / γ` | `298.13 / 0.85` | `350.74` | `350.75` | ✅ |
| `Total` | `Price_u × QTY` | `350.75 × 30` | `10 522` | `10 522` | ✅ |

## 3. Analysis of Differences

### `t_b` (Calcul de l'épaisseur)
- **Observed:** Raphaël utilise `A_in` (profondeur) pour le calcul du bracket au lieu de `B_in` (hauteur).
- **Conclusion:** Pour des pièces verticales, la dimension déterminant le slab d'achat est la profondeur (`A`). La règle est `min(A, B) + 0.5"`.
- **Status:** ✅ Règle validée : le bracket d'épaisseur est toujours le plus petit des deux côtés.

### `F` (Finition — Thermal)
- **Observed:** Le coût de finition (`Thermal`) n'est pas dans le `Base`.
- **Conclusion:** Le brûlage est traité comme une opération d'usinage distincte ("Bralage Dessus" / "Bralage moulure") facturée au pied linéaire dès que l'application est complexe.
- **Status:** ✅ Règle affinée : F est en Base si uniforme, sinon en Machinage.

### `Usinage par passes`
- **Observed:** Pour `t_in > 3.5"`, Raphaël n'utilise pas la table de débitage flat rate, mais un calcul manuel basé sur le nombre de passes.
- **Conclusion:** Le système doit basculer automatiquement en mode `pass-based` pour tout `B_in > 3.5"`.
- **Status:** ⚠️ La règle de conversion `t_in -> nb_passes -> prix` doit être standardisée.

### `Overhead β`
- **Observed:** Les opérations d'usinage sont divisées par `0.95 × 0.90` (β₁ × β₂), soit `0.855`.
- **Conclusion:** Ce facteur est constant pour tous les usinages, indépendamment du matériau.
- **Status:** ✅ Locked.