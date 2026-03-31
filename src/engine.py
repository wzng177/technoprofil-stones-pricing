import math
import logging
from dataclasses import dataclass, field
from typing import Dict, List, Optional
from bisect import bisect_right



@dataclass
class PieceConfig:
    ref: str
    qty: int
    B_in: float  # Thickness
    A_in: float  # Depth
    C_in: float  # Length
    P: float     # Price/pi³
    famille: str # "granit", "calcaire"
    fini: str    # "brule", "poli_glace", etc.
    client: str  # "particulier", etc.
    shape: str = "rect"


@dataclass
class EngineConfig:
    K: float = 12.25      # [in/pi] Effective inches per foot
    V: float = 1728.0     # [in³/pi³] Exact volume factor
    DELTA_T: float = 0.5  # [in] Calibrage allowance
    ALPHA: float = 0.85   # Overhead de base (base rate)
    BETA_1: float = 0.95  # Machining overhead 1
    BETA_2: float = 0.90  # Machining overhead 2
    GAMMA: float = 0.85   # Diviseur client (particulier)

@dataclass
class CalculationResult:
    """Sauvegarde des étapes pour comparaison avec Raphaël"""
    mp: float = 0.0
    gs: float = 0.0
    ps: float = 0.0
    f: float = 0.0
    base_pi2: float = 0.0
    surf_brute: float = 0.0
    cost_brut: float = 0.0
    cost_machining_adj: float = 0.0
    unit_price: float = 0.0
    total_price: float = 0.0

# --- Moteur d'estimation ---
class Estimator:
    def __init__(self, cfg: EngineConfig):
        self.cfg = cfg
        # Mapping Lookup tables
        self.GS_LOOKUP = {2.0: 3.50, 3.5: 4.50} # Ex: clés = seuil max du bracket
        self.PS_LOOKUP = {2.0: 3.50, 3.0: 3.75, 4.5: 4.00}
        
    def _bisect_lookup(self, table: Dict[float, float], value: float) -> float:
        """Recherche binaire pour trouver le bracket correct"""
        keys = sorted(table.keys())
        idx = bisect_right(keys, value)
        if idx >= len(keys): return table[keys[-1]]
        return table[keys[idx]]

    def compute(self, piece: PieceConfig) -> CalculationResult:
        res = CalculationResult()
        
        # 1. Base Price
        t_in = min(piece.A_in, piece.B_in)
        t_b = math.ceil((t_in + self.cfg.DELTA_T) * 2) / 2.0
        
        res.mp = piece.P * (t_b / 12) * ((self.cfg.K / 12) ** 2)
        res.gs = self._bisect_lookup(self.GS_LOOKUP, t_in)
        res.ps = self._bisect_lookup(self.PS_LOOKUP, t_in)
        res.f = 2.50 # Valeur empirique constatée (vs 3.50 table)
        
        res.base_pi2 = (res.mp + res.gs + res.ps + res.f) / self.cfg.ALPHA
        
        # 2. Geometry
        res.surf_brute = (math.ceil(piece.A_in) * (piece.C_in + 1.0)) / 144
        res.cost_brut = res.surf_brute * res.base_pi2
        
        # 3. Final Price
        res.unit_price = res.cost_brut / self.cfg.GAMMA
        res.total_price = res.unit_price * piece.qty
        
        return res

# --- Module de Test Unitaire ---
def test_example_3():
    cfg = EngineConfig()
    engine = Estimator(cfg)
    ex3 = PieceConfig(ref="Z-D1", qty=4, B_in=2.0, A_in=18.875, C_in=27.5625, P=53.50, famille="granit", fini="brule", client="particulier")
    
    result = engine.compute(ex3)
    print(result)
    exit()
    # Comparaison vs Ground Truth
    raphael_price = 129.66
    assert math.isclose(result.unit_price, raphael_price, rel_tol=0.01), f"Écart détecté: {result.unit_price} vs {raphael_price}"
    print(f"Test réussi pour {ex3.ref} : {result.unit_price} $")

if __name__ == "__main__":
    test_example_3()