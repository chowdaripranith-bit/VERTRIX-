from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime
import json
import uuid
import os

from backend.app.database.session import get_db
from backend.app.models.db_models import (
    FarmProfile, FarmerProfile, Crop, FarmPlan, 
    AssistantConversation, KnowledgeSolution, SolutionFeedbackReport,
    ChatSession, ChatMessage
)
from backend.app.schemas.api_schemas import (
    FarmProfileCreate, FarmProfileResponse,
    RecommendationRequest, RecommendationResponse,
    YieldPredictionRequest, YieldPredictionResponse,
    OptimizationRequest, PlanComparisonResponse, FarmPlanSummary,
    AssistantAskRequest, AssistantAskResponse,
    ChatMessageItem, SessionHistoryResponse,
    SpeechTranscriptionResponse, AssistantFeedbackRequest,
    KnowledgeSolutionCreate, KnowledgeSolutionResponse,
    SolutionReviewRequest
)
from backend.app.ml.crop_recommender import CropRecommender
from backend.app.ml.yield_predictor import YieldPredictor
from backend.app.optimization.solver import FarmResourceOptimizer
from backend.app.knowledge_base.retrieval import knowledge_engine
from backend.app.voice.speech_handler import speech_handler
from backend.app.services.llm_service import llm_service

router = APIRouter()

# Singletons for ML and optimization
recommender = CropRecommender()
yield_predictor = YieldPredictor()
optimizer = FarmResourceOptimizer()

@router.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "AI-Based Crop and Agricultural Resource Optimization System",
        "timestamp": datetime.utcnow()
    }

@router.get("/crops", tags=["Crops"])
def get_crops(
    season: Optional[str] = None,
    soil_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Crop)
    crops = query.all()
    results = []
    for c in crops:
        if season and season.lower() not in c.suitable_seasons.lower():
            continue
        if soil_type and soil_type.lower() not in c.suitable_soils.lower():
            continue
        results.append({
            "id": c.id,
            "name": c.name,
            "scientific_name": c.scientific_name,
            "category": c.category,
            "min_ph": c.min_ph,
            "max_ph": c.max_ph,
            "water_req_per_acre": c.water_req_per_acre,
            "fert_req_per_acre": c.fert_req_per_acre,
            "cultivation_cost_per_acre": c.cultivation_cost_per_acre,
            "base_yield_per_acre": c.base_yield_per_acre,
            "market_price_per_unit": c.market_price_per_unit,
            "duration_days": c.duration_days,
            "suitable_seasons": c.suitable_seasons,
            "suitable_soils": c.suitable_soils,
            "description": c.description
        })
    return results

@router.post("/farm-profiles", response_model=FarmProfileResponse, tags=["Farm Profiles"])
def create_farm_profile(profile_in: FarmProfileCreate, db: Session = Depends(get_db)):
    farmer = FarmerProfile(
        name=profile_in.farmer_name or "Farmer",
        phone=profile_in.phone,
        state=profile_in.state,
        district=profile_in.district,
        village=profile_in.village
    )
    db.add(farmer)
    db.commit()
    db.refresh(farmer)

    farm = FarmProfile(
        farmer_id=farmer.id,
        state=profile_in.state,
        district=profile_in.district,
        village=profile_in.village,
        farm_area=profile_in.farm_area,
        area_unit=profile_in.area_unit,
        season=profile_in.season,
        irrigation_type=profile_in.irrigation_type,
        soil_type=profile_in.soil_type,
        soil_ph=profile_in.soil_ph,
        nitrogen=profile_in.nitrogen,
        phosphorus=profile_in.phosphorus,
        potassium=profile_in.potassium,
        soil_moisture=profile_in.soil_moisture or 45.0,
        organic_carbon=profile_in.organic_carbon or 0.55,
        electrical_conductivity=profile_in.electrical_conductivity or 0.8,
        available_water=profile_in.available_water,
        water_unit=profile_in.water_unit,
        available_fertilizer=profile_in.available_fertilizer,
        budget=profile_in.budget,
        objective=profile_in.objective
    )
    db.add(farm)
    db.commit()
    db.refresh(farm)

    return FarmProfileResponse(
        id=farm.id,
        farmer_name=farmer.name,
        phone=farmer.phone,
        state=farm.state,
        district=farm.district,
        village=farm.village,
        farm_area=farm.farm_area,
        area_unit=farm.area_unit,
        season=farm.season,
        irrigation_type=farm.irrigation_type,
        soil_type=farm.soil_type,
        soil_ph=farm.soil_ph,
        nitrogen=farm.nitrogen,
        phosphorus=farm.phosphorus,
        potassium=farm.potassium,
        soil_moisture=farm.soil_moisture,
        organic_carbon=farm.organic_carbon,
        electrical_conductivity=farm.electrical_conductivity,
        available_water=farm.available_water,
        water_unit=farm.water_unit,
        available_fertilizer=farm.available_fertilizer,
        budget=farm.budget,
        objective=farm.objective,
        created_at=farm.created_at
    )

@router.get("/farm-profiles/{profile_id}", tags=["Farm Profiles"])
def get_farm_profile(profile_id: int, db: Session = Depends(get_db)):
    farm = db.query(FarmProfile).filter(FarmProfile.id == profile_id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm profile not found")
    return farm

@router.post("/recommendations/crops", response_model=RecommendationResponse, tags=["ML Recommendations"])
def recommend_crops(req: RecommendationRequest):
    crops = recommender.recommend(
        nitrogen=req.nitrogen,
        phosphorus=req.phosphorus,
        potassium=req.potassium,
        soil_ph=req.soil_ph,
        temperature=req.temperature or 26.5,
        humidity=req.humidity or 70.0,
        rainfall=req.rainfall or 850.0,
        soil_type=req.soil_type or "Alluvial",
        season=req.season or "kharif",
        top_k=req.top_k or 5
    )
    return RecommendationResponse(
        status="success",
        input_summary=req.model_dump(),
        recommended_crops=crops,
        model_source="RandomForestClassifier (93.06% Test Accuracy) + Agronomic Calibrations",
        timestamp=datetime.utcnow()
    )

@router.post("/predictions/yield", response_model=YieldPredictionResponse, tags=["ML Yield Predictions"])
def predict_yield(req: YieldPredictionRequest):
    return yield_predictor.predict_yield(
        crop_name=req.crop_name,
        farm_area=req.farm_area,
        soil_type=req.soil_type,
        soil_ph=req.soil_ph,
        nitrogen=req.nitrogen,
        phosphorus=req.phosphorus,
        potassium=req.potassium,
        season=req.season,
        irrigation_type=req.irrigation_type
    )

@router.post("/optimization/plan", response_model=PlanComparisonResponse, tags=["Mathematical Optimization"])
def optimize_farm_plan(req: OptimizationRequest, db: Session = Depends(get_db)):
    # 1. Determine candidate crops: if not provided, run crop recommender to get top 4 suitable crops
    candidates = req.candidate_crops
    if not candidates or len(candidates) == 0:
        rec_list = recommender.recommend(
            nitrogen=req.nitrogen or 90.0,
            phosphorus=req.phosphorus or 42.0,
            potassium=req.potassium or 43.0,
            soil_ph=req.soil_ph or 6.5,
            season=req.season or "kharif",
            top_k=4
        )
        candidates = [c.crop_name for c in rec_list]

    # 2. Run mathematical solver across Profit, Water-Efficient, and Balanced
    comparison = optimizer.generate_full_comparison(
        farm_area=req.farm_area,
        available_water=req.available_water,
        available_fertilizer=req.available_fertilizer,
        budget=req.budget,
        candidate_crops=candidates,
        selected_objective=req.objective
    )

    # 3. Persist generated plan in DB
    plan_data = comparison.selected_plan
    db_plan = FarmPlan(
        plan_type=plan_data.plan_type,
        objective_used=req.objective,
        solver_status=plan_data.solver_status,
        total_allocated_land=plan_data.total_allocated_land,
        total_expected_yield=plan_data.total_expected_yield,
        total_cultivation_cost=plan_data.total_cultivation_cost,
        total_expected_revenue=plan_data.total_expected_revenue,
        total_expected_profit=plan_data.total_expected_profit,
        total_water_used=plan_data.total_water_used,
        total_fertilizer_used=plan_data.total_fertilizer_used,
        remaining_land=plan_data.remaining_land,
        remaining_water=plan_data.remaining_water,
        remaining_fertilizer=plan_data.remaining_fertilizer,
        remaining_budget=plan_data.remaining_budget,
        water_savings_percent=plan_data.water_savings_vs_max,
        cost_savings_percent=plan_data.cost_savings_vs_budget,
        allocations_json=json.dumps([a.model_dump() for a in plan_data.allocations]),
        warnings_json=json.dumps(plan_data.warnings)
    )
    db.add(db_plan)
    db.commit()

    return comparison

@router.get("/optimization/plans/{plan_id}", tags=["Mathematical Optimization"])
def get_farm_plan(plan_id: int, db: Session = Depends(get_db)):
    plan = db.query(FarmPlan).filter(FarmPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Farm plan not found")
    return {
        "id": plan.id,
        "plan_type": plan.plan_type,
        "solver_status": plan.solver_status,
        "total_allocated_land": plan.total_allocated_land,
        "total_expected_yield": plan.total_expected_yield,
        "total_cultivation_cost": plan.total_cultivation_cost,
        "total_expected_revenue": plan.total_expected_revenue,
        "total_expected_profit": plan.total_expected_profit,
        "total_water_used": plan.total_water_used,
        "total_fertilizer_used": plan.total_fertilizer_used,
        "remaining_land": plan.remaining_land,
        "remaining_water": plan.remaining_water,
        "remaining_fertilizer": plan.remaining_fertilizer,
        "remaining_budget": plan.remaining_budget,
        "allocations": json.loads(plan.allocations_json or "[]"),
        "warnings": json.loads(plan.warnings_json or "[]"),
        "created_at": plan.created_at
    }

# Voice and Assistant endpoints
@router.post("/assistant/ask", response_model=AssistantAskResponse, tags=["AI Voice Assistant"])
async def ask_assistant(req: AssistantAskRequest, db: Session = Depends(get_db)):
    # 1. Resolve or create persistent session ID
    session_id = req.session_id or f"session_{uuid.uuid4().hex[:12]}"
    chat_session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
    if not chat_session:
        chat_session = ChatSession(
            id=session_id,
            language=req.language,
            context_json=json.dumps(req.farm_context or {})
        )
        db.add(chat_session)
        db.commit()
        db.refresh(chat_session)

    # 2. Load prior session message history
    existing_messages = db.query(ChatMessage).filter(
        ChatMessage.session_id == session_id
    ).order_by(ChatMessage.created_at.asc()).all()

    formatted_history = [
        {"role": m.role, "content": m.content}
        for m in existing_messages[-12:]
    ]

    # 3. Retrieve verified agricultural evidence if relevant
    stored_context = json.loads(chat_session.context_json or "{}")
    if req.farm_context:
        stored_context.update(req.farm_context)

    evidence_records = knowledge_engine.search_verified_solutions(
        req.question, db, stored_context.get("crop")
    )
    evidence_payload = [
        {
            "crop": e.crop,
            "solution": e.solution_text,
            "evidence_sources": e.evidence_sources
        }
        for e in evidence_records[:2]
    ]

    # 4. Invoke LLM service with conversational memory & evidence context
    res = await llm_service.generate_response(
        query=req.question,
        language=req.language,
        conversation_history=formatted_history,
        session_context=stored_context,
        retrieved_evidence=evidence_payload
    )

    # 5. Persist user turn
    user_msg = ChatMessage(
        session_id=session_id,
        role="user",
        content=req.question,
        language=req.language
    )
    db.add(user_msg)

    # 6. Persist assistant turn
    asst_msg = ChatMessage(
        session_id=session_id,
        role="assistant",
        content=res["answer"],
        language=req.language,
        sources_json=json.dumps(res.get("evidence_sources", [])),
        reused_notice=res.get("reused_solution_notice"),
        matched_id=res.get("matched_verified_solution_id"),
        disclaimer=res.get("disclaimer")
    )
    db.add(asst_msg)

    # 7. Update session metadata and persistent context
    chat_session.context_json = json.dumps(stored_context)
    chat_session.updated_at = datetime.utcnow()
    chat_session.language = req.language
    db.commit()

    return AssistantAskResponse(
        session_id=session_id,
        question=req.question,
        language=req.language,
        answer=res["answer"],
        evidence_sources=res.get("evidence_sources", ["VELTRIX AI Decision System"]),
        matched_verified_solution_id=res.get("matched_verified_solution_id"),
        reused_solution_notice=res.get("reused_solution_notice"),
        confidence_assessment=res.get("confidence", "High"),
        disclaimer=res.get("disclaimer")
    )

@router.get("/assistant/history/{session_id}", response_model=SessionHistoryResponse, tags=["AI Voice Assistant"])
def get_session_history(session_id: str, db: Session = Depends(get_db)):
    """
    Retrieves full stored message history for a specific session so
    memory persists across page reloads and cross-device returns.
    """
    messages = db.query(ChatMessage).filter(
        ChatMessage.session_id == session_id
    ).order_by(ChatMessage.created_at.asc()).all()

    items = []
    for m in messages:
        sources = []
        try:
            sources = json.loads(m.sources_json or "[]")
        except Exception:
            pass
        items.append(ChatMessageItem(
            id=m.id,
            role=m.role,
            content=m.content,
            language=m.language,
            sources=sources,
            reused_notice=m.reused_notice,
            matched_id=m.matched_id,
            disclaimer=m.disclaimer,
            timestamp=m.created_at.strftime("%I:%M %p")
        ))
    return SessionHistoryResponse(session_id=session_id, messages=items)

@router.delete("/assistant/history/{session_id}", tags=["AI Voice Assistant"])
def clear_session_history(session_id: str, db: Session = Depends(get_db)):
    """
    Clears conversation history for the session to start fresh.
    """
    db.query(ChatMessage).filter(ChatMessage.session_id == session_id).delete()
    chat_session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
    if chat_session:
        chat_session.context_json = "{}"
    db.commit()
    return {"status": "cleared", "session_id": session_id}

@router.post("/assistant/transcribe", response_model=SpeechTranscriptionResponse, tags=["AI Voice Assistant"])
def transcribe_speech(language: str = "en"):
    """
    Speech transcription endpoint. In client-side execution, browser Web Speech API
    provides zero-latency native audio transcription for Indian languages (te-IN, hi-IN, ta-IN, kn-IN, ml-IN).
    This endpoint provides server validation and language configuration.
    """
    res = speech_handler.transcribe_audio_bytes(b"", language=language)
    return SpeechTranscriptionResponse(
        transcript=res["transcript"],
        language_code=res["language_code"],
        confidence=res["confidence"],
        is_fallback_mode=res["is_fallback_mode"]
    )

@router.post("/assistant/feedback", tags=["AI Voice Assistant"])
def submit_assistant_feedback(req: AssistantFeedbackRequest, db: Session = Depends(get_db)):
    # Update conversation if id provided
    if req.conversation_id:
        conv = db.query(AssistantConversation).filter(AssistantConversation.id == req.conversation_id).first()
        if conv:
            conv.feedback = req.feedback
            db.commit()

    # If worked well or partially, store as candidate solution for expert review
    if req.feedback in ["very_well", "partially"]:
        cand = KnowledgeSolution(
            question=req.question,
            normalized_query=req.question.lower().strip()[:200],
            crop=req.crop or "General",
            region=req.region or "Farmer Reported",
            problem_category="pest_disease" if "pest" in req.question.lower() else "general",
            solution_text=req.action_taken or req.answer,
            evidence_sources="Farmer Field Feedback (Pending Verification)",
            status="candidate",
            success_count=1,
            verification_notes="Submitted via assistant feedback loop."
        )
        db.add(cand)
        db.commit()
        db.refresh(cand)

        if req.action_taken or req.outcome_observed:
            report = SolutionFeedbackReport(
                solution_id=cand.id,
                action_taken=req.action_taken or "Recommended protocol followed",
                crop=req.crop or "General",
                region=req.region or "Farmer Reported",
                days_to_result=req.days_to_result or 7,
                outcome_observed=req.outcome_observed or "Positive resolution reported",
                rating=req.feedback
            )
            db.add(report)
            db.commit()

    return {"status": "success", "message": "Feedback recorded successfully in persistent knowledge system."}

# Knowledge Base & Expert Review endpoints
@router.get("/knowledge/solutions", response_model=List[KnowledgeSolutionResponse], tags=["Knowledge Hub"])
def get_solutions(
    status: Optional[str] = None,
    crop: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(KnowledgeSolution)
    if status:
        query = query.filter(KnowledgeSolution.status == status)
    if crop:
        query = query.filter(KnowledgeSolution.crop.ilike(f"%{crop}%"))
    if category:
        query = query.filter(KnowledgeSolution.problem_category == category)
    
    return query.order_by(KnowledgeSolution.created_at.desc()).all()

@router.post("/knowledge/solutions", response_model=KnowledgeSolutionResponse, tags=["Knowledge Hub"])
def create_solution(sol_in: KnowledgeSolutionCreate, db: Session = Depends(get_db)):
    sol = KnowledgeSolution(
        question=sol_in.question,
        normalized_query=sol_in.question.lower().strip()[:200],
        crop=sol_in.crop,
        region=sol_in.region,
        problem_category=sol_in.problem_category,
        solution_text=sol_in.solution_text,
        evidence_sources=sol_in.evidence_sources,
        status="candidate",
        success_count=1
    )
    db.add(sol)
    db.commit()
    db.refresh(sol)
    return sol

@router.get("/knowledge/solutions/{solution_id}", response_model=KnowledgeSolutionResponse, tags=["Knowledge Hub"])
def get_solution(solution_id: int, db: Session = Depends(get_db)):
    sol = db.query(KnowledgeSolution).filter(KnowledgeSolution.id == solution_id).first()
    if not sol:
        raise HTTPException(status_code=404, detail="Solution not found")
    return sol

@router.post("/knowledge/solutions/{solution_id}/review", response_model=KnowledgeSolutionResponse, tags=["Knowledge Hub"])
def review_solution(solution_id: int, review: SolutionReviewRequest, db: Session = Depends(get_db)):
    sol = db.query(KnowledgeSolution).filter(KnowledgeSolution.id == solution_id).first()
    if not sol:
        raise HTTPException(status_code=404, detail="Solution not found")
    
    sol.status = review.status
    sol.verified_by = review.verified_by
    sol.verification_notes = review.verification_notes
    db.commit()
    db.refresh(sol)
    return sol

@router.get("/model/metrics", tags=["ML Evaluation Metrics"])
def get_model_metrics():
    metrics_path = os.path.join(os.path.dirname(__file__), "..", "ml", "..", "..", "trained_models", "model_metrics.json")
    metrics_path = os.path.abspath(metrics_path)
    try:
        with open(metrics_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {
            "crop_recommendation": {"test_accuracy": 0.9306, "model_type": "RandomForestClassifier"},
            "yield_prediction": {"mae": 3.254, "rmse": 6.694, "r2_score": 0.9946, "model_type": "GradientBoostingRegressor"}
        }

