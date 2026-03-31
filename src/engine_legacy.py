import logging
from dataclasses import dataclass
from typing import Dict, List
import math

# Configuration du logger
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger("EstimEngine")

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

class Estimator:
    # Constantes (K=12.25, V=1728, delta_t=0.5, alpha=0.85, beta=0.95*0.90, gamma=0.85)
    K = 12.25
    V = 1728
    DELTA_T = 0.5
    ETA = (K / 12) ** 2
    ALPHA = 0.85
    BETA_TOTAL = 0.95 * 0.90
    GAMMA = 0.85

    # Tables de lookup (simplifiées pour la démo)
    GS_TABLE = {"granit": {1.75: 3.50, 3.5: 4.50}}
    PS_TABLE = {"granit": {2.0: 3.50, 3.0: 3.75}}
    FINI_TABLE = {"granit": {"brule": 2.50, "poli_glace": 5.00}}

    def compute(self, cfg: PieceConfig):
        logger.info(f"--- Calcul pour {cfg.ref} (Qté: {cfg.qty}) ---")

        # 1. Base Price per pi²
        t_b = cfg.B_in + self.DELTA_T
        MP = cfg.P * (t_b / 12) * self.ETA
        logger.info(f"Thick: {t_b} | Eta: {self.ETA:.2f}")

        # Lookups simplifiés (prend le 1er bracket correspondant)
        GS = self.GS_TABLE[cfg.famille][3.5] # Simulation lookup
        PS = self.PS_TABLE[cfg.famille][2.0]
        F  = self.FINI_TABLE[cfg.famille][cfg.fini]
        
        base_pi2 = (MP + GS + PS + F) / self.ALPHA
        logger.info(f"Cout Matiere: {MP:.2f} $/pi² | Base/pi²: {base_pi2:.2f}")

        # 2. Bounding Box & Raw Cost
        # Règle confirmée: A brut = ceil(A), C brut = C + 1
        a_brut = math.ceil(cfg.A_in)
        c_brut = cfg.C_in + 1.0
        surf = (a_brut * c_brut) / 144
        cost_brut = surf * base_pi2
        logger.info(f"Surface brute: {surf:.3f} pi² | Coût brut: {cost_brut:.2f} $")

        # 3. Machining (Angle 45° simplifié)
        s_angle = a_brut / (0.707 * 12)
        p_angle = F * 1.68 # Facteur observé
        cost_angle = (s_angle * p_angle) / self.BETA_TOTAL
        logger.info(f"Coût usinage (adj): {cost_angle:.2f} $")

        # 4. Final Price
        st = cost_brut + cost_angle
        unit_price = st / self.GAMMA
        total = unit_price * cfg.qty
        
        logger.info(f"Prix Unitaire: {unit_price:.2f} $ | TOTAL: {total:.2f} $")
        return {"price_unit": unit_price, "total": total}



if __name__ == "__main__":
    engine = Estimator()
    ex3 = PieceConfig(
        ref="Z-D1", qty=4, B_in=2.0, A_in=18.875, C_in=27.5625,
        P=53.50, famille="granit", fini="brule", client="particulier"
    )
    engine.compute(ex3)