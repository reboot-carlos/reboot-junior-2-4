/* ============================================================
   APP - Initialisation principale
   ============================================================ */

class MyChat {
  constructor() {
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.start());
    } else {
      this.start();
    }
    this.initialized = true;
  }

  start() {
    // Configurer marked.js si disponible
    if (window.marked) {
      marked.setOptions({
        breaks: true,   // \n → <br> dans les paragraphes
        gfm: true,      // GitHub Flavored Markdown (tables, strikethrough…)
      });
    }

    SIDEBAR.init();
    CHAT.init();
    this.setupMenus();
    this.setupLanguages();
    this.setupColors();
    this.setupEmojis();
    this.setupAddContent();
    console.log('✅ my\'chat prêt !');
  }

  // ── Menus flottants ──────────────────────────────────────────

  setupMenus() {
    [
      ['.langue-btn', 'langue-menu'],
      ['.jeux-btn',   'jeux-menu'],
      ['.emoji-btn',  'emoji-menu'],
    ].forEach(([btnSel, menuId]) => {
      const btn  = document.querySelector(btnSel);
      const menu = document.getElementById(menuId);
      if (!btn || !menu) return;

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.classList.toggle('active');
      });

      document.addEventListener('click', (e) => {
        if (!btn.contains(e.target) && !menu.contains(e.target)) {
          menu.classList.remove('active');
        }
      });
    });
  }

  // ── Langues ─────────────────────────────────────────────────

  setupLanguages() {
    document.querySelectorAll('.langue-option').forEach(option => {
      option.addEventListener('click', () => {
        const lang = option.dataset.lang;
        if (lang) CHAT.setLanguage(lang);
        document.getElementById('langue-menu')?.classList.remove('active');
      });
    });

    const active = document.querySelector(`.langue-option[data-lang="${CHAT.currentLanguage}"]`);
    if (active) active.classList.add('active');
  }

  // ── Couleurs ─────────────────────────────────────────────────

  setupColors() {
    document.querySelectorAll('.couleur-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const color = btn.style.background || btn.style.backgroundColor;
        if (color) SIDEBAR.setColor(color);
      });
    });
  }

  // ── Emojis ──────────────────────────────────────────────────

  setupEmojis() {
    document.querySelectorAll('.emoji-option').forEach(option => {
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

  // ── Bouton + (Ajouter image / photo / lien) ──────────────────

  setupAddContent() {
    const btnAdd  = document.getElementById('btn-add-content');
    const menuAdd = document.getElementById('add-content-menu');
    const btnSug  = document.getElementById('btn-add-content-suggestion');
    const menuSug = document.getElementById('add-content-menu-suggestion');
    const fileInput  = document.getElementById('file-input');
    const photoInput = document.getElementById('photo-input');

    // Ouvre/ferme les menus
    btnAdd?.addEventListener('click', (e) => {
      e.stopPropagation();
      menuAdd?.classList.toggle('active');
      menuSug?.classList.remove('active');
    });

    btnSug?.addEventListener('click', (e) => {
      e.stopPropagation();
      menuSug?.classList.toggle('active');
      menuAdd?.classList.remove('active');
    });

    // Ferme en cliquant ailleurs
    document.addEventListener('click', (e) => {
      if (!btnAdd?.contains(e.target) && !menuAdd?.contains(e.target)) {
        menuAdd?.classList.remove('active');
      }
      if (!btnSug?.contains(e.target) && !menuSug?.contains(e.target)) {
        menuSug?.classList.remove('active');
      }
    });

    // Boutons du menu  → appelle les méthodes de CHAT
    menuAdd?.querySelector('[data-action="image"]')?.addEventListener('click', () => CHAT.addImage());
    menuAdd?.querySelector('[data-action="photo"]')?.addEventListener('click', () => CHAT.addPhoto());
    menuAdd?.querySelector('[data-action="link"]')?.addEventListener('click',  () => CHAT.addLink());
    menuSug?.querySelector('[data-action="image"]')?.addEventListener('click', () => CHAT.addImage());
    menuSug?.querySelector('[data-action="photo"]')?.addEventListener('click', () => CHAT.addPhoto());
    menuSug?.querySelector('[data-action="link"]')?.addEventListener('click',  () => CHAT.addLink());

    // Lecture image depuis le disque
    fileInput?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) {
        CHAT.addMessage('bot', '❌ Image trop grande (max 5 Mo)');
        fileInput.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        const src = ev.target.result;
        CHAT.addMessage('user', `<img src="${src}" style="max-width:200px;border-radius:8px;margin-top:.5rem;">`);
        CHAT.askQuestion('Décris cette image en quelques mots');
        menuAdd?.classList.remove('active');
        menuSug?.classList.remove('active');
        fileInput.value = '';
      };
      reader.readAsDataURL(file);
    });

    // Lecture photo (même logique, input séparé pour accept="image/*;capture=camera")
    photoInput?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) {
        CHAT.addMessage('bot', '❌ Photo trop grande (max 5 Mo)');
        photoInput.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        const src = ev.target.result;
        CHAT.addMessage('user', `<img src="${src}" style="max-width:200px;border-radius:8px;margin-top:.5rem;">`);
        CHAT.askQuestion('Décris cette photo en quelques mots');
        menuAdd?.classList.remove('active');
        menuSug?.classList.remove('active');
        photoInput.value = '';
      };
      reader.readAsDataURL(file);
    });
  }
}

// ── Bootstrap ────────────────────────────────────────────────
const myChat = new MyChat();
myChat.init();

window.myChat      = myChat;
window.CHAT        = CHAT;
window.SIDEBAR     = SIDEBAR;
window.STORAGE     = STORAGE;
window.CHARACTERS  = CHARACTERS;
window.API         = API;
