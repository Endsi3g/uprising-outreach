import json
import logging
import anthropic
from typing import Optional, TypedDict
from app.config import settings

logger = logging.getLogger(__name__)

class ScoringResult(TypedDict):
    score: int
    justification: str
    temperature: str

SCORING_PROMPT = """
You are an expert sales development representative (SDR) and ICP (Ideal Customer Profile) analyst.
Your task is to score a business lead based on their metadata and determine how likely they are to be a good fit for a premium outreach agency.

The outreach agency specializes in:
- AI-driven lead generation
- Personalized cold email sequences
- B2B SaaS and high-ticket service industries

Lead Data:
{lead_json}

Instructions:
1. Analyze the lead's title, company (if provided), and any available source/notes.
2. Provide a score from 0 to 100 (where 100 is a perfect match).
3. Provide a brief (1-sentence) justification.
4. Categorize as 'cold', 'warm', or 'hot'.

You MUST return ONLY a valid JSON object with the following keys:
{
  "score": number,
  "justification": "string",
  "temperature": "cold" | "warm" | "hot"
}
"""

async def score_lead_with_ai(lead_data: dict) -> Optional[ScoringResult]:
    """
    Uses ProspectOS AI to score a lead based on ICP criteria.
    If no API key is present, returns a fallback mock score.
    """
    if not settings.anthropic_api_key:
        logger.warning("ANTHROPIC_API_KEY not set. Returning mock scoring result.")
        # Mock logic for local ecosystem testing
        score = 45 + (len(str(lead_data.get("email"))) % 50)
        temp = "hot" if score > 80 else "warm" if score > 50 else "cold"
        return {
            "score": score,
            "justification": "Simulation: Lead has been scored based on profile match probability.",
            "temperature": temp
        }

    client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)
    
    try:
        response = await client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=256,
            temperature=0,
            messages=[
                {"role": "user", "content": SCORING_PROMPT.format(lead_json=json.dumps(lead_data, indent=2))}
            ]
        )
        
        # The AI returns content as a list of content blocks
        text = response.content[0].text
        # Naive JSON extraction
        start = text.find("{")
        end = text.rfind("}") + 1
        if start != -1 and end != -1:
            return json.loads(text[start:end])
        
        logger.error(f"Failed to parse AI scoring response: {text}")
        return None
        
    except Exception as e:
        logger.error(f"Error calling AI API for lead scoring: {str(e)}")
        return None
