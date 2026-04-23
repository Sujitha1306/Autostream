from pydantic import BaseModel, EmailStr
from typing import Optional, List
from enum import Enum

class Intent(str, Enum):
    GREETING = "greeting"
    INQUIRY = "inquiry"
    HIGH_INTENT = "high_intent"

class Message(BaseModel):
    role: str  # "user" | "assistant"
    content: str
    timestamp: Optional[str] = None

class ChatRequest(BaseModel):
    session_id: str
    message: str

class LeadData(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    platform: Optional[str] = None

class AgentState(BaseModel):
    session_id: str
    messages: List[Message] = []
    intent: str = "greeting"
    intent_history: List[str] = []
    lead_name: Optional[str] = None
    lead_email: Optional[str] = None
    lead_platform: Optional[str] = None
    lead_captured: bool = False
    collecting_lead: bool = False
    rag_context: Optional[str] = None
    turn_count: int = 0

class ChatResponse(BaseModel):
    session_id: str
    response: str
    intent: str
    intent_history: List[str]
    lead_name: Optional[str]
    lead_email: Optional[str]
    lead_platform: Optional[str]
    lead_captured: bool
    turn_count: int

class Lead(BaseModel):
    id: str
    name: str
    email: str
    platform: str
    captured_at: str
    session_id: str
    turn_count: int

class LeadsResponse(BaseModel):
    leads: List[Lead]
    total: int
    total_today: int
    platforms: dict
