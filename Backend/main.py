from fastapi import FastAPI
from core.engine import process_request as engine_process
from core.user_profile import (
    get_user_profile, 
    save_user_profile, 
    update_user_field,
    save_conversation
)
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional, Any
import json

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
    user_id: Optional[str] = None  # CRITICAL: Unique identifier for the user
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
    Now with user profile persistence - asks for info once, stores it, never asks again
    """
    
    def _generate_required_documents(visa_status, destination, purpose, origin):
        """Generate list of required documents based on visa requirements"""
        docs = []
        
        # Base documents for all travelers
        docs.append(f"Valid Passport (from {origin})")
        
        if visa_status and "visa required" in visa_status.lower():
            docs.extend([
                f"Visa Application Form for {destination}",
                "Passport-sized Photos (2)",
                "Proof of Accommodation (Hotel booking or invitation letter)",
                "Proof of Financial Means (Bank statements)",
                "Travel Itinerary",
                "Travel Insurance"
            ])
            
            if "work" in purpose.lower():
                docs.extend([
                    "Job Offer Letter",
                    "Employer Sponsorship Documents",
                    "Professional Qualifications/Certificates"
                ])
            elif "student" in purpose.lower() or "study" in purpose.lower():
                docs.extend([
                    "University Acceptance Letter",
                    "Proof of Tuition Payment",
                    "Academic Transcripts"
                ])
                
        elif visa_status and ("e-visa" in visa_status.lower() or "evisa" in visa_status.lower()):
            docs.extend([
                f"e-Visa Application for {destination}",
                "Digital Passport Photo",
                "Proof of Accommodation",
                "Return Flight Ticket"
            ])
        elif visa_status and "free" in visa_status.lower():
            docs.extend([
                "Return Flight Ticket",
                "Proof of Accommodation (recommended)",
                "Travel Insurance (recommended)"
            ])
            
        return docs
    
    def _generate_procedural_steps(visa_status, destination, purpose, ai_analysis):
        """Generate step-by-step procedural logic based on visa requirements
        
        CRITICAL: Returns steps in format expected by ApplicationDetail.tsx:
        {
          "id": "1",
          "title": "Short title",
          "description": "Detailed description",
          "isCompleted": False
        }
        NOT: {"id": "1", "text": "...", "isCompleted": False}
        """
        steps = []
        step_id = 1
        
        if visa_status and "free" in visa_status.lower():
            # Visa-free travel
            steps = [
                {
                    "id": str(step_id), 
                    "title": "Verify Passport Validity",
                    "description": f"Ensure your passport is valid for at least 6 months beyond your planned stay in {destination}",
                    "isCompleted": False
                },
                {"id": str(step_id + 1), "title": "Book Accommodation", "description": "Reserve flights and accommodation with confirmation emails", "isCompleted": False},
                {"id": str(step_id + 2), "title": "Arrange Travel Insurance", "description": "Purchase comprehensive travel insurance", "isCompleted": False},
                {"id": str(step_id + 3), "title": "Check Entry Requirements", "description": f"Review current entry requirements for {destination}", "isCompleted": False},
                {"id": str(step_id + 4), "title": "Prepare for Arrival", "description": f"Pack documents and prepare for arrival in {destination}", "isCompleted": False}
            ]
        elif visa_status and "e-visa" in visa_status.lower():
            # e-Visa process
            steps = [
                {"id": str(step_id), "text": f"Visit {destination} e-Visa portal", "isCompleted": False},
                {"id": str(step_id + 1), "text": "Complete online application form", "isCompleted": False},
                {"id": str(step_id + 2), "text": "Upload required documents (passport scan, photo)", "isCompleted": False},
                {"id": str(step_id + 3), "text": "Pay visa processing fee", "isCompleted": False},
                {"id": str(step_id + 4), "text": "Wait for e-Visa approval (typically 3-5 business days)", "isCompleted": False},
                {"id": str(step_id + 5), "text": "Download and print e-Visa", "isCompleted": False},
                {"id": str(step_id + 6), "text": "Present e-Visa upon arrival", "isCompleted": False}
            ]
        elif visa_status and "visa required" in visa_status.lower():
            # Full visa application process
            steps = [
                {"id": str(step_id), "text": f"Locate nearest {destination} embassy/consulate", "isCompleted": False},
                {"id": str(step_id + 1), "text": "Schedule visa appointment", "isCompleted": False},
                {"id": str(step_id + 2), "text": "Gather all required documents", "isCompleted": False},
                {"id": str(step_id + 3), "text": "Complete visa application form", "isCompleted": False},
                {"id": str(step_id + 4), "text": "Pay visa application fee", "isCompleted": False},
                {"id": str(step_id + 5), "text": "Attend visa interview (if required)", "isCompleted": False},
                {"id": str(step_id + 6), "text": "Submit biometric data (fingerprints, photo)", "isCompleted": False},
                {"id": str(step_id + 7), "text": "Wait for visa processing (typically 2-4 weeks)", "isCompleted": False},
                {"id": str(step_id + 8), "text": "Collect passport with visa", "isCompleted": False}
            ]
            
            # Add specific steps based on purpose
            if "work" in purpose.lower():
                steps.insert(2, {"id": f"{step_id}a", "text": "Obtain work permit/employment authorization", "isCompleted": False})
            elif "student" in purpose.lower():
                steps.insert(2, {"id": f"{step_id}a", "text": "Obtain student visa approval from institution", "isCompleted": False})
else:
            # Unknown status - generic steps
            steps = [
                {"id": str(step_id), "title": "Research Requirements", "description": f"Research specific visa requirements for {destination}", "isCompleted": False},
                {"id": str(step_id + 1), "title": "Contact Embassy", "description": "Contact embassy for clarification on requirements", "isCompleted": False},
                {"id": str(step_id + 2), "title": "Prepare Documentation", "description": "Gather and prepare all necessary documentation", "isCompleted": False}
            ]
        
        return steps
    
    print(f"📥 RECEIVED REQUEST: {data.request_type}")
    print(f"👤 USER: {data.profile.displayName} from {data.profile.nationalities}")
    print(f"🎯 GOAL: {data.type} in {data.country}")

    user_id = data.profile.user_id or data.profile.email  # Use email as fallback ID
    
    # === STEP 1: Check if user profile exists in database ===
    stored_profile = None
    if user_id:
        stored_profile = get_user_profile(user_id)
        if stored_profile:
            print(f"✅ Found existing profile for user: {user_id}")
        else:
            print(f"📝 New user - will create profile: {user_id}")

    # === STEP 2: Determine user's citizenship ===
    user_nationality = None
    user_nationality_code = None
    
    # Priority 1: Check database for stored citizenship
    if stored_profile and stored_profile.get('citizenship_code'):
        user_nationality = stored_profile['citizenship']
        user_nationality_code = stored_profile['citizenship_code']
        print(f"📋 Using stored citizenship: {user_nationality} ({user_nationality_code})")
    
    # Priority 2: Check if provided in current request
    elif data.profile.nationalities and len(data.profile.nationalities) > 0:
        first_nat = data.profile.nationalities[0]
        if isinstance(first_nat, dict):
            user_nationality = first_nat.get('country', 'Unknown')
            user_nationality_code = first_nat.get('code', user_nationality[:2].upper())
        else:
            user_nationality = str(first_nat)
            user_nationality_code = user_nationality[:2].upper()
        
        print(f"📝 New citizenship provided: {user_nationality} ({user_nationality_code})")
        
        # Save this citizenship to the database for future use
        if user_id:
            if stored_profile:
                # Update existing profile
                update_user_field(user_id, 'citizenship', user_nationality)
                update_user_field(user_id, 'citizenship_code', user_nationality_code)
                print(f"💾 Updated citizenship in database")
            else:
                # Create new profile
                save_user_profile(user_id, {
                    'email': data.profile.email,
                    'display_name': data.profile.displayName,
                    'citizenship': user_nationality,
                    'citizenship_code': user_nationality_code
                })
                print(f"💾 Created new user profile in database")

    # === STEP 3: If still no citizenship, ask for it ===
    if not user_nationality_code or user_nationality_code == "UN":
        print("⚠️ MISSING CITIZENSHIP - Requesting from user")
        return {
            "status": "INCOMPLETE",
            "message": "Please provide your citizenship/nationality to proceed",
            "awaiting_feedback": {
                "citizenship": "We need to know your country of citizenship to determine visa requirements. This will be saved to your profile and you won't be asked again."
            },
            "needs_more_info": True,
            "missing_field": "citizenship",
            "stored_profile_exists": stored_profile is not None
        }

    # === STEP 4: Process the request with complete data ===
    destination_code = data.country[:2].upper()

    # Build comprehensive user profile for the engine
    user_profile = {
        "name": data.profile.displayName,
        "email": data.profile.email,
        "citizenship": user_nationality,
        "nationality_code": user_nationality_code,
        "purpose": data.type,
        # Include any stored profile data
        **(stored_profile or {}),
        # Include any additional context from wizard/previous steps
        **data.context
    }

    print(f"🔍 Querying: {user_nationality_code} → {destination_code}")

    # === STEP 5: Call the engine (database + AI) ===
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
        
        # Save this conversation to history
        if user_id:
            save_conversation(user_id, {
                'request_type': data.request_type,
                'origin': user_nationality_code,
                'destination': destination_code,
                'purpose': data.type,
                'status': engine_result.get('status'),
                'ai_response': json.dumps(expert_analysis)
            })
        
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
            
            # *** ADD THESE: Documents and Steps ***
            "documents": _generate_required_documents(
                engine_result.get("summary"),
                data.country,
                data.type,
                user_nationality
            ),
            "steps": _generate_procedural_steps(
                engine_result.get("summary"),
                data.country,
                data.type,
                expert_analysis
            ),
            
            # User profile info
            "user_has_stored_profile": stored_profile is not None,
            "citizenship_was_stored": stored_profile and stored_profile.get('citizenship_code') is not None,
            
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
        "version": "2.0-integrated-with-profiles"
    }

# Get user profile
@app.get("/profile/{user_id}")
async def get_profile(user_id: str):
    """Retrieve a user's stored profile"""
    profile = get_user_profile(user_id)
    if profile:
        return {
            "status": "success",
            "profile": profile
        }
    else:
        return {
            "status": "not_found",
            "message": "No profile found for this user"
        }

# Update user profile
class ProfileUpdate(BaseModel):
    user_id: str
    citizenship: Optional[str] = None
    citizenship_code: Optional[str] = None
    date_of_birth: Optional[str] = None
    passport_number: Optional[str] = None
    existing_visas: Optional[str] = None

@app.post("/profile/update")
async def update_profile(update: ProfileUpdate):
    """Update user profile information"""
    profile_data = {
        'citizenship': update.citizenship,
        'citizenship_code': update.citizenship_code,
        'date_of_birth': update.date_of_birth,
        'passport_number': update.passport_number,
        'existing_visas': update.existing_visas
    }
    
    # Remove None values
    profile_data = {k: v for k, v in profile_data.items() if v is not None}
    
    success = save_user_profile(update.user_id, profile_data)
    
    if success:
        return {
            "status": "success",
            "message": "Profile updated successfully"
        }
    else:
        return {
            "status": "error",
            "message": "Failed to update profile"
        }

# Diagnostic endpoint to see what the frontend is sending
@app.post("/debug/request")
async def debug_request(data: MigrationRequest):
    """Debug endpoint to see exactly what data is being sent"""
    return {
        "received_data": {
            "request_type": data.request_type,
            "country": data.country,
            "type": data.type,
            "profile": {
                "user_id": data.profile.user_id,
                "displayName": data.profile.displayName,
                "email": data.profile.email,
                "nationalities": data.profile.nationalities,
            },
            "context": data.context
        },
        "interpretation": {
            "destination": data.country,
            "purpose": data.type,
            "user_id": data.profile.user_id or data.profile.email,
            "user_name": data.profile.displayName,
            "citizenship_data": data.profile.nationalities,
            "has_citizenship": len(data.profile.nationalities) > 0 if data.profile.nationalities else False
        }
    }

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting TARA Backend with full integration...")
    print("📍 Engine: ✅")
    print("📍 Database: ✅")
    print("📍 Mistral AI: ✅")
    uvicorn.run(app, host="127.0.0.1", port=8000)