import logging
from typing import Optional
import anthropic
from app.config import settings

logger = logging.getLogger(__name__)

class NanoClawAssistant:
    """
    Assistant 'Secrétaire' basé sur NanoClaw concept.
    Gère l'orchestration des tâches et la génération de titres automatiques.
    """
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.anthropic_api_key
        self.client = anthropic.AsyncAnthropic(api_key=self.api_key) if self.api_key else None

    async def generate_chat_title(self, first_message: str) -> str:
        """
        Génère un titre court et percutant pour une nouvelle conversation.
        """
        if not self.client:
            return "Nouvelle Conversation"
            
        try:
            response = await self.client.messages.create(
                model="claude-3-haiku-20240307",
                max_tokens=20,
                temperature=0.7,
                system="Génère un titre très court (3-5 mots) en français pour cette conversation basée sur le premier message. Renvoie uniquement le titre, sans ponctuation superflue.",
                messages=[{"role": "user", "content": first_message}]
            )
            return response.content[0].text.strip().strip('"')
        except Exception as e:
            logger.error(f"Erreur génération titre NanoClaw: {e}")
            return "Prospection Idée"

    async def process_secretary_request(self, user_input: str):
        """
        Analyse la demande pour décider si une action spécifique est nécessaire 
        (ex: créer un projet, pinner un lead).
        """
        # Logique NanoClaw à étendre selon les besoins d'agenticité
        return {"suggested_action": None, "response_prefix": "En tant que votre secrétaire Uprising..."}
