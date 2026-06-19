/* ============================================================
   SIDEBAR - Gestion de la barre latérale et historique
   ============================================================ */

const SIDEBAR = {
  isOpen: true,
  currentPersonality: 'mychat',

  /**
   * Initialise la barre latérale
   */
  init() {
    this.setupEventListeners();
    this.restoreState();
    this.renderPersonalities();
    this.renderHistory();

    // Sur mobile, masquer la sidebar par défaut
    if (window.innerWidth <= 900) {
      const sidebar = document.getElementById('sidebar');
      const main    = document.querySelector('.main-container');
      const openBtn = document.getElementById('btn-open-sidebar');
      sidebar?.classList.add('hidden');
      main?.classList.add('sidebar-hidden');
      openBtn?.classList.add('active');
      this.isOpen = false;
    }
  },

  /**
   * Configure les écouteurs d'événements
   */
  setupEventListeners() {
    const toggleBtn = document.querySelector('.btn-toggle-sidebar');
    const openBtn = document.getElementById('btn-open-sidebar');

    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => this.toggle());
    }

    if (openBtn) {
      openBtn.addEventListener('click', () => this.toggle());
    }

    // Event delegation pour les boutons de personnalité
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('personality-btn')) {
        const personality = e.target.dataset.personality;
        if (personality) {
          CHAT.setPersonality(personality);
          this.setActive(personality);
          CHAT.reset();
        }
      }
    });

    // Bouton nouveau chat
    const newChatBtn = document.querySelector('.btn-new-chat');
    if (newChatBtn) {
      newChatBtn.addEventListener('click', () => CHAT.reset());
    }
  },

  /**
   * Bascule l'état de la barre latérale
   */
  toggle() {
    const sidebar = document.getElementById('sidebar');
    const mainContainer = document.querySelector('.main-container');
    const openBtn = document.getElementById('btn-open-sidebar');

    if (sidebar) {
      sidebar.classList.toggle('hidden');
      this.isOpen = !this.isOpen;
    }

    if (mainContainer) {
      mainContainer.classList.toggle('sidebar-hidden');
    }

    if (openBtn) {
      openBtn.classList.toggle('active');
    }

    localStorage.setItem('mychat_sidebar_open', this.isOpen);
  },

  /**
   * Restaure l'état de la barre latérale
   */
  restoreState() {
    const isOpen = localStorage.getItem('mychat_sidebar_open');
    if (isOpen === 'false') {
      this.isOpen = false;
      this.toggle();
    }
  },

  /**
   * Affiche les personnalités
   */
  renderPersonalities() {
    const personalityList = document.querySelector('.personality-list');
    if (!personalityList) return;

    const lang = CHAT.currentLanguage || 'fr';
    personalityList.innerHTML = '';

    CHARACTERS.getAll().forEach(character => {
      const btn = document.createElement('button');
      btn.className = 'personality-btn';
      btn.dataset.personality = character.id;
      btn.textContent = CHARACTERS.getName(character.id, lang);
      btn.title = CHARACTERS.getDescription(character.id, lang);

      if (character.id === this.currentPersonality) {
        btn.classList.add('active');
      }

      personalityList.appendChild(btn);
    });
  },

  /**
   * Marque une personnalité comme active
   * @param {string} personality - ID de la personnalité
   */
  setActive(personality) {
    document.querySelectorAll('.personality-btn').forEach(btn => {
      btn.classList.remove('active');
    });

    const activeBtn = document.querySelector(`.personality-btn[data-personality="${personality}"]`);
    if (activeBtn) {
      activeBtn.classList.add('active');
    }

    this.currentPersonality = personality;
    STORAGE.savePersonality(personality);
  },

  /**
   * Affiche l'historique des conversations
   */
  renderHistory() {
    const historyList = document.querySelector('.history-list');
    if (!historyList) return;

    const conversations = STORAGE.getConversations();

    if (conversations.length === 0) {
      const msg = CHAT.getTranslation('noHistory');
      historyList.innerHTML = `<p style="color: #888; font-size: 0.85rem; text-align: center; padding: 1rem;">${msg}</p>`;
      return;
    }

    historyList.innerHTML = '';

    conversations.slice(0, 20).forEach(conversation => {
      // Utiliser un <div> — un <button> dans un <button> est du HTML invalide
      const item = document.createElement('div');
      item.className = 'history-item';

      const label = document.createElement('span');
      label.textContent = conversation.title.substring(0, 28);
      label.className = 'history-label';

      const delBtn = document.createElement('button');
      delBtn.className = 'delete-btn';
      delBtn.textContent = '✕';
      delBtn.title = 'Supprimer';

      item.appendChild(label);
      item.appendChild(delBtn);

      // Clic sur l'item (hors supprimer) → charge la conversation
      item.addEventListener('click', () => CHAT.loadConversation(conversation));

      // Clic sur supprimer — stopPropagation pour ne pas déclencher le clic de l'item
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        STORAGE.deleteConversation(conversation.id);
        this.renderHistory();
      });

      historyList.appendChild(item);
    });
  },

  /**
   * Ajoute une conversation à l'historique
   * @param {object} conversation
   */
  addToHistory(conversation) {
    STORAGE.saveConversation(conversation);
    this.renderHistory();
  },

  /**
   * Change la couleur primaire
   * @param {string} color - Code couleur hex
   */
  setColor(color) {
    document.documentElement.style.setProperty('--primary', color);

    const darkColor = this.darkenColor(color, 0.4);

    const header = document.querySelector('header');
    if (header) {
      header.style.background = `linear-gradient(135deg, ${color} 0%, ${darkColor} 100%)`;
    }

    const sendBtn = document.getElementById('bouton-envoyer');
    if (sendBtn) {
      sendBtn.style.background = `linear-gradient(135deg, ${color} 0%, ${darkColor} 100%)`;
    }

    // Teinte le fond d'écran et le champ de texte avec la couleur choisie
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    document.documentElement.style.setProperty(
      '--bg-overlay',
      `linear-gradient(135deg, rgba(${r},${g},${b},0.38) 0%, rgba(12,12,20,0.78) 100%)`
    );
    document.documentElement.style.setProperty(
      '--input-bg',
      `rgba(${r},${g},${b},0.18)`
    );
    document.documentElement.style.setProperty(
      '--chat-bg',
      `linear-gradient(135deg, rgba(${r},${g},${b},0.55) 0%, rgba(${Math.max(0,r-40)},${Math.max(0,g-40)},${Math.max(0,b-40)},0.75) 100%)`
    );

    STORAGE.saveColor(color);
  },

  /**
   * Assombrit une couleur
   * @param {string} color - Code couleur hex
   * @param {number} percent - Pourcentage d'assombrissement
   * @returns {string} Couleur plus foncée
   */
  darkenColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, (num >> 16) - amt);
    const G = Math.max(0, (num >> 8 & 0x00FF) - amt);
    const B = Math.max(0, (num & 0x0000FF) - amt);

    return '#' + (0x1000000 + (R < 0 ? 0 : R) * 0x10000 +
      (G < 0 ? 0 : G) * 0x100 + (B < 0 ? 0 : B))
      .toString(16).slice(1);
  },

  /**
   * Toggle le menu couleur de la barre
   */
  toggleColorMenu() {
    const menu = document.getElementById('couleur-menu-sidebar');
    if (menu) {
      menu.style.display = menu.style.display === 'none' ? 'grid' : 'none';
    }
  }
};
