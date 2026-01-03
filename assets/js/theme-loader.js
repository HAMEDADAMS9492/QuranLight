/**
 * THEME LOADER - QuranLight
 * Optimisé pour une exécution immédiate sans flash visuel.
 */
(function () {
  const getPrefs = () => {
    try {
      return JSON.parse(localStorage.getItem("quranlight_prefs")) || {};
    } catch (e) {
      return {};
    }
  };

  const apply = (theme) => {
    const root = document.documentElement;

    if (theme === "dark") {
      // Applique l'attribut sur l'élément racine (HTML) immédiatement
      root.setAttribute("data-theme", "dark");
      root.classList.add("theme-dark");

      // Si le body est déjà disponible, on lui ajoute la classe aussi
      if (document.body) {
        document.body.classList.add("theme-dark");
      }
    } else {
      // Sécurité : on nettoie si le thème est emerald
      root.removeAttribute("data-theme");
      root.classList.remove("theme-dark");
      if (document.body) document.body.classList.remove("theme-dark");
    }
  };

  const settings = getPrefs();

  // EXÉCUTION IMMÉDIATE (sur l'élément <html> qui existe déjà)
  if (settings.theme) {
    // On applique sur le root tout de suite pour bloquer le flash
    if (settings.theme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
      document.documentElement.classList.add("theme-dark");
    }
  }

  // SURVEILLANCE DU BODY (pour finaliser l'application dès qu'il apparaît)
  if (settings.theme && settings.theme !== "emerald") {
    const observer = new MutationObserver(() => {
      if (document.body) {
        apply(settings.theme);
        observer.disconnect();
      }
    });

    observer.observe(document.documentElement, { childList: true });

    // Sécurité si déjà chargé
    if (document.body) apply(settings.theme);
  }
})();
