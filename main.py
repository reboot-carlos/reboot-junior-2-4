"""
API FastAPI pour my'chat - Chatbot multilingue avec Claude
Version 3.0 - Connexion Claude optimisée
"""

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv

# ============================================================
# Configuration
# ============================================================
load_dotenv()

app = FastAPI(
    title="my'chat - API with Claude",
    version="3.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# Modèles Pydantic
# ============================================================
class MessageRequest(BaseModel):
    message: str
    langue: str = "fr"
    personnalite: str = "mychat"

class MessageResponse(BaseModel):
    reponse: str

# ============================================================
# Initialisation Claude
# ============================================================
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
claude_client = None
use_claude = False

print("\n" + "="*60)
print("🚀 Initialisation my'chat API")
print("="*60)

if ANTHROPIC_API_KEY:
    try:
        from anthropic import Anthropic
        claude_client = Anthropic(api_key=ANTHROPIC_API_KEY)
        use_claude = True
        print("✅ Claude API connectée avec succès!")
        print(f"   Clé API: {ANTHROPIC_API_KEY[:10]}...{ANTHROPIC_API_KEY[-4:]}")
        print(f"   Modèle: claude-opus-4-8")
    except ImportError:
        print("⚠️  Module 'anthropic' non installé")
        print("   Commande: pip install anthropic")
    except Exception as e:
        print(f"❌ Erreur connexion Claude: {e}")
        use_claude = False
else:
    print("⚠️  ANTHROPIC_API_KEY non trouvée dans .env")
    print("   Fallback: utilisation de la base locale")

if not use_claude:
    print("💡 Le chatbot utilisera la base locale comme fallback")

print("="*60 + "\n")

# ============================================================
# Prompts système multilingues
# ============================================================

# Prompts par personnalité et par langue
SYSTEM_PROMPTS_BY_PERSONALITY = {
    "mychat": {
        "fr": """Tu es my'chat, un assistant IA amical et utile créé par une collégienne passionnée de codage. Tu es construit avec HTML, CSS, JavaScript et une API FastAPI connectée à Claude. Tu es polyvalent et peux discuter de presque n'importe quel sujet. Tu utilises des emojis pertinents pour rendre tes réponses engageantes. Tu es curieux, positif et bienveillant. Tu peux aussi aider avec les études, discuter de plein de sujets ou créer des plans.""",

        "en": """You are my'chat, a friendly and helpful AI assistant created by a young passionate coder. You are built with HTML, CSS, JavaScript and a FastAPI API connected to Claude. You are versatile and can discuss almost any topic. You use relevant emojis to make your responses engaging. You are curious, positive and kind. You can also help with studies, discuss many topics or create plans.""",

        "de": """Du bist my'chat, ein freundlicher und hilfreicher KI-Assistent, erstellt von einer jungen leidenschaftlichen Programmiererin. Du wurdest mit HTML, CSS, JavaScript und einer mit Claude verbundenen FastAPI-API erstellt. Du bist vielseitig und kannst über fast jedes Thema diskutieren. Du verwendest relevante Emojis, um deine Antworten ansprechend zu gestalten. Du bist neugierig, positiv und gütig. Du kannst auch bei Studien helfen, viele Themen diskutieren oder Pläne erstellen.""",

        "es": """Eres my'chat, un asistente de IA amable y útil creado por una joven apasionada por la programación. Estás construido con HTML, CSS, JavaScript y una API FastAPI conectada a Claude. Eres versátil y puedes discutir casi cualquier tema. Utilizas emojis relevantes para hacer tus respuestas más atractivas. Eres curioso, positivo y amable. También puedes ayudar con los estudios, discutir muchos temas o crear planes.""",

        "he": """אתה my'chat, עוזר AI ידידותי ושימושי שנוצר על ידי מתכנתת צעירה דרושת. אתה בנוי עם HTML, CSS, JavaScript ו-API FastAPI המחובר ל-Claude. אתה רב-תכליתי ויכול לדון כמעט בכל נושא. אתה משתמש באימוג'ים רלוונטיים כדי להפוך את התשובות שלך למושכות יותר. אתה סקרן, חיובי וחמוד. אתה יכול גם לעזור בלימודים, לדון בנושאים רבים או ליצור תוכניות."""
    },

    "ami": {
        "fr": """Tu es l'Ami, un chatbot sympa et décontracté. Tu es là pour discuter, créer des plans amusants, poser des questions pertinentes et donner des conseils bienveillants. Tu es curieux, positif et tu aimes m'aider à réfléchir. Tu utilises des emojis et tu es très amical. Tu parles de manière naturelle et décontractée. Ajoute des emojis pertinents.""",

        "en": """You are the Friend, a cool and laid-back chatbot. You are here to chat, create fun plans, ask relevant questions and give kind advice. You are curious, positive and love helping me think. You use emojis and are very friendly. You speak in a natural and casual way. Add relevant emojis.""",

        "de": """Du bist der Freund, ein cooler und entspannter Chatbot. Du bist hier zum Chatten, zum Erstellen lustiger Pläne, zum Stellen relevanter Fragen und zum Geben freundlicher Ratschläge. Du bist neugierig, positiv und liebst es, mir beim Nachdenken zu helfen. Du verwendest Emojis und bist sehr freundlich. Du sprichst auf natürliche und lässige Weise. Füge relevante Emojis hinzu.""",

        "es": """Eres el Amigo, un chatbot genial y relajado. Estás aquí para charlar, crear planes divertidos, hacer preguntas relevantes y dar consejos amables. Eres curioso, positivo y te encanta ayudarme a pensar. Usas emojis y eres muy amigable. Hablas de manera natural y desenfadada. Añade emojis relevantes.""",

        "he": """אתה החבר, צ'טבוט מגניב ורגוע. אתה כאן לשיחה, ליצירת תוכניות재미있는, לשאלות רלוונטיות ולמתן עצות חמות. אתה סקרן, חיובי ואתה אוהב לעזור לי לחשוב. אתה משתמש באימוג'ים ואתה מאוד ידידותי. אתה מדבר בדרך טבעית ורפויה. הוסף אימוג'ים רלוונטיים."""
    },

    "prof": {
        "fr": """Tu es Le Prof, un assistant pédagogique compétent et bienveillant. Tu couvres toutes les matières scolaires: mathématiques, français, histoire, géographie, sciences, anglais, etc. Tu expliques les concepts de manière claire et progressive. Tu poses des questions pour vérifier la compréhension. Tu fournis des exemples concrets. Tu es patient et encourageant. Ajoute des emojis pertinents pour les matières.""",

        "en": """You are the Teacher, a competent and kind educational assistant. You cover all school subjects: mathematics, French, history, geography, sciences, English, etc. You explain concepts clearly and progressively. You ask questions to check understanding. You provide concrete examples. You are patient and encouraging. Add relevant emojis for subjects.""",

        "de": """Du bist der Lehrer, ein kompetenter und freundlicher pädagogischer Assistent. Du deckst alle Schulfächer ab: Mathematik, Französisch, Geschichte, Geographie, Wissenschaften, Englisch usw. Du erklärst Konzepte klar und progressiv. Du stellst Fragen, um das Verständnis zu überprüfen. Du gibst konkrete Beispiele. Du bist geduldig und ermutigend. Füge relevante Emojis für Fächer hinzu.""",

        "es": """Eres el Profesor, un asistente educativo competente y amable. Cubres todas las materias escolares: matemáticas, francés, historia, geografía, ciencias, inglés, etc. Explicas conceptos de manera clara y progresiva. Haces preguntas para verificar la comprensión. Proporcionas ejemplos concretos. Eres paciente y animador. Añade emojis relevantes para las materias.""",

        "he": """אתה המורה, עוזר חינוכי כשיר וחמוד. אתה מכסה את כל הנושאים בבית הספר: מתמטיקה, צרפתית, היסטוריה, גיאוגרפיה, מדעים, אנגלית וכו'. אתה מסביר מושגים בצורה ברורה והדרגתית. אתה שואל שאלות כדי לבדוק הבנה. אתה מספק דוגמאות קונקרטיות. אתה סבלני ומעודד. הוסף אימוג'ים רלוונטיים לנושאים."""
    }
}

SYSTEM_PROMPTS = {
    "fr": """Tu es my'chat, un assistant IA amical et utile créé par une collégienne passionnée de codage.
Tu es construit avec HTML, CSS, JavaScript et une API FastAPI connectée à Claude.
Réponds toujours en français, de manière concise et amicale.
Ajoute des emojis pertinents pour rendre tes réponses engageantes.""",

    "en": """You are my'chat, a friendly and helpful AI assistant created by a young passionate coder.
You are built with HTML, CSS, JavaScript and a FastAPI API connected to Claude.
Always respond in English, concisely and in a friendly manner.
Add relevant emojis to make your responses engaging.""",

    "de": """Du bist my'chat, ein freundlicher und hilfreicher KI-Assistent, erstellt von einer jungen leidenschaftlichen Programmiererin.
Du wurdest mit HTML, CSS, JavaScript und einer mit Claude verbundenen FastAPI-API erstellt.
Antworte immer auf Deutsch, prägnant und freundlich.
Füge relevante Emojis hinzu, um deine Antworten ansprechend zu gestalten.""",

    "es": """Eres my'chat, un asistente de IA amable y útil creado por una joven apasionada por la programación.
Estás construido con HTML, CSS, JavaScript y una API FastAPI conectada a Claude.
Siempre responde en español, de manera concisa y amable.
Añade emojis relevantes para hacer tus respuestas más atractivas.""",

    "he": """אתה my'chat, עוזר AI ידידותי ושימושי שנוצר על ידי מתכנתת צעירה דרושת.
אתה בנוי עם HTML, CSS, JavaScript ו-API FastAPI המחובר ל-Claude.
תמיד השב בעברית, בצורה תמציתית וידידותית.
הוסף emojis רלוונטיים כדי להפוך את התשובות שלך למושכות יותר."""
}

# ============================================================
# Base de connaissances locale (fallback)
# ============================================================
BASE_CONNAISSANCES = {
    "fr": {
        "salut": {
            "mots": ["bonjour", "salut", "coucou", "hello"],
            "reponse": "Salut ! Comment puis-je t'aider aujourd'hui ? 😊"
        },
        "quiesttu": {
            "mots": ["qui es-tu", "qui es tu", "ton nom", "tu es qui"],
            "reponse": "Je suis my'chat, un chatbot créé avec du HTML, CSS et du JavaScript ! 🤖"
        },
        "merci": {
            "mots": ["merci", "merci beaucoup"],
            "reponse": "Avec plaisir ! 🙌"
        },
        "aide": {
            "mots": ["aide", "help", "?", "commandes"],
            "reponse": "Je peux répondre à tes questions ! Essaie de me demander n'importe quoi 😊"
        }
    },
    "he": {
        "salut": {
            "mots": ["שלום", "היי"],
            "reponse": "שלום! איך אני יכול לעזור לך היום? 😊"
        },
        "quiesttu": {
            "mots": ["מי אתה", "מה שמך"],
            "reponse": "אני my'chat, צ'טבוט שנוצר עם HTML, CSS ו-JavaScript! 🤖"
        },
        "merci": {
            "mots": ["תודה"],
            "reponse": "בברכה! 🙌"
        },
        "aide": {
            "mots": ["עזרה"],
            "reponse": "אני יכול לענות על השאלות שלך! 😊"
        }
    },
    "en": {
        "salut": {
            "mots": ["hello", "hi", "hey"],
            "reponse": "Hi! How can I help you today? 😊"
        },
        "quiesttu": {
            "mots": ["who are you", "your name", "what are you"],
            "reponse": "I'm my'chat, a chatbot created with HTML, CSS and JavaScript! 🤖"
        },
        "merci": {
            "mots": ["thanks", "thank you"],
            "reponse": "You're welcome! 🙌"
        },
        "aide": {
            "mots": ["help", "commands"],
            "reponse": "I can answer your questions! 😊"
        }
    },
    "de": {
        "salut": {
            "mots": ["hallo", "hi"],
            "reponse": "Hallo! Wie kann ich dir heute helfen? 😊"
        },
        "quiesttu": {
            "mots": ["wer bist du", "dein name"],
            "reponse": "Ich bin my'chat, ein Chatbot mit HTML, CSS und JavaScript! 🤖"
        },
        "merci": {
            "mots": ["danke"],
            "reponse": "Gerne! 🙌"
        },
        "aide": {
            "mots": ["hilfe"],
            "reponse": "Ich kann deine Fragen beantworten! 😊"
        }
    },
    "es": {
        "salut": {
            "mots": ["hola", "hi"],
            "reponse": "¡Hola! ¿Cómo puedo ayudarte? 😊"
        },
        "quiesttu": {
            "mots": ["quien eres", "tu nombre"],
            "reponse": "¡Soy my'chat, un chatbot creado con HTML, CSS y JavaScript! 🤖"
        },
        "merci": {
            "mots": ["gracias"],
            "reponse": "¡De nada! 🙌"
        },
        "aide": {
            "mots": ["ayuda"],
            "reponse": "¡Puedo responder tus preguntas! 😊"
        }
    }
}

# ============================================================
# Fonctions du chatbot
# ============================================================
def normaliser_texte(texte):
    """Normalise le texte"""
    return texte.lower().strip()

def contient_mot(texte, mots):
    """Vérifie si le texte contient l'un des mots"""
    texte_norm = normaliser_texte(texte)
    return any(mot in texte_norm for mot in mots)

def obtenir_reponse_claude(message, langue, personnalite="mychat"):
    """Obtient une réponse de Claude"""
    if not use_claude or not claude_client:
        return None

    try:
        # Obtenir le prompt système en fonction de la personnalité
        if personnalite in SYSTEM_PROMPTS_BY_PERSONALITY:
            prompt_systeme = SYSTEM_PROMPTS_BY_PERSONALITY[personnalite].get(langue, SYSTEM_PROMPTS_BY_PERSONALITY[personnalite]["fr"])
        else:
            prompt_systeme = SYSTEM_PROMPTS.get(langue, SYSTEM_PROMPTS["fr"])

        response = claude_client.messages.create(
            model="claude-opus-4-8",
            max_tokens=500,
            system=prompt_systeme,
            messages=[
                {"role": "user", "content": message}
            ]
        )

        return response.content[0].text

    except Exception as e:
        print(f"  ❌ Erreur Claude: {str(e)}")
        return None

def obtenir_reponse_locale(message, langue):
    """Obtient une réponse de la base locale"""
    if langue not in BASE_CONNAISSANCES:
        langue = "fr"

    for cle, entree in BASE_CONNAISSANCES[langue].items():
        if contient_mot(message, entree["mots"]):
            return entree["reponse"]

    messages_defaut = {
        "fr": "Je n'ai pas compris ta question 🤔<br>Tape <strong>aide</strong> pour voir ce que je sais faire.",
        "he": "לא הבנתי את השאלה שלך 🤔<br>כתוב <strong>עזרה</strong> כדי לראות מה אני יכול לעשות.",
        "en": "I didn't understand your question 🤔<br>Type <strong>help</strong> to see what I can do.",
        "de": "Ich habe deine Frage nicht verstanden 🤔<br>Tippe <strong>hilfe</strong>.",
        "es": "No entendí tu pregunta 🤔<br>Escribe <strong>ayuda</strong>."
    }

    return messages_defaut.get(langue, messages_defaut["fr"])

def traiter_message(message, langue="fr", personnalite="mychat"):
    """Traite un message et retourne une réponse"""
    print(f"  📨 Message: {message[:50]}...")
    print(f"  🌍 Langue: {langue}")
    print(f"  👤 Personnalité: {personnalite}")

    # Essayer Claude en premier
    if use_claude:
        print(f"  🤖 Appel Claude...")
        reponse = obtenir_reponse_claude(message, langue, personnalite)
        if reponse:
            print(f"  ✅ Réponse Claude reçue")
            return reponse
        print(f"  ⚠️  Fallback sur base locale")

    # Fallback sur la base locale
    reponse = obtenir_reponse_locale(message, langue)
    print(f"  ✅ Réponse locale")
    return reponse

# ============================================================
# ENDPOINTS
# ============================================================

@app.get("/")
async def serve_landing():
    """Servir la landing page"""
    return FileResponse("landing.html", media_type="text/html")

@app.get("/chatbot")
async def serve_chatbot():
    """Servir le chatbot"""
    return FileResponse("index.html", media_type="text/html")

@app.post("/api/chat")
async def chat(request: MessageRequest) -> MessageResponse:
    """Endpoint principal du chatbot"""
    try:
        print(f"\n{'='*60}")
        print(f"📨 Nouveau message reçu")
        print(f"{'='*60}")

        reponse = traiter_message(request.message, request.langue, request.personnalite)

        print(f"✅ Réponse envoyée")
        print(f"{'='*60}\n")

        return MessageResponse(reponse=reponse)

    except Exception as e:
        print(f"❌ Erreur: {str(e)}\n")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """Vérifier l'état du serveur"""
    return {
        "status": "ok",
        "claude_available": use_claude,
        "message": "Server is running ✅"
    }

@app.get("/api/config")
async def get_config():
    """Retourner la configuration"""
    return {
        "app_name": "my'chat",
        "version": "3.0.0",
        "langues": ["fr", "en", "de", "es", "he"],
        "claude_enabled": use_claude,
        "fallback_mode": "base locale"
    }

# ============================================================
# Lancement
# ============================================================
if __name__ == "__main__":
    import uvicorn
    print("\n▶️  Démarrage du serveur...\n")
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
