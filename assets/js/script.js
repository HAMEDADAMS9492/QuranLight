/**
 * --- assets/js/script.js ---
 * Gère l'interface utilisateur globale, la localisation,
 * et les notifications réelles.
 */

// Variable globale pour stocker les horaires pour le système de notification
let cachedPrayerTimings = null;
let lastNotifiedPrayer = ""; // Empêche les notifications multiples pour la même minute

// ============================================================
// 1. GESTION DU TEMPS ET DES DATES + NOTIFICATIONS
// ============================================================
function initDateTime() {
  const timeEl = document.getElementById("current-time");
  const gregEl = document.getElementById("gregorian-date");
  const hijriEl = document.getElementById("hijri-date");

  if (!timeEl) return;

  const updateClock = () => {
    const now = new Date();
    const currentTimeStr = now.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    // 1. Mise à jour de l'affichage
    timeEl.textContent = now.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    // 2. Date Grégorienne
    gregEl.textContent = now.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });

    // 3. Date Hijri
    hijriEl.textContent = new Intl.DateTimeFormat("fr-TN-u-ca-islamic", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(now);

    // --- SYSTÈME DE NOTIFICATION RÉELLE ---
    // On vérifie chaque minute si l'heure actuelle correspond à une prière
    if (now.getSeconds() === 0) {
      checkAndSendNotifications(currentTimeStr);
    }
  };

  setInterval(updateClock, 1000);
  updateClock();
}

// ============================================================
// 2. LOGIQUE DU MENU LATÉRAL (SIDEBAR)
// ============================================================
function setupSidebarToggle() {
  const sidebar = document.getElementById("sidebar");
  const menuToggle = document.getElementById("menu-toggle");
  const sidebarOverlay = document.getElementById("sidebar-overlay");

  if (menuToggle && sidebar && sidebarOverlay) {
    const openSidebar = () => {
      sidebar.classList.add("open");
      sidebarOverlay.style.display = "block";
      document.body.style.overflow = "hidden";
    };

    const closeSidebar = () => {
      sidebar.classList.remove("open");
      sidebarOverlay.style.display = "none";
      document.body.style.overflow = "auto";
    };

    menuToggle.onclick = openSidebar;
    sidebarOverlay.onclick = closeSidebar;

    const navLinks = sidebar.querySelectorAll(".nav-item");
    navLinks.forEach((link) => {
      link.onclick = closeSidebar;
    });
  }
}

// ============================================================
// 3. LOCALISATION (GPS -> NOM DE VILLE -> IP -> FAILSAFE)
// ============================================================
function initLocation() {
  const cached = localStorage.getItem("userLocation");

  if (cached) {
    try {
      const data = JSON.parse(cached);
      updateLocationUI(data.city);
      if (document.getElementById("next-prayer-name"))
        updateHomePrayerMini(data);
      return;
    } catch (e) {
      localStorage.removeItem("userLocation");
    }
  }

  if (navigator.geolocation) {
    // On demande une haute précision (enableHighAccuracy: true)
    updateLocationUI("Position GPS...");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        // Appel Nominatim
        fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`
        )
          .then((res) => res.json())
          .then((geoData) => {
            const a = geoData.address;

            // On cherche le nom de la ville ou de l'état
            let cityName =
              a.city ||
              a.town ||
              a.village ||
              a.city_district ||
              a.state ||
              "Ma Position";

            // Nettoyage spécifique
            const trashTerms = [
              "Municipal Area Council",
              "Area Council",
              "Arrondissement",
              "Municipality",
            ];
            trashTerms.forEach((term) => {
              if (cityName.includes(term))
                cityName = cityName.replace(term, "").trim();
            });

            const countryName = a.country || "";

            saveAndInitLocation({
              city: countryName ? `${cityName}, ${countryName}` : cityName,
              lat: lat,
              lng: lng,
            });
          })
          .catch(() => fetchLocationByIP());
      },
      (err) => {
        console.warn("GPS échoué, bascule IP...", err.message);
        fetchLocationByIP();
      },
      {
        enableHighAccuracy: true, // Force le vrai GPS au lieu de l'IP
        timeout: 15000, // On laisse 15 secondes au lieu de 8
        maximumAge: 0, // Ne pas utiliser de vieille position
      }
    );
  } else {
    fetchLocationByIP();
  }
}

/**
 * Sauvegarde les données et déclenche la mise à jour des calculs de prière
 */
function saveAndInitLocation(data) {
  // SÉCURITÉ : On vérifie que les données sont valides avant de continuer
  if (!data || !data.lat || !data.lng) {
    console.error("Erreur : Données de localisation incomplètes.");
    return;
  }

  // 1. Sauvegarde dans le stockage local du navigateur
  localStorage.setItem("userLocation", JSON.stringify(data));

  // 2. Mise à jour immédiate du nom de la ville dans le Header
  updateLocationUI(data.city);

  // 3. Rafraîchissement des horaires (Page Salat)
  // On vérifie si la fonction existe pour éviter les erreurs JS
  if (typeof updateSalatUI === "function") {
    updateSalatUI();
  }

  // 4. Rafraîchissement du mini-widget (Page Accueil)
  const miniWidget = document.getElementById("next-prayer-name");
  if (miniWidget && typeof updateHomePrayerMini === "function") {
    updateHomePrayerMini(data);
  }

  console.log("Localisation sauvegardée et interface mise à jour :", data.city);
}

function updateLocationUI(cityName) {
  const el = document.getElementById("header-location");
  if (el) {
    el.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${cityName}`;
  }
}
// ============================================================
// 4. LOGIQUE MINI-SALAT + NOTIFS DATA
// ============================================================
async function updateHomePrayerMini(coords) {
  const nameEl = document.getElementById("next-prayer-name");
  const countdownEl = document.getElementById("next-prayer-countdown");
  const progressBar = document.getElementById("prayer-progress-bar");

  if (!nameEl) return;

  try {
    const res = await fetch(
      `https://api.aladhan.com/v1/timings?latitude=${coords.lat}&longitude=${coords.lng}&method=3`
    );
    const json = await res.json();
    const timings = json.data.timings;

    cachedPrayerTimings = timings;

    const now = new Date();
    const prayerList = [
      { n: "Fajr", t: timings.Fajr },
      { n: "Dohr", t: timings.Dhuhr },
      { n: "Asr", t: timings.Asr },
      { n: "Maghreb", t: timings.Maghrib },
      { n: "Isha", t: timings.Isha },
    ];

    let nextP = null;
    for (let p of prayerList) {
      const [h, m] = p.t.split(":");
      const pDate = new Date();
      pDate.setHours(h, m, 0, 0);

      if (pDate > now) {
        nextP = { ...p, date: pDate };
        break;
      }
    }

    // GESTION DU FAJR DE DEMAIN (si toutes les prières du jour sont passées)
    if (!nextP) {
      const [h, m] = timings.Fajr.split(":");
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(h, m, 0, 0);
      nextP = { n: "Fajr", t: timings.Fajr, date: tomorrow };
    }

    if (nextP) {
      nameEl.textContent = nextP.n;
      const timer = setInterval(() => {
        const diff = nextP.date - new Date();
        if (diff <= 0) {
          clearInterval(timer);
          window.location.reload();
        }
        const hh = Math.floor(diff / 3600000);
        const mm = Math.floor((diff % 3600000) / 60000);
        const ss = Math.floor((diff % 60000) / 1000);

        countdownEl.textContent = `${String(hh).padStart(2, "0")}:${String(
          mm
        ).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;

        if (progressBar) {
          const progress = Math.max(0, 100 - (diff / (4 * 3600000)) * 100);
          progressBar.style.width = `${Math.min(progress, 100)}%`;
        }
      }, 1000);
    }
  } catch (e) {
    console.error("Erreur widget prière accueil:", e);
  }
}

// ============================================================
// 5. SYSTÈME DE NOTIFICATIONS RÉELLES
// ============================================================
function setupNotifications() {
  const notifBtn = document.getElementById("notif-toggle-btn");
  if (!notifBtn) return;

  notifBtn.onclick = () => {
    if (!("Notification" in window)) {
      alert("Votre navigateur ne supporte pas les notifications.");
      return;
    }

    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        alert("Notifications activées pour l'Adhan !");
        new Notification("QuranLight", {
          body: "Les rappels sont activés.",
          icon: "assets/image/Logo.jpg",
        });
      }
    });
  };
}

function checkAndSendNotifications(currentTime) {
  if (!cachedPrayerTimings || Notification.permission !== "granted") return;

  const prayersToWatch = {
    Fajr: cachedPrayerTimings.Fajr,
    Dohr: cachedPrayerTimings.Dhuhr,
    Asr: cachedPrayerTimings.Asr,
    Maghreb: cachedPrayerTimings.Maghrib,
    Isha: cachedPrayerTimings.Isha,
  };

  for (const [name, time] of Object.entries(prayersToWatch)) {
    // Si l'heure correspond et qu'on n'a pas déjà envoyé cette notif à cette minute précise
    if (currentTime === time && lastNotifiedPrayer !== name + time) {
      new Notification(`C'est l'heure de ${name}`, {
        body: `L'heure de la prière ${name} est arrivée à ${time}.`,
        icon: "assets/image/Logo.jpg",
        vibrate: [200, 100, 200],
      });
      lastNotifiedPrayer = name + time;
    }
  }
}

// ============================================================
// 6. RAPPELS & CITATIONS
// ============================================================
const quotes = [
  {
    ar: "الصَّبْرُ مِفْتَاحُ الْفَرَجِ",
    fr: "La patience est la clé de la délivrance.",
  },
  {
    ar: "إِنَّ مَعَ الْعُسْرِ يُسْرًا",
    fr: "Certes, après la difficulté vient la facilité.",
  },
  {
    ar: "الصَّلَاةُ نُورُ الْمُؤْمِنِ",
    fr: "La prière est la lumière du croyant.",
  },
  {
    ar: "تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ صَدَقَةٌ",
    fr: "Ton sourire à l'égard de ton frère est une aumône.",
  },
  {
    ar: "فَاذْكُرُونِي أَذْكُرْكُمْ",
    fr: "Souvenez-vous de Moi, Je Me souviendrai de vous.",
  },
  {
    ar: "لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ",
    fr: "Ne désespérez jamais de la miséricorde d'Allah.",
  },
  {
    ar: "مَنْ عَرَفَ نَفْسَهُ عَرَفَ رَبَّهُ",
    fr: "Celui qui se connaît soi-même connaît son Seigneur.",
  },
  {
    ar: "الْكَلِمَةُ الطَّيِّبَةُ صَدَقَةٌ",
    fr: "Une bonne parole est une aumône.",
  },
  { ar: "نُورٌ عَلَىٰ نُورٍ", fr: "Lumière sur Lumière." },
  { ar: "ادْعُونِي أَسْتَجِبْ لَكُمْ", fr: "Invoquez-Moi, Je vous répondrai." },
  {
    ar: "الْجَنَّةُ تَحْتَ أَقْدَامِ الْأُمَّهَاتِ",
    fr: "Le Paradis se trouve sous les pieds des mères.",
  },
  {
    ar: "إِنَّ اللَّهَ مَعَ الصَّابِرِينَ",
    fr: "Certes, Allah est avec les endurants.",
  },
  {
    ar: "خَيْرُ النَّاسِ أَنْفَعُهُمْ لِلنَّاسِ",
    fr: "Le meilleur d'entre vous est le plus utile aux autres.",
  },
  {
    ar: "وَقُل رَّبِّ زِدْنِي عِلْمًا",
    fr: "Et dis : Seigneur, accrois mes connaissances.",
  },
  {
    ar: "الدُنيا مَزْرَعَةُ الآخِرَةِ",
    fr: "Ce monde est le champ de culture pour l'au-delà.",
  },
];

function initDailyReminders() {
  const quoteContainer = document.getElementById("daily-quote");
  if (!quoteContainer) return;

  const rotate = () => {
    const rand = Math.floor(Math.random() * quotes.length);
    const selected = quotes[rand];
    quoteContainer.style.opacity = 0;
    quoteContainer.style.transform = "scale(0.95)";

    setTimeout(() => {
      quoteContainer.innerHTML = `
                <div class="quote-content">
                    <p class="quote-arabic">${selected.ar}</p>
                    <div class="quote-separator"><div class="sep-diamond"></div></div>
                    <p class="quote-french">"${selected.fr}"</p>
                </div>
            `;
      quoteContainer.style.opacity = 1;
      quoteContainer.style.transform = "scale(1)";
    }, 600);
  };
  rotate();
  setInterval(rotate, 12000);
}

// ============================================================
// 6.5 GESTION DES RÉCITATEURS (ACCUEIL)
// ============================================================
function selectReciter(reciterId) {
  localStorage.setItem("preferred_reciter", reciterId);
  window.location.href = "quran.html";
}

function initDefaultReciter() {
  if (!localStorage.getItem("preferred_reciter")) {
    localStorage.setItem("preferred_reciter", "ar.alafasy");
  }
}

/* =============================================== */
/* GESTION DES PRÉFÉRENCES ET THÈMES - QURANLIGHT  */
/* =============================================== */

document.addEventListener("DOMContentLoaded", () => {
  const fontRange = document.getElementById("font-range");
  const fontPreview = document.getElementById("font-preview");
  const genderSelect = document.getElementById("pref-gender");
  const themeSelect = document.getElementById("pref-theme");
  const timeSelect = document.getElementById("time-format");
  const distanceSelect = document.getElementById("distance-unit");
  const dhikrToggle = document.getElementById("pref-dhikr");
  const clearCacheBtn = document.getElementById("clear-cache");

  function loadSettings() {
    const settings = JSON.parse(localStorage.getItem("quranlight_prefs")) || {};
    if (settings.fontSize && fontRange) {
      fontRange.value = settings.fontSize;
      if (fontPreview) fontPreview.style.fontSize = settings.fontSize + "px";
    }
    if (settings.gender && genderSelect) genderSelect.value = settings.gender;
    if (settings.theme && themeSelect) {
      themeSelect.value = settings.theme;
      applyTheme(settings.theme);
    } else {
      applyTheme("emerald");
    }
    if (settings.timeFormat && timeSelect)
      timeSelect.value = settings.timeFormat;
    if (settings.distanceUnit && distanceSelect)
      distanceSelect.value = settings.distanceUnit;
    if (settings.dhikr !== undefined && dhikrToggle)
      dhikrToggle.checked = settings.dhikr;
  }

  function saveSetting(key, value) {
    let settings = JSON.parse(localStorage.getItem("quranlight_prefs")) || {};
    settings[key] = value;
    localStorage.setItem("quranlight_prefs", JSON.stringify(settings));
  }

  function applyTheme(themeName) {
    document.body.classList.remove("theme-midnight", "theme-dark");
    if (themeName === "midnight") document.body.classList.add("theme-midnight");
    else if (themeName === "dark") document.body.classList.add("theme-dark");
  }

  if (fontRange) {
    fontRange.addEventListener("input", (e) => {
      const size = e.target.value;
      if (fontPreview) fontPreview.style.fontSize = size + "px";
      saveSetting("fontSize", size);
    });
  }
  if (themeSelect) {
    themeSelect.addEventListener("change", (e) => {
      const selectedTheme = e.target.value;
      applyTheme(selectedTheme);
      saveSetting("theme", selectedTheme);
    });
  }
  if (genderSelect)
    genderSelect.addEventListener("change", (e) =>
      saveSetting("gender", e.target.value)
    );
  if (timeSelect)
    timeSelect.addEventListener("change", (e) =>
      saveSetting("timeFormat", e.target.value)
    );
  if (distanceSelect)
    distanceSelect.addEventListener("change", (e) =>
      saveSetting("distanceUnit", e.target.value)
    );
  if (dhikrToggle)
    dhikrToggle.addEventListener("change", (e) =>
      saveSetting("dhikr", e.target.checked)
    );

  if (clearCacheBtn) {
    clearCacheBtn.addEventListener("click", () => {
      if (
        confirm("Attention : Cela effacera toutes vos préférences. Continuer ?")
      ) {
        localStorage.removeItem("quranlight_prefs");
        location.reload();
      }
    });
  }
  loadSettings();
});

// ============================================================
// 7. INITIALISATION AU CHARGEMENT
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  setupSidebarToggle();
  initLocation();
  initDateTime();
  initDailyReminders();
  setupNotifications();
  initDefaultReciter();

  const syncBtn = document.getElementById("sync-location-btn");

  if (syncBtn) {
    syncBtn.onclick = () => {
      // 1. Effacer le cache
      localStorage.removeItem("userLocation");

      // 2. Feedback visuel immédiat (On fait tourner l'icône)
      const originalIcon = '<i class="fas fa-sync-alt"></i>';
      syncBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

      // 3. Relancer la détection
      if (typeof initLocation === "function") {
        // On appelle initLocation
        initLocation();

        // Astuce : On surveille quand le localStorage est mis à jour
        // pour remettre l'icône originale au bon moment
        const checkUpdate = setInterval(() => {
          if (localStorage.getItem("userLocation")) {
            syncBtn.innerHTML = originalIcon;
            clearInterval(checkUpdate); // On arrête de surveiller
          }
        }, 500);

        // Sécurité : Si après 10s rien ne se passe, on remet l'icône
        setTimeout(() => {
          if (syncBtn.innerHTML.includes("fa-spin")) {
            syncBtn.innerHTML = originalIcon;
            clearInterval(checkUpdate);
          }
        }, 10000);
      } else {
        // Fallback si la fonction n'existe pas
        window.location.reload();
      }
    };
  }
});
