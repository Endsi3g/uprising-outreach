import logging
from typing import Optional
import anthropic
from app.config import settings

logger = logging.getLogger(__name__)

import json
from app.leads.service import get_lead_stats

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

    async def process_secretary_request(self, user_input: str, workspace_id: any, db_session: any):
        """
        Analyse la demande, utilise des outils si nécessaire, et répond.
        """
        if not self.client:
            return {"suggested_action": None, "response_prefix": "Erreur: Configuration Anthropic manquante."}

        from app.projects.service import create_project
        from app.projects.schemas import ProjectCreate
        from app.leads.service import get_lead_stats, create_email_draft, trigger_linkedin_enrichment

        tools = [
            {
                "name": "get_crm_stats",
                "description": "Récupère les statistiques actuelles des leads pour le workspace.",
                "input_schema": {"type": "object", "properties": {}}
            },
            {
                "name": "create_crm_project",
                "description": "Crée un nouveau projet dans le CRM ProspectOS.",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "name": {"type": "string", "description": "Nom du projet"},
                        "description": {"type": "string", "description": "Description optionnelle"}
                    },
                    "required": ["name"]
                }
            },
            {
                "name": "draft_prospect_email",
                "description": "Prépare un brouillon d'email personnalisé pour un prospect.",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "lead_id": {"type": "string", "description": "ID du lead concerné (optionnel)"},
                        "subject": {"type": "string", "description": "Objet de l'email"},
                        "content": {"type": "string", "description": "Contenu de l'email"}
                    },
                    "required": ["subject", "content"]
                }
            },
            {
                "name": "capture_linkedin_lead",
                "description": "Lanche la capture d'un profil LinkedIn via Playwright.",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "url": {"type": "string", "description": "URL LinkedIn du profil"}
                    },
                    "required": ["url"]
                }
            }
        ]

        try:
            # 1. Initial call
            response = await self.client.messages.create(
                model="claude-3-haiku-20240307",
                max_tokens=1024,
                system="Tu es la secrétaire virtuelle de ProspectOS. Aide l'utilisateur à automatiser ses tâches de prospection en utilisant les outils outils fournis.",
                messages=[{"role": "user", "content": user_input}],
                tools=tools
            )

            if response.stop_reason == "tool_use":
                tool_use = next(block for block in response.content if block.type == "tool_use")
                tool_name = tool_use.name
                tool_input = tool_use.input
                tool_result = "Action effectuée avec succès."

                if tool_name == "get_crm_stats":
                    stats = await get_lead_stats(db_session, workspace_id)
                    tool_result = json.dumps({
                        "total": stats["total_leads"],
                        "qualifies": stats["qualified_leads"],
                        "reponses": stats["replied_leads"]
                    })
                    suggested_action = None
                elif tool_name == "create_crm_project":
                    await create_project(db_session, workspace_id, ProjectCreate(**tool_input))
                    tool_result = f"Projet '{tool_input.get('name')}' créé dans ProspectOS."
                    suggested_action = "/projects"
                elif tool_name == "draft_prospect_email":
                    await create_email_draft(db_session, workspace_id, tool_input.get("lead_id"), tool_input.get("subject"), tool_input.get("content"))
                    tool_result = "Brouillon d'email enregistré."
                    suggested_action = "/leads"
                elif tool_name == "capture_linkedin_lead":
                    await trigger_linkedin_enrichment(workspace_id, tool_input.get("url"))
                    tool_result = "Capture LinkedIn lancée via Playwright."
                    suggested_action = "/leads"

                # Final response with tool results
                final_response = await self.client.messages.create(
                    model="claude-3-haiku-20240307",
                    max_tokens=1024,
                    system="Tu es la secrétaire virtuelle de ProspectOS.",
                    messages=[
                        {"role": "user", "content": user_input},
                        {"role": "assistant", "content": response.content},
                        {
                            "role": "user",
                            "content": [
                                {
                                    "type": "tool_result",
                                    "tool_use_id": tool_use.id,
                                    "content": tool_result
                                }
                            ]
                        }
                    ],
                    tools=tools
                )
                return {
                    "suggested_action": suggested_action, 
                    "response_prefix": final_response.content[0].text
                }

            return {
                "suggested_action": None, 
                "response_prefix": response.content[0].text
            }

        except Exception as e:
            logger.error(f"Erreur NanoClaw Agency: {e}")
            return {"suggested_action": None, "response_prefix": "Désolé, une erreur est survenue lors de l'exécution de cette tâche."}
