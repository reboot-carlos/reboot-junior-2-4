/* ============================================================
   STORAGE - Gestion du localStorage
   ============================================================ */

const STORAGE = {
  prefix: 'mychat_',

  /**
   * Sauvegarde la couleur principale
   * @param {string} color - Code couleur hexadécimal
   */
  saveColor(color) {
    localStorage.setItem(this.prefix + 'color', color);
  },

  /**
   * Récupère la couleur principale
   * @returns {string|null}
   */
  getColor() {
    return localStorage.getItem(this.prefix + 'color');
  },

  /**
   * Sauvegarde la langue courante
   * @param {string} lang - Code de langue
   */
  saveLanguage(lang) {
    localStorage.setItem(this.prefix + 'language', lang);
  },

  /**
   * Récupère la langue courante
   * @returns {string}
   */
  getLanguage() {
    return localStorage.getItem(this.prefix + 'language') || 'fr';
  },

  /**
   * Sauvegarde la personnalité courante
   * @param {string} personality - Clé de personnalité
   */
  savePersonality(personality) {
    localStorage.setItem(this.prefix + 'personality', personality);
  },

  /**
   * Récupère la personnalité courante
   * @returns {string}
   */
  getPersonality() {
    return localStorage.getItem(this.prefix + 'personality') || 'mychat';
  },

  /**
   * Ajoute une conversation à l'historique
   * @param {object} conversation - Objet avec id, titre, date, messages
   */
  saveConversation(conversation) {
    const conversations = this.getConversations();
    conversations.unshift(conversation);
    // Garder seulement les 50 dernières conversations
    if (conversations.length > 50) {
      conversations.pop();
    }
    localStorage.setItem(this.prefix + 'conversations', JSON.stringify(conversations));
  },

  /**
   * Récupère toutes les conversations
   * @returns {array}
   */
  getConversations() {
    const stored = localStorage.getItem(this.prefix + 'conversations');
    if (!stored) return [];

    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Erreur parsing conversations:', e);
      // localStorage corrompu, réinitialiser
      this.clearConversations();
      return [];
    }
  },

  /**
   * Supprime une conversation
   * @param {string} id - ID de la conversation
   */
  deleteConversation(id) {
    const conversations = this.getConversations();
    const filtered = conversations.filter(c => c.id !== id);
    localStorage.setItem(this.prefix + 'conversations', JSON.stringify(filtered));
  },

  /**
   * Efface tout l'historique
   */
  clearConversations() {
    localStorage.removeItem(this.prefix + 'conversations');
  },

  /**
   * Sauvegarde l'emoji courant
   * @param {string} emoji - L'emoji
   */
  saveEmoji(emoji) {
    localStorage.setItem(this.prefix + 'emoji', emoji);
  },

  /**
   * Récupère l'emoji courant
   * @returns {string|null}
   */
  getEmoji() {
    return localStorage.getItem(this.prefix + 'emoji');
  },

  /**
   * Efface tous les données (reset complet)
   */
  clearAll() {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key);
      }
    });
  }
};
