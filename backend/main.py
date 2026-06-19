"""
🚀 my'chat API - Chatbot IA multilingue avec Claude
Version 3.1 - Railway-ready
"""

import json
import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

load_dotenv()

# Base directory — works both locally and inside a Docker container
BASE_DIR = Path(__file__).parent.parent

# ============================================================
# MODELS
# ============================================================

class MessageRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=5000)
    langue: str = Field(default="fr", pattern="^(fr|en|de|es|he)$")
    personnalite: str = Field(default="mychat", pattern="^(mychat|ami|prof|cuisinier|coach|conteur)$")

class MessageResponse(BaseModel):
    reponse: str

class HealthResponse(BaseModel):
    status: str
    claude_available: bool
    message: str

class ConfigResponse(BaseModel):
    app_name: str
    version: str
    langues: list
    claude_enabled: bool

# ============================================================
# APP
# ============================================================

app = FastAPI(
    title="my'chat API",
    description="Chatbot IA multilingue avec Claude",
    version="3.1.0",
)

# CORS — origins read from env so Railway URL can be injected at deploy time
# Example: ALLOWED_ORIGINS=["https://mychat.up.railway.app"]
_raw_origins = os.getenv(
    "ALLOWED_ORIGINS",
    '["http://localhost:8000","http://localhost:3000","http://127.0.0.1:8000"]'
)
try:
    ALLOWED_ORIGINS = json.loads(_raw_origins)
except json.JSONDecodeError:
    ALLOWED_ORIGINS = ["http://localhost:8000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

# Serve all frontend assets (CSS, JS, images) under /static
app.mount(
    "/static",
    StaticFiles(directory=str(BASE_DIR / "frontend")),
    name="static",
)

# ============================================================
# CLAUDE
# ============================================================

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
claude_client = None
use_claude = False

print("\n" + "=" * 60)
print("🚀 my'chat API v3.1")
print("=" * 60)

if ANTHROPIC_API_KEY and ANTHROPIC_API_KEY != "YOUR_API_KEY_HERE":
    try:
        from anthropic import Anthropic
        claude_client = Anthropic(api_key=ANTHROPIC_API_KEY)
        use_claude = True
        print("✅ Claude API connectée")
    except ImportError:
        print("⚠️  Module 'anthropic' non installé — pip install anthropic")
    except Exception as e:
        print(f"❌ Erreur Claude: {e}")
else:
    print("⚠️  ANTHROPIC_API_KEY manquante — mode fallback activé")

print("=" * 60 + "\n")

# ============================================================
# SYSTEM PROMPTS
# ============================================================

SYSTEM_PROMPTS: dict[str, dict[str, str]] = {
    "mychat": {
        "fr": "Tu es my'chat, un assistant IA amical créé par une collégienne passionnée de codage. Tu es polyvalent, curieux et bienveillant. Tu utilises des emojis pertinents.",
        "en": "You are my'chat, a friendly AI assistant created by a young passionate coder. You are versatile, curious and kind. You use relevant emojis.",
        "de": "Du bist my'chat, ein freundlicher KI-Assistent, erstellt von einer jungen leidenschaftlichen Programmiererin. Du bist vielseitig, neugierig und gütig. Du verwendest relevante Emojis.",
        "es": "Eres my'chat, un asistente de IA amable creado por una joven apasionada por la programación. Eres versátil, curioso y amable. Usas emojis relevantes.",
        "he": "אתה my'chat, עוזר AI ידידותי שנוצר על ידי מתכנתת צעירה. אתה רב-תכליתי, סקרן וחמוד. אתה משתמש באימוג'ים רלוונטיים.",
    },
    "ami": {
        "fr": "Tu es l'Ami, un chatbot sympa et décontracté. Tu discutes, crées des plans amusants et donnes des conseils bienveillants. Tu parles de manière naturelle avec des emojis.",
        "en": "You are the Friend, a cool laid-back chatbot. You chat, create fun plans and give kind advice. You speak naturally with emojis.",
        "de": "Du bist der Freund, ein cooler entspannter Chatbot. Du chattest, erstellst lustige Pläne und gibst freundliche Ratschläge. Du sprichst natürlich mit Emojis.",
        "es": "Eres el Amigo, un chatbot genial y relajado. Charlas, creas planes divertidos y das consejos amables. Hablas de forma natural con emojis.",
        "he": "אתה החבר, צ'טבוט מגניב ורגוע. אתה משוחח, יוצר תוכניות כיפיות ונותן עצות חמות. אתה מדבר בצורה טבעית עם אימוג'ים.",
    },
    "prof": {
        "fr": "Tu es Le Prof, un assistant pédagogique compétent et bienveillant. Tu couvres toutes les matières scolaires et expliques clairement. Tu es patient et encourageant.",
        "en": "You are the Teacher, a competent and kind educational assistant. You cover all school subjects and explain clearly. You are patient and encouraging.",
        "de": "Du bist der Lehrer, ein kompetenter und freundlicher pädagogischer Assistent. Du deckst alle Schulfächer ab und erklärst klar. Du bist geduldig und ermutigend.",
        "es": "Eres el Profesor, un asistente educativo competente y amable. Cubres todas las materias y explicas claramente. Eres paciente y animador.",
        "he": "אתה המורה, עוזר חינוכי כשיר וחמוד. אתה מכסה את כל הנושאים ומסביר בבירור. אתה סבלני ומעודד.",
    },
    "cuisinier": {
        "fr": "Tu es Le Cuisinier, un chef passionné et chaleureux. Tu partages des recettes délicieuses, des techniques culinaires et des astuces de cuisine. Tu t'adaptes au niveau de l'utilisateur. Tu utilises des emojis alimentaires 🍳🥘🍰.",
        "en": "You are The Chef, a passionate and warm cook. You share delicious recipes, culinary techniques and kitchen tips. You adapt to the user's level. You use food emojis 🍳🥘🍰.",
        "de": "Du bist Der Koch, ein leidenschaftlicher Chefkoch. Du teilst Rezepte und Kochtipps. Du verwendest Essen-Emojis 🍳🥘🍰.",
        "es": "Eres El Cocinero, un chef apasionado. Compartes recetas y técnicas culinarias. Usas emojis de comida 🍳🥘🍰.",
        "he": "אתה הטבח, שף נלהב וחמים. אתה משתף מתכונים וטיפים למטבח. אתה משתמש באימוג'י אוכל 🍳🥘🍰.",
    },
    "coach": {
        "fr": "Tu es Le Coach sportif, un entraîneur motivant et bienveillant. Tu crées des plans d'entraînement personnalisés et donnes des conseils nutrition et motivation. Tu es énergique et positif. Tu utilises des emojis sportifs 💪🏃‍♂️🎯.",
        "en": "You are The Sports Coach, a motivating and caring trainer. You create personalised training plans and give nutrition and motivation advice. You are energetic and positive. You use sports emojis 💪🏃‍♂️🎯.",
        "de": "Du bist Der Sportcoach, ein motivierender Trainer. Du erstellst Trainingspläne und gibst Ernährungsratschläge. Du verwendest Sport-Emojis 💪🏃‍♂️🎯.",
        "es": "Eres El Coach deportivo, un entrenador motivador. Creas planes de entrenamiento y das consejos. Usas emojis deportivos 💪🏃‍♂️🎯.",
        "he": "אתה המאמן הספורטיבי, מדריך מניע. אתה יוצר תוכניות אימון ונותן עצות. אתה משתמש באימוג'י ספורט 💪🏃‍♂️🎯.",
    },
    "conteur": {
        "fr": "Tu es Le Conteur, un maître des histoires et de l'imagination. Tu inventes des contes, aventures et histoires captivantes. Tu as un style narratif riche et plein de suspense. Tu utilises des emojis narratifs ✨📖🌟🐉.",
        "en": "You are The Storyteller, a master of stories and imagination. You invent tales, adventures and captivating stories. You have a rich narrative style full of suspense. You use narrative emojis ✨📖🌟🐉.",
        "de": "Du bist Der Geschichtenerzähler. Du erfindest Märchen und Abenteuer. Du verwendest narrative Emojis ✨📖🌟🐉.",
        "es": "Eres El Narrador, un maestro de las historias. Inventas cuentos y aventuras. Usas emojis narrativos ✨📖🌟🐉.",
        "he": "אתה המספר, אמן הסיפורים. אתה ממציא אגדות והרפתקאות. אתה משתמש באימוג'י נרטיביים ✨📖🌟🐉.",
    },
}

# ============================================================
# LOCAL KNOWLEDGE FALLBACK
# ============================================================

LOCAL_KNOWLEDGE: dict[str, dict[str, dict]] = {
    "fr": {
        "hello":    {"keywords": ["bonjour", "salut", "coucou", "hello"], "response": "Salut ! Comment puis-je t'aider ? 😊"},
        "identity": {"keywords": ["qui es-tu", "ton nom", "tu es qui"],   "response": "Je suis my'chat, un chatbot IA ! 🤖"},
        "thanks":   {"keywords": ["merci"],                                "response": "Avec plaisir ! 🙌"},
        "help":     {"keywords": ["aide", "help"],                         "response": "Pose-moi n'importe quelle question 😊"},
    },
    "en": {
        "hello":    {"keywords": ["hello", "hi", "hey"],                  "response": "Hi! How can I help? 😊"},
        "identity": {"keywords": ["who are you", "your name"],             "response": "I'm my'chat, an AI chatbot! 🤖"},
        "thanks":   {"keywords": ["thanks", "thank you"],                  "response": "You're welcome! 🙌"},
        "help":     {"keywords": ["help"],                                 "response": "Ask me anything 😊"},
    },
    "de": {
        "hello":    {"keywords": ["hallo", "hi", "hey"],                  "response": "Hallo! Wie kann ich helfen? 😊"},
        "identity": {"keywords": ["wer bist du", "dein name"],             "response": "Ich bin my'chat, ein KI-Chatbot! 🤖"},
        "thanks":   {"keywords": ["danke"],                                "response": "Gerne! 🙌"},
        "help":     {"keywords": ["hilfe"],                                "response": "Frag mich alles 😊"},
    },
    "es": {
        "hello":    {"keywords": ["hola", "hi"],                          "response": "¡Hola! ¿Cómo puedo ayudarte? 😊"},
        "identity": {"keywords": ["quien eres", "tu nombre"],              "response": "¡Soy my'chat, un chatbot IA! 🤖"},
        "thanks":   {"keywords": ["gracias"],                              "response": "¡De nada! 🙌"},
        "help":     {"keywords": ["ayuda"],                                "response": "Pregúntame lo que quieras 😊"},
    },
    "he": {
        "hello":    {"keywords": ["שלום", "היי"],                         "response": "שלום! איך אני יכול לעזור? 😊"},
        "identity": {"keywords": ["מי אתה", "מה שמך"],                   "response": "אני my'chat, צ'טבוט AI! 🤖"},
        "thanks":   {"keywords": ["תודה"],                                "response": "בברכה! 🙌"},
        "help":     {"keywords": ["עזרה"],                                "response": "שאל אותי הכל 😊"},
    },
}

# ============================================================
# BUSINESS LOGIC
# ============================================================

def get_system_prompt(personality: str, language: str) -> str:
    return SYSTEM_PROMPTS.get(personality, SYSTEM_PROMPTS["mychat"]).get(
        language, SYSTEM_PROMPTS["mychat"]["fr"]
    )

def call_claude(message: str, language: str, personality: str) -> str | None:
    if not use_claude or not claude_client:
        return None
    try:
        response = claude_client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=500,
            system=get_system_prompt(personality, language),
            messages=[{"role": "user", "content": message}],
        )
        return response.content[0].text
    except Exception as e:
        print(f"❌ Erreur Claude: {e}")
        return None

def search_local_knowledge(message: str, language: str) -> str | None:
    kb = LOCAL_KNOWLEDGE.get(language, LOCAL_KNOWLEDGE["fr"])
    msg = message.lower().strip()
    for entry in kb.values():
        if any(kw in msg for kw in entry["keywords"]):
            return entry["response"]
    return None

def process_message(message: str, language: str, personality: str) -> str:
    response = call_claude(message, language, personality)
    if response:
        return response

    response = search_local_knowledge(message, language)
    if response:
        return response

    defaults = {
        "fr": "Je n'ai pas bien compris 🤔 Peux-tu reformuler ?",
        "en": "I didn't understand 🤔 Can you rephrase?",
        "de": "Ich habe nicht verstanden 🤔",
        "es": "No entendí 🤔",
        "he": "לא הבנתי 🤔",
    }
    return defaults.get(language, defaults["fr"])

# ============================================================
# ENDPOINTS
# ============================================================

@app.get("/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(status="ok", claude_available=use_claude, message="Server is running ✅")

@app.get("/api/config", response_model=ConfigResponse)
async def get_config():
    return ConfigResponse(
        app_name="my'chat",
        version="3.1.0",
        langues=["fr", "en", "de", "es", "he"],
        claude_enabled=use_claude,
    )

@app.post("/api/chat", response_model=MessageResponse)
async def chat(request: MessageRequest) -> MessageResponse:
    try:
        reponse = process_message(request.message, request.langue, request.personnalite)
        return MessageResponse(reponse=reponse)
    except Exception as e:
        print(f"❌ Erreur: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/", response_class=FileResponse)
async def serve_landing():
    path = BASE_DIR / "landing.html"
    if not path.exists():
        raise HTTPException(status_code=404, detail="Landing page not found")
    return FileResponse(str(path), media_type="text/html")

@app.get("/chatbot", response_class=FileResponse)
async def serve_chatbot():
    path = BASE_DIR / "frontend" / "index.html"
    if not path.exists():
        raise HTTPException(status_code=404, detail="Chatbot not found")
    return FileResponse(str(path), media_type="text/html")

# ============================================================
# ENTRYPOINT
# ============================================================

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
