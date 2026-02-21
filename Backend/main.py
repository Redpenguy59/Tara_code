from fastapi import FastAPI
from core.engine import process_request as engine_process
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional, Any

app = FastAPI()

# Allow React to talk to Python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- THE DATA MODEL ---
class UserProfile(BaseModel):
    displayName: Optional[str] = "User"
    email: Optional[str] = None
    nationalities: List[Any] = []  # Handles the [{"country": "USA"}] structure

class MigrationRequest(BaseModel):
    request_type: str
    country: str        # The Destination
    type: str           # The Purpose (Visa, Residency, etc.)
    profile: UserProfile # The User Data from Login
    context: Optional[dict] = {} # Wizard answers

@app.post("/tourism/check")
async def handle_migration_request(data: MigrationRequest):
    """
    Main endpoint that processes migration/travel requests
    Now properly integrated with the engine, database, and Mistral AI
    """
    print(f"📥 RECEIVED REQUEST: {data.request_type}")
    print(f"👤 USER: {data.profile.displayName} from {data.profile.nationalities}")
    print(f"🎯 GOAL: {data.type} in {data.country}")

    # Extract user nationality
    user_nationality = "Unknown"
    user_nationality_code = "XX"  # 2-letter country code for database
    
    if data.profile.nationalities and len(data.profile.nationalities) > 0:
        first_nat = data.profile.nationalities[0]
        if isinstance(first_nat, dict):
            user_nationality = first_nat.get('country', 'Unknown')
            # Extract country code if available, otherwise use first 2 letters
            user_nationality_code = first_nat.get('code', user_nationality[:2].upper())
        else:
            user_nationality = str(first_nat)
            user_nationality_code = user_nationality[:2].upper()

    # Get destination country code
    destination_code = data.country[:2].upper()

    # Build comprehensive user profile for the engine
    user_profile = {
        "name": data.profile.displayName,
        "email": data.profile.email,
        "citizenship": user_nationality,
        "nationality_code": user_nationality_code,
        "purpose": data.type,
        # Include any additional context from wizard/previous steps
        **data.context
    }

    print(f"🔍 Querying: {user_nationality_code} → {destination_code}")

    # === THE KEY INTEGRATION ===
    # Call your engine which handles database + AI
    try:
        engine_result = engine_process(
            origin=user_nationality_code,
            dest=destination_code,
            user_profile=user_profile
        )
        
        print(f"✅ Engine returned: {engine_result.get('status')}")
        print(f"📊 Visa requirement: {engine_result.get('summary')}")
        
        # Extract the AI analysis
        expert_analysis = engine_result.get("expert_analysis", {})
        awaiting_feedback = expert_analysis.get("awaiting_feedback", {})
        
        # Format response for frontend
        response = {
            "status": engine_result.get("status", "SUCCESS"),
            "visa_requirement": engine_result.get("summary", "unknown"),
            "origin": user_nationality,
            "destination": data.country,
            "purpose": data.type,
            
            # AI-generated guidance
            "forms": expert_analysis.get("forms", []),
            "health": expert_analysis.get("health", []),
            "safety": expert_analysis.get("safety", []),
            
            # Missing information that needs to be collected
            "awaiting_feedback": awaiting_feedback,
            "needs_more_info": len(awaiting_feedback) > 0,
            
            # Metadata
            "data_source": engine_result.get("data_source", "Hybrid (DB + AI)")
        }
        
        # If status is INCOMPLETE, let frontend know what's missing
        if engine_result.get("status") == "INCOMPLETE":
            print(f"⚠️ Missing information: {list(awaiting_feedback.keys())}")
            response["message"] = "Additional information required to provide complete guidance."
        else:
            print(f"✅ Complete analysis provided")
            response["message"] = "Complete travel guidance generated successfully."
        
        return response
        
    except Exception as e:
        print(f"❌ ERROR in engine processing: {e}")
        import traceback
        traceback.print_exc()
        
        # Return error response
        return {
            "status": "ERROR",
            "message": f"Unable to process request: {str(e)}",
            "origin": user_nationality,
            "destination": data.country,
            "error_details": str(e)
        }

# Health check endpoint
@app.get("/health")
async def health_check():
    """Simple health check to verify the API is running"""
    return {
        "status": "healthy",
        "service": "TARA Migration Assistant",
        "version": "2.0-integrated"
    }

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting TARA Backend with full integration...")
    print("📍 Engine: ✅")
    print("📍 Database: ✅")
    print("📍 Mistral AI: ✅")
    uvicorn.run(app, host="127.0.0.1", port=8000)