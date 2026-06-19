/* ============================================================
   CHAT - Logique principale du chatbot
   ============================================================ */

const CHAT = {
  currentLanguage: 'fr',
  currentPersonality: 'mychat',
  currentConversationId: null,
  messageCount: 0,
  isWaiting: false,

  translations: {
    fr: {
      subtitle: "Demande moi tout",
      welcome: `Hello 👋 Je suis ton chatbot.<br>Écris-moi ce que tu veux !`,
      placeholder: "Écris ton message ici...",
      envoyer: "Envoyer",
      btn1: "Coucou",
      btn2: "Création",
      btn3: "Créer une image",
      errorServer: "❌ Le serveur ne répond pas 🔌<br>Vérification:<br>✓ Est-ce que 'python main.py' est lancé?<br>✓ Est-ce que le navigateur est sur http://localhost:8000?<br><br>F12 → Console pour voir les détails"
    },
    he: {
      subtitle: "שאל אותי הכל",
      welcome: `שלום 👋 אני הצ'טבוט שלך.<br>כתוב לי מה שאתה רוצה !`,
      placeholder: "כתוב את ההודעה שלך כאן...",
      envoyer: "שלח",
      btn1: "שלום",
      btn2: "יצירה",
      btn3: "צור תמונה",
      errorServer: "❌ השרת לא מגיב<br>בדוק: python main.py חייב להיות מריץ"
    },
    en: {
      subtitle: "Ask me anything",
      welcome: `Hello 👋 I'm your chatbot.<br>Tell me what you want !`,
      placeholder: "Write your message here...",
      envoyer: "Send",
      btn1: "Hi",
      btn2: "Creation",
      btn3: "Create an image",
      errorServer: "❌ Server not responding 🔌<br>Check: Is 'python main.py' running?"
    },
    de: {
      subtitle: "Frag mich alles",
      welcome: `Hallo 👋 Ich bin dein Chatbot.<br>Schreib mir, was du möchtest !`,
      placeholder: "Schreib deine Nachricht hier...",
      envoyer: "Senden",
      btn1: "Hallo",
      btn2: "Kreation",
      btn3: "Bild erstellen",
      errorServer: "❌ Server antwortet nicht<br>Prüfen: Läuft 'python main.py'?"
    },
    es: {
      subtitle: "Pregúntame cualquier cosa",
      welcome: `¡Hola 👋 Soy tu chatbot!<br>¡Dime qué quieres !`,
      placeholder: "Escribe tu mensaje aquí...",
      envoyer: "Enviar",
      btn1: "Hola",
      btn2: "Creación",
      btn3: "Crear imagen",
      errorServer: "❌ Servidor no responde<br>Verifica: ¿Está 'python main.py' en ejecución?"
    }
  },

  /**
   * Initialise le chat
   */
  init() {
    this.currentLanguage = STORAGE.getLanguage();
    this.currentPersonality = STORAGE.getPersonality();

    this.setupEventListeners();
    this.restoreUI();
    this.reset();
  },

  /**
   * Configure les écouteurs d'événements
   */
  setupEventListeners() {
    const input = document.getElementById('champ-texte');
    const sendBtn = document.getElementById('bouton-envoyer');

    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });
    }

    if (sendBtn) {
      sendBtn.addEventListener('click', () => this.sendMessage());
    }

    // Boutons de suggestion
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('btn-suggestion')) {
        const text = e.target.textContent.trim();
        const match = text.match(/^[^ ]+ (.+)$/);
        if (match) {
          this.askQuestion(match[1]);
        }
      }
    });
  },

  /**
   * Restaure l'UI
   */
  restoreUI() {
    const input = document.getElementById('champ-texte');
    const subtitle = document.getElementById('header-subtitle');

    if (input) {
      input.placeholder = this.translations[this.currentLanguage]?.placeholder || '';
    }

    if (subtitle) {
      subtitle.textContent = this.translations[this.currentLanguage]?.subtitle || '';
    }

    const color = STORAGE.getColor();
    if (color) {
      SIDEBAR.setColor(color);
    }

    const emoji = STORAGE.getEmoji();
    if (emoji) {
      this.setEmoji(emoji);
    }
  },

  /**
   * Réinitialise le chat
   */
  reset() {
    const chatZone = document.getElementById('zone-chat');
    if (chatZone) {
      chatZone.innerHTML = '';
    }

    this.messageCount = 0;
    this.currentConversationId = this.generateId();

    const welcome = CHARACTERS.getWelcomeMessage(this.currentPersonality, this.currentLanguage);
    this.addMessage('bot', welcome);
  },

  /**
   * Envoie un message
   */
  async sendMessage() {
    const input = document.getElementById('champ-texte');
    if (!input) return;

    const message = input.value.trim();
    if (!message) return;

    input.value = '';   // vider immédiatement, avant l'appel API
    input.focus();
    await this.askQuestion(message);
  },

  /**
   * Pose une question
   * @param {string} question - La question
   */
  async askQuestion(question) {
    if (this.isWaiting) return;

    this.addMessage('user', question);
    const sendBtn = document.getElementById('bouton-envoyer');
    if (sendBtn) sendBtn.disabled = true;
    this.isWaiting = true;

    const loadingId = this.addMessage('loading', '⏳ Je réfléchis...');

    try {
      const response = await API.chat(question, this.currentLanguage, this.currentPersonality);
      this.removeMessage(loadingId);
      this.addMessage('bot', response);
    } catch (error) {
      this.removeMessage(loadingId);
      const errorMsg = this.translations[this.currentLanguage]?.errorServer || this.translations.fr.errorServer;
      this.addMessage('bot', errorMsg);
    } finally {
      if (sendBtn) sendBtn.disabled = false;
      this.isWaiting = false;
      this.scrollToBottom();
    }
  },

  /**
   * Ajoute un message au chat
   * @param {string} type - 'bot', 'user', 'loading'
   * @param {string} content - Contenu du message (texte ou HTML sécurisé)
   * @returns {string} ID du message
   */
  addMessage(type, content) {
    const chatZone = document.getElementById('zone-chat');
    if (!chatZone) return '';

    const id = `msg-${++this.messageCount}`;
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${type}`;
    msgDiv.id = id;

    // Sécurité: utiliser textContent par défaut, sauf pour les images (innerHTML limité)
    if (content.includes('<img') && type === 'user') {
      msgDiv.innerHTML = content;  // Accepte seulement les <img> côté utilisateur
    } else {
      msgDiv.textContent = content;
    }

    chatZone.appendChild(msgDiv);
    this.scrollToBottom();

    return id;
  },

  /**
   * Supprime un message
   * @param {string} id - ID du message
   */
  removeMessage(id) {
    const msg = document.getElementById(id);
    if (msg) msg.remove();
  },

  /**
   * Scroll vers le bas du chat
   */
  scrollToBottom() {
    const chatZone = document.getElementById('zone-chat');
    if (chatZone) {
      chatZone.scrollTop = chatZone.scrollHeight;
    }
  },

  /**
   * Change la langue
   * @param {string} lang - Code de langue
   */
  setLanguage(lang) {
    this.currentLanguage = lang;
    STORAGE.saveLanguage(lang);

    document.getElementById('zone-chat').innerHTML = '';
    const input = document.getElementById('champ-texte');
    if (input) input.placeholder = this.translations[lang]?.placeholder || '';

    const subtitle = document.getElementById('header-subtitle');
    if (subtitle) subtitle.textContent = this.translations[lang]?.subtitle || '';

    // Mark langue menu
    document.querySelectorAll('.langue-option').forEach(opt => opt.classList.remove('active'));
    document.querySelector(`.langue-option[data-lang="${lang}"]`)?.classList.add('active');

    document.getElementById('langue-menu')?.classList.remove('active');

    this.reset();
  },

  /**
   * Change la personnalité
   * @param {string} personality - ID de la personnalité
   */
  setPersonality(personality) {
    this.currentPersonality = personality;
    STORAGE.savePersonality(personality);
    SIDEBAR.setActive(personality);
  },

  /**
   * Change l'emoji principal
   * @param {string} emoji - L'emoji
   */
  setEmoji(emoji) {
    const h1 = document.querySelector('header h1');
    const emojiBtn = document.querySelector('.emoji-btn');

    if (h1) h1.textContent = emoji + ' my\'chat';
    if (emojiBtn) emojiBtn.textContent = emoji + ' Emoji';

    STORAGE.saveEmoji(emoji);
  },

  /**
   * Enlève l'emoji
   */
  removeEmoji() {
    const h1 = document.querySelector('header h1');
    const emojiBtn = document.querySelector('.emoji-btn');

    if (h1) h1.textContent = 'my\'chat';
    if (emojiBtn) emojiBtn.textContent = '😊 Emoji';

    localStorage.removeItem('mychat_emoji');
  },

  /**
   * Charge une conversation sauvegardée
   * @param {object} conversation
   */
  loadConversation(conversation) {
    this.currentConversationId = conversation.id;
    const chatZone = document.getElementById('zone-chat');

    if (chatZone) {
      chatZone.innerHTML = '';
      conversation.messages.forEach(msg => {
        this.addMessage(msg.type, msg.content);
      });
    }
  },

  /**
   * Sauvegarde la conversation courante
   */
  saveConversation() {
    const chatZone = document.getElementById('zone-chat');
    if (!chatZone) return;

    const messages = [];
    chatZone.querySelectorAll('.message').forEach(msg => {
      messages.push({
        type: msg.classList[1],
        content: msg.innerHTML
      });
    });

    const conversation = {
      id: this.currentConversationId,
      title: messages[0]?.content.substring(0, 50) || 'Conversation',
      date: new Date().toISOString(),
      messages
    };

    SIDEBAR.addToHistory(conversation);
  },

  /**
   * Génère un ID unique
   * @returns {string}
   */
  generateId() {
    return 'conv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  },

  /**
   * Ajoute une image à la discussion
   */
  addImage() {
    const fileInput = document.getElementById('file-input');
    if (fileInput) {
      fileInput.click();
    }
  },

  /**
   * Ajoute une photo (webcam) à la discussion
   */
  addPhoto() {
    const photoInput = document.getElementById('photo-input');
    if (photoInput) {
      photoInput.click();
    }
  },

  /**
   * Ajoute un lien à la discussion
   */
  addLink() {
    document.getElementById('add-content-menu')?.classList.remove('active');
    document.getElementById('add-content-menu-suggestion')?.classList.remove('active');

    const url = prompt('Colle le lien (URL) :');
    if (!url || !url.trim()) return;

    const linkText = prompt('Quel titre pour ce lien ?') || url;
    this.addMessage('user', `🔗 ${linkText} — ${url.trim()}`);
    this.askQuestion(`J'ai partagé ce lien : ${url.trim()} — qu'en penses-tu ?`);
  }
};
