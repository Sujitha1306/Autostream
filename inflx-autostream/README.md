# Inflx by AutoStream — Social-to-Lead Agentic Workflow

A production-grade, full-stack AI-powered lead conversion platform. Inflx uses a stateful LangGraph agent with Gemini 1.5 Flash + FAISS RAG to convert social media conversations into qualified business leads.

**Think: Intercom × ChatGPT × Linear.app**

---

## Live Demo

| Page | Description |
|---|---|
| `/` | Marketing landing page |
| `/chat` | AI Agent chat interface (main feature) |
| `/dashboard` | Real-time leads analytics dashboard |
| `/docs` | Searchable product documentation |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + TypeScript |
| Styling | Tailwind CSS + Framer Motion |
| State | Zustand + React Query |
| Backend | FastAPI + Uvicorn (Python 3.11) |
| AI Model | Google Gemini 1.5 Flash (free tier) |
| RAG | FAISS + Google Generative AI Embeddings |
| Storage | JSON flat-file (`leads.json`) |

---

## Setup & Running

### Prerequisites
- Python 3.11+
- Node.js 18+
- Free Google AI Studio API key (https://aistudio.google.com)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env from example
cp .env.example .env
# Edit .env and add your GOOGLE_API_KEY

uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

---

## Agent Architecture
User Message
│
▼
┌─────────────────────────────────────┐
│         Intent Classifier Node       │
│  (Gemini + few-shot classification) │
│  GREETING / INQUIRY / HIGH_INTENT   │
└────────────────┬────────────────────┘
│
┌───────┼───────┐
▼       ▼       ▼
Greeting   RAG     Lead
Node     Node   Capture
│      Node
▼       │
FAISS        ▼
Search   Tool Gate
│   (validates
▼    all fields)
Gemini        │
Answer        ▼
mock_lead_capture()
→ leads.json

---

## Key Features

- **3-Intent Classification:** GREETING / INQUIRY / HIGH_INTENT — re-evaluated every turn
- **RAG Pipeline:** FAISS vector search + Gemini embeddings — 100% grounded answers
- **Lead State Machine:** Sequential 3-field collection (Name → Email → Platform) with full validation
- **Edge Case Handling:** Abandon detection, invalid email/platform re-prompting, out-of-scope graceful fallback
- **State Inspector:** Live sidebar showing intent badge, lead field progress, turn count
- **Dashboard:** Real-time analytics — stats cards, platform chart, leads table, CSV export
- **Docs Portal:** Searchable accordion FAQ with section navigation

---

## WhatsApp Deployment Strategy

### Option 1 — Twilio (Recommended for Prototyping)

1. Register a Twilio WhatsApp Sandbox at https://console.twilio.com
2. Deploy backend to a public URL (e.g., Railway, Render, or ngrok for local testing)
3. Set your webhook URL in Twilio Console → Messaging → Sandbox Settings:
   `https://your-backend.com/webhook/whatsapp`
4. Add the webhook endpoint to `main.py`:

```python
@app.post("/webhook/whatsapp")
async def whatsapp_webhook(request: Request):
    form = await request.form()
    from_number = form.get("From")       # e.g., whatsapp:+1234567890
    body = form.get("Body", "").strip()
    
    # Use phone number as session_id for per-user state
    session_id = from_number
    if session_id not in sessions:
        sessions[session_id] = initial_state(session_id)
    
    state = sessions[session_id]
    state["messages"].append({"role": "user", "content": body, "timestamp": datetime.now(timezone.utc).isoformat()})
    result = compiled_agent.invoke(state)
    sessions[session_id] = result
    
    ai_msgs = [m for m in result["messages"] if m["role"] == "assistant"]
    reply = ai_msgs[-1]["content"] if ai_msgs else "Sorry, I couldn't process that."
    
    # Respond via Twilio TwiML
    from twilio.twiml.messaging_response import MessagingResponse
    resp = MessagingResponse()
    resp.message(reply)
    return Response(content=str(resp), media_type="application/xml")
```

5. Install Twilio SDK: `pip install twilio`

### Option 2 — Meta Graph API (Production Grade)

1. Create a Meta Business App at https://developers.facebook.com
2. Add the WhatsApp product and configure a WhatsApp Business Account
3. Set up a webhook endpoint that responds to `hub.challenge` for verification:

```python
@app.get("/webhook/meta")
def meta_verify(hub_mode: str, hub_challenge: str, hub_verify_token: str):
    if hub_verify_token == os.getenv("META_VERIFY_TOKEN"):
        return Response(content=hub_challenge, media_type="text/plain")
    raise HTTPException(status_code=403, detail="Invalid verify token")

@app.post("/webhook/meta")
async def meta_webhook(request: Request):
    data = await request.json()
    for entry in data.get("entry", []):
        for change in entry.get("changes", []):
            messages = change.get("value", {}).get("messages", [])
            for msg in messages:
                from_number = msg["from"]
                body = msg.get("text", {}).get("body", "")
                # Route to agent — same session logic as above
                # Reply using: POST https://graph.facebook.com/v18.0/{phone_number_id}/messages
    return {"status": "ok"}
```

4. Use `httpx` or `requests` to send replies back via the Meta API with the page access token.

---

## Project Structure
inflx-autostream/
├── backend/
│   ├── main.py          # FastAPI app + all routes + WhatsApp webhook
│   ├── agent.py         # LangGraph agent (classifier, RAG, lead capture nodes)
│   ├── rag.py           # FAISS vector store + Gemini embedding pipeline
│   ├── tools.py         # mock_lead_capture() + leads.json persistence
│   ├── models.py        # Pydantic schemas
│   ├── knowledge_base.md
│   ├── leads.json       # Auto-created on first lead
│   └── requirements.txt
└── frontend/
    └── src/
        ├── pages/        # LandingPage, ChatPage, DashboardPage, DocsPage
        ├── components/   # Navbar, chat/, dashboard/, ui/
        ├── store/        # Zustand chat + session state
        ├── hooks/        # useLeads
        ├── api/          # Axios client
        └── types/        # TypeScript interfaces

---

## Acceptance Criteria (All Passing)

- [x] Agent correctly classifies all 3 intents across a 6-turn test conversation
- [x] RAG returns correct pricing: Basic $29, Pro $79
- [x] `mock_lead_capture()` never fires with incomplete data
- [x] Partial lead data persists across turns
- [x] Sidebar reflects real-time agent state
- [x] Dashboard shows live lead analytics with CSV export
- [x] Docs page has searchable FAQ with accordion sections
- [x] WhatsApp deployment strategy documented with code
