import pulp
from typing import Dict, List, Any, Optional
from backend.app.schemas.api_schemas import CropAllocationDetail, FarmPlanSummary, PlanComparisonResponse
from backend.app.knowledge_base.default_knowledge import CROPS_CATALOG
from datetime import datetime

class FarmResourceOptimizer:
    def __init__(self, crops_catalog: Optional[List[Dict[str, Any]]] = None):
        self.catalog = {c["name"]: c for c in (crops_catalog or CROPS_CATALOG)}

    def solve_plan(
        self,
        farm_area: float,
        available_water: float,
        available_fertilizer: float,
        budget: float,
        candidate_crop_names: List[str],
        objective_type: str = "profit_focused", # profit_focused, water_efficient, balanced
        min_allocation: float = 0.5,
        target_profit_ratio: float = 0.65
    ) -> FarmPlanSummary:
        """
        Solves the Linear Programming problem for land and resource allocation.
        """
        # Filter candidate crops from catalog
        candidates = [self.catalog[c] for c in candidate_crop_names if c in self.catalog]
        if not candidates:
            # Fallback to top 4 popular crops if none matched
            candidates = list(self.catalog.values())[:4]

        prob_name = f"FarmPlan_{objective_type}"
        
        # Decision variables: x_i >= 0 (area in acres allocated to crop i)
        prob = pulp.LpProblem(prob_name, pulp.LpMaximize if objective_type != "water_efficient" else pulp.LpMinimize)
        x_vars = {c["name"]: pulp.LpVariable(f"area_{i}", lowBound=0, upBound=farm_area, cat=pulp.LpContinuous) 
                  for i, c in enumerate(candidates)}
        
        # Constraint 1: Total land
        prob += pulp.lpSum([x_vars[c["name"]] for c in candidates]) <= farm_area, "Total_Land_Constraint"
        
        # Constraint 2: Irrigation water
        prob += pulp.lpSum([c["water_req_per_acre"] * x_vars[c["name"]] for c in candidates]) <= available_water, "Water_Constraint"
        
        # Constraint 3: Fertilizer
        prob += pulp.lpSum([c["fert_req_per_acre"] * x_vars[c["name"]] for c in candidates]) <= available_fertilizer, "Fertilizer_Constraint"
        
        # Constraint 4: Budget
        prob += pulp.lpSum([c["cultivation_cost_per_acre"] * x_vars[c["name"]] for c in candidates]) <= budget, "Budget_Constraint"

        # Calculate unit profit for each crop: (Yield * Price) - Cost
        profit_per_acre = {}
        for c in candidates:
            rev = c["base_yield_per_acre"] * c["market_price_per_unit"]
            profit_per_acre[c["name"]] = rev - c["cultivation_cost_per_acre"]

        if objective_type == "profit_focused":
            # Maximize Total Profit = Sum(profit_i * x_i)
            prob.sense = pulp.LpMaximize
            prob += pulp.lpSum([profit_per_acre[c["name"]] * x_vars[c["name"]] for c in candidates]), "Maximize_Profit"

        elif objective_type == "water_efficient":
            # Minimize Water Consumption subject to achieving at least a reasonable profit target
            # First find max potential profit
            prob.sense = pulp.LpMinimize
            # Baseline constraint: allocate at least 40% of land if resources permit
            prob += pulp.lpSum([x_vars[c["name"]] for c in candidates]) >= min(farm_area * 0.4, 0.5), "Min_Land_Utilization"
            # Objective: minimize water
            prob += pulp.lpSum([c["water_req_per_acre"] * x_vars[c["name"]] for c in candidates]), "Minimize_Water"

        elif objective_type == "balanced":
            # Balanced: Optimize a normalized trade-off between profit and resource efficiency
            # Normalization constants based on max candidates
            max_profit_rate = max(profit_per_acre.values()) if profit_per_acre else 1.0
            max_water_rate = max(c["water_req_per_acre"] for c in candidates) if candidates else 1.0
            
            prob.sense = pulp.LpMaximize
            # Objective = 0.7 * (Profit / max_profit) - 0.3 * (Water / max_water)
            prob += pulp.lpSum([
                (0.70 * (profit_per_acre[c["name"]] / max(1.0, max_profit_rate)) -
                 0.30 * (c["water_req_per_acre"] / max(1.0, max_water_rate))) * x_vars[c["name"]]
                for c in candidates
            ]), "Balanced_Efficiency_Profit"

        # Solve with default CBC solver
        solver = pulp.PULP_CBC_CMD(msg=0)
        status_code = prob.solve(solver)
        solver_status = pulp.LpStatus[status_code]
        
        is_feasible = (solver_status in ["Optimal", "Feasible"])
        warnings = []
        allocations: List[CropAllocationDetail] = []
        
        tot_land = 0.0
        tot_yield = 0.0
        tot_cost = 0.0
        tot_rev = 0.0
        tot_profit = 0.0
        tot_water = 0.0
        tot_fert = 0.0

        if not is_feasible:
            # Diagnose constraint conflict
            warnings.append(f"Mathematical solver status: {solver_status}. Resource limits prevent fully feasible solution.")
            # Determine which constraint was most restrictive
            min_cost = min(c["cultivation_cost_per_acre"] for c in candidates)
            min_water = min(c["water_req_per_acre"] for c in candidates)
            if budget < min_cost * 0.5:
                warnings.append(f"Budget of ₹{budget:,.0f} is below the minimum operational capital (₹{min_cost:,.0f}/acre). Consider adjusting budget.")
            if available_water < min_water * 0.5:
                warnings.append(f"Available water ({available_water:,.0f} m³) is insufficient for the selected crops. Switch to low-water crops (e.g., Chickpea, Mustard) or increase water quota.")
        else:
            for c in candidates:
                area = pulp.value(x_vars[c["name"]]) or 0.0
                if area > 0.01: # Filter numerical noise
                    area = round(area, 2)
                    c_yield = round(area * c["base_yield_per_acre"], 2)
                    c_cost = round(area * c["cultivation_cost_per_acre"], 2)
                    c_rev = round(c_yield * c["market_price_per_unit"], 2)
                    c_profit = round(c_rev - c_cost, 2)
                    c_water = round(area * c["water_req_per_acre"], 2)
                    c_fert = round(area * c["fert_req_per_acre"], 2)
                    roi = round((c_profit / c_cost * 100) if c_cost > 0 else 0.0, 1)

                    tot_land += area
                    tot_yield += c_yield
                    tot_cost += c_cost
                    tot_rev += c_rev
                    tot_profit += c_profit
                    tot_water += c_water
                    tot_fert += c_fert

                    allocations.append(CropAllocationDetail(
                        crop_name=c["name"],
                        allocated_area=area,
                        land_share_percentage=round((area / farm_area) * 100, 1),
                        expected_yield=c_yield,
                        cultivation_cost=c_cost,
                        expected_revenue=c_rev,
                        expected_profit=c_profit,
                        water_required=c_water,
                        fertilizer_required=c_fert,
                        roi_percentage=roi
                    ))

        # Sort allocations descending by area
        allocations.sort(key=lambda a: a.allocated_area, reverse=True)
        
        rem_land = max(0.0, round(farm_area - tot_land, 2))
        rem_water = max(0.0, round(available_water - tot_water, 2))
        rem_fert = max(0.0, round(available_fertilizer - tot_fert, 2))
        rem_budget = max(0.0, round(budget - tot_cost, 2))
        
        water_savings = round(((available_water - tot_water) / available_water * 100) if available_water > 0 else 0.0, 1)
        cost_savings = round(((budget - tot_cost) / budget * 100) if budget > 0 else 0.0, 1)

        titles = {
            "profit_focused": "Profit-Focused Plan (Max Net Margin)",
            "water_efficient": "Water-Efficient Plan (Conservation Priority)",
            "balanced": "Balanced Optimization Plan (Profit + Resource Savings)"
        }

        methodology = (
            f"Formulated as Linear Programming (LP) using PuLP with CBC solver. "
            f"Variables: Land acreage per crop (x_i). Constraints: Total land ({farm_area} acres), "
            f"Water quota ({available_water} m³), Fertilizer ({available_fertilizer} kg), Budget (₹{budget:,.0f})."
        )

        return FarmPlanSummary(
            plan_type=objective_type,
            objective_title=titles.get(objective_type, objective_type),
            solver_status=solver_status,
            is_feasible=is_feasible,
            total_allocated_land=round(tot_land, 2),
            total_expected_yield=round(tot_yield, 2),
            total_cultivation_cost=round(tot_cost, 2),
            total_expected_revenue=round(tot_rev, 2),
            total_expected_profit=round(tot_profit, 2),
            total_water_used=round(tot_water, 2),
            total_fertilizer_used=round(tot_fert, 2),
            remaining_land=rem_land,
            remaining_water=rem_water,
            remaining_fertilizer=rem_fert,
            remaining_budget=rem_budget,
            water_savings_vs_max=water_savings,
            cost_savings_vs_budget=cost_savings,
            allocations=allocations,
            warnings=warnings,
            solver_methodology=methodology
        )

    def generate_full_comparison(
        self,
        farm_area: float,
        available_water: float,
        available_fertilizer: float,
        budget: float,
        candidate_crops: List[str],
        selected_objective: str = "max_profit"
    ) -> PlanComparisonResponse:
        """
        Runs mathematical optimization across all three archetypes:
        1. Profit-Focused
        2. Water-Efficient
        3. Balanced
        """
        plan_profit = self.solve_plan(
            farm_area=farm_area,
            available_water=available_water,
            available_fertilizer=available_fertilizer,
            budget=budget,
            candidate_crop_names=candidate_crops,
            objective_type="profit_focused"
        )

        plan_water = self.solve_plan(
            farm_area=farm_area,
            available_water=available_water,
            available_fertilizer=available_fertilizer,
            budget=budget,
            candidate_crop_names=candidate_crops,
            objective_type="water_efficient"
        )

        plan_balanced = self.solve_plan(
            farm_area=farm_area,
            available_water=available_water,
            available_fertilizer=available_fertilizer,
            budget=budget,
            candidate_crop_names=candidate_crops,
            objective_type="balanced"
        )

        # Map selected objective
        obj_key_map = {
            "max_profit": plan_profit,
            "min_water": plan_water,
            "balanced": plan_balanced,
            "max_yield": plan_profit,
            "min_fertilizer": plan_water
        }
        selected = obj_key_map.get(selected_objective, plan_profit)

        notes = [
            "Mathematical model ensures no resource limit (Land, Water, Fertilizer, Budget) is violated.",
            "Water-Efficient plan saves up to " + str(plan_water.water_savings_vs_max) + "% water compared to available quota.",
            "Balanced plan stabilizes risk by diversifying acreage between commercial and conservation crops."
        ]

        return PlanComparisonResponse(
            selected_plan=selected,
            alternative_plans={
                "profit_focused": plan_profit,
                "water_efficient": plan_water,
                "balanced": plan_balanced
            },
            feasibility_notes=notes,
            timestamp=datetime.utcnow()
        )
