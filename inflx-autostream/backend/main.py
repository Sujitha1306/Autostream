"""
FastAPI backend for Inflx by AutoStream.
Exposes REST API consumed by the React frontend.
"""

import uuid
import os
from datetime import datetime, timezone
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import ChatRequest, ChatResponse, LeadsResponse
from agent import compiled_agent, initial_state
from tools import get_all_leads
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="Inflx API — AutoStream",
    description="Social-to-Lead Agentic Workflow API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174", "http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory session store
sessions: dict = {}

@app.get("/")
def root():
    return {"status": "running", "service": "Inflx API", "version": "1.0.0"}

@app.get("/health")
def health():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}

@app.post("/api/session/new")
def create_session():
    session_id = str(uuid.uuid4())
    sessions[session_id] = initial_state(session_id)
    return {"session_id": session_id}

@app.post("/api/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    session_id = request.session_id
    if session_id not in sessions:
        sessions[session_id] = initial_state(session_id)

    state = sessions[session_id]
    state["messages"].append({
        "role": "user",
        "content": request.message,
        "timestamp": datetime.now(timezone.utc).isoformat()
    })

    try:
        result = compiled_agent.invoke(state)
        sessions[session_id] = result
    except Exception as e:
        import traceback
        print("\n[ERROR] AGENT ERROR DETECTED:")
        traceback.print_exc()
        err = str(e)
        
        # Robust rate limit detection
        is_rate_limit = any(x in err.lower() for x in ["429", "resource_exhausted", "quota", "limit exceeded", "too many requests"])
        
        if is_rate_limit:
            fallback_msg = (
                "I'm experiencing high demand right now and my AI brain needs a moment to cool down. "
                "Please try again in a few seconds! In the meantime, feel free to explore our plans at autostream.io "
                "or reach out to support@autostream.io."
            )
            state["messages"].append({
                "role": "assistant",
                "content": fallback_msg,
                "timestamp": datetime.now(timezone.utc).isoformat()
            })
            return ChatResponse(
                session_id=session_id,
                response=fallback_msg,
                intent=state.get("intent", "greeting"),
                intent_history=state.get("intent_history", []),
                lead_name=state.get("lead_name"),
                lead_email=state.get("lead_email"),
                lead_platform=state.get("lead_platform"),
                lead_captured=state.get("lead_captured", False),
                turn_count=state.get("turn_count", 0)
            )
        
        # Log the specific error before raising
        print(f"Raising 500 error: {err}")
        raise HTTPException(status_code=500, detail=f"Agent error: {err}")

    ai_msgs = [m for m in result["messages"] if m["role"] == "assistant"]
    last_reply = ai_msgs[-1]["content"] if ai_msgs else "I had trouble processing that. Please try again."

    return ChatResponse(
        session_id=session_id,
        response=last_reply,
        intent=result["intent"],
        intent_history=result["intent_history"],
        lead_name=result.get("lead_name"),
        lead_email=result.get("lead_email"),
        lead_platform=result.get("lead_platform"),
        lead_captured=result["lead_captured"],
        turn_count=result["turn_count"]
    )


@app.get("/api/leads", response_model=LeadsResponse)
def get_leads():
    leads = get_all_leads()
    today = datetime.now(timezone.utc).date().isoformat()
    today_leads = [l for l in leads if l.get("captured_at", "").startswith(today)]

    platform_counts = {}
    for lead in leads:
        p = lead.get("platform", "Other")
        platform_counts[p] = platform_counts.get(p, 0) + 1

    return LeadsResponse(
        leads=leads,
        total=len(leads),
        total_today=len(today_leads),
        platforms=platform_counts
    )

@app.get("/api/session/{session_id}")
def get_session(session_id: str):
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    state = sessions[session_id]
    return {
        "session_id": session_id,
        "turn_count": state["turn_count"],
        "intent": state["intent"],
        "lead_captured": state["lead_captured"],
        "messages_count": len(state["messages"])
    }

if __name__ == "__main__":
    import uvicorn
    host = "127.0.0.1"
    port = 8000
    print(f"\nStarting Inflx API...")
    print(f"Host: {host}")
    print(f"Port: {port}")
    print(f"URL:  http://{host}:{port}")
    print(f"Mode: Reload enabled\n")
    uvicorn.run("main:app", host=host, port=port, reload=True)
