import pytest
from backend.app.optimization.solver import FarmResourceOptimizer

def test_optimization_respects_land_and_resource_constraints():
    optimizer = FarmResourceOptimizer()
    farm_area = 5.0
    water = 12000.0
    fert = 800.0
    budget = 100000.0
    candidates = ["Rice (Paddy)", "Maize (Corn)", "Chickpea (Gram)", "Groundnut (Peanut)"]

    plan = optimizer.solve_plan(
        farm_area=farm_area,
        available_water=water,
        available_fertilizer=fert,
        budget=budget,
        candidate_crop_names=candidates,
        objective_type="profit_focused"
    )

    assert plan.is_feasible is True
    assert plan.total_allocated_land <= farm_area + 1e-4
    assert plan.total_water_used <= water + 1e-4
    assert plan.total_fertilizer_used <= fert + 1e-4
    assert plan.total_cultivation_cost <= budget + 1e-4
    # Verify profit math
    assert abs((plan.total_expected_revenue - plan.total_cultivation_cost) - plan.total_expected_profit) < 1.0

def test_water_efficient_objective():
    optimizer = FarmResourceOptimizer()
    candidates = ["Rice (Paddy)", "Chickpea (Gram)", "Mustard", "Wheat"]

    plan_profit = optimizer.solve_plan(5.0, 15000.0, 1000.0, 120000.0, candidates, "profit_focused")
    plan_water = optimizer.solve_plan(5.0, 15000.0, 1000.0, 120000.0, candidates, "water_efficient")

    assert plan_water.is_feasible is True
    # Water efficient plan should use less or equal water compared to profit plan
    assert plan_water.total_water_used <= plan_profit.total_water_used + 1e-4

def test_infeasible_problem_diagnostic():
    optimizer = FarmResourceOptimizer()
    # Extremely small budget (e.g. ₹500 for 10 acres of rice)
    plan = optimizer.solve_plan(
        farm_area=10.0,
        available_water=10.0,
        available_fertilizer=10.0,
        budget=500.0,
        candidate_crop_names=["Rice (Paddy)", "Sugarcane"],
        objective_type="profit_focused"
    )
    # The solver will find it infeasible or allocate 0 without violating limits
    assert plan.total_water_used <= 10.0
    assert plan.total_cultivation_cost <= 500.0
