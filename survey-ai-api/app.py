from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder
import os

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(__file__)

# Load model
model_path = os.path.join(BASE_DIR, 'random_forest_model.pkl')
with open(model_path, 'rb') as f:
    model = pickle.load(f)

# Global variable to store encoders
encoders = {}

def prepare_encoders():
    csv_path = os.path.join(BASE_DIR, 'Autism_data.csv')
    data = pd.read_csv(csv_path)
    
    # Remove duplicate header rows
    data = data[data['age'] != 'age']
    
    # Basic preprocessing matched from streamlit code
    data['age'] = data['age'].apply(lambda x: int(float(x)) if pd.notna(x) else 0)
    data = data.rename(columns={'austim':'autism', 'contry_of_res':'Country_of_res'})
    data = data.drop(columns=['age_desc','ID'], errors='ignore')
    data['ethnicity'] = data['ethnicity'].replace('?', data['ethnicity'].mode()[0])
    data['ethnicity'] = data['ethnicity'].replace('others','Others')
    data['relation'] = data['relation'].replace('?', data['relation'].mode()[0])
    
    mapping = {'Viet Nam':'Vietnam', 'AmericanSamoa':'United States', 'Hong Kong': 'China'}
    data['Country_of_res'] = data['Country_of_res'].replace(mapping)
    
    # Create encoders
    categorical_columns = data.select_dtypes(include=['object']).columns
    
    for col in categorical_columns:
        le = LabelEncoder()
        le.fit(data[col])
        encoders[col] = le

# Prepare encoders on startup
prepare_encoders()

cat_cols = [
    'gender', 'ethnicity', 'jaundice',
    'autism', 'Country_of_res',
    'used_app_before', 'relation'
]

X_COLUMNS_ORDER = [
    'A1_Score','A2_Score','A3_Score','A4_Score','A5_Score',
    'A6_Score','A7_Score','A8_Score','A9_Score','A10_Score',
    'age',
    'gender', 'ethnicity', 'jaundice', 'autism',
    'Country_of_res', 'used_app_before',
    'result', 'relation'
]

def safe_transform(le, value):
    try:
        return le.transform([value])[0]
    except:
        return 0

@app.route('/')
def home():
    return "Survey AI Model API is running!"

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        df = pd.DataFrame([data])

        # Handle mapped values identical to streamlit code defaults
        if 'ethnicity' in df.columns and df['ethnicity'].iloc[0] == "?":
            df['ethnicity'] = "White-European"
        if 'Country_of_res' in df.columns and df['Country_of_res'].iloc[0] == "Others":
            df['Country_of_res'] = "United States"
        if 'relation' in df.columns and df['relation'].iloc[0] == "?":
            df['relation'] = "Self"

        # Encode categorical variables
        for col in cat_cols:
            if col in encoders and col in df.columns:
                df[col] = df[col].apply(lambda x: safe_transform(encoders[col], x))

        # Fix column order dynamically to ensure match
        for col in X_COLUMNS_ORDER:
            if col not in df.columns:
                df[col] = 0
        df = df[X_COLUMNS_ORDER]

        print("\n========== DEBUG: INPUT TO MODEL ==========")
        print("DF:\n", df)
        print("\nDTYPES:\n", df.dtypes)
        print("\nAny NaNs:\n", df.isna().sum())
        print("===========================================\n")

        # Make prediction
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
