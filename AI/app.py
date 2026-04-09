from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import pandas as pd
import numpy as np

app = Flask(__name__)
CORS(app)

# Load model & tools
with open('random_forest_model.pkl', 'rb') as f:
    model = pickle.load(f)

with open('encoders.pkl', 'rb') as f:
    encoders = pickle.load(f)

with open('scaler.pkl', 'rb') as f:
    scaler = pickle.load(f)

cat_cols = [
    'gender', 'ethnicity', 'jaundice',
    'autism', 'Country_of_res',
    'used_app_before', 'relation'
]

num_cols = [
    'A1_Score','A2_Score','A3_Score','A4_Score','A5_Score',
    'A6_Score','A7_Score','A8_Score','A9_Score','A10_Score',
    'age', 'result'
]

X_COLUMNS_ORDER = [
    'A1_Score','A2_Score','A3_Score','A4_Score','A5_Score',
    'A6_Score','A7_Score','A8_Score','A9_Score','A10_Score',
    'age',
    'gender', 'ethnicity', 'jaundice', 'autism',
    'Country_of_res', 'used_app_before',
    'result', 'relation'
]

@app.route('/')
def home():
    return "Autism Prediction API is running!"

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        df = pd.DataFrame([data])

        # Encode categorical
        for col in cat_cols:
            le = encoders[col]
            if df[col][0] not in le.classes_:
                df[col][0] = le.classes_[0]  # fallback
            df[col] = le.transform(df[col])

        # Fix order
        df = df[X_COLUMNS_ORDER]

        # ======= DEBUG PRINTS =======
        print("\n========== DEBUG: INPUT TO MODEL ==========")
        print("DF:\n", df)
        print("\nDTYPES:\n", df.dtypes)
        print("\nSHAPE:\n", df.shape)
        print("\nAny NaNs:\n", df.isna().sum())
        print("===========================================\n")
        # ============================

        # Prediction
        prediction = int(model.predict(df)[0])
        proba = model.predict_proba(df)
        probability = float(np.max(proba)) * 100
        if np.isnan(probability):
            probability = 0.0

        return jsonify({
            "prediction": prediction,
            "probability": round(probability, 2)
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
