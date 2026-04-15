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
        system_prompt = "Génère un titre très court (3-5 mots) en français pour cette conversation basée sur le premier message. Renvoie uniquement le titre, sans ponctuation superflue."
        
        if not self.client:
            from app.ai.ollama_client import call_ollama
            res = await call_ollama(model="llama3.1", system=system_prompt, messages=[{"role": "user", "content": first_message}], temperature=0.7)
            return res["content"][0]["text"].strip().strip('"')
            
        try:
            response = await self.client.messages.create(
                model="claude-3-haiku-20240307",
                max_tokens=20,
                temperature=0.7,
                system=system_prompt,
                messages=[{"role": "user", "content": first_message}]
            )
            return response.content[0].text.strip().strip('"')
        except Exception as e:
            logger.error(f"Erreur génération titre NanoClaw (Claude): {e}. Fallback vers Ollama.")
            from app.ai.ollama_client import call_ollama
            res = await call_ollama(model="llama3.1", system=system_prompt, messages=[{"role": "user", "content": first_message}], temperature=0.7)
            return res["content"][0]["text"].strip().strip('"')

    async def process_secretary_request(self, user_input: str, workspace_id: any, db_session: any):
        """
        Analyse la demande, utilise des outils si nécessaire, et répond.
        """
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
                "description": "Lance la capture d'un profil LinkedIn via Playwright.",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "url": {"type": "string", "description": "URL LinkedIn du profil"}
                    },
                    "required": ["url"]
                }
            },
            {
                "name": "discover_prospects",
                "description": "Recherche des leads pertinents sur Google Maps via Apify (compass/crawler-google-places).",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "query": {"type": "string", "description": "La requête de recherche (ex: 'Agences marketing à Paris')"}
                    },
                    "required": ["query"]
                }
            }
        ]

        system_prompt = (
            "Tu es la secrétaire virtuelle de ProspectOS. Aide l'utilisateur à automatiser ses tâches de prospection en utilisant les outils fournis.\n\n"
            "LORSQUE TU RÉDIGES DES EMAILS (Cold Email Writing Principles) :\n"
            "- Adopte un ton 'peer-to-peer' (entre pairs, professionnel mais direct).\n"
            "- Fais des phrases extrêmement courtes et percutantes.\n"
            "- Commence toujours par parler de LEUR monde, LEURS enjeux (Lead with their world).\n"
            "- Termine par un seul appel à l'action clair et avec le moins de friction possible (1 low-friction CTA)."
        )

        try:
            # 1. First Pass: Call LLM (Claude or Ollama)
            if self.client:
                response = await self.client.messages.create(
                    model="claude-3-haiku-20240307",
                    max_tokens=1024,
                    system=system_prompt,
                    messages=[{"role": "user", "content": user_input}],
                    tools=tools
                )
                stop_reason = response.stop_reason
                assistant_content = response.content
            else:
                from app.ai.ollama_client import call_ollama
                res = await call_ollama(
                    model="llama3.1", # Modèle supportant le tool calling
                    system=system_prompt, 
                    messages=[{"role": "user", "content": user_input}], 
                    tools=tools
                )
                stop_reason = res["stop_reason"]
                assistant_content = res["content"]

            # 2. Handle Tool Use
            suggested_action = None
            if stop_reason == "tool_use":
                tool_use = next(block for block in assistant_content if block.get("type") == "tool_use")
                tool_name = tool_use.get("name")
                tool_input = tool_use.get("input")
                tool_result = "Action effectuée avec succès."

                if tool_name == "get_crm_stats":
                    stats = await get_lead_stats(db_session, workspace_id)
                    tool_result = json.dumps({
                        "total": stats["total_leads"],
                        "qualifies": stats["qualified_leads"],
                        "reponses": stats["replied_leads"]
                    })
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
                elif tool_name == "discover_prospects":
                    apify_token = getattr(settings, 'apify_token', None)
                    if apify_token:
                        tool_result = f"Recherche de prospects lancée sur Apify pour la requête : '{tool_input.get('query')}'. Les leads seront bientôt disponibles."
                    else:
                        tool_result = "Action impossible : APIFY_TOKEN non configuré."
                    suggested_action = "/leads"

                # 3. Final Response with Tool Output
                if self.client:
                    final_response = await self.client.messages.create(
                        model="claude-3-haiku-20240307",
                        max_tokens=1024,
                        system=system_prompt,
                        messages=[
                            {"role": "user", "content": user_input},
                            {"role": "assistant", "content": assistant_content},
                            {
                                "role": "user",
                                "content": [
                                    {
                                        "type": "tool_result",
                                        "tool_use_id": tool_use.get("id"),
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
                else:
                    from app.ai.ollama_client import call_ollama
                    res = await call_ollama(
                        model="llama3.1",
                        system=system_prompt,
                        messages=[
                            {"role": "user", "content": user_input},
                            {"role": "assistant", "content": assistant_content},
                            {"role": "user", "content": [{"type": "tool_result", "content": tool_result}]}
                        ],
                        tools=tools
                    )
                    return {
                        "suggested_action": suggested_action, 
                        "response_prefix": res["content"][0]["text"]
                    }

            return {
                "suggested_action": None, 
                "response_prefix": assistant_content[0].get("text")
            }

        except Exception as e:
            logger.error(f"Erreur NanoClaw Agency: {e}")
            return {"suggested_action": None, "response_prefix": "Désolé, une erreur est survenue lors de l'exécution de cette tâche."}
