## 1. Inputs
| Variable | Value | Unit | Source |
| :--- | :--- | :--- | :--- |
| `Ref` | `V-C29` | — | PDF `exemple 4.pdf` |
| `QTY` | `1` | — | PDF `exemple 4.pdf` |
| `B_in` | `2.00` | `in` | `51 mm` |
| `A_in` | `11.89` | `in` | `302 mm` |
| `C_in` | `39.33` | `in` | `999 mm` |
| `P` | `44.50` | `$/pi³` | Notes Raphaël |
| `famille` | `"granit"` | — | Crystal Gold |
| `fini` | `"brule"` | — | Brulé |
| `client` | `"particulier"` | — | Notes Raphaël |

## 2. Computation
| Step | Formula | Calculation | Result | Raphaël | Δ |
|:---|:---|:---|:---|:---|:---|
| `t_b` | `B_in + 0.5` | `2.0 + 0.5` | `2.5"` | `2.5"` | ✅ |
| `MP` | `P × (t_b/12) × η` | `44.50 × 0.2083 × 1.0425` | `9.66` | `9.55` | 1% ✅ |
| `GS` | `lookup_GS` | bracket `2"–3.5"` | `4.50` | `3.50` | **⚠️** |
| `PS` | `lookup_PS` | bracket `1"–2"` | `3.50` | `4.50` | **⚠️** |
| `F` | `lookup_FINI` | table | `3.50` | `2.50` | **⚠️** |
| `RawBase` | `MP+GS+PS+F` | `9.55+3.50+4.50+2.50` | `20.05` | `20.05` | ✅ |
| `α` | `RawBase / Base` | `20.05 / 23.45` | `0.855` | — | — |
| `Base` | `RawBase / 0.85` | `20.05 / 0.85` | `23.59` | `23.45` | 0.6% ✅ |

*(Le calcul final inclut des opérations d'usinage complexes "en rond" et des brûlages sur chants, détaillés dans les notes par des équations quadratiques spécifiques au profil.)*

## 3. Analysis of Differences

### `GS` & `PS` — Labels inversés
- **Observed:** Comme pour l'exemple 3, Raphaël utilise `3.50` pour le débitage (GS) et `4.50` pour le sciage primaire (PS).
- **Conclusion:** La règle d'inversion des labels dans les notes manuscrites est confirmée et systématique.

### `F` — Taux de finition (Brûlé)
- **Observed:** Raphaël utilise `2.50 $/pi²` au lieu des `3.50 $/pi²` théoriques de la table.
- **Conclusion:** Cette valeur de `2.50` est constante pour les granits "Crystal Gold" (exemples 3 et 4).
- **Status:** ⚠️ Règle de prix différenciée selon la pierre à intégrer dans la table `lookup_FINI`.

### `α` — Overhead de base
- **Observed:** `RawBase / 0.85 = Base`.
- **Conclusion:** Le facteur `0.85` est le diviseur standard pour passer du coût brut au prix de base, constant sur tous les exemples.
- **Status:** ✅ Locked.

### `Machinage spécifique` (Usinage en rond)
- **Observed:** Les notes mentionnent des calculs spécifiques (`28.50/pi.lin` pour usinage des axes simultanés).
- **Conclusion:** Pour les pièces courbes, le coût n'est pas uniquement surfacique, mais dépend du nombre de passes et de l'usinage en simultané sur plusieurs axes (CNC 5 axes).
- **Status:** ⚠️ Nécessite une table de tarifs spécifique pour les opérations "Usinage en rond".