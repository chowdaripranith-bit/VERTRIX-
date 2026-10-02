from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime

# Farm profile schemas
class FarmProfileCreate(BaseModel):
    farmer_name: Optional[str] = "Aditya Rao"
    phone: Optional[str] = "9876543210"
    state: str = "Andhra Pradesh"
    district: str = "Guntur"
    village: str = "Amaravathi"
    farm_area: float = Field(..., gt=0, description="Total land area")
    area_unit: str = Field(default="acres", pattern="^(acres|hectares)$")
    season: str = Field(default="kharif", pattern="^(kharif|rabi|zaid|year_round)$")
    irrigation_type: str = Field(default="canal")
    
    # Soil metrics
    soil_type: str = "Alluvial"
    soil_ph: float = Field(default=6.5, ge=3.5, le=10.0)
    nitrogen: float = Field(default=90.0, ge=0.0)
    phosphorus: float = Field(default=42.0, ge=0.0)
    potassium: float = Field(default=43.0, ge=0.0)
    soil_moisture: Optional[float] = 45.0
    organic_carbon: Optional[float] = 0.55
    electrical_conductivity: Optional[float] = 0.8
    
    # Resources
    available_water: float = Field(..., ge=0, description="Total water available in m3")
    water_unit: str = "m3"
    available_fertilizer: float = Field(..., ge=0, description="Available NPK in kg")
    budget: float = Field(..., ge=0, description="Total farming budget in INR")
    
    # Target objective
    objective: str = Field(default="max_profit", pattern="^(max_profit|max_yield|min_water|min_fertilizer|balanced)$")

class FarmProfileResponse(FarmProfileCreate):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Crop recommendation schemas
class RecommendationRequest(BaseModel):
    nitrogen: float
    phosphorus: float
    potassium: float
    soil_ph: float
    temperature: Optional[float] = 26.5
    humidity: Optional[float] = 70.0
    rainfall: Optional[float] = 850.0
    soil_type: Optional[str] = "Alluvial"
    season: Optional[str] = "kharif"
    state: Optional[str] = "Andhra Pradesh"
    top_k: Optional[int] = 5

class RecommendedCropItem(BaseModel):
    crop_name: str
    confidence: float
    suitability_score: float
    suitability_explanation: str
    expected_yield_per_acre: float
    cultivation_cost_per_acre: float
    market_price_per_quintal: float
    water_req_per_acre: float
    fert_req_per_acre: float
    duration_days: int
    season_fit: str
    soil_fit: str
    key_advantages: List[str]
    risks_and_warnings: List[str]

class RecommendationResponse(BaseModel):
    status: str
    input_summary: Dict[str, Any]
    recommended_crops: List[RecommendedCropItem]
    model_source: str
    timestamp: datetime

# Yield prediction schemas
class YieldPredictionRequest(BaseModel):
    crop_name: str
    farm_area: float
    soil_type: str
    soil_ph: float
    nitrogen: float
    phosphorus: float
    potassium: float
    season: str
    irrigation_type: str

class YieldPredictionItem(BaseModel):
    crop_name: str
    predicted_yield_per_acre: float
    predicted_total_yield: float
    yield_unit: str = "Quintals"
    confidence_interval: Dict[str, float]
    factors_affecting: List[str]
    model_r2_score: float

class YieldPredictionResponse(BaseModel):
    crop_name: str
    farm_area: float
    prediction: YieldPredictionItem
    method: str
    timestamp: datetime

# Mathematical Optimization schemas
class OptimizationRequest(BaseModel):
    farm_area: float = Field(..., gt=0)
    available_water: float = Field(..., ge=0)
    available_fertilizer: float = Field(..., ge=0)
    budget: float = Field(..., ge=0)
    objective: str = "max_profit" # max_profit, min_water, min_fertilizer, max_yield, balanced
    candidate_crops: Optional[List[str]] = None
    min_allocation_per_selected_crop: Optional[float] = 0.5 # acres
    soil_ph: Optional[float] = 6.5
    nitrogen: Optional[float] = 90.0
    phosphorus: Optional[float] = 42.0
    potassium: Optional[float] = 43.0
    season: Optional[str] = "kharif"

class CropAllocationDetail(BaseModel):
    crop_name: str
    allocated_area: float # in acres
    land_share_percentage: float
    expected_yield: float # in quintals
    cultivation_cost: float # INR
    expected_revenue: float # INR
    expected_profit: float # INR
    water_required: float # m3
    fertilizer_required: float # kg
    roi_percentage: float

class FarmPlanSummary(BaseModel):
    plan_type: str # profit_focused, water_efficient, balanced
    objective_title: str
    solver_status: str
    is_feasible: bool
    total_allocated_land: float
    total_expected_yield: float
    total_cultivation_cost: float
    total_expected_revenue: float
    total_expected_profit: float
    total_water_used: float
    total_fertilizer_used: float
    remaining_land: float
    remaining_water: float
    remaining_fertilizer: float
    remaining_budget: float
    water_savings_vs_max: float
    cost_savings_vs_budget: float
    allocations: List[CropAllocationDetail]
    warnings: List[str]
    solver_methodology: str

class PlanComparisonResponse(BaseModel):
    selected_plan: FarmPlanSummary
    alternative_plans: Dict[str, FarmPlanSummary] # profit_focused, water_efficient, balanced
    feasibility_notes: List[str]
    timestamp: datetime

# Voice Assistant schemas
class AssistantAskRequest(BaseModel):
    question: str
    language: str = "en" # en, te, hi, ta, kn, ml
    session_id: Optional[str] = None
    farm_context: Optional[Dict[str, Any]] = None

class AssistantAskResponse(BaseModel):
    session_id: str
    question: str
    language: str
    answer: str
    evidence_sources: List[str]
    matched_verified_solution_id: Optional[int] = None
    reused_solution_notice: Optional[str] = None
    confidence_assessment: str
    disclaimer: Optional[str] = None

class ChatMessageItem(BaseModel):
    id: int
    role: str # user or assistant
    content: str
    language: str
    sources: Optional[List[str]] = None
    reused_notice: Optional[str] = None
    matched_id: Optional[int] = None
    disclaimer: Optional[str] = None
    timestamp: str

class SessionHistoryResponse(BaseModel):
    session_id: str
    messages: List[ChatMessageItem]

class SpeechTranscriptionResponse(BaseModel):
    transcript: str
    language_code: str
    confidence: float
    is_fallback_mode: bool = False

class AssistantFeedbackRequest(BaseModel):
    conversation_id: Optional[int] = None
    question: str
    answer: str
    feedback: str # very_well, partially, not_solved
    action_taken: Optional[str] = None
    crop: Optional[str] = None
    region: Optional[str] = None
    days_to_result: Optional[int] = None
    outcome_observed: Optional[str] = None

# Knowledge Solutions
class KnowledgeSolutionCreate(BaseModel):
    question: str
    crop: str
    region: Optional[str] = "General"
    problem_category: str = "general"
    solution_text: str
    evidence_sources: str = "Verified Agricultural Extension"

class KnowledgeSolutionResponse(BaseModel):
    id: int
    question: str
    crop: str
    region: Optional[str]
    problem_category: str
    solution_text: str
    evidence_sources: str
    status: str
    success_count: int
    verified_by: Optional[str]
    verification_notes: Optional[str]
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class SolutionReviewRequest(BaseModel):
    status: str = Field(..., pattern="^(verified|rejected|needs_review|outdated)$")
    verified_by: str
    verification_notes: str
