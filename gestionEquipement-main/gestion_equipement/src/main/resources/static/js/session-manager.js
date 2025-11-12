// js/session-manager.js

console.log("🔧 Session Manager chargé");

/**
 * Affiche l'overlay de session expirée
 */
function showSessionExpiredOverlay() {
  console.log("🚨 Affichage overlay session expirée");
  const overlay = document.getElementById('session-expired-overlay');
  if (overlay) {
    overlay.style.display = 'flex';
    
    // Fermer tous les modals
    document.querySelectorAll('.modal, #modal').forEach(modal => {
      modal.style.display = 'none';
    });
    
    document.body.style.overflow = 'hidden';
  }
}

/**
 * Déconnexion
 */
function logout() {
  console.log("🔒 Déconnexion...");
  fetch('/logout', {
    method: 'POST',
    credentials: 'include'
  })
  .then(() => window.location.href = '/auth')
  .catch(() => window.location.href = '/auth');
}

// ========================================
// 1️⃣ INTERCEPTER XMLHttpRequest (jQuery, etc.)
// ========================================
const originalXHROpen = XMLHttpRequest.prototype.open;
const originalXHRSend = XMLHttpRequest.prototype.send;

XMLHttpRequest.prototype.open = function(method, url, ...rest) {
  this._url = url; // Stocker l'URL pour référence
  this._method = method;
  return originalXHROpen.apply(this, [method, url, ...rest]);
};

XMLHttpRequest.prototype.send = function(...args) {
  // Ne pas intercepter /auth et /logout
  if (this._url && (this._url.includes('/auth') || this._url.includes('/logout'))) {
    return originalXHRSend.apply(this, args);
  }

  // Ajouter un listener pour détecter la réponse
  this.addEventListener("load", function() {
    if (this.status === 401 || this.status === 403) {
      console.warn(`⚠️ Session expirée détectée (XHR ${this._method} ${this._url})`);
      
      // Vérifier si c'est vraiment une erreur de session
      try {
        const contentType = this.getResponseHeader("Content-Type");
        if (contentType && contentType.includes("application/json")) {
          const response = JSON.parse(this.responseText);
          if (response.error === "Session expired") {
            showSessionExpiredOverlay();
          }
        } else {
          // Si ce n'est pas du JSON, on affiche quand même le popup
          showSessionExpiredOverlay();
        }
      } catch (e) {
        // En cas d'erreur de parsing, afficher le popup par sécurité
        showSessionExpiredOverlay();
      }
    }
  });

  // Ajouter header pour identifier comme requête AJAX
  this.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

  return originalXHRSend.apply(this, args);
};

// ========================================
// 2️⃣ INTERCEPTER FETCH (pour les nouvelles requêtes)
// ========================================
const originalFetch = window.fetch;

window.fetch = function(...args) {
  const url = args[0];
  const options = args[1] || {};
  
  // Ne pas intercepter /auth et /logout
  if (typeof url === 'string' && (url.includes('/auth') || url.includes('/logout'))) {
    return originalFetch.apply(this, args);
  }

  // Ajouter header AJAX
  if (!options.headers) {
    options.headers = {};
  }
  options.headers['X-Requested-With'] = 'XMLHttpRequest';

  return originalFetch.apply(this, [url, options])
    .then(response => {
      if (response.status === 401 || response.status === 403) {
        console.warn(`⚠️ Session expirée détectée (Fetch ${url})`);
        showSessionExpiredOverlay();
        throw new Error('SESSION_EXPIRED');
      }
      return response;
    })
    .catch(error => {
      if (error.message !== 'SESSION_EXPIRED') {
        console.error("❌ Erreur fetch:", error);
      }
      throw error;
    });
};

// ========================================
// 3️⃣ VÉRIFICATION PÉRIODIQUE
// ========================================
function checkSession() {
  if (window.location.pathname.includes('/auth')) {
    return;
  }
  
  originalFetch("/session/check", {
    method: 'GET',
    credentials: 'include',
    headers: {'X-Requested-With': 'XMLHttpRequest'}
  })
    .then(res => {
      if (res.status === 401 || res.status === 403) {
        showSessionExpiredOverlay();
        throw new Error('SESSION_EXPIRED');
      }
      return res.json();
    })
    .then(data => {
      if (data && data.valid) {
        console.log("✅ Session valide");
      } else {
        showSessionExpiredOverlay();
      }
    })
    .catch(err => {
      if (err.message !== 'SESSION_EXPIRED') {
        console.error("❌ Erreur vérification session:", err);
      }
    });
}

// Vérifier au chargement
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', checkSession);
} else {
  checkSession();
}

// Vérification périodique (toutes les 3 minutes)
setInterval(checkSession, 3 * 60 * 1000);

// ========================================
// 4️⃣ EXPOSER GLOBALEMENT
// ========================================
window.checkSession = checkSession;
window.logout = logout;
window.showSessionExpiredOverlay = showSessionExpiredOverlay;

console.log("✅ Session Manager initialisé (XHR + Fetch interceptés)");