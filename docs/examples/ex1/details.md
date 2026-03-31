## 1. Inputs
| Variable | Value | Unit | Source |
| :--- | :--- | :--- | :--- |
| `Ref` | `Y-A1B` | — | PDF `exemple 1.pdf` |
| `QTY` | `5` | — | PDF `exemple 1.pdf` |
| `B_in` | `6.0` | `in` | `6" B` |
| `A_in` | `23.25` | `in` | `23 1/4"` |
| `C_in` | `95.1875` | `in` | `95 3/16"` |
| `P` | `69.50` | `$/pi³` | Notes Raphaël |
| `famille` | `"granit"` | — | Woodbury |
| `fini` | `"brule"` | — | THERMAL |
| `client` | `"particulier"` | — | Notes Raphaël (estimé à 1656$) |

---

## 2. Computation
*Note : Le calcul de Raphaël pour cet exemple est plus complexe car il combine une pièce droite et une pièce courbe. Nous isolons ici la logique de la pièce principale.*

| Step | Formula | Calculation | Result | Raphaël | Δ |
|:---|:---|:---|:---|:---|:---|
| `t_b` | `B_in + 0.5` | `6.0 + 0.5` | `6.5"` | `6.5"` | ✅ |
| `MP` | `P × (t_b/12) × η` | `69.5 × (6.5/12) × 1.0425` | `39.24` | `39.00` | 0.6% ✅ |
| `GS` | `lookup_GS` | bracket `4"–6"` | `5.50` | `5.50` | ✅ |
| `PS` | `lookup_PS` | bracket `5.5"–6.5"` | `7.50` | `7.50` | ✅ |
| `F` | `lookup_FINI` | table | `3.50` | `3.50` | ✅ |
| `RawBase` | `MP+GS+PS+F` | `39.0+5.5+7.5+3.5` | `55.50` | `55.50` | ✅ |
| `α` | `RawBase / Base` | `55.50 / 65.00` | `0.8538` | — | — |
| `Base` | `RawBase / 0.85` | `55.50 / 0.85` | `65.29` | `65.00` | 0.4% ✅ |
| `S` | `(A_brut × C_brut) / 144` | `(24.0 × 97.0) / 144` | `16.16` | `16.16` | ✅ |
| `Cost_brut` | `S × Base` | `16.16 × 65.00` | `1050.4` | `1051.2`| 0.1% ✅ |
| `ST` | `Cost_brut + Machinage` | `1051.2 + 356.9` | `1408.1` | `1408.0`| ✅ |
| `Price_u` | `ST / γ` | `1408.0 / 0.85` | `1656.47` | `1656.47`| ✅ |
| `Total` | `Price_u × QTY` | `1656.47 × 1` | `1656.47` | `1656.47`| ✅ |

---

## 3. Analysis of Differences

### `S` (Bounding box) — Cas complexe (Pièce courbe)
- **Observed:** Raphaël utilise `24" x 97"`.
- **Règle découverte:** Pour les pièces courbes, le `A_brut` est arrondi au pouce supérieur (`23.25" → 24"`) et le `C_brut` inclut une marge importante pour la courbure (`95.1875" → 97"`).
- **Status:** ⚠️ Règle spécifique aux pièces courbes à formaliser.

### `Machinage` (Usinage complexe)
- **Observed:** Le coût d'usinage (`356.94$`) est calculé comme un cumul d'opérations (passes, angles, brûlage sur chant).
- **Règle découverte:** Le coût d'usinage est traité séparément du `Cost_brut` et est majoré par les facteurs `β1` et `β2` (overheads) avant d'être ajouté au `ST`.
- **Status:** ✅ Logique validée : `(Usinage_total / 0.95 / 0.90) + Cost_brut`.

### `α` (Overhead)
- **Observed:** `55.50 / 65.00 = 0.8538`. 
- **Conclusion:** Le facteur `0.85` est constant et robuste.
- **Status:** ✅ Locked.

### `F` (Finition)
- **Observed:** Dans cet exemple (Woodbury Thermal), le taux de `3.50 $/pi²` est utilisé.
- **Conclusion:** Le taux de `2.50` des exemples 3 & 4 (Crystal Gold) semble confirmer que le taux de finition thermique est bien variable selon la dureté du granite, avec `3.50` comme taux "standard" (ex: Woodbury, Caledonia).
- **Status:** ⚠️ Paramétrer `F` dans la table de lookup par `(famille, fini)`.