"""
LangGraph-based conversational agent for AutoStream Inflx.
Handles intent classification, RAG retrieval, and stateful lead capture.
"""

import os
import json
import re
from typing import TypedDict, Optional, List, Literal
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.graph import StateGraph, END
from rag import query_knowledge_base
from tools import mock_lead_capture, validate_email, normalize_platform
from dotenv import load_dotenv
import time


load_dotenv()

llm = ChatGoogleGenerativeAI(
    model="gemini-2.0-flash-lite",
    google_api_key=os.getenv("GOOGLE_API_KEY"),
    temperature=0.3
)

def invoke_with_retry(prompt: str, max_retries: int = 3) -> str:
    """Invoke LLM with exponential backoff on 429 rate limit errors."""
    for attempt in range(max_retries):
        try:
            response = llm.invoke(prompt)
            return response.content
        except Exception as e:
            err = str(e)
            if "429" in err or "RESOURCE_EXHAUSTED" in err:
                wait = 2 ** attempt  # 1s, 2s, 4s
                print(f"[LLM] Rate limited, retrying in {wait}s (attempt {attempt + 1}/{max_retries})")
                time.sleep(wait)
            else:
                raise
    return ""  # fallback after all retries

# ── State Schema ───────────────────────────────────────────────────────────────
class AgentState(TypedDict):
    session_id: str
    messages: List[dict]           # {role, content, timestamp}
    intent: str
    intent_history: List[str]
    lead_name: Optional[str]
    lead_email: Optional[str]
    lead_platform: Optional[str]
    lead_captured: bool
    collecting_lead: bool
    rag_context: Optional[str]
    turn_count: int
    last_node: str
    _skip_routing: Optional[bool]

# ── Intent Classifier ──────────────────────────────────────────────────────────
def intent_classifier_node(state: AgentState) -> AgentState:
    from datetime import datetime, timezone
    state["turn_count"] = state.get("turn_count", 0) + 1
    
    user_text = ""
    for m in reversed(state["messages"]):
        if m["role"] == "user":
            user_text = m["content"].strip()
            break

    if not user_text:
        reply = "I didn't catch that — could you type your question? 😊"
        state["messages"].append({"role": "assistant", "content": reply, "timestamp": datetime.now(timezone.utc).isoformat()})
        state["intent"] = "greeting"
        state["last_node"] = "empty_guard"
        state["_skip_routing"] = True
        return state

    last_msg = user_text
    conversation_summary = ""
    
    # Use a rolling window of the last 10 messages for context
    recent_msgs = state["messages"][-10:]
    
    if len(recent_msgs) > 2:
        recent = recent_msgs[-4:-1] # get last few before the latest
        conversation_summary = "\n".join([f"{m['role']}: {m['content']}" for m in recent])

    prompt = f"""You are an intent classifier for AutoStream, a video editing SaaS platform.

Conversation context:
{conversation_summary}

Latest user message: "{last_msg}"

Classify into EXACTLY ONE of these labels:
- "greeting" → Casual hello, introduction, small talk, no product question
- "inquiry" → Questions about features, pricing, plans, policies, support, refunds, trial
- "high_intent" → User expresses desire to sign up, buy, subscribe, start trial, or upgrade. Any buying signal.

Rules:
- If message has ANY buying signal → "high_intent" (override others)
- "I want to try", "sign me up", "let's do it", "I'm ready", "sounds good I'll take it" → always "high_intent"
- Return ONLY the label string. Nothing else. No quotes.

Label:"""

    intent = invoke_with_retry(prompt).strip().lower().strip('"').strip("'")
    if intent not in ["greeting", "inquiry", "high_intent"]:
        intent = "inquiry"

    state["intent"] = intent
    state["intent_history"] = state.get("intent_history", []) + [intent]
    state["last_node"] = "intent_classifier"
    return state

# ── Router ─────────────────────────────────────────────────────────────────────
def router(state: AgentState) -> str:
    if state.get("_skip_routing"):
        return END
    if state.get("collecting_lead") or state["intent"] == "high_intent":
        return "lead_capture_node"
    if state["intent"] == "inquiry":
        return "rag_node"
    return "greeting_node"

# ── Greeting Node ──────────────────────────────────────────────────────────────
def greeting_node(state: AgentState) -> AgentState:
    responses = [
        "Hey there! 👋 Welcome to **AutoStream** — where content creators edit smarter, not harder.\n\nI can help you explore our plans, features, and pricing. What would you like to know?",
        "Hi! Great to see you here. 🎬 I'm the AutoStream AI assistant.\n\nAre you looking to learn about our video editing plans, or are you ready to get started with a free trial?",
        "Hello! Welcome to AutoStream. ✨\n\nI'm here to help you find the perfect plan for your content creation workflow. Ask me anything about our features, pricing, or policies!"
    ]
    import random
    reply = random.choice(responses)
    from datetime import datetime, timezone
    state["messages"].append({"role": "assistant", "content": reply, "timestamp": datetime.now(timezone.utc).isoformat()})
    state["last_node"] = "greeting_node"
    return state

# ── RAG Node ───────────────────────────────────────────────────────────────────
def rag_node(state: AgentState) -> AgentState:
    from datetime import datetime, timezone
    
    # Use a rolling window of the last 10 messages to build RAG context query
    recent = state["messages"][-10:]
    context_query = "\n".join([f"{m['role']}: {m['content']}" for m in recent])
    
    answer = query_knowledge_base(context_query)
    state["rag_context"] = answer
    state["messages"].append({"role": "assistant", "content": answer, "timestamp": datetime.now(timezone.utc).isoformat()})
    state["last_node"] = "rag_node"
    return state

# ── Field Extractor ────────────────────────────────────────────────────────────
def extract_fields_from_message(state: AgentState, message: str) -> AgentState:
    prompt = f"""Extract contact details from this message. Return ONLY valid JSON.

Message: "{message}"

Return this exact JSON structure (use null if not found):
{{"name": "full name or null", "email": "email@domain.com or null", "platform": "platform name or null"}}

For platform, only accept: YouTube, Instagram, TikTok, Twitter/X, Facebook, Twitch, LinkedIn, Other
If platform is mentioned differently (e.g. "yt" = YouTube, "ig" = Instagram), normalize it.
Return ONLY the JSON object. No explanation."""

    try:
        raw = invoke_with_retry(prompt).strip()
        json_match = re.search(r'\{.*\}', raw, re.DOTALL)
        if json_match:
            extracted = json.loads(json_match.group())
            if extracted.get("name") and not state.get("lead_name"):
                state["lead_name"] = extracted["name"].strip()
            if extracted.get("email") and not state.get("lead_email"):
                if validate_email(extracted["email"]):
                    state["lead_email"] = extracted["email"].strip().lower()
            if extracted.get("platform") and not state.get("lead_platform"):
                state["lead_platform"] = normalize_platform(extracted["platform"])
    except Exception as e:
        print(f"[EXTRACT] Field extraction failed: {e}")
    return state

# ── Lead Capture Node ──────────────────────────────────────────────────────────
def lead_capture_node(state: AgentState) -> AgentState:
    from datetime import datetime, timezone

    state["collecting_lead"] = True
    last_msg = state["messages"][-1]["content"]
    user_text = last_msg

    # 2. "Never Mind" / Abandon Lead Flow Detection
    abandon_signals = ["never mind", "nevermind", "cancel", "stop", "forget it", "not interested", "skip"]
    if any(signal in user_text.lower() for signal in abandon_signals):
        state["lead_name"] = None
        state["lead_email"] = None
        state["lead_platform"] = None
        state["collecting_lead"] = False
        state["intent"] = "greeting"
        reply = "No problem at all! 😊 I've cleared the form. Feel free to ask me anything about AutoStream's features or pricing."
        state["messages"].append({"role": "assistant", "content": reply, "timestamp": datetime.now(timezone.utc).isoformat()})
        return state

    state = extract_fields_from_message(state, last_msg)

    name = state.get("lead_name")
    email = state.get("lead_email")
    platform = state.get("lead_platform")

    # 3. Platform Validation
    if not platform and name and email:
        platform_input = user_text.strip().lower()
        platform_map = {
            "youtube": "YouTube", "instagram": "Instagram", "tiktok": "TikTok",
            "twitter": "Twitter/X", "twitter/x": "Twitter/X", "x": "Twitter/X",
            "facebook": "Facebook", "twitch": "Twitch", "other": "Other"
        }
        matched = platform_map.get(platform_input)
        if matched:
            state["lead_platform"] = matched
            platform = matched
        elif any(p in platform_input for p in platform_map):
            for k, v in platform_map.items():
                if k in platform_input:
                    state["lead_platform"] = v
                    platform = v
                    break
        else:
            if state["turn_count"] > 1: # Only trigger invalid platform if we already asked
                reply = "I didn't recognize that platform. Please choose from: **YouTube, Instagram, TikTok, Twitter/X, Facebook, Twitch, or Other**."
                state["messages"].append({"role": "assistant", "content": reply, "timestamp": datetime.now(timezone.utc).isoformat()})
                return state

    # Check if all fields ready
    if name and email and platform:
        return tool_gate_node(state)

    # Ask for missing fields
    if not name:
        reply = "Excellent choice! 🚀 I'm excited to get you started with AutoStream Pro.\n\nFirst, could I get your **full name**?"
    elif not email:
        reply = f"Great to meet you, **{name}**! 🎉\n\nWhat's the best **email address** for your account? We'll use this to set everything up."
    elif not platform:
        reply = (f"Almost there! One last question — which platform do you primarily create content on?\n\n"
                 f"*(YouTube, Instagram, TikTok, Twitter/X, Facebook, Twitch, or Other)*")

    state["messages"].append({"role": "assistant", "content": reply, "timestamp": datetime.now(timezone.utc).isoformat()})
    state["last_node"] = "lead_capture_node"
    return state

# ── Tool Gate Node ─────────────────────────────────────────────────────────────
def tool_gate_node(state: AgentState) -> AgentState:
    from datetime import datetime, timezone

    name = state.get("lead_name")
    email = state.get("lead_email")
    platform = state.get("lead_platform")

    if not validate_email(email or ""):
        state["lead_email"] = None
        reply = f"That email doesn't look quite right 🤔 Could you double-check it for me? (e.g. name@gmail.com)"
        state["messages"].append({"role": "assistant", "content": reply, "timestamp": datetime.now(timezone.utc).isoformat()})
        return state

    # Fire the tool
    mock_lead_capture(
        name=name,
        email=email,
        platform=platform,
        session_id=state["session_id"],
        turn_count=state["turn_count"]
    )
    state["lead_captured"] = True
    state["last_node"] = "tool_gate"

    reply = (
        f"🎉 **You're all set, {name}!**\n\n"
        f"Welcome to AutoStream Pro! Here's a summary of what's next:\n\n"
        f"✅ Account confirmation will be sent to **{email}**\n"
        f"✅ Your **7-day free Pro trial** starts immediately\n"
        f"✅ 4K editing, AI captions, and unlimited videos — all yours\n\n"
        f"Our team will reach out within 24 hours to help you get the most out of AutoStream for your **{platform}** channel. 🚀\n\n"
        f"Is there anything else I can help you with?"
    )
    state["messages"].append({"role": "assistant", "content": reply, "timestamp": datetime.now(timezone.utc).isoformat()})
    return state

# ── Build LangGraph ────────────────────────────────────────────────────────────
def build_agent():
    graph = StateGraph(AgentState)
    graph.add_node("intent_classifier", intent_classifier_node)
    graph.add_node("greeting_node", greeting_node)
    graph.add_node("rag_node", rag_node)
    graph.add_node("lead_capture_node", lead_capture_node)

    graph.set_entry_point("intent_classifier")
    graph.add_conditional_edges("intent_classifier", router, {
        "greeting_node": "greeting_node",
        "rag_node": "rag_node",
        "lead_capture_node": "lead_capture_node",
    })
    graph.add_edge("greeting_node", END)
    graph.add_edge("rag_node", END)
    graph.add_edge("lead_capture_node", END)

    return graph.compile()

compiled_agent = build_agent()
print("[AGENT] LangGraph agent compiled successfully.")

def initial_state(session_id: str) -> AgentState:
    return AgentState(
        session_id=session_id,
        messages=[],
        intent="greeting",
        intent_history=[],
        lead_name=None,
        lead_email=None,
        lead_platform=None,
        lead_captured=False,
        collecting_lead=False,
        rag_context=None,
        turn_count=0,
        last_node="start",
        _skip_routing=False
    )
