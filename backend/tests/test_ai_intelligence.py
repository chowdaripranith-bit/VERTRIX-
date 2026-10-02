import pytest
import uuid
import json
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.database.session import SessionLocal
from backend.app.models.db_models import ChatSession, ChatMessage

client = TestClient(app)

def test_greeting_casual_conversation():
    session_id = f"test_greet_{uuid.uuid4().hex[:8]}"
    
    # 1. Test "Hi, how are you?"
    res = client.post("/api/assistant/ask", json={
        "question": "Hi, how are you?",
        "language": "en",
        "session_id": session_id
    })
    assert res.status_code == 200
    data = res.json()
    assert data["session_id"] == session_id
    assert "doing" in data["answer"].lower() or "help" in data["answer"].lower() or "hi" in data["answer"].lower()
    # Greetings must NOT have chemical pesticide warnings
    assert data["disclaimer"] is None

    # 2. Test "What are you doing?"
    res2 = client.post("/api/assistant/ask", json={
        "question": "What are you doing?",
        "language": "en",
        "session_id": session_id
    })
    assert res2.status_code == 200
    data2 = res2.json()
    assert "chatting" in data2["answer"].lower() or "help" in data2["answer"].lower()
    assert data2["disclaimer"] is None

def test_general_science_question():
    session_id = f"test_sci_{uuid.uuid4().hex[:8]}"
    res = client.post("/api/assistant/ask", json={
        "question": "Now explain how a transistor works.",
        "language": "en",
        "session_id": session_id
    })
    assert res.status_code == 200
    ans = res.json()["answer"].lower()
    assert "transistor" in ans
    assert "semiconductor" in ans or "switch" in ans or "current" in ans or "amplifier" in ans

def test_full_nine_step_conversation_scenario():
    """
    Executes the exact 9-message conversation required in Section 11 of the specification:
    1. Hi, how are you?
    2. I grow cotton on two acres.
    3. The leaves are turning yellow.
    4. What could be the reason?
    5. What should I do next?
    6. Can I save water at the same time?
    7. Explain everything in Telugu.
    8. Now explain how a transistor works.
    9. Let's return to my cotton problem. What did we discuss earlier?
    """
    session_id = f"farmer_session_{uuid.uuid4().hex[:8]}"

    # Message 1
    r1 = client.post("/api/assistant/ask", json={
        "question": "Hi, how are you?",
        "language": "en",
        "session_id": session_id
    })
    assert r1.status_code == 200
    a1 = r1.json()["answer"]
    assert len(a1) > 10

    # Message 2
    r2 = client.post("/api/assistant/ask", json={
        "question": "I grow cotton on two acres.",
        "language": "en",
        "session_id": session_id
    })
    assert r2.status_code == 200
    a2 = r2.json()["answer"]
    assert "cotton" in a2.lower()

    # Message 3
    r3 = client.post("/api/assistant/ask", json={
        "question": "The leaves are turning yellow.",
        "language": "en",
        "session_id": session_id
    })
    assert r3.status_code == 200
    a3 = r3.json()["answer"]
    assert "yellow" in a3.lower() or "cotton" in a3.lower() or "nitrogen" in a3.lower()

    # Message 4
    r4 = client.post("/api/assistant/ask", json={
        "question": "What could be the reason?",
        "language": "en",
        "session_id": session_id
    })
    assert r4.status_code == 200
    a4 = r4.json()["answer"]
    assert any(term in a4.lower() for term in ["nitrogen", "pest", "moisture", "water", "magnesium", "deficiency", "aeration"])

    # Message 5
    r5 = client.post("/api/assistant/ask", json={
        "question": "What should I do next?",
        "language": "en",
        "session_id": session_id
    })
    assert r5.status_code == 200
    a5 = r5.json()["answer"]
    assert any(term in a5.lower() for term in ["spray", "urea", "step", "inspect", "moisture", "drainage"])

    # Message 6
    r6 = client.post("/api/assistant/ask", json={
        "question": "Can I save water at the same time?",
        "language": "en",
        "session_id": session_id
    })
    assert r6.status_code == 200
    a6 = r6.json()["answer"]
    assert any(term in a6.lower() for term in ["furrow", "drip", "water", "alternate", "mulch", "%"])

    # Message 7
    r7 = client.post("/api/assistant/ask", json={
        "question": "Explain everything in Telugu.",
        "language": "te",
        "session_id": session_id
    })
    assert r7.status_code == 200
    a7 = r7.json()["answer"]
    assert "పత్తి" in a7 or "నత్రజని" in a7 or "నీటి" in a7 or "ఆకులు" in a7

    # Message 8
    r8 = client.post("/api/assistant/ask", json={
        "question": "Now explain how a transistor works.",
        "language": "en",
        "session_id": session_id
    })
    assert r8.status_code == 200
    a8 = r8.json()["answer"]
    assert "transistor" in a8.lower()
    assert "semiconductor" in a8.lower() or "switch" in a8.lower() or "current" in a8.lower() or "amplifier" in a8.lower()

    # Message 9 - Memory Recall
    r9 = client.post("/api/assistant/ask", json={
        "question": "Let's return to my cotton problem. What did we discuss earlier?",
        "language": "en",
        "session_id": session_id
    })
    assert r9.status_code == 200
    a9 = r9.json()["answer"]
    assert "cotton" in a9.lower()
    assert "yellow" in a9.lower() or "earlier" in a9.lower() or "two acres" in a9.lower() or "discussed" in a9.lower()

    # Verify session history persistence via GET endpoint
    hist_res = client.get(f"/api/assistant/history/{session_id}")
    assert hist_res.status_code == 200
    hist = hist_res.json()
    assert hist["session_id"] == session_id
    # 9 user turns + 9 assistant turns = 18 stored messages
    assert len(hist["messages"]) >= 18

def test_session_isolation():
    """
    Verifies that User A's session is completely isolated from User B's session.
    """
    user_a = f"session_A_{uuid.uuid4().hex[:6]}"
    user_b = f"session_B_{uuid.uuid4().hex[:6]}"

    # User A talks about sugarcane
    client.post("/api/assistant/ask", json={
        "question": "I have sugarcane in Coimbatore",
        "language": "en",
        "session_id": user_a
    })

    # User B talks about wheat
    client.post("/api/assistant/ask", json={
        "question": "I have wheat in Ludhiana",
        "language": "en",
        "session_id": user_b
    })

    hist_a = client.get(f"/api/assistant/history/{user_a}").json()
    hist_b = client.get(f"/api/assistant/history/{user_b}").json()

    a_contents = [m["content"] for m in hist_a["messages"]]
    b_contents = [m["content"] for m in hist_b["messages"]]

    assert any("sugarcane" in c.lower() for c in a_contents)
    assert not any("sugarcane" in c.lower() for c in b_contents)

    assert any("wheat" in c.lower() for c in b_contents)
    assert not any("wheat" in c.lower() for c in a_contents)
