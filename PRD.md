# Product Requirements Document (PRD)
## AutoStream — Social-to-Lead Agentic Workflow
**Project:** Social-to-Lead Agentic Workflow
**Product:** Inflx (by ServiceHive)
**Version:** 1.0.0
**Status:** Ready for Development
**Author:** ML Intern Assignment
**Last Updated:** 2025

---

## 1. Executive Summary

AutoStream is a fictional SaaS platform offering automated video editing tools for content creators. This PRD defines the full requirements for a **Conversational AI Agent** that serves as an intelligent front-line representative — capable of understanding user intent, retrieving accurate product knowledge, and converting high-intent users into qualified business leads.

The agent is not a simple FAQ bot. It is a **multi-turn, stateful, tool-calling AI agent** built on LangGraph, designed to mirror how an expert sales representative would naturally guide a conversation from curiosity to commitment.

---

## 2. Goals & Objectives

### 2.1 Primary Goals
- **Intent Awareness:** Correctly classify every user message into one of three intents without relying on keyword matching alone.
- **Accurate Knowledge Delivery:** Answer product and pricing questions exclusively from a curated knowledge base — never hallucinating figures or policies.
- **Lead Conversion:** Detect high-intent users and collect their information (Name, Email, Platform) in a natural, non-intrusive conversational flow.
- **Safe Tool Execution:** Call the lead capture backend only when all required fields are validated — never prematurely.

### 2.2 Secondary Goals (Differentiators)
- Provide a **Streamlit-powered interactive UI** with a live "State Inspector" sidebar for transparency.
- Handle **multi-turn edge cases** gracefully (e.g., user changes their mind mid-conversation, provides partial info, asks off-topic questions).
- Support a clean **WhatsApp deployment path** through documented webhook integration.
- Emit **structured agent reasoning logs** for evaluation and debugging.

---

## 3. Target Users

| User Persona | Description | Expected Interaction |
|---|---|---|
| **Casual Browser** | A content creator exploring tools | Short, non-committal messages like "What does AutoStream do?" |
| **Researching Buyer** | Evaluating AutoStream vs competitors | Detailed questions about features, pricing tiers, limitations |
| **High-Intent Lead** | Ready to subscribe or trial | Statements like "I want the Pro plan for my YouTube channel" |
| **Support Seeker** | Asking about policies/refunds | Questions like "Can I get a refund if I cancel?" |

---

## 4. Scope

### 4.1 In Scope
- Conversational agent with 3-intent classification
- RAG-powered knowledge retrieval from a local `knowledge_base.md`
- Stateful multi-turn dialogue (minimum 5–6 turns)
- Lead capture with 3-field validation (Name, Email, Creator Platform)
- Mock lead capture API trigger upon full data collection
- Streamlit-based chat interface with sidebar state inspector
- README documentation including WhatsApp webhook deployment strategy

### 4.2 Out of Scope (v1.0)
- Real CRM integration (e.g., Salesforce, HubSpot)
- Actual WhatsApp or social media deployment
- Multi-language support
- Image/video uploads from users
- Real payment processing

---

## 5. Functional Requirements

### 5.1 Intent Classification

The agent MUST classify every incoming user message into exactly one of the following intents:

| Intent ID | Label | Example Triggers | Agent Behavior |
|---|---|---|---|
| `INTENT_GREETING` | Casual Greeting | "Hi", "Hello", "Hey there" | Warm welcome + offer to help with pricing/features |
| `INTENT_INQUIRY` | Product / Pricing Inquiry | "What plans do you have?", "How much does it cost?" | Trigger RAG retrieval and respond with accurate knowledge |
| `INTENT_HIGH_LEAD` | High-Intent Lead | "I want to sign up", "Let me try the Pro plan", "I'm ready" | Initiate lead qualification flow |

**Rules:**
- Intent must be re-evaluated on EVERY turn — users can shift intent mid-conversation.
- A message may contain signals from multiple intents; the agent should prioritize `INTENT_HIGH_LEAD` > `INTENT_INQUIRY` > `INTENT_GREETING`.
- Intent transitions must be logged in the agent state.

### 5.2 RAG-Powered Knowledge Retrieval

The agent must retrieve answers exclusively from the following local knowledge base. It must NEVER fabricate pricing, features, or policies.

#### Knowledge Base Contents

**Pricing Plans:**

| Feature | Basic Plan | Pro Plan |
|---|---|---|
| Price | $29/month | $79/month |
| Videos/month | 10 videos | Unlimited |
| Resolution | 720p | 4K |
| AI Captions | ❌ | ✅ |
| 24/7 Support | ❌ | ✅ |

**Company Policies:**
- No refunds are issued after 7 days from the purchase date.
- 24/7 customer support is exclusively available on the Pro plan.
- Basic plan users can upgrade to Pro at any time.

**RAG Behavior Requirements:**
- Retrieval must use semantic similarity (not keyword matching).
- Agent must gracefully handle questions outside the knowledge base ("I don't have information on that, but I can help you with…").
- Responses must stay grounded — no elaboration beyond what the knowledge base contains.

### 5.3 Lead Capture State Machine

The lead capture flow is a sequential, validated multi-step process:

```
[HIGH_INTENT DETECTED]
        │
        ▼
  Ask for Name ──────────► Validate non-empty
        │
        ▼
  Ask for Email ─────────► Validate email format (must contain @)
        │
        ▼
  Ask for Platform ──────► Validate from list: YouTube, Instagram, TikTok, Twitter/X, Other
        │
        ▼
  All fields collected?
        │ YES
        ▼
  Call mock_lead_capture(name, email, platform)
        │
        ▼
  Display success confirmation to user
```

**Strict Rules:**
- The tool MUST NOT be called if any of the three fields is missing or empty.
- If the user provides a field before being asked (e.g., "I'm John from YouTube"), the agent must recognize and store it — do not ask for it again.
- If a user abandons the flow mid-way and asks an unrelated question, the agent must gracefully handle it, then offer to resume lead capture.
- Email format must be validated before storing.

### 5.4 State Management

The LangGraph state object must persist the following fields across all conversation turns:

```python
class AgentState(TypedDict):
    messages: List[BaseMessage]          # Full conversation history
    intent: str                          # Current detected intent
    lead_name: Optional[str]             # Collected name
    lead_email: Optional[str]            # Collected email
    lead_platform: Optional[str]         # Collected platform
    lead_captured: bool                  # Whether mock_lead_capture() was called
    rag_context: Optional[str]           # Last retrieved knowledge base content
    turn_count: int                      # Number of conversation turns
```

### 5.5 Streamlit UI Requirements

The web interface must include:

**Chat Panel:**
- Chat history displayed in a message-bubble style (user on right, agent on left).
- Auto-scroll to the latest message.
- Text input field with a "Send" button.

**Sidebar State Inspector:**
- Current detected intent (color-coded badge: grey/blue/green for greeting/inquiry/lead).
- Lead collection progress:
  - Name: Collected / Pending
  - Email: Collected / Pending
  - Platform: Collected / Pending
- Lead Capture Status: "Pending" → "SUCCESS ✅" when tool fires.
- Turn counter.

**Extra UI Features (Differentiators):**
- "Reset Conversation" button to clear state.
- Animated typing indicator while agent is processing.
- Toast notification when lead is successfully captured.

---

## 6. Non-Functional Requirements

| Requirement | Specification |
|---|---|
| **Response Latency** | Agent must respond within 5 seconds per turn under normal conditions |
| **Context Window** | Must maintain accurate state across at least 6 conversation turns |
| **Accuracy** | RAG responses must reflect knowledge base data with 100% fidelity |
| **Tool Safety** | `mock_lead_capture()` must NEVER fire with incomplete data |
| **Code Quality** | PEP8-compliant Python; functions documented with docstrings |
| **Modularity** | Each concern (RAG, intent, lead capture, UI) in a separate module |

---

## 7. Conversation Flow Specification

### 7.1 Happy Path (End-to-End)

```
Turn 1:
  User:  "Hi, tell me about your pricing."
  Agent: [INTENT: INQUIRY] Retrieves from KB → Returns both plan details

Turn 2:
  User:  "What's the difference between Basic and Pro?"
  Agent: [INTENT: INQUIRY] Retrieves comparison from KB → Returns feature diff

Turn 3:
  User:  "That sounds good. I want to try the Pro plan for my YouTube channel."
  Agent: [INTENT: HIGH_LEAD] "Great choice! I'd love to set you up. Could I get your name first?"

Turn 4:
  User:  "Sure, I'm Alex Kumar."
  Agent: [STATE: name=Alex Kumar] "Nice to meet you, Alex! What's the best email to reach you at?"

Turn 5:
  User:  "alexkumar@gmail.com"
  Agent: [STATE: email=alexkumar@gmail.com] "Perfect. And which platform do you primarily create content for — YouTube, Instagram, TikTok, or another?"

Turn 6:
  User:  "YouTube"
  Agent: [STATE: platform=YouTube] → Calls mock_lead_capture() → "You're all set, Alex! Our team will reach out to alexkumar@gmail.com shortly. Welcome to AutoStream Pro! 🎉"
```

### 7.2 Edge Cases to Handle

| Scenario | Expected Agent Behavior |
|---|---|
| User provides name before being asked | Agent detects and stores it; skips asking for name |
| User provides invalid email | Agent asks for a valid email format |
| User asks pricing question mid-lead-flow | Agent answers question, then offers to resume lead capture |
| User says "never mind" during lead flow | Agent acknowledges, resets lead state, returns to general help mode |
| User asks question outside knowledge base | Agent says "I don't have info on that" and stays on topic |
| User sends empty message | Agent prompts for input |

---

## 8. Acceptance Criteria

The project is complete when ALL of the following pass:

- [ ] Agent correctly identifies all 3 intents across a 6-turn test conversation.
- [ ] RAG retrieves and returns the correct pricing for both Basic ($29) and Pro ($79) plans.
- [ ] Agent does NOT call `mock_lead_capture()` with any field missing.
- [ ] Agent stores partial lead data across turns without losing it.
- [ ] Streamlit sidebar accurately reflects the current agent state in real time.
- [ ] `mock_lead_capture(name, email, platform)` prints the success message when all 3 fields are collected.
- [ ] README includes a WhatsApp deployment explanation using webhooks.

---

## 9. WhatsApp Deployment Strategy (Summary)

For production deployment on WhatsApp, the integration would follow this pattern:

**Using Twilio (Recommended for ease of setup):**
1. Register a Twilio WhatsApp Sandbox or production number.
2. Configure the webhook URL in Twilio to point to a FastAPI/Flask endpoint.
3. The endpoint receives incoming WhatsApp messages as HTTP POST requests.
4. The message text is extracted and passed to the LangGraph agent.
5. The agent's response is sent back to Twilio's REST API, which delivers it to the user's WhatsApp.
6. Session state per user is maintained using a unique identifier (e.g., WhatsApp phone number).

**Using Meta Graph API (Direct, Production-Grade):**
1. Register a Meta Business App and configure a WhatsApp Business Account.
2. Set up a webhook endpoint to receive messages from Meta's servers.
3. Verify the webhook with a `hub.challenge` token handshake.
4. Parse incoming `messages` events and route to the agent.
5. Reply using Meta's `POST /v18.0/{phone-number-id}/messages` endpoint.

See `README.md` for the complete architecture explanation.

---

## 10. Milestones

| Phase | Task | Deliverable |
|---|---|---|
| Phase 1 | Knowledge base creation + RAG pipeline | `knowledge_base.md`, `rag_pipeline.py` |
| Phase 2 | Intent classifier + LangGraph nodes | `agent_logic.py` |
| Phase 3 | Lead capture state machine + tool | `tools.py` |
| Phase 4 | Streamlit UI + state inspector | `app.py` |
| Phase 5 | Integration testing + edge case fixes | Passing all acceptance criteria |
| Phase 6 | Documentation + demo recording | `README.md`, demo video |
