"""
Service Claude - Gère l'intégration avec l'API Anthropic Claude
"""

import os
import traceback
from anthropic import Anthropic

class ClaudeService:
    """Service pour communiquer avec Claude API"""

    def __init__(self, api_key: str = None):
        """
        Initialise le service Claude

        Args:
            api_key: Clé API Anthropic (optionnel, utilise ANTHROPIC_API_KEY par défaut)
        """
        self.api_key = api_key or os.getenv("ANTHROPIC_API_KEY")

        if not self.api_key:
            raise ValueError(
                "ANTHROPIC_API_KEY non configurée. "
                "Définis la variable d'environnement ou passe la clé en paramètre."
            )

        self.client = Anthropic(api_key=self.api_key)
        self.model = "claude-opus-4-8"  # Dernier modèle disponible

    def obtenir_reponse(self, message: str, langue: str = "fr") -> str:
        """
        Obtient une réponse de Claude pour un message donné

        Args:
            message: Message de l'utilisateur
            langue: Langue de réponse (fr, en, de, es, he)

        Returns:
            Réponse de Claude
        """
        try:
            # Prompt système multilingue
            prompts_systeme = {
                "fr": """Tu es my'chat, un assistant IA amical et utile.
Tu es créé avec du HTML, du CSS, du JavaScript et une API FastAPI connectée à Claude.
Réponds toujours en français, de manière concise et amicale.
Ajoute des emojis pertinents pour rendre les réponses plus engageantes.""",

                "en": """You are my'chat, a friendly and helpful AI assistant.
You are created with HTML, CSS, JavaScript and a FastAPI API connected to Claude.
Always respond in English, concisely and in a friendly manner.
Add relevant emojis to make responses more engaging.""",

                "de": """Du bist my'chat, ein freundlicher und hilfreicher KI-Assistent.
Du wirst mit HTML, CSS, JavaScript und einer FastAPI-API erstellt, die mit Claude verbunden ist.
Antworte immer auf Deutsch, prägnant und freundlich.
Füge relevante Emojis hinzu, um die Antworten ansprechender zu gestalten.""",

                "es": """Eres my'chat, un asistente de IA amable y útil.
Estás creado con HTML, CSS, JavaScript y una API FastAPI conectada a Claude.
Siempre responde en español, de manera concisa y amable.
Añade emojis relevantes para hacer las respuestas más atractivas.""",

                "he": """אתה my'chat, עוזר AI ידידותי ושימושי.
אתה נוצר עם HTML, CSS, JavaScript ו-API FastAPI המחובר ל-Claude.
תמיד הגב בעברית, בצורה תמציתית וידידותית.
הוסף emoji רלוונטיים כדי להפוך את התשובות למושכות יותר."""
            }

            prompt = prompts_systeme.get(langue, prompts_systeme["fr"])

            # Appel à l'API Claude
            message_response = self.client.messages.create(
                model=self.model,
                max_tokens=500,
                system=prompt,
                messages=[
                    {"role": "user", "content": message}
                ]
            )

            # Extraire et retourner la réponse
            return message_response.content[0].text

        except Exception as e:
            print(f"❌ Erreur Claude API: {str(e)}")
            traceback.print_exc()

            # Messages d'erreur multilingues
            erreurs = {
                "fr": "Oups! Il y a une erreur de communication avec Claude. Réessaie dans un moment! 🔌",
                "en": "Oops! There's a communication error with Claude. Try again in a moment! 🔌",
                "de": "Hoppla! Es gibt einen Kommunikationsfehler mit Claude. Versuche es gleich nochmal! 🔌",
                "es": "¡Ups! Hay un error de comunicación con Claude. ¡Intenta de nuevo en un momento! 🔌",
                "he": "אופס! יש שגיאה תקשורת עם Claude. נסה שוב בעוד רגע! 🔌"
            }

            return erreurs.get(langue, erreurs["fr"])


# Instance globale du service
_claude_service = None

def initialiser_claude(api_key: str = None) -> ClaudeService:
    """Initialise et retourne le service Claude"""
    global _claude_service
    if _claude_service is None:
        _claude_service = ClaudeService(api_key)
    return _claude_service

def obtenir_claude() -> ClaudeService:
    """Retourne l'instance du service Claude"""
    global _claude_service
    if _claude_service is None:
        _claude_service = ClaudeService()
    return _claude_service
