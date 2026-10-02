import urllib.request
import json
import sys

# Configure UTF-8 stdout for multilingual printing
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')


import uuid

BASE_URL = "https://ringtones-cia-adjusted-medicine.trycloudflare.com"
session_id = f"live_farmer_{uuid.uuid4().hex[:8]}"

conversation = [
    ("Hi, how are you?", "en"),
    ("I grow cotton on two acres.", "en"),
    ("The leaves are turning yellow.", "en"),
    ("What could be the reason?", "en"),
    ("What should I do next?", "en"),
    ("Can I save water at the same time?", "en"),
    ("Explain everything in Telugu.", "te"),
    ("Now explain how a transistor works.", "en"),
    ("Let's return to my cotton problem. What did we discuss earlier?", "en")
]

print(f"Connecting to live production URL: {BASE_URL}")

for idx, (question, lang) in enumerate(conversation, 1):
    payload = {
        "question": question,
        "language": lang,
        "session_id": session_id
    }
    req = urllib.request.Request(
        f"{BASE_URL}/api/assistant/ask",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    res = urllib.request.urlopen(req, timeout=20)
    data = json.loads(res.read().decode("utf-8"))
    
    print(f"\n[Turn {idx}] User: {question}")
    print(f"Status: {res.status}")
    print(f"Session: {data.get('session_id')}")
    answer_preview = data.get("answer", "").replace("\n", " ")[:120]
    print(f"Assistant: {answer_preview}...")

# Check persistence across page reloads/sessions
print("\n--- Verifying Database Session History Persistence ---")
hist_req = urllib.request.Request(f"{BASE_URL}/api/assistant/history/{session_id}")
hist_res = urllib.request.urlopen(hist_req, timeout=15)
history_data = json.loads(hist_res.read().decode("utf-8"))

print(f"Persisted Session ID: {history_data.get('session_id')}")
print(f"Total Persisted Messages: {len(history_data.get('messages', []))}")
assert len(history_data.get("messages", [])) == 18, f"Expected 18 messages, got {len(history_data.get('messages', []))}"

print("\nSUCCESS! All 9 conversation turns verified live with persistent memory!")
