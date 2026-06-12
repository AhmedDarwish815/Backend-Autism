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

SYSTEM_PROMPT_EN = """
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
- If the user writes in Arabic, respond in Arabic with the same guidelines.
"""

SYSTEM_PROMPT_AR = """
أنت "أوتيمت"، مساعد ذكاء اصطناعي متخصص ومتعاطف، مصمم خصيصاً لدعم 
الأفراد المصابين باضطراب طيف التوحد (ASD) ومقدمي الرعاية وأفراد الأسرة.

إرشاداتك الأساسية:
- استخدم جملاً بسيطة وواضحة وقصيرة. تجنب اللغة المعقدة.
- كن صبوراً وهادئاً وإيجابياً في كل رد.
- تجنب السخرية أو التعابير المجازية التي قد تربك الأفراد المصابين بالتوحد.
- إذا بدا المستخدم في ضيق، استجب بالتعاطف والطمأنينة أولاً.
- ركز على النصائح العملية والملموسة عند السؤال عن موضوعات التوحد.
- تخصصاتك: الروتين اليومي، الحساسيات الحسية، التواصل الاجتماعي، 
  استراتيجيات السلوك، دعم مقدم الرعاية، التنظيم العاطفي، والتعليم حول ASD.
- شجع المستخدم دائماً واعترف بمشاعره.
- اجعل الردود موجزة — من جملتين إلى أربع جمل قصيرة ما لم يكن هناك حاجة لمزيد من التفاصيل.
"""

def get_gemini_response(user_message: str, history: list, lang: str = "en") -> str:
    system_prompt = SYSTEM_PROMPT_AR if lang == "ar" else SYSTEM_PROMPT_EN

    model = genai.GenerativeModel(
        model_name="gemini-2.5-flash", system_instruction=system_prompt
    )

    chat = model.start_chat(history=history)
    response = chat.send_message(user_message)
    return response.text


def transcribe_audio(audio_bytes: bytes, lang="en"):
    try:
        transcription = groq_client.audio.transcriptions.create(
            file=("audio.m4a", audio_bytes),
            model="whisper-large-v3",
            temperature=0,
            response_format="verbose_json",
            language="ar" if lang == "ar" else "en",
        )
        return transcription.text
    except Exception as e:
        raise Exception(f"Groq Error: {str(e)}")


def text_to_speech(text: str, lang: str = "en") -> str:
    try:
        if lang == "ar":
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

        speech_file_path = Path(__file__).parent / "speech.wav"
        with open(speech_file_path, "wb") as f:
            f.write(audio_data)

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
