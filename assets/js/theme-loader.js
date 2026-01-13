/**
 * THEME LOADER OPTIMISÉ - QuranLight v2
 * Zéro flash, 100% robuste, compatible PWA/offline
 */
(function () {
  // Cache pour éviter les appels répétés
  let prefsCache = null;

  const getPrefs = () => {
    if (prefsCache) return prefsCache;

    try {
      prefsCache = JSON.parse(localStorage.getItem("quranlight_prefs")) || {};
    } catch (e) {
      prefsCache = { theme: "emerald" }; // Fallback sécurisé
    }
    return prefsCache;
  };

  const applyTheme = (theme) => {
    const root = document.documentElement;
    const body = document.body;

    // Nettoyage complet
    root.removeAttribute("data-theme");
    root.classList.remove("theme-dark");
    if (body) body.classList.remove("theme-dark");

    // Application du thème dark uniquement
    if (theme === "dark") {
      root.setAttribute("data-theme", "dark");
      root.classList.add("theme-dark");
      if (body) body.classList.add("theme-dark");
    }
  };

  // LECTURE PRÉCOCE (anti-flash)
  const prefs = getPrefs();
  if (prefs.theme === "dark") {
    applyTheme("dark");
  }

  // FINALISATION (body + événements)
  const finalize = () => {
    applyTheme(prefs.theme);

    // Écoute les changements de préférence utilisateur
    window.addEventListener("storage", (e) => {
      if (e.key === "quranlight_prefs") {
        prefsCache = null; // Invalide cache
        applyTheme(getPrefs().theme);
      }
    });
  };

  // Exécution selon disponibilité DOM
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", finalize);
  } else {
    finalize();
  }

  // SURVEILLANCE MULTI-ONGLET (bonus)
  window.addEventListener("storage", (e) => {
    if (e.key === "quranlight_prefs") {
      location.reload(); // Plus robuste que recalcul
    }
  });
})();
