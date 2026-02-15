from fastapi import FastAPI
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
# This must match the JSON sent from geminiService.ts exactly
class UserProfile(BaseModel):
    displayName: Optional[str] = "User"
    email: Optional[str] = None
    nationalities: List[Any] = [] # Handles the [{"country": "USA"}] structure

class MigrationRequest(BaseModel):
    request_type: str
    country: str        # The Destination
    type: str           # The Purpose (Visa, Residency, etc.)
    profile: UserProfile # The User Data from Login
    context: Optional[dict] = {} # Wizard answers

@app.post("/tourism/check")
async def process_request(data: MigrationRequest):
    print(f"📥 RECEIVED REQUEST: {data.request_type}")
    print(f"👤 USER: {data.profile.displayName} from {data.profile.nationalities}")
    print(f"🎯 GOAL: {data.type} in {data.country}")

    # Extract user nationality for logic
    user_nationality = "Unknown"
    if data.profile.nationalities and len(data.profile.nationalities) > 0:
        # Handle if it's a list of objects or strings
        first_nat = data.profile.nationalities[0]
        user_nationality = first_nat.get('country', 'Unknown') if isinstance(first_nat, dict) else str(first_nat)

    # LOGIC SWITCH
    if data.request_type == 'requirements':
        return {
            "documents": [
                f"Passport ({user_nationality})",
                f"Application for {data.country} {data.type}",
                "Proof of Accommodation",
                "Biometric Photos"
            ],
            "steps": [
                {"id": "1", "text": f"Visit the {data.country} embassy in {user_nationality}", "isCompleted": False},
                {"id": "2", "text": "Gather certified translations of documents", "isCompleted": False},
                {"id": "3", "text": "Submit preliminary application online", "isCompleted": False}
            ]
        }
    
    elif data.request_type == 'resources':
        return {
            "forms": [
                {"name": f"Official {data.country} Entry Form", "url": "#"},
                {"name": "Health Declaration", "url": "#"}
            ],
            "submissionPoints": [
                {"name": "Central Visa Unit", "address": "Main Capital District"},
                {"name": "Online Portal", "address": "https://gov.example.com"}
            ]
        }

    return {"message": "Request received but type unknown."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)