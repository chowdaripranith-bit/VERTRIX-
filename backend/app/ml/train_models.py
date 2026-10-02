"""
Model training and dataset generation pipeline for Crop Recommendation and Yield Prediction.
Evaluates models using real statistical metrics (Accuracy, MAE, RMSE, R2) and saves checkpoints.
"""
import os
import json
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, mean_absolute_error, root_mean_squared_error, r2_score
import joblib

DATASETS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "datasets")
MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "trained_models")

os.makedirs(DATASETS_DIR, exist_ok=True)
os.makedirs(MODELS_DIR, exist_ok=True)

# Standard benchmark crop profiles for realistic synthetic generation
CROP_PROFILES = {
    "Rice (Paddy)": {"N": (80, 120), "P": (35, 60), "K": (35, 60), "temp": (20, 32), "humidity": (70, 95), "ph": (5.5, 7.2), "rain": (150, 300), "yield_base": 24.0},
    "Wheat": {"N": (70, 110), "P": (35, 55), "K": (30, 50), "temp": (12, 25), "humidity": (50, 75), "ph": (6.0, 7.5), "rain": (50, 100), "yield_base": 20.0},
    "Maize (Corn)": {"N": (60, 100), "P": (30, 50), "K": (30, 50), "temp": (18, 30), "humidity": (55, 75), "ph": (5.8, 7.5), "rain": (60, 130), "yield_base": 25.0},
    "Cotton": {"N": (50, 90), "P": (25, 45), "K": (25, 45), "temp": (21, 35), "humidity": (55, 80), "ph": (6.0, 8.0), "rain": (60, 110), "yield_base": 12.0},
    "Chickpea (Gram)": {"N": (15, 35), "P": (40, 65), "K": (20, 40), "temp": (15, 28), "humidity": (45, 65), "ph": (6.0, 7.8), "rain": (30, 70), "yield_base": 9.5},
    "Groundnut (Peanut)": {"N": (20, 40), "P": (40, 60), "K": (30, 50), "temp": (22, 32), "humidity": (50, 75), "ph": (5.8, 7.2), "rain": (50, 100), "yield_base": 11.0},
    "Sugarcane": {"N": (120, 180), "P": (50, 80), "K": (60, 100), "temp": (24, 38), "humidity": (60, 85), "ph": (6.0, 8.0), "rain": (150, 250), "yield_base": 350.0},
    "Tomato": {"N": (70, 100), "P": (50, 75), "K": (60, 85), "temp": (18, 30), "humidity": (55, 80), "ph": (6.0, 7.2), "rain": (40, 90), "yield_base": 110.0},
    "Potato": {"N": (80, 115), "P": (50, 75), "K": (70, 95), "temp": (14, 24), "humidity": (60, 80), "ph": (5.2, 6.5), "rain": (40, 80), "yield_base": 95.0},
    "Mustard": {"N": (45, 75), "P": (25, 45), "K": (20, 40), "temp": (12, 26), "humidity": (45, 70), "ph": (6.0, 7.5), "rain": (30, 65), "yield_base": 7.5},
    "Soybean": {"N": (20, 40), "P": (50, 70), "K": (25, 45), "temp": (20, 32), "humidity": (60, 80), "ph": (6.0, 7.2), "rain": (70, 130), "yield_base": 10.0},
    "Onion": {"N": (60, 90), "P": (40, 60), "K": (50, 75), "temp": (15, 30), "humidity": (50, 75), "ph": (6.0, 7.4), "rain": (40, 85), "yield_base": 85.0}
}

def generate_crop_recommendation_dataset(samples_per_crop=180):
    np.random.seed(42)
    rows = []
    for crop, prof in CROP_PROFILES.items():
        for _ in range(samples_per_crop):
            n = np.clip(np.random.normal(np.mean(prof["N"]), (prof["N"][1]-prof["N"][0])/4), 0, 200)
            p = np.clip(np.random.normal(np.mean(prof["P"]), (prof["P"][1]-prof["P"][0])/4), 0, 150)
            k = np.clip(np.random.normal(np.mean(prof["K"]), (prof["K"][1]-prof["K"][0])/4), 0, 150)
            temp = np.random.normal(np.mean(prof["temp"]), (prof["temp"][1]-prof["temp"][0])/4)
            hum = np.clip(np.random.normal(np.mean(prof["humidity"]), 6), 15, 100)
            ph = np.clip(np.random.normal(np.mean(prof["ph"]), 0.4), 3.5, 9.5)
            rain = np.clip(np.random.normal(np.mean(prof["rain"]), 15), 10, 400)
            rows.append({
                "N": round(float(n), 1),
                "P": round(float(p), 1),
                "K": round(float(k), 1),
                "temperature": round(float(temp), 1),
                "humidity": round(float(hum), 1),
                "ph": round(float(ph), 2),
                "rainfall": round(float(rain), 1),
                "label": crop
            })
    df = pd.DataFrame(rows)
    csv_path = os.path.join(DATASETS_DIR, "crop_recommendation_dataset.csv")
    df.to_csv(csv_path, index=False)
    print(f"Generated recommendation dataset: {csv_path} with {len(df)} records.")
    return df

def generate_yield_dataset(samples_per_crop=120):
    np.random.seed(42)
    rows = []
    soil_types = ["Alluvial", "Black", "Red", "Loamy", "Clayey", "Sandy Loam"]
    seasons = ["kharif", "rabi", "zaid"]
    
    for crop, prof in CROP_PROFILES.items():
        base_y = prof["yield_base"]
        for _ in range(samples_per_crop):
            soil = np.random.choice(soil_types)
            season = np.random.choice(seasons)
            area = round(float(np.random.uniform(1.0, 15.0)), 1)
            n = round(float(np.random.uniform(prof["N"][0]*0.7, prof["N"][1]*1.3)), 1)
            p = round(float(np.random.uniform(prof["P"][0]*0.7, prof["P"][1]*1.3)), 1)
            k = round(float(np.random.uniform(prof["K"][0]*0.7, prof["K"][1]*1.3)), 1)
            ph = round(float(np.random.uniform(prof["ph"][0]-0.5, prof["ph"][1]+0.5)), 2)
            rainfall = round(float(np.random.uniform(prof["rain"][0]*0.8, prof["rain"][1]*1.2)), 1)
            
            # Yield formula with realistic agronomic response curve
            fert_factor = 1.0 + 0.1 * ((n - prof["N"][0]) / max(1, prof["N"][1]-prof["N"][0]))
            ph_penalty = 1.0 - 0.15 * abs(ph - np.mean(prof["ph"]))
            noise = np.random.normal(0, 0.05)
            
            yield_per_acre = max(1.0, base_y * fert_factor * ph_penalty * (1 + noise))
            total_yield = yield_per_acre * area
            
            rows.append({
                "crop": crop,
                "soil_type": soil,
                "season": season,
                "area": area,
                "N": n,
                "P": p,
                "K": k,
                "ph": ph,
                "rainfall": rainfall,
                "yield_per_acre": round(float(yield_per_acre), 2),
                "total_yield": round(float(total_yield), 2)
            })
    df = pd.DataFrame(rows)
    csv_path = os.path.join(DATASETS_DIR, "crop_yield_dataset.csv")
    df.to_csv(csv_path, index=False)
    print(f"Generated yield dataset: {csv_path} with {len(df)} records.")
    return df

def train_and_evaluate_models():
    rec_df = generate_crop_recommendation_dataset()
    yield_df = generate_yield_dataset()
    
    # 1. Train Crop Recommendation Model (Random Forest Classifier)
    X_rec = rec_df[["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]]
    y_rec = rec_df["label"]
    
    X_train_r, X_test_r, y_train_r, y_test_r = train_test_split(X_rec, y_rec, test_size=0.2, random_state=42, stratify=y_rec)
    
    clf = RandomForestClassifier(n_estimators=100, max_depth=12, random_state=42)
    clf.fit(X_train_r, y_train_r)
    
    rec_preds = clf.predict(X_test_r)
    rec_acc = accuracy_score(y_test_r, rec_preds)
    print(f"Crop Recommendation Model Test Accuracy: {rec_acc * 100:.2f}%")
    
    # 2. Train Yield Prediction Model (Gradient Boosting Regressor)
    # One-hot encode categorical features: crop, soil_type, season
    yield_df_encoded = pd.get_dummies(yield_df[["crop", "soil_type", "season", "N", "P", "K", "ph", "rainfall"]], drop_first=True)
    X_yield = yield_df_encoded
    y_yield = yield_df["yield_per_acre"]
    
    X_train_y, X_test_y, y_train_y, y_test_y = train_test_split(X_yield, y_yield, test_size=0.2, random_state=42)
    
    reg = GradientBoostingRegressor(n_estimators=120, learning_rate=0.08, max_depth=5, random_state=42)
    reg.fit(X_train_y, y_train_y)
    
    yield_preds = reg.predict(X_test_y)
    mae = mean_absolute_error(y_test_y, yield_preds)
    rmse = root_mean_squared_error(y_test_y, yield_preds)
    r2 = r2_score(y_test_y, yield_preds)
    print(f"Yield Prediction Metrics -> MAE: {mae:.3f}, RMSE: {rmse:.3f}, R2 Score: {r2:.4f}")
    
    # Save models
    clf_path = os.path.join(MODELS_DIR, "crop_recommendation_model.joblib")
    reg_path = os.path.join(MODELS_DIR, "crop_yield_model.joblib")
    cols_path = os.path.join(MODELS_DIR, "yield_feature_columns.json")
    metrics_path = os.path.join(MODELS_DIR, "model_metrics.json")
    
    joblib.dump(clf, clf_path)
    joblib.dump(reg, reg_path)
    
    with open(cols_path, "w", encoding="utf-8") as f:
        json.dump(list(X_yield.columns), f)
        
    metrics = {
        "crop_recommendation": {
            "model_type": "RandomForestClassifier",
            "test_accuracy": round(float(rec_acc), 4),
            "n_classes": len(CROP_PROFILES),
            "features": list(X_rec.columns)
        },
        "yield_prediction": {
            "model_type": "GradientBoostingRegressor",
            "mae": round(float(mae), 4),
            "rmse": round(float(rmse), 4),
            "r2_score": round(float(r2), 4),
            "target": "yield_per_acre (Quintals)"
        }
    }
    
    with open(metrics_path, "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)
        
    print("Models and verifiable metrics successfully saved to:", MODELS_DIR)
    return metrics

if __name__ == "__main__":
    train_and_evaluate_models()
