/* ============================================================
   API - Appels au serveur FastAPI
   ============================================================ */

const API = {
  BASE_URL: window.location.origin === 'file://' ? 'http://localhost:8000' : window.location.origin,

  /**
   * Envoie un message au chatbot
   * @param {string} message - Le message à envoyer
   * @param {string} langue - La langue ('fr', 'en', etc.)
   * @param {string} personnalite - La personnalité du chatbot
   * @returns {Promise<string>} La réponse du chatbot
   */
  async chat(message, langue = 'fr', personnalite = 'mychat') {
    const url = `${this.BASE_URL}/api/chat`;

    try {
      console.log('📨 Envoi du message:', {
        message,
        langue,
        personnalite,
        url
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          langue,
          personnalite
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur HTTP:', response.status);
        console.error('Détails:', errorText);
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Réponse reçue:', data);

      if (!data.reponse) {
        throw new Error('Réponse vide du serveur');
      }

      return data.reponse;

    } catch (error) {
      console.error('❌ Erreur API:', error);
      throw error;
    }
  },

  /**
   * Vérifie si le serveur est disponible (avec timeout)
   * @returns {Promise<boolean>}
   */
  async ping() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${this.BASE_URL}/health`, {
        method: 'GET',
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (e) {
      if (e.name === 'AbortError') {
        console.warn('Health check timeout');
      }
      return false;
    }
  },

  /**
   * Récupère la configuration du chatbot
   * @returns {Promise<object>}
   */
  async getConfig() {
    try {
      const response = await fetch(`${this.BASE_URL}/api/config`, {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération de la config:', error);
      return null;
    }
  }
};
