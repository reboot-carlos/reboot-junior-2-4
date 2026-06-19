/* ============================================================
   APP - Initialisation principale
   ============================================================ */

class MyChat {
  constructor() {
    this.initialized = false;
  }

  /**
   * Initialise l'application
   */
  init() {
    if (this.initialized) return;

    console.log('🚀 Initialisation de my\'chat...');

    // Attendre le chargement du DOM
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.start());
    } else {
      this.start();
    }

    this.initialized = true;
  }

  /**
   * Démarre l'application
   */
  start() {
    console.log('✅ DOM chargé');

    // Initialiser les modules
    SIDEBAR.init();
    CHAT.init();
    this.setupMenus();
    this.setupLanguages();
    this.setupColors();
    this.setupEmojis();
    this.setupAddContent();

    console.log('✅ my\'chat prêt !');
  }

  /**
   * Configure les menus flottants
   */
  setupMenus() {
    // Menu Langue
    const langueBtn = document.querySelector('.langue-btn');
    const langueMenu = document.getElementById('langue-menu');

    if (langueBtn && langueMenu) {
      langueBtn.addEventListener('click', () => {
        langueMenu.classList.toggle('active');
      });

      document.addEventListener('click', (e) => {
        if (e.target !== langueBtn && !langueBtn.contains(e.target)) {
          langueMenu.classList.remove('active');
        }
      });
    }

    // Menu Jeux
    const jeuxBtn = document.querySelector('.jeux-btn');
    const jeuxMenu = document.getElementById('jeux-menu');

    if (jeuxBtn && jeuxMenu) {
      jeuxBtn.addEventListener('click', () => {
        jeuxMenu.classList.toggle('active');
      });

      document.addEventListener('click', (e) => {
        if (e.target !== jeuxBtn && !jeuxBtn.contains(e.target)) {
          jeuxMenu.classList.remove('active');
        }
      });
    }

    // Menu Emoji
    const emojiBtn = document.querySelector('.emoji-btn');
    const emojiMenu = document.getElementById('emoji-menu');

    if (emojiBtn && emojiMenu) {
      emojiBtn.addEventListener('click', () => {
        emojiMenu.classList.toggle('active');
      });

      document.addEventListener('click', (e) => {
        if (e.target !== emojiBtn && !emojiBtn.contains(e.target)) {
          emojiMenu.classList.remove('active');
        }
      });
    }

    // Menu Paramètres
    const paramBtn = document.querySelector('.param-btn');
    const paramMenu = document.getElementById('param-menu');

    if (paramBtn && paramMenu) {
      paramBtn.addEventListener('click', () => {
        paramMenu.classList.toggle('active');
      });
    }
  }

  /**
   * Configure les options de langue
   */
  setupLanguages() {
    const langueOptions = document.querySelectorAll('.langue-option');

    langueOptions.forEach(option => {
      const lang = option.textContent.match(/[a-z]{2}/i)?.[0]?.toLowerCase();
      if (lang) option.dataset.lang = lang;

      option.addEventListener('click', () => {
        const lang = option.dataset.lang || option.textContent.match(/[a-z]{2}/i)?.[0]?.toLowerCase();
        if (lang && ['fr', 'en', 'de', 'es', 'he'].includes(lang)) {
          CHAT.setLanguage(lang);
        }
      });
    });

    // Marquer la langue active
    const activeOption = document.querySelector(`.langue-option[data-lang="${CHAT.currentLanguage}"]`);
    if (activeOption) activeOption.classList.add('active');
  }

  /**
   * Configure les couleurs
   */
  setupColors() {
    const colorBtns = document.querySelectorAll('.couleur-btn');

    colorBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const color = btn.style.background || btn.style.backgroundColor;
        if (color) {
          SIDEBAR.setColor(color);
        }
      });
    });

    const toggleBtn = document.querySelector('[onclick="toggleCouleurMenuSidebar()"]');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        SIDEBAR.toggleColorMenu();
      });
    }
  }

  /**
   * Configure les emojis
   */
  setupEmojis() {
    const emojiOptions = document.querySelectorAll('.emoji-option');

    emojiOptions.forEach(option => {
      option.addEventListener('click', () => {
        const emoji = option.textContent.trim();

        if (emoji === '✕') {
          CHAT.removeEmoji();
        } else if (emoji) {
          CHAT.setEmoji(emoji);
        }

        document.getElementById('emoji-menu')?.classList.remove('active');
      });
    });
  }

  /**
   * Configure le bouton + ajouter contenu
   */
  setupAddContent() {
    const btnAddContent = document.getElementById('btn-add-content');
    const addContentMenu = document.getElementById('add-content-menu');
    const btnAddContentSuggestion = document.getElementById('btn-add-content-suggestion');
    const addContentMenuSuggestion = document.getElementById('add-content-menu-suggestion');
    const fileInput = document.getElementById('file-input');
    const photoInput = document.getElementById('photo-input');

    // Toggle menu principal
    if (btnAddContent && addContentMenu) {
      btnAddContent.addEventListener('click', (e) => {
        e.stopPropagation();
        addContentMenu.classList.toggle('active');
        if (addContentMenuSuggestion) {
          addContentMenuSuggestion.classList.remove('active');
        }
      });
    }

    // Toggle menu suggestions
    if (btnAddContentSuggestion && addContentMenuSuggestion) {
      btnAddContentSuggestion.addEventListener('click', (e) => {
        e.stopPropagation();
        addContentMenuSuggestion.classList.toggle('active');
        if (addContentMenu) {
          addContentMenu.classList.remove('active');
        }
      });
    }

    // Fermer les menus en cliquant ailleurs
    document.addEventListener('click', (e) => {
      if (btnAddContent && !btnAddContent.contains(e.target) && addContentMenu && !addContentMenu.contains(e.target)) {
        addContentMenu.classList.remove('active');
      }
      if (btnAddContentSuggestion && !btnAddContentSuggestion.contains(e.target) && addContentMenuSuggestion && !addContentMenuSuggestion.contains(e.target)) {
        addContentMenuSuggestion.classList.remove('active');
      }
    });
  }

    // Gestion du fichier image
    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const base64 = event.target.result;
            const message = `🖼️ Image ajoutée`;
            CHAT.addMessage('user', `<img src="${base64}" style="max-width: 200px; border-radius: 8px; margin-top: 0.5rem;">`);
            CHAT.addMessage('bot', `J'ai bien reçu ton image ! 📸`);
            CHAT.closeAddMenu();
            fileInput.value = '';
          };
          reader.readAsDataURL(file);
        }
      });
    }

    // Gestion du fichier photo
    if (photoInput) {
      photoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const base64 = event.target.result;
            CHAT.addMessage('user', `<img src="${base64}" style="max-width: 200px; border-radius: 8px; margin-top: 0.5rem;">`);
            CHAT.addMessage('bot', `Jolie photo ! 📷`);
            CHAT.closeAddMenu();
            photoInput.value = '';
          };
          reader.readAsDataURL(file);
        }
      });
    }
  }

  /**
   * Affiche un message d'erreur
   * @param {string} message
   */
  showError(message) {
    console.error('❌ Erreur:', message);
    CHAT.addMessage('bot', `❌ ${message}`);
  }

  /**
   * Affiche un message de succès
   * @param {string} message
   */
  showSuccess(message) {
    console.log('✅ Succès:', message);
    CHAT.addMessage('bot', `✅ ${message}`);
  }
}

// Créer et initialiser l'app
const myChat = new MyChat();
myChat.init();

// Export pour utilisation globale
window.myChat = myChat;
window.CHAT = CHAT;
window.SIDEBAR = SIDEBAR;
window.STORAGE = STORAGE;
window.CHARACTERS = CHARACTERS;
window.API = API;
