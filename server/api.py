"""
PDF extraction API
FastAPI server that accepts a PDF upload and returns structured order data.

Run:
    uvicorn api:app --reload --port 8000

POST /extract
    Body: multipart/form-data  { file: <pdf> }
    Returns: ExtractResponse JSON
"""

from __future__ import annotations

import json
import re
import tempfile
from pathlib import Path
from typing import Optional

import base64

import fitz  # PyMuPDF
import pdfplumber
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from server.llm import complete, complete_with_images  # your existing multi-provider client

# ── Pydantic models ───────────────────────────────────────────────────────────

class Piece(BaseModel):
    ref: Optional[str]
    qty: Optional[int]
    depth_in: Optional[float]       # A  (PROF / DEPTH)
    thickness_in: Optional[float]   # B  (HAUT / THICK)
    length_in: Optional[float]      # C  (LONG / LENGTH)
    material: Optional[str]
    finish: Optional[str]           # brule | poli_glace | poli_mat | jet_sable | thermal
    stone_family: Optional[str]     # granit | calcaire | marbre


class ExtractResponse(BaseModel):
    project: Optional[str]
    customer: Optional[str]
    pieces: list[Piece]
    raw_text: str                   # full extracted text, useful for debugging


# ── Prompt ────────────────────────────────────────────────────────────────────

EXTRACTION_PROMPT = """\
Tu es un assistant spécialisé en estimation de coûts pour la fabrication de pierre naturelle \
(granite, calcaire, marbre).

Voici le texte brut extrait d'une fiche de commande client.
Extrais les informations et réponds UNIQUEMENT avec un objet JSON valide — \
aucun markdown, aucune explication, aucun texte avant ou après.

Format attendu :
{{
  "project": "string or null",
  "customer": "string or null",
  "pieces": [
    {{
      "ref": "string or null",
      "qty": integer or null,
      "depth_in": float or null,       // A (PROF/DEPTH) in inches
      "thickness_in": float or null,   // B (HAUT/THICK) in inches
      "length_in": float or null,      // C (LONG/LENGTH) in inches
      "material": "string or null",
      "finish": "string or null",
      "stone_family": "granit|calcaire|marbre or null"
    }}
  ]
}}

Règles de conversion:
- Si les dimensions sont en mm, convertis en pouces (divise par 25.4).
- Les fractions dans le texte comme "23 1/4" = 23.25, "95 3/16" = 95.1875.
- Normalise le fini en: brule | thermal | poli_glace | poli_mat | jet_sable | meule | bouchard | eclate
  (THERMAL → brule, BRULÉ → brule, POLISHED → poli_glace, SAND BLAST → jet_sable, etc.)
- Normalise la famille de pierre: granit | calcaire | marbre
  (GRANITE → granit, LIMESTONE → calcaire, MARBLE → marbre, WOODBURY → granit, CRYSTAL GOLD → granit)
- Si une valeur est absente, utilise null.

Texte de la fiche:
{text}
"""


# ── PDF extraction helpers ────────────────────────────────────────────────────

def _fraction_to_float(text: str) -> str:
    """Convert vulgar fractions like '23 1/4' or '95 3/16' to decimals inline."""
    def replace(m: re.Match) -> str:
        whole = int(m.group(1) or 0)
        num   = int(m.group(2))
        den   = int(m.group(3))
        return str(round(whole + num / den, 6))

    # "23 1/4"  or just "1/4"
    return re.sub(r'(\d+)\s+(\d+)/(\d+)', replace, text)


def extract_text_from_pdf(path: str | Path) -> str:
    """Extract all text from a PDF, page by page, with pdfplumber."""
    pages: list[str] = []
    with pdfplumber.open(str(path)) as pdf:
        for page in pdf.pages:
            # Also extract tables as simple text so the LLM sees tabular data
            table_text = ""
            for table in page.extract_tables():
                for row in table:
                    table_text += "  |  ".join(str(c or "").strip() for c in row) + "\n"

            plain = page.extract_text() or ""
            pages.append(plain + ("\n" + table_text if table_text else ""))

    combined = "\n\n--- PAGE BREAK ---\n\n".join(pages)
    return _fraction_to_float(combined)


def pdf_to_images_b64(path: str | Path, dpi_scale: float = 2.0) -> list[str]:
    """Render each PDF page as a base64-encoded PNG (for vision LLM fallback)."""
    doc = fitz.open(str(path))
    mat = fitz.Matrix(dpi_scale, dpi_scale)
    images: list[str] = []
    for page in doc:
        pix = page.get_pixmap(matrix=mat)
        images.append(base64.b64encode(pix.tobytes("png")).decode())
    return images


def parse_llm_json(raw: str) -> dict:
    """Strip markdown fences, evaluate inline arithmetic (e.g. 31 / 12), then parse JSON."""
    clean = re.sub(r"```(?:json)?", "", raw).strip().rstrip("`").strip()
    # Replace bare arithmetic expressions like  31 / 12  or  3 * 4  with their float value.
    # Only matches patterns that appear as a JSON value (after : or ,).
    def eval_arith(m: re.Match) -> str:
        try:
            return str(round(eval(m.group(0)), 8))  # noqa: S307 — safe: only \d/+*-. matched
        except Exception:
            return m.group(0)
    clean = re.sub(r"\b\d+(?:\.\d+)?\s*[+\-*/]\s*\d+(?:\.\d+)?\b", eval_arith, clean)
    return json.loads(clean)


# ── App ───────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="Extraction API",
    description="Upload a stone order PDF → get structured piece data for the estimator.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # tighten in production
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/extract", response_model=ExtractResponse, summary="Extract order data from PDF")
async def extract(file: UploadFile = File(..., description="Client order PDF")):
    """
    Upload a PDF → returns project info + list of pieces with their
    A/B/C dimensions, material, finish, and stone family.

    The response `pieces` array maps directly to the estimator inputs:
      - `depth_in`     → A
      - `thickness_in` → B
      - `length_in`    → C
    """
    print("FILE-NAME:", file.filename)
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    # Write upload to a temp file so pdfplumber can open it
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
        tmp.write(await file.read())
        tmp_path = Path(tmp.name)

    try:
        raw_text = extract_text_from_pdf(tmp_path)
    except Exception as exc:
        tmp_path.unlink(missing_ok=True)
        raise HTTPException(status_code=422, detail=f"Could not read PDF: {exc}") from exc

    use_vision = not raw_text.strip()

    try:
        if use_vision:
            images_b64 = pdf_to_images_b64(tmp_path)
            llm_raw = complete_with_images(EXTRACTION_PROMPT.format(text="(see attached image)"), images_b64, max_tokens=2048)
        else:
            llm_raw = complete(EXTRACTION_PROMPT.format(text=raw_text), max_tokens=2048)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"LLM call failed: {exc}") from exc
    finally:
        tmp_path.unlink(missing_ok=True)

    try:
        data = parse_llm_json(llm_raw)
    except json.JSONDecodeError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"LLM returned non-JSON: {exc}\n\nRaw response:\n{llm_raw[:500]}",
        ) from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"LLM call failed: {exc}") from exc

    pieces = [Piece(**p) for p in data.get("pieces", [])]

    return ExtractResponse(
        project=data.get("project"),
        customer=data.get("customer"),
        pieces=pieces,
        raw_text=raw_text,
    )


@app.get("/health", summary="Health check")
def health():
    return {"status": "ok"}