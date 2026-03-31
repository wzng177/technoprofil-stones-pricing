# ── Inputs (boundary, convert once) ─────────────────────────
B_in       # thickness [in]  → raw input
A_in       # depth [in]      → raw input  
C_in       # length [in]     → raw input

# ── Config constants ─────────────────────────────────────────
δ   = 0.25        # kerf loss per linear dimension [in]   ⚠️ confirm
Δt  = 0.5         # thickness calibration allowance [in]  ⚠️ confirm
K   = 12 + δ      # effective in/pi with kerf = 12.25     ⚠️ confirm
η   = (K/12)²     # area yield factor [-]  ≈ 1.042
α   = 0.85        # base price overhead divisor [-]       ⚠️ confirm
β₁  = 0.95        # machining overhead factor 1 [-]
β₂  = 0.90        # machining overhead factor 2 [-]
γ   = 0.85        # client divisor (particulier) [-]

# ── Step 1 : Material cost per pi² ───────────────────────────
t_b = B_in + Δt                        # bracketed thickness [in]
B_h = t_b / 12                         # bracketed thickness [pi]
MP  = P * B_h * η                      # [$/pi²]
GS  = lookup_GS(famille, B_in)         # [$/pi²]
PS  = lookup_PS(famille, B_in)         # [$/pi²]
F   = lookup_FINI(famille, fini)       # [$/pi²]

Base = (MP + GS + PS + F) / α          # [$/pi²]

# ── Step 2 : Bounding box ────────────────────────────────────
A_brut = ceil(A_in)                    # [in]  ⚠️ rule to confirm
C_brut = C_in + 1.0                    # [in]  ⚠️ rule to confirm
S = (A_brut / 12) * (C_brut / 12)      # [pi²]

Cost_brut = S * Base                   # [$/piece]

# ── Step 3 : Machining (angle 45°) ───────────────────────────
S_angle = A_brut / (sin(45°) * 12)          # [pi²]
P_angle = F * m_ext(B_in)                   # [$/pi²]  ⚠️ m_ext TBD
Cost_angle = S_angle * P_angle              # [$]
Cost_angle_adj = Cost_angle / (β₁ * β₂)     # [$]

# ── Step 4 : Final price ─────────────────────────────────────
ST          = Cost_brut + Cost_angle_adj          # [$]
Price_unit  = ST / γ                              # [$/piece]
Price_total = Price_unit * QTY                    # [$]