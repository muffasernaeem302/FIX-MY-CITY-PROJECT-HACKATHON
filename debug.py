# Test each step of incident creation
import urllib.request, json

# Test AI service
from app.services.ai import classify_image, compute_risk_score
import asyncio

async def test():
    r1 = await classify_image(description="Dangerous pothole", category_hint="POTHOLE_ROAD_DAMAGE")
    print("AI classify:", r1)
    r2 = await compute_risk_score("POTHOLE_ROAD_DAMAGE", "HIGH", "Dangerous pothole")
    print("Risk score:", r2)

asyncio.run(test())
