import asyncio
import uuid
from datetime import datetime, UTC, timedelta
from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.auth.models import User
from app.leads.models import Lead, LeadStatus, LeadTemperature

async def seed_leads():
    async with AsyncSessionLocal() as db:
        # Get the first user/workspace to assign leads
        result = await db.execute(select(User).limit(1))
        user = result.scalar_one_or_none()
        
        if not user:
            print("No user found in DB. Run the app and create an account first.")
            return

        workspace_id = user.workspace_id
        owner_id = user.id
        
        print(f"Seeding leads for Workspace: {workspace_id}")

        demo_leads = [
            {
                "status": LeadStatus.RAW,
                "temperature": LeadTemperature.HOT,
                "score": 85,
                "source": "LinkedIn",
                "notes": "Intéressé par la refonte de leur site vitrine.",
                "created_at": datetime.now(UTC)
            },
            {
                "status": LeadStatus.ENRICHED,
                "temperature": LeadTemperature.WARM,
                "score": 72,
                "source": "Google Maps",
                "notes": "PME à Laval avec un vieux site WordPress.",
                "created_at": datetime.now(UTC) - timedelta(hours=2)
            },
            {
                "status": LeadStatus.SCORED,
                "temperature": LeadTemperature.HOT,
                "score": 94,
                "source": "Direct",
                "notes": "Besoin urgent de SEO local.",
                "created_at": datetime.now(UTC) - timedelta(hours=5)
            },
            {
                "status": LeadStatus.REPLIED,
                "temperature": LeadTemperature.HOT,
                "score": 98,
                "source": "Hunter.io",
                "notes": "A répondu positivement au premier mail.",
                "created_at": datetime.now(UTC) - timedelta(days=1)
            }
        ]

        for ld in demo_leads:
            lead = Lead(
                id=uuid.uuid4(),
                workspace_id=workspace_id,
                owner_id=owner_id,
                **ld
            )
            db.add(lead)
        
        await db.commit()
        print(f"Successfully seeded {len(demo_leads)} demo leads.")

if __name__ == "__main__":
    asyncio.run(seed_leads())
