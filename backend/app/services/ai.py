"""AI service - dev fallback classifier."""

from typing import Optional


# Department routing
DEPT_MAP = {"POTHOLE_ROAD_DAMAGE": ("ROADS", "Road Maintenance"), "BROKEN_STREETLIGHT": ("LIGHTING", "Street Lighting"), "GARBAGE_ACCUMULATION": ("WASTE", "Waste Management"), "WATER_LEAKAGE": ("WATER", "Water & Sanitation")}


async def classify_image(image_data: Optional[bytes] = None, description: Optional[str] = None, category_hint: Optional[str] = None) -> dict:
    """Dev fallback classifier - returns deterministic results."""
    categories = ["POTHOLE_ROAD_DAMAGE", "BROKEN_STREETLIGHT", "GARBAGE_ACCUMULATION", "WATER_LEAKAGE"]
    severities = {"POTHOLE_ROAD_DAMAGE": "HIGH", "BROKEN_STREETLIGHT": "MEDIUM", "GARBAGE_ACCUMULATION": "LOW", "WATER_LEAKAGE": "MEDIUM"}
    if category_hint and category_hint in categories:
        cat = category_hint
    elif description:
        desc_lower = description.lower()
        if any(w in desc_lower for w in ["pothole", "road", "crack", "hole"]): cat = "POTHOLE_ROAD_DAMAGE"
        elif any(w in desc_lower for w in ["light", "lamp", "streetlight", "dark"]): cat = "BROKEN_STREETLIGHT"
        elif any(w in desc_lower for w in ["garbage", "trash", "bin", "waste", "litter"]): cat = "GARBAGE_ACCUMULATION"
        elif any(w in desc_lower for w in ["water", "leak", "flood", "pipe"]): cat = "WATER_LEAKAGE"
        else: cat = categories[0]
    else:
        cat = categories[0]
    sev = severities.get(cat, "MEDIUM")
    conf = 0.87 if category_hint else 0.75
    dept_code, dept_name = DEPT_MAP.get(cat, ("ROADS", "Road Maintenance"))
    return {"category": cat, "confidence": conf, "severity_hint": sev, "description": f"Dev fallback: {cat}", "source": "dev_fallback", "department_code": dept_code, "department_name": dept_name}


async def compute_risk_score(category: str, severity: str, description: Optional[str] = None, is_duplicate: bool = False, duplicate_count: int = 0) -> dict:
    """Compute risk score using factor-based approach."""
    sev_base = {"LOW": 10, "MEDIUM": 20, "HIGH": 30, "CRITICAL": 40}
    base = sev_base.get(severity, 20)
    traffic = 15 if any(w in (description or "").lower() for w in ["road", "intersection", "highway", "crosswalk"]) else 5
    dup_score = min(int(15 * (1 + 0.1 * duplicate_count)), 25) if is_duplicate else 0
    exposure = 10
    factors = {"severity_base": base, "traffic_exposure": traffic, "duplicate_score": dup_score, "nearby_exposure": exposure, "environmental": 5}
    total = min(base + traffic + dup_score + exposure + 5, 100)
    if total >= 75: sev = "CRITICAL"
    elif total >= 50: sev = "HIGH"
    elif total >= 25: sev = "MEDIUM"
    else: sev = "LOW"
    dept_code, dept_name = DEPT_MAP.get(category, ("ROADS", "Road Maintenance"))
    return {"risk_score": total, "severity": sev, "factors": factors, "priority": "High" if total >= 50 else "Normal", "department_code": dept_code, "department_name": dept_name}


async def verify_repair(before_url: str, after_url: str) -> dict:
    """Verify repair using before/after comparison."""
    return {"verdict": "NEEDS_HUMAN_REVIEW", "confidence": 0.72, "reason": "Dev fallback - manual verification recommended", "source": "dev_fallback"}
