import os
import json
import joblib
import numpy as np
from typing import List, Dict, Any
from backend.app.schemas.api_schemas import RecommendedCropItem, RecommendationResponse
from backend.app.knowledge_base.default_knowledge import CROPS_CATALOG
from datetime import datetime

MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "trained_models")
MODEL_PATH = os.path.join(MODELS_DIR, "crop_recommendation_model.joblib")

class CropRecommender:
    def __init__(self):
        self.model = None
        self.catalog = {c["name"]: c for c in CROPS_CATALOG}
        self._load_model()

    def _load_model(self):
        if os.path.exists(MODEL_PATH):
            try:
                self.model = joblib.load(MODEL_PATH)
                print("Loaded trained Crop Recommendation model successfully.")
            except Exception as e:
                print("Notice: Model file present but failed to load, using agronomic baseline:", e)
                self.model = None

    def recommend(
        self,
        nitrogen: float,
        phosphorus: float,
        potassium: float,
        soil_ph: float,
        temperature: float = 26.5,
        humidity: float = 70.0,
        rainfall: float = 850.0,
        soil_type: str = "Alluvial",
        season: str = "kharif",
        top_k: int = 5
    ) -> List[RecommendedCropItem]:
        results = []

        if self.model is not None:
            # Predict probabilities across classes
            features = np.array([[nitrogen, phosphorus, potassium, temperature, humidity, soil_ph, rainfall]])
            classes = self.model.classes_
            probs = self.model.predict_proba(features)[0]
            
            # Pair and sort
            sorted_indices = np.argsort(probs)[::-1]
            top_indices = sorted_indices[:top_k]

            for idx in top_indices:
                crop_name = classes[idx]
                confidence = float(probs[idx])
                if crop_name in self.catalog:
                    crop_info = self.catalog[crop_name]
                    # Score suitability based on soil & season alignment
                    suit_score = self._calc_suitability(crop_info, soil_ph, soil_type, season, confidence)
                    results.append(self._build_item(crop_info, confidence, suit_score, soil_ph, season, soil_type))
        else:
            # Agronomic scoring fallback
            scored_crops = []
            for crop_name, info in self.catalog.items():
                score = self._calc_suitability(info, soil_ph, soil_type, season, 0.8)
                scored_crops.append((score, info))
            scored_crops.sort(key=lambda x: x[0], reverse=True)

            for score, info in scored_crops[:top_k]:
                conf = min(0.95, max(0.60, score / 100.0))
                results.append(self._build_item(info, conf, score, soil_ph, season, soil_type))

        return results

    def _calc_suitability(self, crop: Dict[str, Any], ph: float, soil: str, season: str, base_conf: float) -> float:
        score = base_conf * 60.0
        # pH check
        if crop["min_ph"] <= ph <= crop["max_ph"]:
            score += 20.0
        else:
            diff = min(abs(ph - crop["min_ph"]), abs(ph - crop["max_ph"]))
            score += max(0.0, 20.0 - diff * 8)

        # Season check
        if season.lower() in crop["suitable_seasons"].lower():
            score += 10.0
        else:
            score += 2.0

        # Soil type check
        if soil.lower() in crop["suitable_soils"].lower():
            score += 10.0
        else:
            score += 4.0

        return round(min(100.0, max(10.0, score)), 1)

    def _build_item(self, crop: Dict[str, Any], confidence: float, suitability: float, ph: float, season: str, soil: str) -> RecommendedCropItem:
        advantages = [
            f"Strong regional suitability for {crop['category'].title()} crops in {season.title()} season",
            f"Optimal pH range is {crop['min_ph']} - {crop['max_ph']} (Current: {ph})",
            f"Expected harvest duration: ~{crop['duration_days']} days with market liquidity"
        ]
        warnings = [
            f"Requires approximately {crop['water_req_per_acre']} m³ water per acre",
            f"Fertilizer guideline: {crop['fert_req_per_acre']} kg NPK per acre"
        ]
        explanation = (
            f"{crop['name']} exhibits high agronomic alignment ({suitability}% score) "
            f"for {soil} soil under {season.title()} cultivation with an estimated yield of "
            f"{crop['base_yield_per_acre']} Quintals/acre."
        )

        return RecommendedCropItem(
            crop_name=crop["name"],
            confidence=round(confidence, 3),
            suitability_score=suitability,
            suitability_explanation=explanation,
            expected_yield_per_acre=crop["base_yield_per_acre"],
            cultivation_cost_per_acre=crop["cultivation_cost_per_acre"],
            market_price_per_quintal=crop["market_price_per_unit"],
            water_req_per_acre=crop["water_req_per_acre"],
            fert_req_per_acre=crop["fert_req_per_acre"],
            duration_days=crop["duration_days"],
            season_fit=crop["suitable_seasons"],
            soil_fit=crop["suitable_soils"],
            key_advantages=advantages,
            risks_and_warnings=warnings
        )
