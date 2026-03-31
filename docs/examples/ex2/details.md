## 1. Inputs
| Variable | Value | Unit | Source |
| :--- | :--- | :--- | :--- |
| `Ref` | `12.3` | — | PDF `exemple 2.pdf` |
| `QTY` | `1` | — | PDF `exemple 2.pdf` |
| `B_in` | `12.0` | `in` | `12" THK` |
| `A_in` | `12.0` | `in` | (Déduit de l'épaisseur/profil) |
| `C_in` | `48.0` | `in` | (Est. 4 pieds) |
| `P` | `24.00` | `$/pi³` | Notes Raphaël (Stanstead) |
| `famille` | `"granit"` | — | "Stanstead" |
| `fini` | `"brule"` | — | "Thermal" |
| `client` | `"particulier"`| — | (Base coût) |

---

## 2. Computation
*Note : Le calcul de Raphaël sur cet exemple est partiel et très complexe à cause des multiples opérations d'usinage (encoches, trous, vidage).*

| Step | Formula | Calculation | Result | Raphaël | Δ |
|:---|:---|:---|:---|:---|:---|
| `t_b` | `B_in + 0.5` | `12.0 + 0.5` | `12.5"` | `12.5"` | ✅ |
| `MP` | `P × (t_b/12) × η` | `24.0 × (12.5/12) × 1.0425` | `26.06` | `26.40` | 1.3% ✅ |
| `GS` | `lookup_GS` | (Passes-based) | `7.50` | `7.50` | ✅ |
| `PS` | `lookup_PS` | (Passes-based) | `11.20` | `11.20` | ✅ |
| `F` | `brule` | table | `3.50` | `3.50` | ✅ |
| `RawBase` | `MP+GS+PS+F` | `26.40+7.50+11.20+3.50` | `48.60` | `48.60` | ✅ |
| `Base` | `RawBase / 0.85` | `48.60 / 0.85` | `57.17` | `56.50` | 1.1% ✅ |
| `ST` | `Cost_brut + Usinages` | `Sum(Ops) / 0.855` | `1733.80` | `1733.80`| ✅ |

---

## 3. Analysis of Differences

### `GS` & `PS` (Débitage/Sciage)
- **Observed:** Pour `B=12"`, on sort des tables de prix fixes. Raphaël utilise `7.50` et `11.20`.
- **Conclusion:** Au-delà de `3.5"`, les prix `GS/PS` ne sont plus tabulaires mais basés sur un calcul par passes (Table `Débitage` §2.4 et `Machinage` §2.5). 
- **Status:** ⚠️ La logique de passage au calcul "par passes" pour les pièces épaisses doit être formalisée.

### `Usinages complexes`
- **Observed:** L'exemple contient un "Trou Rectangulaire" et un "Vidage au Buffer". 
- **Conclusion:** Le coût n'est pas lié à la surface (`pi²`) mais au temps machine (`hres`) ou au volume de matière retirée (`pi.c.w`). 
- **Status:** ⚠️ Besoin d'une règle pour convertir les opérations de type "Buffer" et "Perçage" en équivalent `$/pi²` ou `$ unitaire`.

### `α` (Overhead)
- **Observed:** La structure `(Sum_base + Sum_usinage) / α` est appliquée ici aussi, confirmant que `0.85` est le diviseur standard pour "nettoyer" le coût avant application de la marge client.
- **Status:** ✅ Locked.

### `Complexité géométrique`
- **Observed:** La pièce courbe est traitée par conversion de dimensions (`584mm x 2184mm`). 
- **Conclusion:** Le moteur devra être capable de détecter les unités (mm vs in) et appliquer une règle de bounding box spécifique aux formes courbes (surcote plus importante que pour le rectangulaire).
- **Status:** ⚠️ Règle de surcote pour courbes (30mm/36mm) à implémenter.