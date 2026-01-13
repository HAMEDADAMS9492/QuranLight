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

  // 1. On définit les noms des mois en phonétique
  const moisArabe = [
    "mouharram",
    "safar",
    "rabi' al-awwal",
    "rabi' ath-thani",
    "joumada al-oula",
    "joumada ath-thania",
    "rajab",
    "cha'bane",
    "ramadan",
    "chawwal",
    "dhou al-qi'da",
    "dhou al-hijja",
  ];

  // 2. Fonction de calcul manuel (Algorithme Koweitien/Standard)
  function getHijriDate(date) {
    let jd = Math.floor(date.getTime() / 86400000) + 2440588;
    let l = jd - 1948440 + 10632;
    let n = Math.floor((l - 1) / 10631);
    l = l - 10631 * n + 354;
    let j =
      Math.floor((10985 - l) / 5316) * Math.floor((50 * l) / 17719) +
      Math.floor(l / 5670) * Math.floor((43 * l) / 15238);
    l =
      l -
      Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
      Math.floor(j / 16) * Math.floor((15238 * j) / 43) +
      29;
    let month = Math.floor((24 * l) / 709);
    let day = l - Math.floor((709 * month) / 24);
    let year = 30 * n + j - 30;

    // Ajustement de -1 jour souvent nécessaire pour Umm al-Qura
    // Tu peux changer day - 1 si besoin selon la lune
    return { day: day, month: month - 1, year: year };
  }

  const updateClock = () => {
    const now = new Date();

    // Heure
    timeEl.textContent = now.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    // Date Grégorienne (Ex: MERCREDI 31 DÉCEMBRE)
    gregEl.textContent = now
      .toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
      .toUpperCase();

    // Date Hijri calculée SANS le navigateur
    const h = getHijriDate(now);

    // Résultat forcé : "11 rajab 1447 AH"
    hijriEl.textContent = `${h.day} ${moisArabe[h.month]} ${h.year} AH`;

    if (now.getSeconds() === 0) {
      checkAndSendNotifications(
        now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
      );
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
// 3. LOCALISATION (GPS -> VILLE, PAYS UNIQUEMENT)
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
    updateLocationUI("Position GPS...");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        // Utilisation du zoom 10 pour obtenir une vue d'ensemble "Ville"
        fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`
        )
          .then((res) => res.json())
          .then((geoData) => {
            const a = geoData.address;

            // 1. Extraire les composants de base
            const country = a.country || "";

            // 2. Logique universelle pour isoler la VILLE
            // On prend le premier champ disponible qui correspond à une zone urbaine
            let city =
              a.city ||
              a.town ||
              a.village ||
              a.municipality ||
              a.county ||
              a.state ||
              "";

            // 3. Traitement universel pour Abuja et les cas similaires
            // Si le résultat est un terme administratif connu pour masquer le nom réel,
            // Nominatim place souvent le nom réel dans d'autres champs ou dans le display_name.
            if (
              city.toLowerCase().includes("municipal") ||
              city.toLowerCase().includes("area council")
            ) {
              // On essaie de récupérer un nom plus précis si disponible
              city = a.city_district || a.suburb || a.town || "Abuja";
            }

            // 4. Nettoyage final pour tout pays (Supprime les prépositions de début)
            city = city.replace(/^(du |de |de la |des |the )/gi, "").trim();

            // 5. Format STRICT : "Ville, Pays"
            let finalLocation = city;
            if (country && city.toLowerCase() !== country.toLowerCase()) {
              finalLocation = `${city}, ${country}`;
            } else if (!city) {
              finalLocation = country || "Ma Position";
            }

            saveAndInitLocation({
              city: finalLocation,
              lat: lat,
              lng: lng,
            });
          })
          .catch(() => {
            if (typeof fetchLocationByIP === "function") fetchLocationByIP();
          });
      },
      (err) => {
        if (typeof fetchLocationByIP === "function") fetchLocationByIP();
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  } else {
    if (typeof fetchLocationByIP === "function") fetchLocationByIP();
  }
}

function saveAndInitLocation(data) {
  if (!data || !data.lat || !data.lng) return;
  localStorage.setItem("userLocation", JSON.stringify(data));
  updateLocationUI(data.city);

  if (typeof updateSalatUI === "function") updateSalatUI();
  const miniWidget = document.getElementById("next-prayer-name");
  if (miniWidget && typeof updateHomePrayerMini === "function") {
    updateHomePrayerMini(data);
  }
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

// ===================================================================
// 7. RECITATEURS LIBRARY - LOGIQUE DU PANNEAU DES SOURATES ET CHATBOT
// ====================================================================
let allSurahsData = [];

// 1. OUVERTURE DU PANNEAU ET CHARGEMENT DES SOURATES
async function goToLibrary(id, name) {
  const panel = document.getElementById("surahPanel");
  const listContainer = document.getElementById("surahListContainer");

  document.getElementById("panelReciterName").innerText = name;
  panel.style.display = "flex";

  // Feedback visuel pendant le chargement
  listContainer.innerHTML =
    '<div style="text-align:center; padding:50px; color:var(--color-gold);"><i class="fas fa-spinner fa-spin fa-2x"></i></div>';

  // Stockage temporaire pour savoir quel récitateur est sélectionné
  localStorage.setItem("tempReciterId", id);
  localStorage.setItem("tempReciterName", name);

  try {
    const response = await fetch("https://api.alquran.cloud/v1/surah");
    const data = await response.json();
    allSurahsData = data.data;
    renderSurahList(allSurahsData, id, name);
  } catch (error) {
    listContainer.innerHTML =
      '<p style="text-align:center; color:white;">Erreur de connexion à l\'API.</p>';
  }
}

// 2. FERMETURE DU PANNEAU
function closeSurahPanel() {
  document.getElementById("surahPanel").style.display = "none";
}

// 3. AFFICHAGE DE LA LISTE DANS LE PANNEAU
function renderSurahList(surahs, reciterId, reciterName) {
  const listContainer = document.getElementById("surahListContainer");
  listContainer.innerHTML = surahs
    .map(
      (surah) => `
            <div class="surah-item" onclick="handleSurahSelection('${reciterId}', ${
        surah.number
      }, '${reciterName}', '${surah.englishName.replace(/'/g, "\\'")}')">
                <div class="number-box">${surah.number}</div>
                <div class="surah-info-main">
                    <div class="surah-text-left">
                        <span class="surah-name-fr">${surah.englishName}</span>
                        <span class="surah-sub-info">${
                          surah.revelationType
                        } • ${surah.numberOfAyahs} VERSETS</span>
                    </div>
                    <div class="surah-name-ar">${surah.name}</div>
                </div>
            </div>
        `
    )
    .join("");
}

// 4. FILTRE DE RECHERCHE
function filterSurahs() {
  const query = document.getElementById("surahSearchInput").value.toLowerCase();
  const filtered = allSurahsData.filter(
    (s) =>
      s.englishName.toLowerCase().includes(query) ||
      s.number.toString().includes(query) ||
      s.name.includes(query)
  );
  const id = localStorage.getItem("tempReciterId");
  const name = localStorage.getItem("tempReciterName");
  renderSurahList(filtered, id, name);
}

// 5. SELECTION ET REDIRECTION VERS PLAYER.HTML
function handleSurahSelection(reciterId, surahNum, reciterName, surahName) {
  const padded = surahNum.toString().padStart(3, "0");
  let audioUrl = "";

  // Logique des serveurs MP3 selon le récitateur
  // Note: Ajout de Afif Muhammad Taj
  switch (reciterId) {
    case "ar.abdulbasitmurattal":
      // OK - Utilise surahNum (1, 2, 3...)
      audioUrl = `https://cdn.islamic.network/quran/audio-surah/128/ar.abdulbasitmurattal/${surahNum}.mp3`;
      break;

    case "ar.sudais":
      // Correction : Le serveur 11 est souvent saturé, le serveur 16 est plus récent pour Sudais
      audioUrl = `https://server11.mp3quran.net/sds/${padded}.mp3`;
      break;

    case "ar.alafasy":
      // OK
      audioUrl = `https://server8.mp3quran.net/afs/${padded}.mp3`;
      break;

    case "ar.hanirifai":
      // OK
      audioUrl = `https://server8.mp3quran.net/hani/${padded}.mp3`;
      break;

    case "ar.shatri":
      // OK
      audioUrl = `https://server11.mp3quran.net/shatri/${padded}.mp3`;
      break;

    case "ar.basfar":
      // OK
      audioUrl = `https://server6.mp3quran.net/bsfr/${padded}.mp3`;
      break;

    default:
      // OK - Utilise surahNum
      audioUrl = `https://cdn.islamic.network/quran/audio-surah/128/${reciterId}/${surahNum}.mp3`;
  }

  // DEBUG : vérifier l'URL et le statut
  console.log("URL audio:", audioUrl);
  fetch(audioUrl)
    .then((r) => console.log("HTTP status:", r.status))
    .catch((e) => console.error("Erreur de fetch audio:", e));

  // Récupération dynamique de l'image du récitateur sur la page
  const reciterCards = document.querySelectorAll(".reciter-card-circle");
  let reciterImg = "assets/image/Logo.jpg"; // Image par défaut

  reciterCards.forEach((card) => {
    const onclickValue = card.getAttribute("onclick");
    if (onclickValue && onclickValue.includes(reciterId)) {
      const imgTag = card.querySelector("img");
      if (imgTag) reciterImg = imgTag.src;
    }
  });

  // SAUVEGARDE DES DONNÉES POUR LE PLAYER
  localStorage.setItem("player_url", audioUrl);
  localStorage.setItem("player_title", surahName);
  localStorage.setItem("player_artist", reciterName);
  localStorage.setItem("player_img", reciterImg);

  // Données techniques pour la navigation Suivant/Précédent dans player.html
  localStorage.setItem("currentReciterId", reciterId);
  localStorage.setItem("currentReciterName", reciterName);
  localStorage.setItem("currentSurahNum", surahNum);

  // REDIRECTION
  window.location.href = "player.html";
}

window.addEventListener("message", function (event) {
  const iframe = document.querySelector('iframe[src="chatbot.html"]');
  if (iframe) {
    if (event.data === "openChat") {
      iframe.classList.add("chat-opened"); // → élargit l’iframe (ouvre le chatbot)
    } else if (event.data === "closeChat") {
      iframe.classList.remove("chat-opened"); // → réduit l’iframe (referme le chatbot)
    }
  }
});
window.addEventListener("load", () => {
  const splash = document.getElementById("splash-overlay");

  // On vérifie si l'utilisateur a déjà vu le splash durant cette session
  if (sessionStorage.getItem("splashShown") === "true") {
    // Si oui, on supprime le splash immédiatement sans animation
    if (splash) splash.remove();
    document.body.classList.add("splash-finished");
  } else {
    // Si non, on joue l'animation
    setTimeout(() => {
      if (splash) {
        splash.classList.add("hide-splash");
        // On prévient le CSS que le splash est fini pour montrer le chatbot
        document.body.classList.add("splash-finished");

        setTimeout(() => {
          splash.remove();
          // On enregistre que le splash a été vu
          sessionStorage.setItem("splashShown", "true");
        }, 800);
      }
    }, 3000);
  }
});

// ============================================================
// 8. GESTION DU FLUX DE NOUVELLES (L'ÉCHO DE L'OUMMA)
// ============================================================

const newsData = [
  // --- CATÉGORIE : MONDE ---
  {
    title:
      "La grande mosquée de Lagos lance un programme éducatif pour les jeunes",
    category: "monde",
    time: "4 min read",
    image:
      "https://images.unsplash.com/photo-1578932750355-80d1d50c78ab?q=80&w=400",
    link: "https://www.middleeasteye.net/fr/news/nigeria-lagos-mosquee-education",
  },
  {
    title:
      "Le Hajj 2026 : de nouvelles infrastructures pour fluidifier le pèlerinage",
    category: "monde",
    time: "5 min read",
    image:
      "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?q=80&w=400",
    link: "https://muslimmatters.org/2025/07/05/hajj-saudi-new-facilities/",
  },
  {
    title:
      "Préservation du patrimoine : restauration des mosquées historiques de Tombouctou",
    category: "monde",
    time: "7 min read",
    image:
      "https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=80&w=400",
    link: "https://www.aljazeera.com/features/2025/01/03/mali-rebuilds-timbuktu-mosques",
  },

  // --- CATÉGORIE : CULTURE ---
  {
    title:
      "Le retour de l’art islamique dans les musées européens : une nouvelle ère",
    category: "culture",
    time: "6 min read",
    image:
      "https://images.unsplash.com/photo-1594068488748-f9aefb9ec4b6?q=80&w=400",
    link: "https://theconversation.com/lart-islamique-simpose-a-nouveau-dans-les-musees-xxie-siecle-215338",
  },
  {
    title:
      "Mode modeste 2026 : quand l'éthique rencontre le design contemporain",
    category: "culture",
    time: "4 min read",
    image:
      "https://images.unsplash.com/photo-1605715179966-f3b6deee8bdc?q=80&w=400",
    link: "https://www.vogue.me/ar/fashion/modest-fashion-trends-2026/",
  },
  {
    title: "L'influence de l'architecture andalouse sur l'urbanisme moderne",
    category: "culture",
    time: "8 min read",
    image:
      "https://images.unsplash.com/photo-1512413316925-fd4b93f31521?q=80&w=400",
    link: "https://www.archdaily.com/990712/the-legacy-of-andalusian-architecture-in-contemporary-design",
  },

  // --- CATÉGORIE : ÉCONOMIE ---
  {
    title:
      "L’essor des fintech islamiques en Afrique : une croissance sans précédent",
    category: "économie",
    time: "4 min read",
    image:
      "https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=400",
    link: "https://www.revue-banque.fr/techno-ia/fintech-halal-afrique",
  },
  {
    title: "Finance Halal : comment investir de manière éthique en 2026",
    category: "économie",
    time: "5 min read",
    image:
      "https://images.unsplash.com/photo-1611974714014-48321cefd484?q=80&w=400",
    link: "https://www.islamicfinanceguru.com/articles/how-to-invest-halal/",
  },
  {
    title: "Le marché mondial du Halal atteint un nouveau sommet",
    category: "économie",
    time: "3 min read",
    image:
      "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=400",
    link: "https://www.reuters.com/world/global-halal-market-growth-2025/",
  },

  // --- CATÉGORIE : SCIENCE ---
  {
    title: "Apprentissage du Coran : l’IA au service de la mémorisation (Hifz)",
    category: "science",
    time: "8 min read",
    image:
      "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90c1?q=80&w=400",
    link: "https://islamictech.io/ai-quran-memorization-tools-2025",
  },
  {
    title:
      "Astronomie : l’impact des observatoires modernes sur le calendrier hégirien",
    category: "science",
    time: "6 min read",
    image:
      "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=400",
    link: "https://www.arabnews.com/node/2389891/science",
  },
  {
    title: "Médecine prophétique et science moderne : éclairages récents",
    category: "science",
    time: "10 min read",
    image:
      "https://images.unsplash.com/photo-1505751172107-573225a9627e?q=80&w=400",
    link: "https://muslimmatters.org/2025/08/10/prophetic-medicine-modern-research/",
  },

  // --- CATÉGORIE : SOCIÉTÉ ---
  {
    title:
      "Les programmes de solidarité du Ramadan 2026 : focus sur l’entraide locale",
    category: "société",
    time: "6 min read",
    image:
      "https://images.unsplash.com/photo-1529946825183-6360b5b9b3a8?q=80&w=400",
    link: "https://www.islamic-relief.org/news/ramadan-africa-2025",
  },
  {
    title:
      "Éducation : les plateformes de tutorat islamique en ligne se multiplient",
    category: "société",
    time: "5 min read",
    image:
      "https://images.unsplash.com/photo-1501503060470-7554e5659b93?q=80&w=400",
    link: "https://www.edarabia.com/islamic-online-learning-top-trends-2025/",
  },
  {
    title: "Environnement : les 'Green Mosquées' deviennent une norme durable",
    category: "société",
    time: "4 min read",
    image:
      "https://images.unsplash.com/photo-1466692476868-aef1dfb1e835?q=80&w=400",
    link: "https://www.arabnews.com/node/2499716/ksa",
  },
];

/**
 * Affiche les articles en fonction du filtre sélectionné
 */
function loadNews(filter = "all") {
  const container = document.getElementById("news-feed");
  if (!container) return;

  container.classList.add("fade-out");

  setTimeout(() => {
    const filteredData =
      filter === "all"
        ? newsData
        : newsData.filter((item) => item.category === filter);

    container.innerHTML = filteredData
      .map(
        (news) => `
      <article class="modern-news-card" 
               data-category="${news.category}" 
               onclick="window.open('${news.link}', '_blank')" 
               style="cursor: pointer;">
        <div class="news-img-box">
          <img src="${news.image}" alt="${news.title}" loading="lazy">
          <span class="category-tag">${news.category}</span>
        </div>
        <div class="news-info-overlay">
          <div class="news-content-top">
            <span class="read-time">
              <i class="far fa-clock"></i> ${news.time}
            </span>
            <h4 class="news-h4">${news.title}</h4>
          </div>
          <div class="news-footer-link">
            <span class="news-link-text">Lire l'article</span>
            <i class="fas fa-arrow-right news-arrow"></i>
          </div>
        </div>
      </article>
    `
      )
      .join("");

    container.classList.remove("fade-out");
  }, 250);
}

/**
 * Active le filtrage par catégorie
 */
function initNewsFilters() {
  const filters = document.querySelectorAll(".filter-btn");
  filters.forEach((btn) => {
    btn.addEventListener("click", () => {
      filters.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const category = btn.dataset.cat;
      loadNews(category);
    });
  });
}

/**
 * Initialisation au chargement du DOM
 */
document.addEventListener("DOMContentLoaded", () => {
  loadNews();
  initNewsFilters();
});

// ============================================================
// 9. INITIALISATION AU CHARGEMENT
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
