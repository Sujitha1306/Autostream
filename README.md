# 🚀 Inflx by AutoStream

### Social-to-Lead Agentic Workflow Platform

**Inflx** is a production-grade Social-to-Lead Agentic Workflow platform built as the AI-powered agent layer for **AutoStream**, a fictional SaaS company offering automated video editing tools for content creators. 

The platform leverages **Google Gemini 1.5 Flash** orchestrated through **LangGraph** to build a stateful, multi-turn conversational agent capable of intent classification, product knowledge retrieval (RAG), and autonomous lead capture.

---

## 🏗️ System Architecture

### High-Level System Flow
The Inflx platform is structured as a client-server application with a clear separation between the presentation layer, the application logic layer, and the data layer.

```text
  +-------------------+          +-------------------------+
  |  React Frontend   |  HTTP    |    FastAPI Backend       |
  |  (Port 5173)      | <------> |    (Port 8000)          |
  |                   |  REST    |                         |
  |  - Landing Page   |          |  - /api/session/new     |
  |  - Chat Interface |          |  - /api/chat            |
  |  - Dashboard      |          |  - /api/leads           |
  |  - Docs Portal    |          |  - /health              |
  +-------------------+          +----------+--------------+
                                            |
                               +------------v--------------+
                               |   LangGraph Agent         |
                               |                           |
                               |  Intent Classifier Node   |
                               |  RAG Node                 |
                               |  Lead Capture Node        |
                               |  Tool Gate Node           |
                               +-----+-----------+---------+
                                     |           |
                        +------------v--+    +---v-----------+
                        |  FAISS Vector |    |  leads.json   |
                        |  Store + RAG  |    |  (Flat-file   |
                        |  (Gemini)     |    |   persistence)|
                        +---------------+    +---------------+
```
*Figure 1: High-Level System Architecture*

---

## 🤖 LangGraph Agent Design

The agent is implemented as a directed acyclic graph (with conditional cyclic behavior for the lead capture loop). The graph comprises four nodes connected by conditional edges.

### Node Workflow
```text
  User Message
       |
       v
  +--------------------+
  | Intent Classifier  |  <-- Gemini 1.5 Flash (zero-shot prompt)
  | Node               |
  +--------+-----------+
           |
    +-------+--------+
    |       |        |
    v       v        v
 Greeting  RAG    Lead Capture
  Node    Node      Node
    |       |        |
    |       v        v
    |    FAISS    Tool Gate
    |    Search   (Validator)
    |       |        |
    |    Gemini      v
    |    Answer   mock_lead_capture()
    |              leads.json
    +-------+--------+
            |
           END
```
*Figure 2: LangGraph Agent Node Graph*

### Lead Capture State Machine
```text
  [HIGH_INTENT DETECTED]
          |
          v
  collecting_lead = True
          |
          v
  Extract fields from current message
          |
   +-------+--------+
   |       |        |
   v       v        v
 name?  email?  platform?   (check each field)
   |
   v
  Missing name?  --> Ask: 'Could I get your full name?'
  Missing email? --> Ask: 'What email address should we use?'
  Missing platform? --> Ask: 'Which platform do you create on?'
          |
          v (all 3 fields populated)
  [TOOL GATE NODE]
          |
  Validate email format (regex)
          |
  Invalid? --> Clear email, re-prompt
  Valid?   --> Execute mock_lead_capture()
          |
  lead_captured = True
          |
  Send confirmation message
          |
         END
```
*Figure 3: Lead Capture State Machine Transition Diagram*

---

## 🛠️ Technical Stack

| Layer | Technology | Justification |
| :--- | :--- | :--- |
| **Agent** | LangGraph | Stateful graph with conditional edges for strict workflows. |
| **LLM** | Gemini 1.5 Flash | Free tier via AI Studio, 1M token context. |
| **RAG** | FAISS + Google Embeddings | Efficient in-memory vector search for product docs. |
| **Backend** | FastAPI | Async support, automatic OpenAPI docs. |
| **Frontend** | React 18 + TS | Component-based UI, Vite for fast HMR. |
| **Styling** | Tailwind CSS | Utility-first design, seamless dark mode. |
| **Animation** | Framer Motion | Spring-based animations for premium feel. |

---

## 🏃 Running Steps

### Prerequisites
- Python 3.11+
- Node.js 18+
- Google AI Studio API Key

### 1. Backend Setup
```bash
cd inflx-autostream/backend
python -m venv venv
# Activate venv (Windows)
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
cp .env.example .env # Add your GOOGLE_API_KEY
python main.py
```

### 2. Frontend Setup
```bash
cd inflx-autostream/frontend
npm install
npm run dev
```

---

## 📱 WhatsApp Integration

### Twilio Integration
Incoming WhatsApp messages arrive at `/webhook/whatsapp` as POST requests. The agent response is returned as TwiML XML.

### Meta Graph API
Direct integration via Meta Business App. Webhook at `/webhook/meta` handles the verification handshake and incoming message events.

---

## 📜 Documentation
- [DESIGN.md](./DESIGN.md)
- [PRD.md](./PRD.md)
- [TECHNICAL_STACK.md](./TECHNICAL_STACK.md)

*Developed for the ServiceHive Machine Learning Internship Assignment.*
