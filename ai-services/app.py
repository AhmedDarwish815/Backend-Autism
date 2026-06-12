import os
import uuid
import base64
import pickle
import pandas as pd
import numpy as np
from pathlib import Path
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from sklearn.preprocessing import LabelEncoder
from dotenv import load_dotenv

import re
import google.generativeai as genai
from groq import Groq

# ─── LOAD ENV ──────────────────────────────────────────────────────────────────
env_path = Path(__file__).parent.parent / "backend" / ".env"
load_dotenv(dotenv_path=env_path)

# ─── CONFIG ────────────────────────────────────────────────────────────────────
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "YOUR_GEMINI_API_KEY_HERE")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "YOUR_GROQ_API_KEY_HERE")

genai.configure(api_key=GEMINI_API_KEY)
groq_client = Groq(api_key=GROQ_API_KEY)

# ─── FLASK APP ─────────────────────────────────────────────────────────────────
app = Flask(__name__, static_folder="static")
CORS(app)

BASE_DIR = os.path.dirname(__file__)

# ─── 1. SURVEY AI MODEL SETUP ──────────────────────────────────────────────────
model_path = os.path.join(BASE_DIR, 'models', 'random_forest_model.pkl')
model = None
if os.path.exists(model_path):
    with open(model_path, 'rb') as f:
        model = pickle.load(f)

encoders = {}

def prepare_encoders():
    csv_path = os.path.join(BASE_DIR, 'data', 'Autism_data.csv')
    if not os.path.exists(csv_path):
        print("Warning: Autism_data.csv not found. Prediction API may fail.")
        return
        
    data = pd.read_csv(csv_path)
    data = data[data['age'] != 'age']
    data['age'] = data['age'].apply(lambda x: int(float(x)) if pd.notna(x) else 0)
    data = data.rename(columns={'austim':'autism', 'contry_of_res':'Country_of_res'})
    data = data.drop(columns=['age_desc','ID'], errors='ignore')
    data['ethnicity'] = data['ethnicity'].replace('?', data['ethnicity'].mode()[0])
    data['ethnicity'] = data['ethnicity'].replace('others','Others')
    data['relation'] = data['relation'].replace('?', data['relation'].mode()[0])
    
    mapping = {'Viet Nam':'Vietnam', 'AmericanSamoa':'United States', 'Hong Kong': 'China'}
    data['Country_of_res'] = data['Country_of_res'].replace(mapping)
    
    categorical_columns = data.select_dtypes(include=['object']).columns
    for col in categorical_columns:
        le = LabelEncoder()
        le.fit(data[col])
        encoders[col] = le

prepare_encoders()

cat_cols = ['gender', 'ethnicity', 'jaundice', 'autism', 'Country_of_res', 'used_app_before', 'relation']
X_COLUMNS_ORDER = [
    'A1_Score','A2_Score','A3_Score','A4_Score','A5_Score',
    'A6_Score','A7_Score','A8_Score','A9_Score','A10_Score',
    'age', 'gender', 'ethnicity', 'jaundice', 'autism',
    'Country_of_res', 'used_app_before', 'result', 'relation'
]

def safe_transform(le, value):
    try:
        return le.transform([value])[0]
    except:
        return 0

# ─── 2. CHATBOT AI SETUP ───────────────────────────────────────────────────────

SYSTEM_PROMPT = """
You are Autimate, a compassionate and specialized AI assistant designed specifically 
to support individuals with Autism Spectrum Disorder (ASD), their caregivers, 
and family members.

Your core guidelines:
- Use SIMPLE, CLEAR, and SHORT sentences. Avoid complex language.
- Be PATIENT, CALM, and POSITIVE in every response.
- Avoid sarcasm, idioms, or figurative language that may confuse autistic individuals.
- If the user seems distressed, respond with empathy and reassurance first.
- Focus on practical, concrete advice when asked about autism-related topics.
- Topics you specialize in: daily routines, sensory sensitivities, social communication,
  behavioral strategies, caregiver support, emotional regulation, and ASD education.
- Always encourage and validate the user's feelings.
- Keep responses concise — ideally 2 to 4 short sentences unless more detail is needed.

CRITICAL INSTRUCTION FOR LANGUAGE:
- You MUST reply in the exact same language as the user's message.
- If the user writes or speaks in Arabic, you MUST reply entirely in Arabic.
- If the user writes or speaks in English, you MUST reply entirely in English.
- Do not mix languages unless explicitly asked.
"""

def detect_language(text: str) -> str:
    """Returns 'ar' if the text contains Arabic characters, else 'en'."""
    if re.search("[\u0600-\u06FF]", text):
        return "ar"
    return "en"

def get_gemini_response(user_message: str, history: list, lang: str = "en") -> str:
    try:
        model = genai.GenerativeModel(
            model_name="gemini-2.5-flash", system_instruction=SYSTEM_PROMPT
        )

        # Sanitize history: Gemini strictly requires alternating roles starting with 'user'
        clean_history = []
        expected_role = "user"
        for msg in history:
            if msg.get("role") == expected_role:
                clean_history.append(msg)
                expected_role = "model" if expected_role == "user" else "user"
                
        # If the last message in history is 'user', drop it because the NEXT message being sent is also 'user'
        if clean_history and clean_history[-1].get("role") == "user":
            clean_history.pop()

        chat = model.start_chat(history=clean_history)
        response = chat.send_message(user_message)
        return response.text
    except Exception as e:
        print(f"Gemini Error: {str(e)}")
        if lang == "ar":
            return "عذراً، أواجه مشكلة تقنية حالياً في معالجة طلبك. هل يمكنك المحاولة مرة أخرى لاحقاً؟"
        return "Sorry, I am facing a technical issue right now. Can you try again later?"


def transcribe_audio(audio_bytes: bytes, lang="en"):
    try:
        if not audio_bytes or len(audio_bytes) < 100:
            return "عذراً، لم أتمكن من سماع شيء. يرجى التحدث مرة أخرى."

        transcription = groq_client.audio.transcriptions.create(
            file=("audio.m4a", audio_bytes),
            model="whisper-large-v3",
            prompt="يرجى كتابة النص المسموع بدقة. إذا كان الصوت صامتاً أو مجرد ضجيج، لا تكتب أي شيء.",
            temperature=0,
            response_format="verbose_json"
        )
        
        # Safely parse whether it's a dict or an object
        if isinstance(transcription, dict):
            text = transcription.get("text", "").strip()
            segments = transcription.get("segments", [])
        else:
            text = getattr(transcription, "text", "").strip()
            segments = getattr(transcription, "segments", [])
        
        # 1. Check no_speech_prob to detect pure silence/noise
        is_silent = False
        if segments:
            probs = [s.get("no_speech_prob", 0) if isinstance(s, dict) else getattr(s, "no_speech_prob", 0) for s in segments]
            if probs and (sum(probs) / len(probs)) > 0.6:
                is_silent = True

        # 2. Exact match fallback for common hallucinations
        import re
        clean_text = re.sub(r'[^\w\s]', '', text.lower()).strip()
        known_hallucinations = {
            "nancy qanqour", "نانسي قنقر", "amaraorg", "thanks for watching",
            "thank you for watching", "شكرا على المشاهدة", "اشترك في القناة", 
            "subscribe to the channel", "شكرا"
        }
        
        if is_silent or not text or clean_text in known_hallucinations:
            return "عذراً، الصوت غير واضح أو يحتوي على ضجيج. هل يمكنك التحدث بوضوح وتكرار ما قلته؟"
            
        return text
    except Exception as e:
        error_msg = str(e).lower()
        if "too short" in error_msg or "minimum audio length" in error_msg:
            return "عذراً، الرسالة الصوتية قصيرة جداً أو تالفة. هل يمكنك تكرارها؟"
        raise Exception(f"Groq Error: {str(e)}")


def text_to_speech(text: str, lang: str = "en") -> str:
    try:
        detected_lang = detect_language(text)
        if detected_lang == "ar":
            model_name = "canopylabs/orpheus-arabic-saudi"
            voice = "abdullah"
        else:
            model_name = "canopylabs/orpheus-english"
            voice = "male_1"

        response = groq_client.audio.speech.create(
            model=model_name,
            voice=voice,
            response_format="wav",
            input=text,
        )

        audio_data = bytearray(response.read())

        # Fix the WAV header if it contains 0xFFFFFFFF for chunk sizes (streaming artifact)
        import struct
        if len(audio_data) >= 44 and audio_data[0:4] == b"RIFF":
            # Fix RIFF chunk size
            audio_data[4:8] = struct.pack('<I', len(audio_data) - 8)
            
            # Find and fix the 'data' chunk size
            offset = 12
            while offset < len(audio_data) - 8:
                chunk_id = audio_data[offset:offset+4]
                chunk_size = struct.unpack('<I', audio_data[offset+4:offset+8])[0]
                if chunk_id == b'data':
                    if chunk_size == 0xFFFFFFFF:
                        data_chunk_size = len(audio_data) - offset - 8
                        audio_data[offset+4:offset+8] = struct.pack('<I', data_chunk_size)
                    break
                if chunk_size == 0xFFFFFFFF:
                    break
                offset += 8 + chunk_size

        # Encode directly to base64 in memory without writing to disk
        audio_b64 = base64.b64encode(audio_data).decode("utf-8")

        return audio_b64
    except Exception as e:
        raise Exception(f"Text-to-speech error: {str(e)}")


# ─── ROUTES ────────────────────────────────────────────────────────────────────

@app.route('/')
def home():
    return jsonify({"status": "ok", "service": "Unified AI API Running!"})

@app.route('/predict', methods=['POST'])
def predict():
    try:
        if model is None:
            return jsonify({"error": "Model not loaded"}), 500

        data = request.json
        df = pd.DataFrame([data])

        if 'ethnicity' in df.columns and df['ethnicity'].iloc[0] == "?":
            df['ethnicity'] = "White-European"
        if 'Country_of_res' in df.columns and df['Country_of_res'].iloc[0] == "Others":
            df['Country_of_res'] = "United States"
        if 'relation' in df.columns and df['relation'].iloc[0] == "?":
            df['relation'] = "Self"

        for col in cat_cols:
            if col in encoders and col in df.columns:
                df[col] = df[col].apply(lambda x: safe_transform(encoders[col], x))

        for col in X_COLUMNS_ORDER:
            if col not in df.columns:
                df[col] = 0
        df = df[X_COLUMNS_ORDER]

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
        return jsonify({"error": str(e)}), 500


@app.route("/api/chat", methods=["POST", "OPTIONS"])
def chat():
    if request.method == "OPTIONS":
        return jsonify({}), 200

    data = request.get_json()
    message = data.get("message", "").strip()
    session_id = data.get("session_id") or str(uuid.uuid4())
    lang = data.get("lang", "en")
    history = data.get("history", [])

    if not message:
        return jsonify({"error": "Empty message"}), 400

    reply = get_gemini_response(message, history, lang)
    return jsonify({"reply": reply, "session_id": session_id})


@app.route("/api/voice", methods=["POST", "OPTIONS"])
def voice():
    if request.method == "OPTIONS":
        return jsonify({}), 200

    import json
    audio_file = request.files.get("audio")
    audio_bytes = None

    if audio_file:
        audio_bytes = audio_file.read()
    else:
        # Fallback for json base64
        data = request.get_json(silent=True) or {}
        audio_b64 = data.get("audio", "")
        if audio_b64:
            audio_bytes = base64.b64decode(audio_b64)

    if not audio_bytes:
        return jsonify({"error": "No audio provided"}), 400

    session_id = request.form.get("session_id") or (request.json.get("session_id") if request.is_json else str(uuid.uuid4()))
    lang = request.form.get("lang", "en")
    history_str = request.form.get("history", "[]")

    try:
        history = json.loads(history_str)
    except:
        history = []

    try:
        transcript = transcribe_audio(audio_bytes, lang)
        reply = get_gemini_response(transcript, history, lang)
        audio_response = text_to_speech(reply, lang)

        return jsonify({
            "transcript": transcript,
            "reply": reply,
            "audio": audio_response,
            "session_id": session_id,
        })
    except Exception as e:
        error_msg = str(e)
        if "insufficient_quota" in error_msg or "rate_limit" in error_msg:
            return jsonify({"error": "Groq quota exceeded. Please check your billing."}), 402
        return jsonify({"error": f"Voice processing failed: {error_msg}"}), 500


@app.route("/api/reset", methods=["POST"])
def reset():
    return jsonify({"status": "cleared, no memory stored anymore"})


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "Unified AI API"})


# ─── RUN ───────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
