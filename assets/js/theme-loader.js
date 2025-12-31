/**
 * THEME LOADER - QuranLight
 * Ce script est optimisé pour éviter le "flash" blanc/vert au chargement.
 */
(function () {
  // 1. Récupérer les préférences
  const getPrefs = () => {
    try {
      return JSON.parse(localStorage.getItem("quranlight_prefs")) || {};
    } catch (e) {
      return {};
    }
  };

  const apply = (theme) => {
    const root = document.documentElement;
    const body = document.body;

    // On ne gère plus que le thème "dark"
    if (theme === "dark") {
      if (body) body.classList.add("theme-dark");
      root.classList.add("theme-dark");
    }
  };

  const settings = getPrefs();

  // On n'exécute la logique que si le thème est défini et n'est pas "emerald" (le thème par défaut)
  if (settings.theme && settings.theme !== "emerald") {
    // 2. Observer l'apparition du Document pour appliquer le thème ASAP
    const observer = new MutationObserver(() => {
      if (document.body) {
        apply(settings.theme);
        observer.disconnect();
      }
    });

    observer.observe(document.documentElement, { childList: true });

    // 3. Sécurité au cas où le body est déjà là
    if (document.body) {
      apply(settings.theme);
    }
  }
})();
