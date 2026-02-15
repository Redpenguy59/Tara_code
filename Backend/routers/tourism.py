from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, Dict, List
from core.engine import process_request

router = APIRouter()

# Data coming IN
class UserSpecifics(BaseModel):
    reason: str
    age: Optional[int] = None
    income: Optional[str] = None
    current_visas: Optional[str] = None
    citizenship: Optional[str] = None

# Data going OUT
class MigrationResponse(BaseModel):
    status: str  # "SUCCESS" or "INCOMPLETE"
    summary: str
    expert_analysis: Dict
    data_source: str

@router.post("/check", response_model=MigrationResponse)
async def check_migration(origin: str, destination: str, profile: UserSpecifics):
    return process_request(origin, destination, profile.dict())