import httpx
import logging
from typing import Optional, List, Dict, Any

logger = logging.getLogger(__name__)

OLLAMA_URL = "http://localhost:11434/api/chat"

async def call_ollama(
    model: str,
    system: str,
    messages: List[Dict[str, Any]],
    tools: Optional[List[Dict[str, Any]]] = None,
    temperature: float = 0.7
) -> Dict[str, Any]:
    """
    Appelle l'API Ollama locale pour générer une réponse ou utiliser un outil.
    """
    try:
        ollama_messages = []
        if system:
            ollama_messages.append({"role": "system", "content": system})
        
        # Convertir les messages
        for msg in messages:
            # Gérer le tool_result dans l'historique
            if isinstance(msg.get("content"), list):
                # Anthropic tool result format
                text_parts = []
                for part in msg["content"]:
                    if part.get("type") == "tool_result":
                        text_parts.append(f"Result for tool: {part.get('content')}")
                if text_parts:
                    ollama_messages.append({"role": "user", "content": "\n".join(text_parts)})
            else:
                ollama_messages.append({"role": msg["role"], "content": msg["content"]})
        
        payload = {
            "model": model,
            "messages": ollama_messages,
            "stream": False,
            "options": {
                "temperature": temperature
            }
        }

        if tools:
            ollama_tools = []
            for t in tools:
                # Convertir le schéma Anthropic vers OpenAI/Ollama (JSON Schema)
                ollama_tools.append({
                    "type": "function",
                    "function": {
                        "name": t["name"],
                        "description": t["description"],
                        "parameters": t["input_schema"]
                    }
                })
            payload["tools"] = ollama_tools

        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(OLLAMA_URL, json=payload)
            response.raise_for_status()
            data = response.json()

            msg = data.get("message", {})
            content = msg.get("content", "")
            
            tool_calls = msg.get("tool_calls")
            
            if tool_calls:
                # Mock Anthropic tool use return structure
                tool_call = tool_calls[0]
                func = tool_call.get("function", {})
                return {
                    "stop_reason": "tool_use",
                    "content": [
                        {
                            "type": "tool_use",
                            "id": "call_ollama",
                            "name": func.get("name"),
                            "input": func.get("arguments", {})
                        }
                    ]
                }
            
            return {
                "stop_reason": "end_turn",
                "content": [{"type": "text", "text": content}]
            }

    except Exception as e:
        logger.error(f"Erreur appel Ollama: {e}")
        return {"stop_reason": "error", "content": [{"type": "text", "text": f"Erreur locale Ollama: {str(e)}"}]}
