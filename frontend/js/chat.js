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
      errorServer: "❌ Le serveur ne répond pas 🔌<br>Vérification:<br>✓ Est-ce que 'python main.py' est lancé?<br>✓ Est-ce que le navigateur est sur http://localhost:8000?<br><br>F12 → Console pour voir les détails",
      suggestions: [
        { label: '👋 Coucou',   question: 'Coucou' },
        { label: '🎨 Création', question: 'Parle moi de la création' },
        { label: '📚 Devoirs',  question: 'Tu peux m\'aider avec mes devoirs?' },
      ],
      sidebar: {
        newChat:       '➕ Nouveau Chat',
        personalities: '👥 Personnalités',
        history:       '⏱️ Historique',
        params:        '⚙️ Paramètres',
        home:          '🏠 Accueil',
        colors:        '🎨 Couleurs',
        hide:          '◀ Masquer',
        noHistory:     'Aucune conversation',
        add:           '➕ Ajouter',
      }
    },
    he: {
      subtitle: "שאל אותי הכל",
      welcome: `שלום 👋 אני הצ'טבוט שלך.<br>כתוב לי מה שאתה רוצה !`,
      placeholder: "כתוב את ההודעה שלך כאן...",
      errorServer: "❌ השרת לא מגיב<br>בדוק: python main.py חייב להיות מריץ",
      suggestions: [
        { label: '👋 שלום',    question: 'שלום' },
        { label: '🎨 יצירה',  question: 'ספר לי על יצירה' },
        { label: '📚 שיעורים', question: 'אתה יכול לעזור לי בשיעורים?' },
      ],
      sidebar: {
        newChat:       '➕ שיחה חדשה',
        personalities: '👥 אישיויות',
        history:       '⏱️ היסטוריה',
        params:        '⚙️ הגדרות',
        home:          '🏠 בית',
        colors:        '🎨 צבעים',
        hide:          '◀ הסתר',
        noHistory:     'אין שיחות עדיין',
        add:           '➕ הוסף',
      }
    },
    en: {
      subtitle: "Ask me anything",
      welcome: `Hello 👋 I'm your chatbot.<br>Tell me what you want !`,
      placeholder: "Write your message here...",
      errorServer: "❌ Server not responding 🔌<br>Check: Is 'python main.py' running?",
      suggestions: [
        { label: '👋 Hello',    question: 'Hello' },
        { label: '🎨 Creation', question: 'Tell me about creation' },
        { label: '📚 Homework', question: 'Can you help me with my homework?' },
      ],
      sidebar: {
        newChat:       '➕ New Chat',
        personalities: '👥 Personalities',
        history:       '⏱️ History',
        params:        '⚙️ Settings',
        home:          '🏠 Home',
        colors:        '🎨 Colors',
        hide:          '◀ Hide',
        noHistory:     'No conversations yet',
        add:           '➕ Add',
      }
    },
    de: {
      subtitle: "Frag mich alles",
      welcome: `Hallo 👋 Ich bin dein Chatbot.<br>Schreib mir, was du möchtest !`,
      placeholder: "Schreib deine Nachricht hier...",
      errorServer: "❌ Server antwortet nicht<br>Prüfen: Läuft 'python main.py'?",
      suggestions: [
        { label: '👋 Hallo',        question: 'Hallo' },
        { label: '🎨 Kreation',     question: 'Erzähl mir von der Kreation' },
        { label: '📚 Hausaufgaben', question: 'Kannst du mir bei den Hausaufgaben helfen?' },
      ],
      sidebar: {
        newChat:       '➕ Neuer Chat',
        personalities: '👥 Persönlichkeiten',
        history:       '⏱️ Verlauf',
        params:        '⚙️ Einstellungen',
        home:          '🏠 Startseite',
        colors:        '🎨 Farben',
        hide:          '◀ Ausblenden',
        noHistory:     'Noch keine Gespräche',
        add:           '➕ Hinzufügen',
      }
    },
    es: {
      subtitle: "Pregúntame cualquier cosa",
      welcome: `¡Hola 👋 Soy tu chatbot!<br>¡Dime qué quieres !`,
      placeholder: "Escribe tu mensaje aquí...",
      errorServer: "❌ Servidor no responde<br>Verifica: ¿Está 'python main.py' en ejecución?",
      suggestions: [
        { label: '👋 Hola',    question: 'Hola' },
        { label: '🎨 Creación', question: 'Háblame de la creación' },
        { label: '📚 Deberes', question: '¿Puedes ayudarme con mis deberes?' },
      ],
      sidebar: {
        newChat:       '➕ Nuevo Chat',
        personalities: '👥 Personalidades',
        history:       '⏱️ Historial',
        params:        '⚙️ Ajustes',
        home:          '🏠 Inicio',
        colors:        '🎨 Colores',
        hide:          '◀ Ocultar',
        noHistory:     'Sin conversaciones aún',
        add:           '➕ Añadir',
      }
    }
  },

  getTranslation(key) {
    const t = this.translations[this.currentLanguage] || this.translations.fr;
    return t.sidebar?.[key] ?? this.translations.fr.sidebar[key];
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
   * Réinitialise le chat (sauvegarde la conversation courante d'abord)
   */
  reset() {
    // Sauvegarder la conversation courante si elle contient des messages utilisateur
    this.saveConversation();

    const chatZone = document.getElementById('zone-chat');
    if (chatZone) chatZone.innerHTML = '';

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
      this.saveConversation(); // sauvegarder après chaque échange réussi
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
   * @param {string} type - 'bot' | 'user' | 'loading'
   * @param {string} content - Texte brut ou HTML (images utilisateur)
   * @returns {string} ID du message
   */
  addMessage(type, content) {
    const chatZone = document.getElementById('zone-chat');
    if (!chatZone) return '';

    const id = `msg-${++this.messageCount}`;
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${type}`;
    msgDiv.id = id;

    if (type === 'bot') {
      // Markdown → HTML → DOMPurify
      const raw = window.marked ? marked.parse(content) : content;
      msgDiv.innerHTML = window.DOMPurify
        ? DOMPurify.sanitize(raw, {
            ALLOWED_TAGS: ['p','br','strong','em','b','i','u','s','del',
                           'h1','h2','h3','h4','h5','h6',
                           'ul','ol','li','blockquote',
                           'code','pre','hr','a','table',
                           'thead','tbody','tr','th','td'],
            ALLOWED_ATTR: ['href', 'class', 'target', 'rel'],
          })
        : raw;
    } else if (type === 'user' && content.includes('<img')) {
      msgDiv.innerHTML = content;   // images uploadées par l'utilisateur
    } else {
      msgDiv.textContent = content; // messages utilisateur et loading — texte brut
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

    const t = this.translations[lang] || this.translations.fr;

    // Placeholder + sous-titre
    const input = document.getElementById('champ-texte');
    if (input) input.placeholder = t.placeholder || '';
    const subtitle = document.getElementById('header-subtitle');
    if (subtitle) subtitle.textContent = t.subtitle || '';

    // Boutons de suggestions
    const suggBtns = document.querySelectorAll('.btn-suggestion[data-question]');
    suggBtns.forEach((btn, i) => {
      if (t.suggestions?.[i]) {
        btn.textContent   = t.suggestions[i].label;
        btn.dataset.question = t.suggestions[i].question;
      }
    });

    // Sidebar
    const s = t.sidebar;
    if (s) {
      const set = (sel, val) => { const el = document.querySelector(sel); if (el) el.textContent = val; };
      set('.btn-new-chat',              s.newChat);
      set('.personalities-section h4', s.personalities);
      set('.history-section h4',        s.history);
      set('.parameters-section h4',     s.params);
      set('#btn-home',                  s.home);
      set('#btn-toggle-colors',         s.colors);
      set('.btn-toggle-sidebar',        s.hide);
      set('#btn-add-content-suggestion', s.add);
    }

    // Personnalités (noms traduits)
    SIDEBAR.renderPersonalities();

    // Menu langue
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
   * Sauvegarde la conversation courante dans l'historique
   */
  saveConversation() {
    const chatZone = document.getElementById('zone-chat');
    if (!chatZone) return;

    // Ne sauvegarder que si l'utilisateur a envoyé au moins un message
    const userMessages = chatZone.querySelectorAll('.message.user');
    if (userMessages.length === 0) return;

    const messages = [];
    chatZone.querySelectorAll('.message:not(.loading)').forEach(msg => {
      messages.push({
        type: msg.classList[1],
        content: msg.innerHTML
      });
    });

    // Titre = premier message utilisateur (plus parlant que le message de bienvenue)
    const firstUserMsg = chatZone.querySelector('.message.user');
    const title = (firstUserMsg?.textContent || 'Conversation').substring(0, 40);

    const conversation = {
      id: this.currentConversationId,
      title,
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
