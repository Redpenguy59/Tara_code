from core.database import query_visa_db
from core.mistral_service import get_expert_advice

def process_request(origin: str, dest: str, user_profile: dict):
    # 1. Anonymize
    safe_profile = {k: v for k, v in user_profile.items() if k != "name"}

    # 2. Database Check
    db_status = query_visa_db(origin[:2].upper(), dest[:2].upper())
    
    # 3. AI Analysis
    ai_details = get_expert_advice(origin, dest, safe_profile)
    
    # --- NEW LOGIC: Determine Status ---
    # If the AI identified missing fields, status is "INCOMPLETE"
    has_gaps = len(ai_details.get("awaiting_feedback", {})) > 0
    status = "INCOMPLETE" if has_gaps else "SUCCESS"
    
    return {
        "status": status,
        "summary": db_status,
        "expert_analysis": ai_details,
        "data_source": "Hybrid (DB + Mistral AI)"
    }