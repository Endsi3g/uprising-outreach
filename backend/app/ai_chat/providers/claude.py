"""Anthropic Claude streaming provider with tool_use support."""

from __future__ import annotations

import json
import logging
import uuid
from typing import Any, AsyncGenerator

import anthropic

from app.config import settings

logger = logging.getLogger(__name__)

_SYSTEM_PROMPT = """Tu es l'assistant IA intégré à ProspectOS, une plateforme d'outreach B2B.
Tu aides l'utilisateur à gérer ses leads, campagnes, inbox et pipeline de vente.
Tu as accès à des outils pour rechercher des leads, obtenir des statistiques, scorer et enrichir des contacts.
Réponds en français de manière concise et professionnelle.
Quand tu utilises un outil, explique brièvement ce que tu fais avant de l'exécuter."""


async def stream_claude(
    model: str,
    messages: list[dict[str, Any]],
    tool_definitions: list[dict] | None,
    page_context: dict | None,
    tool_executor: Any,  # callable (name, input) -> dict
) -> AsyncGenerator[str, None]:
    """Stream a Claude response as SSE event strings.

    Yields strings of the form: 'data: {json}\\n\\n'
    Handles the agentic tool-use loop internally.
    """
    if not settings.anthropic_api_key:
        yield _sse({"t": "error", "message": "Clé API Anthropic manquante. Configurez ANTHROPIC_API_KEY."})
        return

    client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)

    system = _SYSTEM_PROMPT
    if page_context:
        page = page_context.get("page", "")
        selected = page_context.get("selected_lead_ids", [])
        if page:
            system += f"\n\nContexte actuel: page '{page}'."
        if selected:
            system += f" {len(selected)} lead(s) sélectionné(s): {', '.join(selected[:5])}."

    current_messages = list(messages)
    tools = tool_definitions or []

    # Agentic loop — keep going until end_turn with no tool calls
    for _ in range(6):  # max 6 iterations (3 tool rounds)
        kwargs: dict[str, Any] = {
            "model": model,
            "max_tokens": 2048,
            "system": system,
            "messages": current_messages,
        }
        if tools:
            kwargs["tools"] = tools

        try:
            # Collect the full response (streaming text deltas, handling tool_use)
            full_text = ""
            tool_uses: list[dict] = []

            async with client.messages.stream(**kwargs) as stream:
                async for event in stream:
                    etype = getattr(event, "type", None)

                    if etype == "content_block_delta":
                        delta = event.delta
                        if getattr(delta, "type", None) == "text_delta":
                            chunk = delta.text
                            full_text += chunk
                            yield _sse({"t": "text", "v": chunk})

                    elif etype == "content_block_start":
                        block = event.content_block
                        if getattr(block, "type", None) == "tool_use":
                            tool_uses.append({
                                "id": block.id,
                                "name": block.name,
                                "input": {},
                            })

                    elif etype == "content_block_stop":
                        pass  # tool input is accumulated via input_json_delta

                    # Accumulate tool input JSON
                    if etype == "content_block_delta":
                        delta = event.delta
                        if getattr(delta, "type", None) == "input_json_delta" and tool_uses:
                            # Accumulate into the last tool use
                            tool_uses[-1].setdefault("_raw", "")
                            tool_uses[-1]["_raw"] += delta.partial_json

                # Finalize tool inputs
                for tu in tool_uses:
                    raw = tu.pop("_raw", "{}")
                    try:
                        tu["input"] = json.loads(raw)
                    except json.JSONDecodeError:
                        tu["input"] = {}

            # If no tool calls, we're done
            if not tool_uses:
                break

            # Emit tool_use events and execute tools
            tool_results = []
            for tu in tool_uses:
                yield _sse({
                    "t": "tool_use",
                    "name": tu["name"],
                    "call_id": tu["id"],
                    "input": tu["input"],
                })

                result = await tool_executor(tu["name"], tu["input"])

                yield _sse({
                    "t": "tool_result",
                    "call_id": tu["id"],
                    "name": tu["name"],
                    "output": result,
                })

                tool_results.append({
                    "type": "tool_result",
                    "tool_use_id": tu["id"],
                    "content": json.dumps(result),
                })

            # Append assistant turn + tool results to message history
            assistant_content: list[dict] = []
            if full_text:
                assistant_content.append({"type": "text", "text": full_text})
            for tu in tool_uses:
                assistant_content.append({
                    "type": "tool_use",
                    "id": tu["id"],
                    "name": tu["name"],
                    "input": tu["input"],
                })

            current_messages.append({"role": "assistant", "content": assistant_content})
            current_messages.append({"role": "user", "content": tool_results})

        except anthropic.APIError as exc:
            logger.error("Anthropic API error: %s", exc)
            yield _sse({"t": "error", "message": f"Erreur API: {exc}"})
            return

    yield _sse({"t": "done"})


def _sse(data: dict) -> str:
    return f"data: {json.dumps(data, ensure_ascii=False)}\n\n"
