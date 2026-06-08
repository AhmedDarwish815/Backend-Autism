import os
import uuid
import base64
from pathlib import Path
from flask import Flask, request, jsonify, send_from_directory
from dotenv import load_dotenv

import google.generativeai as genai
from groq import Groq

# ─── LOAD ENV ──────────────────────────────────────────────────────────────────
env_path = Path(__file__).parent.parent / "backend" / ".env"
load_dotenv(dotenv_path=env_path)

# ─── CONFIG ────────────────────────────────────────────────────────────────────
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "YOUR_GEMINI_API_KEY_HERE")
GROQ_API_KEY = os.getenv(
    "GROQ_API_KEY", "YOUR_GROQ_API_KEY_HERE"
)  # for Whisper STT only

genai.configure(api_key=GEMINI_API_KEY)
groq_client = Groq(api_key=GROQ_API_KEY)

# ─── AUTISM SYSTEM PROMPT ──────────────────────────────────────────────────────
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

# ─── FLASK APP ─────────────────────────────────────────────────────────────────
app = Flask(__name__, static_folder="static")

# In-memory conversation history per session
sessions = {}


def get_gemini_response(user_message: str, session_id: str, lang: str = "en") -> str:
    """Get response from Gemini with autism-focused system prompt."""

    if session_id not in sessions:
        sessions[session_id] = []

    history = sessions[session_id]
    system_prompt = SYSTEM_PROMPT_AR if lang == "ar" else SYSTEM_PROMPT_EN

    # Build conversation for Gemini
    model = genai.GenerativeModel(
        model_name="gemini-2.5-flash", system_instruction=system_prompt
    )

    chat = model.start_chat(history=history)
    response = chat.send_message(user_message)
    reply = response.text

    # Save to history (Gemini format)
    history.append({"role": "user", "parts": [user_message]})
    history.append({"role": "model", "parts": [reply]})

    # Keep last 20 turns to avoid token overflow
    if len(history) > 40:
        sessions[session_id] = history[-40:]

    return reply


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
    """Convert text to speech using Groq, return base64 encoded audio."""
    try:
        # Select model and voice based on language
        if lang == "ar":
            model = "canopylabs/orpheus-arabic-saudi"
            voice = "abdullah"  # Arabic voice
        else:
            model = "canopylabs/orpheus-english"
            voice = "male_1"  # English voice

        # Call Groq TTS API
        response = groq_client.audio.speech.create(
            model=model,
            voice=voice,
            response_format="wav",
            input=text,
        )

        # Save to speech.wav file
        speech_file_path = Path(__file__).parent / "speech.wav"
        with open(speech_file_path, "wb") as f:
            f.write(response.content)

        # Read and encode to base64
        with open(speech_file_path, "rb") as f:
            audio_b64 = base64.b64encode(f.read()).decode("utf-8")

        return audio_b64
    except Exception as e:
        raise Exception(f"Text-to-speech error: {str(e)}")


# ─── ROUTES ────────────────────────────────────────────────────────────────────


@app.after_request
def add_cors(response):
    """Add CORS headers manually (no flask-cors needed)."""
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response


@app.route("/", methods=["GET"])
def index():
    """Serve test UI."""
    return send_from_directory("static", "index.html")


@app.route("/api/chat", methods=["POST", "OPTIONS"])
def chat():
    """
    Text chat endpoint.
    Body: { "message": str, "session_id": str (optional), "lang": "en"|"ar" }
    Returns: { "reply": str, "session_id": str }
    """
    if request.method == "OPTIONS":
        return jsonify({}), 200

    data = request.get_json()
    message = data.get("message", "").strip()
    session_id = data.get("session_id") or str(uuid.uuid4())
    lang = data.get("lang", "en")

    if not message:
        return jsonify({"error": "Empty message"}), 400

    reply = get_gemini_response(message, session_id, lang)

    return jsonify({"reply": reply, "session_id": session_id})


@app.route("/api/voice", methods=["POST", "OPTIONS"])
def voice():
    """
    Voice input endpoint.
    Body: { "audio": base64_audio, "session_id": str, "lang": "en"|"ar" }
    Returns: { "transcript": str, "reply": str, "session_id": str }
    """
    if request.method == "OPTIONS":
        return jsonify({}), 200

    data = request.get_json()
    audio_b64 = data.get("audio", "")
    session_id = data.get("session_id") or str(uuid.uuid4())
    lang = data.get("lang", "en")

    if not audio_b64:
        return jsonify({"error": "No audio provided"}), 400

    try:
        audio_bytes = base64.b64decode(audio_b64)
        transcript = transcribe_audio(audio_bytes, lang)
        reply = get_gemini_response(transcript, session_id, lang)
        audio_response = text_to_speech(reply, lang)

        return jsonify(
            {
                "transcript": transcript,
                "reply": reply,
                "audio": audio_response,
                "session_id": session_id,
            }
        )
    except Exception as e:
        error_msg = str(e)
        if "insufficient_quota" in error_msg or "rate_limit" in error_msg:
            return (
                jsonify({"error": "Groq quota exceeded. Please check your billing."}),
                402,
            )
        return jsonify({"error": f"Voice processing failed: {error_msg}"}), 500


@app.route("/api/reset", methods=["POST"])
def reset():
    """Clear conversation history for a session."""
    session_id = request.get_json().get("session_id", "")
    if session_id in sessions:
        del sessions[session_id]
    return jsonify({"status": "cleared"})


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "Autimate Chatbot API"})


# ─── RUN ───────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
