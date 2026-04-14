import os
import httpx
import logging
from typing import Optional, List, Dict

logger = logging.getLogger(__name__)

class NanoClawBridge:
    def __init__(self, api_url: str = "http://nanoclaw:3001"):
        self.api_url = api_url

    async def run_agent(self, prompt: str, group_id: str = "global") -> Dict:
        """
        Invokes a NanoClaw agent via the HTTP API.
        """
        try:
            logger.info(f"Triggering NanoClaw agent (API: {self.api_url}) for group {group_id}: {prompt}")
            
            async with httpx.AsyncClient(timeout=120.0) as client:
                response = await client.post(
                    f"{self.api_url}/run",
                    json={
                        "prompt": prompt,
                        "group_folder": group_id
                    }
                )
                response.raise_for_status()
                data = response.json()
                
                return {
                    "status": data.get("status", "success"),
                    "output": data.get("output", "L'agent n'a retourné aucun message."),
                    "error": data.get("error")
                }
        except Exception as e:
            logger.error(f"NanoClaw API Error: {e}")
            return {
                "status": "error", 
                "message": f"Désolé, je n'ai pas pu lancer l'agent autonome. Erreur: {str(e)}",
                "output": ""
            }

    def list_tasks(self) -> List[Dict]:
        """Lists scheduled tasks from NanoClaw (Mock for now)."""
        return [
            {"id": "task_1", "name": "Briefing Lundi", "schedule": "Monday 8am", "status": "active"}
        ]

# singleton
nanoclaw_bridge = NanoClawBridge(api_url="http://nanoclaw:3001")
