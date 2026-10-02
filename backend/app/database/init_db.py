from sqlalchemy.orm import Session
from backend.app.database.session import Base, engine, SessionLocal
from backend.app.models.db_models import Crop, KnowledgeSolution, FarmerProfile, FarmProfile
from backend.app.knowledge_base.default_knowledge import CROPS_CATALOG, DEFAULT_VERIFIED_SOLUTIONS

def init_db():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    try:
        # 1. Seed crops if empty
        if db.query(Crop).count() == 0:
            for item in CROPS_CATALOG:
                crop = Crop(
                    name=item["name"],
                    scientific_name=item["scientific_name"],
                    category=item["category"],
                    min_ph=item["min_ph"],
                    max_ph=item["max_ph"],
                    opt_n=item["opt_n"],
                    opt_p=item["opt_p"],
                    opt_k=item["opt_k"],
                    water_req_per_acre=item["water_req_per_acre"],
                    fert_req_per_acre=item["fert_req_per_acre"],
                    cultivation_cost_per_acre=item["cultivation_cost_per_acre"],
                    base_yield_per_acre=item["base_yield_per_acre"],
                    market_price_per_unit=item["market_price_per_unit"],
                    duration_days=item["duration_days"],
                    suitable_seasons=item["suitable_seasons"],
                    suitable_soils=item["suitable_soils"],
                    description=item["description"]
                )
                db.add(crop)
            db.commit()
            print("Seeded crops catalog into database.")

        # 2. Seed verified solutions if empty
        if db.query(KnowledgeSolution).count() == 0:
            for sol_item in DEFAULT_VERIFIED_SOLUTIONS:
                sol = KnowledgeSolution(
                    question=sol_item["question"],
                    normalized_query=sol_item["normalized_query"],
                    crop=sol_item["crop"],
                    region=sol_item["region"],
                    problem_category=sol_item["problem_category"],
                    solution_text=sol_item["solution_text"],
                    evidence_sources=sol_item["evidence_sources"],
                    status=sol_item["status"],
                    success_count=sol_item["success_count"],
                    verified_by=sol_item["verified_by"],
                    verification_notes=sol_item["verification_notes"]
                )
                db.add(sol)
            db.commit()
            print("Seeded verified solutions into database.")

        # 3. Seed demo farmer profile if empty
        if db.query(FarmerProfile).count() == 0:
            farmer = FarmerProfile(
                name="Ramesh Varma",
                phone="9848022338",
                state="Andhra Pradesh",
                district="Guntur",
                village="Amaravathi"
            )
            db.add(farmer)
            db.commit()
            db.refresh(farmer)

            farm = FarmProfile(
                farmer_id=farmer.id,
                state="Andhra Pradesh",
                district="Guntur",
                village="Amaravathi",
                farm_area=5.0,
                area_unit="acres",
                season="kharif",
                irrigation_type="canal",
                soil_type="Alluvial",
                soil_ph=6.6,
                nitrogen=95.0,
                phosphorus=44.0,
                potassium=46.0,
                soil_moisture=48.0,
                organic_carbon=0.58,
                electrical_conductivity=0.75,
                available_water=18000.0,
                water_unit="m3",
                available_fertilizer=1200.0,
                budget=150000.0,
                objective="max_profit"
            )
            db.add(farm)
            db.commit()
            print("Seeded demo farmer and farm profile.")

    finally:
        db.close()

if __name__ == "__main__":
    init_db()
