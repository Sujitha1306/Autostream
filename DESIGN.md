# System Design Document
## AutoStream — Social-to-Lead Agentic Workflow
**Version:** 1.0.0
**Document Type:** Architecture & Design Specification

---

## 1. Design Philosophy

This agent is designed around three core principles:

1. **Stateful by Default** — Every node in the graph reads from and writes to a shared state object. Nothing is passed implicitly; every piece of information has a defined home.
2. **Fail-Safe Tool Execution** — The lead capture tool is guarded by an explicit validation gate. If any required field is absent, the tool is never invoked — regardless of what the LLM decides.
3. **Modular & Replaceable** — Each concern (intent, retrieval, lead collection, tool execution, UI) is isolated in its own module. Swapping the LLM, vector store, or frontend requires changing exactly one file.

---

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Streamlit Frontend (app.py)                     │
│  ┌──────────────────────────────┐  ┌──────────────────────────────────┐ │
│  │      Chat Panel              │  │     State Inspector Sidebar      │ │
│  │  - Message bubbles           │  │  - Current Intent (badge)        │ │
│  │  - Input field + Send btn    │  │  - Lead fields status            │ │
│  │  - Typing indicator          │  │  - Capture status / Turn count   │ │
│  └──────────────┬───────────────┘  └──────────────────────────────────┘ │
└─────────────────┼───────────────────────────────────────────────────────┘
                  │ user_message
                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      LangGraph Agent (agent_logic.py)                   │
│                                                                         │
│   ┌────────────┐     ┌─────────────┐     ┌──────────────────────────┐  │
│   │  INTENT    │────►│  ROUTER     │────►│  RAG NODE                │  │
│   │  CLASSIFIER│     │  (Conditional│    │  - Query vector store    │  │
│   │  NODE      │     │   Edge)     │     │  - Return grounded resp  │  │
│   └────────────┘     └──────┬──────┘     └──────────────────────────┘  │
│                             │                                           │
│                             │ (if HIGH_INTENT)                          │
│                             ▼                                           │
│                    ┌─────────────────┐                                  │
│                    │  LEAD CAPTURE   │                                  │
│                    │  NODE           │                                  │
│                    │  - Ask name     │                                  │
│                    │  - Ask email    │                                  │
│                    │  - Ask platform │                                  │
│                    └────────┬────────┘                                  │
│                             │ (all fields present)                      │
│                             ▼                                           │
│                    ┌─────────────────┐                                  │
│                    │  TOOL GATE      │                                  │
│                    │  (Validator)    │                                  │
│                    │  - Check fields │                                  │
│                    │  - Call tool    │                                  │
│                    └─────────────────┘                                  │
└─────────────────────────────────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                  Knowledge Base + Vector Store (rag_pipeline.py)        │
│  knowledge_base.md ──► LangChain Splitter ──► Embeddings ──► FAISS     │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. LangGraph State Design

### 3.1 State Schema

```python
from typing import TypedDict, Optional, List
from langchain_core.messages import BaseMessage

class AgentState(TypedDict):
    # Conversation history (full, accumulated)
    messages: List[BaseMessage]

    # Intent tracking
    intent: str                     # "greeting" | "inquiry" | "high_intent"
    intent_history: List[str]       # Track intent across all turns

    # Lead collection fields
    lead_name: Optional[str]
    lead_email: Optional[str]
    lead_platform: Optional[str]

    # Workflow status
    lead_captured: bool             # True once mock_lead_capture() fires
    collecting_lead: bool           # True once high intent is detected

    # RAG
    rag_context: Optional[str]      # Most recent retrieved knowledge

    # Diagnostics
    turn_count: int
    last_node: str                  # For debugging graph traversal
```

### 3.2 State Transition Rules

| From Node | To Node | Condition |
|---|---|---|
| `intent_classifier` | `rag_node` | intent == "inquiry" |
| `intent_classifier` | `lead_capture_node` | intent == "high_intent" |
| `intent_classifier` | `greeting_node` | intent == "greeting" |
| `lead_capture_node` | `tool_gate_node` | all 3 fields populated |
| `lead_capture_node` | `lead_capture_node` | any field still missing |
| `tool_gate_node` | `END` | lead_captured == True |

---

## 4. Node Specifications

### 4.1 Intent Classifier Node

**File:** `agent_logic.py`
**Input:** `state["messages"]` (last user message)
**Output:** Updated `state["intent"]`

**Prompt Design:**
```
System: You are an intent classification engine for AutoStream, a SaaS video editing platform.
Classify the user's latest message into exactly ONE of:
- "greeting"   → Casual hello, no product inquiry
- "inquiry"    → Questions about features, pricing, policies, or capabilities
- "high_intent"→ User expresses desire to sign up, try, buy, or subscribe

Rules:
- Prioritize "high_intent" over all others if any buying signal exists.
- Return ONLY the label. No explanation.

User message: {last_message}
```

**Output format:** Raw string — `"greeting"` | `"inquiry"` | `"high_intent"`

---

### 4.2 RAG Node

**File:** `rag_pipeline.py`
**Input:** User message
**Output:** Grounded response based on knowledge base retrieval

**Pipeline:**

```
knowledge_base.md
      │
      ▼
RecursiveCharacterTextSplitter (chunk_size=300, overlap=50)
      │
      ▼
GoogleGenerativeAIEmbeddings / OpenAIEmbeddings
      │
      ▼
FAISS Vector Store (in-memory)
      │
      ▼
Similarity Search (top_k=3)
      │
      ▼
Prompt: "Answer using ONLY this context: {context}\nQuestion: {question}"
      │
      ▼
LLM Response
```

**Grounding Prompt:**
```
You are the AutoStream assistant. Answer the user's question using ONLY the 
information provided below. Do not add, infer, or fabricate any details.
If the answer is not in the context, say: "I don't have that information, 
but I'd be happy to connect you with our team."

Context:
{retrieved_chunks}

User Question: {user_message}
```

---

### 4.3 Lead Capture Node

**File:** `agent_logic.py`
**Input:** Current state (checks which fields are missing)
**Output:** Next question to ask user + updated state fields as they're collected

**Sequential Collection Logic:**

```python
def lead_capture_node(state: AgentState) -> AgentState:
    # Try to extract any field from the latest user message
    state = extract_fields_from_message(state)

    # Determine what to ask next
    if not state["lead_name"]:
        response = "I'd love to get you started! Could I get your name?"
    elif not state["lead_email"]:
        response = f"Great, {state['lead_name']}! What email address should we use?"
    elif not state["lead_platform"]:
        response = "And which platform do you create content on? (YouTube, Instagram, TikTok, Twitter/X, Other)"
    else:
        # All collected — pass to tool gate
        return route_to_tool_gate(state)

    state["messages"].append(AIMessage(content=response))
    return state
```

**Field Extraction Logic:**
The `extract_fields_from_message()` function uses the LLM to parse the latest user message and extract any of the three fields if present. This allows users who volunteer information early (e.g., "I'm Sarah from YouTube") to have that recognized without being asked again.

---

### 4.4 Tool Gate Node

**File:** `tools.py`
**Input:** State with all 3 lead fields populated
**Output:** Calls `mock_lead_capture()`, sets `state["lead_captured"] = True`

```python
def tool_gate_node(state: AgentState) -> AgentState:
    name = state.get("lead_name")
    email = state.get("lead_email")
    platform = state.get("lead_platform")

    # Strict guard — all fields must be non-empty strings
    if not all([name, email, platform]):
        raise ValueError("Tool gate reached with incomplete lead data. This is a bug.")

    # Validate email format
    if "@" not in email or "." not in email.split("@")[-1]:
        state["messages"].append(AIMessage(content="That doesn't look like a valid email. Could you double-check it?"))
        state["lead_email"] = None
        return state

    # Execute the tool
    mock_lead_capture(name, email, platform)
    state["lead_captured"] = True

    confirmation = (
        f"You're all set, {name}! 🎉 We'll reach out to {email} shortly. "
        f"Welcome to AutoStream Pro — made for creators like you on {platform}!"
    )
    state["messages"].append(AIMessage(content=confirmation))
    return state
```

---

## 5. RAG Knowledge Base

### 5.1 File: `knowledge_base.md`

```markdown
# AutoStream Knowledge Base

## Pricing Plans

### Basic Plan
- Price: $29/month
- Videos per month: 10
- Maximum resolution: 720p
- AI Captions: Not included
- 24/7 Support: Not included

### Pro Plan
- Price: $79/month
- Videos per month: Unlimited
- Maximum resolution: 4K
- AI Captions: Included
- 24/7 Support: Included

## Company Policies

### Refund Policy
AutoStream does not issue refunds after 7 days from the date of purchase.
Users are encouraged to test the product during the 7-day window.

### Customer Support
24/7 live customer support is exclusively available to Pro plan subscribers.
Basic plan users can access support via email with a 2-business-day response time.

### Plan Upgrades
Basic plan users can upgrade to Pro at any time. The upgrade is prorated
for the remaining billing period.
```

---

## 6. Graph Visualization

```
                      ┌─────────────┐
                      │    START    │
                      └──────┬──────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │   intent_classifier  │
                  └──────────┬───────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
      ┌──────────┐  ┌──────────────┐  ┌─────────────┐
      │ greeting │  │   rag_node   │  │ lead_capture│
      │   node   │  │              │  │    node     │
      └────┬─────┘  └──────┬───────┘  └──────┬──────┘
           │               │                  │
           └───────────────┼──────────────────┘
                           │
                    ┌──────▼──────┐
                    │  tool_gate  │ (only if all 3 fields present)
                    └──────┬──────┘
                           │
                      ┌────▼────┐
                      │   END   │
                      └─────────┘
```

---

## 7. File Structure

```
autostream-agent/
│
├── app.py                    # Streamlit frontend + session state
├── agent_logic.py            # LangGraph graph definition + all nodes
├── rag_pipeline.py           # Vector store setup + retrieval chain
├── tools.py                  # mock_lead_capture() + tool gate node
├── knowledge_base.md         # Local knowledge base (source of truth)
├── requirements.txt          # All Python dependencies
├── README.md                 # Setup + architecture + WhatsApp docs
│
└── utils/
    ├── intent_prompts.py     # Prompt templates for intent classifier
    ├── rag_prompts.py        # Prompt templates for RAG responses
    └── validators.py         # Email + field validation helpers
```

---

## 8. Streamlit UI Design

### 8.1 Chat Panel Layout

```
┌─────────────────────────────────────────────────────────┐
│  🎬 AutoStream Assistant                           [Reset]│
├─────────────────────────────────────────────────────────┤
│                                                         │
│    ┌─────────────────────────────────────────┐          │
│    │ 👤 Hi, tell me about your pricing.      │          │
│    └─────────────────────────────────────────┘          │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │ 🤖 AutoStream offers two plans:                 │    │
│  │    • Basic ($29/mo): 10 videos, 720p             │    │
│  │    • Pro ($79/mo): Unlimited, 4K, AI Captions   │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  [ Type your message...                    ] [Send]     │
└─────────────────────────────────────────────────────────┘
```

### 8.2 State Inspector Sidebar

```
┌─────────────────────────────┐
│  🧠 Agent State Inspector   │
├─────────────────────────────┤
│  Turn:  4 / ∞               │
│  Intent: 🟢 HIGH_INTENT     │
├─────────────────────────────┤
│  Lead Collection            │
│  ✅ Name:      Alex Kumar   │
│  ✅ Email:     alex@...     │
│  ⏳ Platform:  Pending      │
├─────────────────────────────┤
│  Lead Status:  ⏳ Pending   │
└─────────────────────────────┘
```

### 8.3 Post-Capture State

```
┌─────────────────────────────┐
│  🧠 Agent State Inspector   │
├─────────────────────────────┤
│  Turn:  6 / ∞               │
│  Intent: 🟢 HIGH_INTENT     │
├─────────────────────────────┤
│  Lead Collection            │
│  ✅ Name:      Alex Kumar   │
│  ✅ Email:     alex@...     │
│  ✅ Platform:  YouTube      │
├─────────────────────────────┤
│  Lead Status: ✅ CAPTURED!  │
└─────────────────────────────┘
```

---

## 9. Extra Design Features (Differentiators)

### 9.1 Intent History Visualization
The sidebar shows the sequence of detected intents across turns, e.g.:
`greeting → inquiry → inquiry → high_intent → high_intent → high_intent`

This makes the agent's reasoning transparent and is excellent for demo purposes.

### 9.2 Early Field Recognition
If a user volunteers their name, email, or platform before being asked, the LLM extracts and stores it. A subtle visual indicator in the sidebar shows "Auto-detected ✨" next to that field.

### 9.3 Graceful Off-Topic Handling
If the user asks something off-topic during lead collection (e.g., "Wait, do you support Windows?"), the agent answers from the knowledge base, then smoothly re-anchors: "Coming back to your sign-up — what email should we use?"

### 9.4 Conversation Reset
A "Reset" button in the UI clears all state and starts a fresh conversation. This is essential for the demo video.

### 9.5 Agent Reasoning Log (Optional Toggle)
A collapsible "Debug View" in the sidebar that shows the raw LLM prompt sent for the last intent classification — useful for evaluation and grading.

---

## 10. Security & Reliability Notes

- **No real API keys in code** — use `.env` file with `python-dotenv`.
- **Tool guard is deterministic** — Python-level validation, not LLM-dependent.
- **FAISS index built at startup** — not per-request (avoids latency spikes).
- **Email regex validation** — catches obvious malformed emails before tool fires.
- **State is immutable within a node** — each node receives a copy and returns a new state (LangGraph default behavior).
