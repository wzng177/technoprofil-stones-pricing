"""
Multi-provider LLM client.

Configuration via environment variables:
  LLM_PROVIDER  — "openai" (default) | "gemini" | "anthropic"
  LLM_MODEL     — model name for the chosen provider

  Default models per provider:
    openai:    gpt-4o-mini
    gemini:    gemini-1.5-flash
    anthropic: claude-opus-4-5
"""

import os
from dotenv import load_dotenv

load_dotenv()

_DEFAULTS = {
    "openai":    "gpt-4o-mini",
    "gemini":    "gemini-1.5-flash",
    "anthropic": "claude-opus-4-5",
}

PROVIDER = os.getenv("LLM_PROVIDER", "openai").lower()
MODEL    = os.getenv("LLM_MODEL", _DEFAULTS.get(PROVIDER, "gpt-4o-mini"))


def complete(prompt: str, max_tokens: int = 1024) -> str:
    """Send a prompt to the configured LLM provider and return the text response."""
    if PROVIDER == "openai":
        return _openai(prompt, max_tokens)
    if PROVIDER == "gemini":
        return _gemini(prompt, max_tokens)
    if PROVIDER == "anthropic":
        return _anthropic(prompt, max_tokens)
    raise ValueError(f"Unknown LLM_PROVIDER: '{PROVIDER}'. Choose openai, gemini, or anthropic.")


# ── Provider implementations ──────────────────────────────────────────────────

def _openai(prompt: str, max_tokens: int) -> str:
    from openai import OpenAI
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=max_tokens,
    )
    return response.choices[0].message.content.strip()


def _gemini(prompt: str, max_tokens: int) -> str:
    import google.generativeai as genai
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    model = genai.GenerativeModel(
        MODEL,
        generation_config={"max_output_tokens": max_tokens},
    )
    response = model.generate_content(prompt)
    return response.text.strip()


def _anthropic(prompt: str, max_tokens: int) -> str:
    import anthropic
    client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
    response = client.messages.create(
        model=MODEL,
        max_tokens=max_tokens,
        messages=[{"role": "user", "content": prompt}],
    )
    return response.content[0].text.strip()
