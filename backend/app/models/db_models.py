from sqlalchemy import Column, Integer, Float, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.app.database.session import Base

class FarmerProfile(Base):
    __tablename__ = "farmer_profiles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), default="Farmer")
    phone = Column(String(20), nullable=True)
    state = Column(String(50), default="Andhra Pradesh")
    district = Column(String(50), default="Guntur")
    village = Column(String(100), default="Amaravathi")
    created_at = Column(DateTime, default=datetime.utcnow)

    farm_profiles = relationship("FarmProfile", back_populates="farmer", cascade="all, delete-orphan")


class FarmProfile(Base):
    __tablename__ = "farm_profiles"

    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("farmer_profiles.id"), nullable=True)
    
    # Location & Farm Size
    state = Column(String(50), default="Andhra Pradesh")
    district = Column(String(50), default="Guntur")
    village = Column(String(100), default="Amaravathi")
    farm_area = Column(Float, default=5.0)  # Total land
    area_unit = Column(String(20), default="acres")  # acres or hectares
    season = Column(String(20), default="kharif")  # kharif, rabi, zaid, year_round
    irrigation_type = Column(String(50), default="canal")
    
    # Soil parameters
    soil_type = Column(String(50), default="Alluvial")
    soil_ph = Column(Float, default=6.5)
    nitrogen = Column(Float, default=90.0)    # N kg/ha
    phosphorus = Column(Float, default=42.0)  # P kg/ha
    potassium = Column(Float, default=43.0)   # K kg/ha
    soil_moisture = Column(Float, default=45.0)  # %
    organic_carbon = Column(Float, default=0.55) # %
    electrical_conductivity = Column(Float, default=0.8) # dS/m
    
    # Resource constraints
    available_water = Column(Float, default=15000.0) # in m3 or liters or acre-inches
    water_unit = Column(String(20), default="m3")
    available_fertilizer = Column(Float, default=1200.0) # total kg NPK
    budget = Column(Float, default=150000.0) # INR
    
    # Farmer objective
    objective = Column(String(50), default="max_profit")
    
    created_at = Column(DateTime, default=datetime.utcnow)

    farmer = relationship("FarmerProfile", back_populates="farm_profiles")
    plans = relationship("FarmPlan", back_populates="farm_profile", cascade="all, delete-orphan")


class Crop(Base):
    __tablename__ = "crops"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, index=True)
    scientific_name = Column(String(100), nullable=True)
    category = Column(String(50), default="cereal")
    min_ph = Column(Float, default=5.5)
    max_ph = Column(Float, default=7.5)
    opt_n = Column(Float, default=80.0)
    opt_p = Column(Float, default=40.0)
    opt_k = Column(Float, default=40.0)
    water_req_per_acre = Column(Float, default=2500.0) # m3 per acre
    fert_req_per_acre = Column(Float, default=150.0)   # kg per acre
    cultivation_cost_per_acre = Column(Float, default=25000.0) # INR
    base_yield_per_acre = Column(Float, default=22.0) # Quintals per acre
    market_price_per_unit = Column(Float, default=2400.0) # INR per Quintal
    duration_days = Column(Integer, default=120)
    suitable_seasons = Column(String(100), default="kharif,rabi")
    suitable_soils = Column(String(200), default="Alluvial,Black,Clayey,Loamy")
    description = Column(Text, nullable=True)


class FarmPlan(Base):
    __tablename__ = "farm_plans"

    id = Column(Integer, primary_key=True, index=True)
    farm_profile_id = Column(Integer, ForeignKey("farm_profiles.id"), nullable=True)
    plan_type = Column(String(50), default="profit_focused") # profit_focused, water_efficient, balanced
    objective_used = Column(String(50))
    solver_status = Column(String(50)) # Optimal, Feasible, Infeasible
    
    total_allocated_land = Column(Float, default=0.0)
    total_expected_yield = Column(Float, default=0.0) # Quintals
    total_cultivation_cost = Column(Float, default=0.0) # INR
    total_expected_revenue = Column(Float, default=0.0) # INR
    total_expected_profit = Column(Float, default=0.0)  # INR
    total_water_used = Column(Float, default=0.0)      # m3
    total_fertilizer_used = Column(Float, default=0.0) # kg
    
    remaining_land = Column(Float, default=0.0)
    remaining_water = Column(Float, default=0.0)
    remaining_fertilizer = Column(Float, default=0.0)
    remaining_budget = Column(Float, default=0.0)
    
    water_savings_percent = Column(Float, default=0.0)
    cost_savings_percent = Column(Float, default=0.0)
    
    allocations_json = Column(Text, default="[]") # Detailed JSON per crop
    warnings_json = Column(Text, default="[]")    # JSON list of warnings & assumptions
    
    created_at = Column(DateTime, default=datetime.utcnow)

    farm_profile = relationship("FarmProfile", back_populates="plans")


class AssistantConversation(Base):
    __tablename__ = "assistant_conversations"

    id = Column(Integer, primary_key=True, index=True)
    question = Column(Text, nullable=False)
    language = Column(String(20), default="en")
    answer = Column(Text, nullable=False)
    sources_json = Column(Text, default="[]")
    farm_context_json = Column(Text, default="{}")
    feedback = Column(String(50), nullable=True) # very_well, partially, not_solved
    created_at = Column(DateTime, default=datetime.utcnow)


class KnowledgeSolution(Base):
    __tablename__ = "knowledge_solutions"

    id = Column(Integer, primary_key=True, index=True)
    question = Column(Text, nullable=False)
    normalized_query = Column(String(255), index=True)
    crop = Column(String(50), index=True)
    region = Column(String(100), nullable=True)
    problem_category = Column(String(50), default="general") # pest_disease, soil_water, fertilizer, yield_optimization, general
    solution_text = Column(Text, nullable=False)
    evidence_sources = Column(Text, default="ICAR Guidelines, TNAU Agritech Portal")
    status = Column(String(30), default="candidate") # candidate, needs_review, verified, rejected, outdated
    success_count = Column(Integer, default=1)
    verified_by = Column(String(100), nullable=True)
    verification_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    feedback_reports = relationship("SolutionFeedbackReport", back_populates="solution", cascade="all, delete-orphan")


class SolutionFeedbackReport(Base):
    __tablename__ = "solution_feedback_reports"

    id = Column(Integer, primary_key=True, index=True)
    solution_id = Column(Integer, ForeignKey("knowledge_solutions.id"))
    action_taken = Column(Text, nullable=True)
    crop = Column(String(50), nullable=True)
    region = Column(String(100), nullable=True)
    days_to_result = Column(Integer, default=7)
    outcome_observed = Column(Text, nullable=True)
    solution = relationship("KnowledgeSolution", back_populates="feedback_reports")


class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(String(64), primary_key=True, index=True) # UUID or client-generated session id
    title = Column(String(255), default="Agricultural Chat")
    language = Column(String(20), default="en")
    context_json = Column(Text, default="{}") # Persistent extracted context (crop, acres, symptoms, location, etc.)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    messages = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan", order_by="ChatMessage.created_at")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(64), ForeignKey("chat_sessions.id", ondelete="CASCADE"), index=True, nullable=False)
    role = Column(String(20), nullable=False) # "user" or "assistant"
    content = Column(Text, nullable=False)
    language = Column(String(20), default="en")
    sources_json = Column(Text, default="[]")
    reused_notice = Column(Text, nullable=True)
    matched_id = Column(Integer, nullable=True)
    disclaimer = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("ChatSession", back_populates="messages")

