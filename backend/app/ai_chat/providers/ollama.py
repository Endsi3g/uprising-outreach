"""Ollama streaming provider — uses Ollama's OpenAI-compatible API."""

from __future__ import annotations

import json
import logging
from typing import Any, AsyncGenerator

import httpx

from app.config import settings

logger = logging.getLogger(__name__)

_SYSTEM_PROMPT = """Tu es l'assistant IA intégré à ProspectOS, une plateforme d'outreach B2B.
Tu aides l'utilisateur à gérer ses leads, campagnes, inbox et pipeline de vente.
Réponds en français de manière concise et professionnelle."""


async def stream_ollama(
    model: str,  # e.g. "ollama/llama3" → strip prefix → "llama3"
    messages: list[dict[str, Any]],
    page_context: dict | None,
) -> AsyncGenerator[str, None]:
    """Stream an Ollama response as SSE event strings.

    Yields: 'data: {json}\\n\\n'
    Tool calls are not supported for Ollama in Sprint 1 (text-only streaming).
    """
    ollama_base = getattr(settings, "ollama_base_url", "http://localhost:11434")
    ollama_model = model.removeprefix("ollama/")

    system = _SYSTEM_PROMPT
    if page_context:
        page = page_context.get("page", "")
        if page:
            system += f"\n\nContexte: page '{page}'."

    payload = {
        "model": ollama_model,
        "stream": True,
        "messages": [{"role": "system", "content": system}, *messages],
    }

    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            async with client.stream(
                "POST",
                f"{ollama_base}/v1/chat/completions",
                json=payload,
                headers={"Content-Type": "application/json"},
            ) as response:
                if response.status_code != 200:
                    body = await response.aread()
                    yield _sse({"t": "error", "message": f"Ollama error {response.status_code}: {body.decode()[:200]}"})
                    return

                async for line in response.aiter_lines():
                    if not line.startswith("data: "):
                        continue
                    raw = line[6:]
                    if raw.strip() == "[DONE]":
                        break
                    try:
                        chunk = json.loads(raw)
                        delta = chunk["choices"][0]["delta"]
                        text = delta.get("content", "")
                        if text:
                            yield _sse({"t": "text", "v": text})
                    except (json.JSONDecodeError, KeyError, IndexError):
                        continue

    except httpx.ConnectError:
        yield _sse({
            "t": "error",
            "message": f"Impossible de contacter Ollama sur {ollama_base}. Assurez-vous qu'Ollama est démarré (`ollama serve`).",
        })
        return
    except Exception as exc:
        logger.error("Ollama stream error: %s", exc)
        yield _sse({"t": "error", "message": str(exc)})
        return

    yield _sse({"t": "done"})


def _sse(data: dict) -> str:
    return f"data: {json.dumps(data, ensure_ascii=False)}\n\n"
