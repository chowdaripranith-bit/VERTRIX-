import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_api_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"

def test_crops_list():
    res = client.get("/api/crops")
    assert res.status_code == 200
    crops = res.json()
    assert len(crops) >= 8
    assert any(c["name"] == "Rice (Paddy)" for c in crops)

def test_crop_recommendation_endpoint():
    payload = {
        "nitrogen": 90.0,
        "phosphorus": 45.0,
        "potassium": 45.0,
        "soil_ph": 6.5,
        "soil_type": "Alluvial",
        "season": "kharif"
    }
    res = client.post("/api/recommendations/crops", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert len(data["recommended_crops"]) >= 3
    assert data["recommended_crops"][0]["suitability_score"] > 50

def test_yield_prediction_endpoint():
    payload = {
        "crop_name": "Wheat",
        "farm_area": 3.0,
        "soil_type": "Alluvial",
        "soil_ph": 6.8,
        "nitrogen": 95.0,
        "phosphorus": 45.0,
        "potassium": 40.0,
        "season": "rabi",
        "irrigation_type": "canal"
    }
    res = client.post("/api/predictions/yield", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["prediction"]["predicted_yield_per_acre"] > 0
    assert data["prediction"]["predicted_total_yield"] > 0

def test_optimization_endpoint():
    payload = {
        "farm_area": 5.0,
        "available_water": 14000.0,
        "available_fertilizer": 900.0,
        "budget": 120000.0,
        "objective": "max_profit",
        "season": "kharif"
    }
    res = client.post("/api/optimization/plan", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "selected_plan" in data
    assert "alternative_plans" in data
    assert data["selected_plan"]["total_allocated_land"] <= 5.0

def test_assistant_multilingual_ask():
    payload = {
        "question": "How to control blast in rice?",
        "language": "te"
    }
    res = client.post("/api/assistant/ask", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["language"] == "te"
    assert len(data["answer"]) > 10

def test_knowledge_solutions_flow():
    res = client.get("/api/knowledge/solutions")
    assert res.status_code == 200
    sols = res.json()
    assert len(sols) > 0
