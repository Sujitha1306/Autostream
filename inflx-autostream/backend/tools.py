"""
Lead capture tool with Python-level validation.
The tool ONLY fires when all 3 fields are validated.
"""

import re
import json
import uuid
import os
import threading
from datetime import datetime, timezone

LEADS_FILE = os.path.join(os.path.dirname(__file__), "leads.json")

# A threading lock to prevent race conditions during concurrent file writes
leads_file_lock = threading.Lock()

VALID_PLATFORMS = {
    "youtube", "instagram", "tiktok", "twitter", "twitter/x",
    "x", "facebook", "twitch", "linkedin", "other"
}

def validate_email(email: str) -> bool:
    pattern = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
    return bool(re.match(pattern, email.strip()))

def normalize_platform(platform: str) -> str:
    p = platform.strip().lower()
    mapping = {
        "youtube": "YouTube", "yt": "YouTube",
        "instagram": "Instagram", "ig": "Instagram",
        "tiktok": "TikTok", "twitter": "Twitter/X",
        "twitter/x": "Twitter/X", "x": "Twitter/X",
        "facebook": "Facebook", "fb": "Facebook",
        "twitch": "Twitch", "linkedin": "LinkedIn",
        "other": "Other"
    }
    return mapping.get(p, platform.title())

def mock_lead_capture(name: str, email: str, platform: str, session_id: str, turn_count: int) -> dict:
    """
    Simulates a CRM lead capture API call.
    Persists to leads.json for the dashboard.
    """
    lead = {
        "id": str(uuid.uuid4()),
        "name": name.strip(),
        "email": email.strip().lower(),
        "platform": normalize_platform(platform),
        "captured_at": datetime.now(timezone.utc).isoformat(),
        "session_id": session_id,
        "turn_count": turn_count
    }

    with leads_file_lock:
        # Load existing leads
        leads = []
        if os.path.exists(LEADS_FILE):
            with open(LEADS_FILE, "r") as f:
                try:
                    leads = json.load(f)
                except:
                    leads = []

        leads.append(lead)

        with open(LEADS_FILE, "w") as f:
            json.dump(leads, f, indent=2)

    print(f"[TOOL] Lead captured: {name} | {email} | {platform}")
    return lead

def get_all_leads() -> list:
    with leads_file_lock:
        if not os.path.exists(LEADS_FILE):
            return []
        with open(LEADS_FILE, "r") as f:
            try:
                return json.load(f)
            except:
                return []
