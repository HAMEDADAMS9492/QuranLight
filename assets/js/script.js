/**
 * QuranLight – script.js
 * Script principal : Sidebar, Localisation, Date/Heure, Prière, Citations,
 * Récitateurs, Nouvelles, Paramètres, Splash, Notifications
 *
 * Optimisations :
 * - "use strict" + IIFE pour éviter la pollution globale
 * - Constantes en haut, variables d'état encapsulées
 * - Fonctions async/await uniformisées
 * - Gestion d'erreurs systématique
 * - Accessibilité : aria-expanded, focus management
 * - Suppression des doublons et du code mort
 * - Event delegation pour les récitateurs et les nouvelles
 */

"use strict";

/* ============================================================
   0. CONSTANTES & ÉTAT
   ============================================================ */
const PRAYER_API = "https://api.aladhan.com/v1";
const GEOCODE_API = "https://nominatim.openstreetmap.org/reverse";
const QURAN_API = "https://api.alquran.cloud/v1";
const LOC_STORAGE_KEY = "userLocation";
const PREFS_STORAGE_KEY = "quranlight_prefs";
const DEFAULT_RECITER = "ar.alafasy";

// État partagé (modules internes uniquement)
let _cachedPrayerTimings = null;
let _lastNotifiedPrayer = "";
let _allSurahs = [];
let _prayerCountdownTimer = null;

async function checkForUpdate() {
  try {
    const res = await fetch("/", {
      cache: "no-store",
    });

    const newVersion = res.headers.get("last-modified");

    const oldVersion = localStorage.getItem("site-version");

    if (oldVersion && oldVersion !== newVersion) {
      location.reload(true);
    }

    localStorage.setItem("site-version", newVersion);
  } catch {}
}

setInterval(checkForUpdate, 60000);
/* ============================================================
   1. ENTRÉE PRINCIPALE
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  setupSplash();
  setupSidebar();
  setupSyncBtn();
  initLocation();
  initDateTime();
  initDailyReminders();
  setupNotifications();
  initDefaultReciter();
  setupReciters();
  loadNews("all");
  initNewsFilters();
  initSettings();
  setupChatbotBridge();
});

/* ============================================================
   2. SPLASH SCREEN
   ============================================================ */
function setupSplash() {
  const splash = document.getElementById("splash-overlay");
  if (!splash) return;

  if (sessionStorage.getItem("splashShown") === "true") {
    splash.remove();
    document.body.classList.add("splash-finished");
    return;
  }

  setTimeout(() => {
    splash.classList.add("hide-splash");
    document.body.classList.add("splash-finished");
    setTimeout(() => {
      splash.remove();
      sessionStorage.setItem("splashShown", "true");
    }, 800);
  }, 3000);
}

/* ============================================================
   3. SIDEBAR
   ============================================================ */
function setupSidebar() {
  const sidebar = document.getElementById("sidebar");
  const toggle = document.getElementById("menu-toggle");
  const overlay = document.getElementById("sidebar-overlay");
  if (!sidebar || !toggle || !overlay) return;

  const open = () => {
    sidebar.classList.add("open");
    overlay.style.display = "block";
    document.body.style.overflow = "hidden";
    toggle.setAttribute("aria-expanded", "true");
  };

  const close = () => {
    sidebar.classList.remove("open");
    overlay.style.display = "none";
    document.body.style.overflow = "";
    toggle.setAttribute("aria-expanded", "false");
  };

  toggle.addEventListener("click", open);
  overlay.addEventListener("click", close);

  // Fermeture au clic sur un lien de nav
  sidebar
    .querySelectorAll(".nav-item")
    .forEach((link) => link.addEventListener("click", close));

  // Fermeture à la touche Echap
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && sidebar.classList.contains("open")) close();
  });
}

/* ============================================================
   4. BOUTON SYNC LOCALISATION
   ============================================================ */
function setupSyncBtn() {
  const btn = document.getElementById("sync-location-btn");
  if (!btn) return;

  btn.addEventListener("click", () => {
    localStorage.removeItem(LOC_STORAGE_KEY);
    btn.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i>';
    btn.disabled = true;

    initLocation().finally(() => {
      btn.innerHTML = '<i class="fas fa-sync-alt" aria-hidden="true"></i>';
      btn.disabled = false;
    });
  });
}

/* ============================================================
   5. LOCALISATION GPS
   ============================================================ */
async function initLocation() {
  // Tenter le cache d'abord
  const cached = localStorage.getItem(LOC_STORAGE_KEY);
  if (cached) {
    try {
      const data = JSON.parse(cached);
      if (data?.city && data?.lat && data?.lng) {
        updateLocationUI(data.city);
        updateHomePrayerMini(data);
        return;
      }
    } catch {
      localStorage.removeItem(LOC_STORAGE_KEY);
    }
  }

  // Géolocalisation GPS
  if (!navigator.geolocation) {
    await fallbackToIP();
    return;
  }

  updateLocationUI("Position GPS…");

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        try {
          const res = await fetch(
            `${GEOCODE_API}?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`,
          );
          const geo = await res.json();
          const a = geo.address || {};
          const city = buildCityName(a);
          saveAndInitLocation({ city, lat, lng });
        } catch {
          saveAndInitLocation({ city: "Ma Position", lat, lng });
        }
        resolve();
      },
      async () => {
        await fallbackToIP();
        resolve();
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  });
}

/**
 * Construit un nom de ville propre à partir de l'objet adresse Nominatim
 */
function buildCityName(a) {
  const country = a.country || "";
  let city =
    a.city ||
    a.town ||
    a.village ||
    a.municipality ||
    a.county ||
    a.state ||
    "";

  // Cas zones administratives (Abuja, etc.)
  if (/municipal|area council/i.test(city)) {
    city = a.city_district || a.suburb || a.town || "Ma Position";
  }

  // Nettoyage prépositions
  city = city.replace(/^(du |de |de la |des |the )/gi, "").trim();

  if (city && country && city.toLowerCase() !== country.toLowerCase()) {
    return `${city}, ${country}`;
  }
  return city || country || "Ma Position";
}

async function fallbackToIP() {
  // Fallback silencieux : Paris par défaut
  saveAndInitLocation({ city: "Paris, France", lat: 48.8566, lng: 2.3522 });
}

function saveAndInitLocation(data) {
  if (!data?.lat || !data?.lng) return;
  localStorage.setItem(LOC_STORAGE_KEY, JSON.stringify(data));
  updateLocationUI(data.city);
  updateHomePrayerMini(data);

  // Notifie salat_logic.js si présent
  if (typeof updateSalatUI === "function") updateSalatUI();
}

function updateLocationUI(cityName) {
  // Cible le span de texte pour ne pas écraser l'icône
  const span = document.getElementById("header-location-text");
  if (span) {
    span.textContent = cityName;
  } else {
    // Fallback pour ancienne structure
    const el = document.getElementById("header-location");
    if (el)
      el.innerHTML = `<i class="fa-solid fa-location-dot" aria-hidden="true"></i> ${cityName}`;
  }
}

/* ============================================================
   6. DATE, HEURE & HIJRI
   ============================================================ */
const MOIS_ARABE = [
  "Mouharram",
  "Safar",
  "Rabi' al-Awwal",
  "Rabi' ath-Thani",
  "Joumada al-Oula",
  "Joumada ath-Thania",
  "Rajab",
  "Cha'bane",
  "Ramadan",
  "Chawwal",
  "Dhou al-Qi'da",
  "Dhou al-Hijja",
];

/**
 * Convertit une date grégorienne en date hijri (algorithme koweitien)
 */
function getHijriDate(date) {
  const jd = Math.floor(date.getTime() / 86400000) + 2440588;
  let l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  l = l - 10631 * n + 354;
  const j =
    Math.floor((10985 - l) / 5316) * Math.floor((50 * l) / 17719) +
    Math.floor(l / 5670) * Math.floor((43 * l) / 15238);
  l =
    l -
    Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
    Math.floor(j / 16) * Math.floor((15238 * j) / 43) +
    29;
  const month = Math.floor((24 * l) / 709);
  const day = l - Math.floor((709 * month) / 24);
  const year = 30 * n + j - 30;
  return { day, month: month - 1, year };
}

function initDateTime() {
  const timeEl = document.getElementById("current-time");
  const gregEl = document.getElementById("gregorian-date");
  const hijriEl = document.getElementById("hijri-date");

  if (!timeEl) return;

  const tick = () => {
    const now = new Date();

    timeEl.textContent = now.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    gregEl.textContent = now
      .toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
      .toUpperCase();

    const h = getHijriDate(now);
    hijriEl.textContent = `${h.day} ${MOIS_ARABE[h.month]} ${h.year} AH`;

    // Notifications à la minute pile
    if (now.getSeconds() === 0) {
      const hhmm = now.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      });
      _checkAndSendNotifications(hhmm);
    }
  };

  tick();
  setInterval(tick, 1000);
}

/* ============================================================
   7. WIDGET PROCHAINE PRIÈRE (Accueil)
   ============================================================ */
async function updateHomePrayerMini(coords) {
  const nameEl = document.getElementById("next-prayer-name");
  const countdownEl = document.getElementById("next-prayer-countdown");
  const progressBar = document.getElementById("prayer-progress-bar");
  if (!nameEl) return;

  try {
    const res = await fetch(
      `${PRAYER_API}/timings?latitude=${coords.lat}&longitude=${coords.lng}&method=3`,
    );
    const json = await res.json();
    const timings = json?.data?.timings;
    if (!timings) return;

    _cachedPrayerTimings = timings;

    const now = new Date();
    const prayers = [
      { name: "Fajr", time: timings.Fajr },
      { name: "Dohr", time: timings.Dhuhr },
      { name: "Asr", time: timings.Asr },
      { name: "Maghreb", time: timings.Maghrib },
      { name: "Isha", time: timings.Isha },
    ];

    // Trouver la prochaine prière
    let next = null;
    for (const p of prayers) {
      const [h, m] = p.time.split(":");
      const pDate = new Date();
      pDate.setHours(+h, +m, 0, 0);
      if (pDate > now) {
        next = { ...p, date: pDate };
        break;
      }
    }

    // Fajr de demain si toutes les prières sont passées
    if (!next) {
      const [h, m] = timings.Fajr.split(":");
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(+h, +m, 0, 0);
      next = { name: "Fajr", time: timings.Fajr, date: tomorrow };
    }

    nameEl.textContent = next.name;

    // Annuler l'ancien timer si présent
    if (_prayerCountdownTimer) clearInterval(_prayerCountdownTimer);

    _prayerCountdownTimer = setInterval(() => {
      const diff = next.date - new Date();
      if (diff <= 0) {
        clearInterval(_prayerCountdownTimer);
        location.reload();
        return;
      }
      const hh = Math.floor(diff / 3600000);
      const mm = Math.floor((diff % 3600000) / 60000);
      const ss = Math.floor((diff % 60000) / 1000);
      countdownEl.textContent = `${pad(hh)}:${pad(mm)}:${pad(ss)}`;

      if (progressBar) {
        const progress = Math.min(
          100,
          Math.max(0, 100 - (diff / (4 * 3600000)) * 100),
        );
        progressBar.style.width = `${progress}%`;
      }
    }, 1000);
  } catch (err) {
    console.error("[QuranLight] Widget prière :", err);
    if (nameEl) nameEl.textContent = "Erreur";
  }
}

/* ============================================================
   8. SYSTÈME DE NOTIFICATIONS
   ============================================================ */
function setupNotifications() {
  const btn = document.getElementById("notif-toggle-btn");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    if (!("Notification" in window)) {
      alert("Votre navigateur ne supporte pas les notifications.");
      return;
    }
    const perm = await Notification.requestPermission();
    if (perm === "granted") {
      new Notification("QuranLight", {
        body: "Les rappels de prière sont activés.",
        icon: "assets/image/Logo.jpg",
      });
    }
  });
}

function _checkAndSendNotifications(currentTime) {
  if (!_cachedPrayerTimings || Notification.permission !== "granted") return;

  const watched = {
    Fajr: _cachedPrayerTimings.Fajr,
    Dohr: _cachedPrayerTimings.Dhuhr,
    Asr: _cachedPrayerTimings.Asr,
    Maghreb: _cachedPrayerTimings.Maghrib,
    Isha: _cachedPrayerTimings.Isha,
  };

  for (const [name, time] of Object.entries(watched)) {
    // On compare HH:MM (les timings de l'API sont "HH:MM")
    const apiTime = time.split(" ")[0]; // Enlève le fuseau si présent
    const key = name + apiTime;
    if (currentTime === apiTime && _lastNotifiedPrayer !== key) {
      new Notification(`C'est l'heure de ${name}`, {
        body: `L'heure de la prière ${name} est arrivée à ${apiTime}.`,
        icon: "assets/image/Logo.jpg",
      });
      _lastNotifiedPrayer = key;
    }
  }
}

/* ============================================================
   9. CITATIONS DU JOUR
   ============================================================ */
const QUOTES = [
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
    ar: "الدُّنيا مَزْرَعَةُ الآخِرَةِ",
    fr: "Ce monde est le champ de culture pour l'au-delà.",
  },
];

function initDailyReminders() {
  const el = document.getElementById("daily-quote");
  if (!el) return;

  let currentIndex = Math.floor(Math.random() * QUOTES.length);

  const show = () => {
    const q = QUOTES[currentIndex];
    el.style.opacity = "0";
    el.style.transform = "scale(0.97)";

    setTimeout(() => {
      el.innerHTML = `
        <div class="quote-content">
          <p class="quote-arabic" lang="ar">${q.ar}</p>
          <div class="quote-separator"><div class="sep-diamond"></div></div>
          <p class="quote-french">"${q.fr}"</p>
        </div>`;
      el.style.opacity = "1";
      el.style.transform = "scale(1)";
      currentIndex = (currentIndex + 1) % QUOTES.length;
    }, 500);
  };

  el.style.transition = "opacity 0.5s ease, transform 0.5s ease";
  show();
  setInterval(show, 12000);
}

/* ============================================================
   10. RÉCITATEURS + PANNEAU SOURATES
   ============================================================ */
function initDefaultReciter() {
  if (!localStorage.getItem("preferred_reciter")) {
    localStorage.setItem("preferred_reciter", DEFAULT_RECITER);
  }
}

function setupReciters() {
  const list = document.querySelector(".reciters-horizontal-list");
  if (!list) return;

  // Délégation d'événements sur la liste entière
  list.addEventListener("click", (e) => {
    const card = e.target.closest(".reciter-card-circle");
    if (!card) return;
    const id = card.dataset.reciterId;
    const name = card.dataset.reciterName;
    if (id && name) openSurahPanel(id, name);
  });

  // Accessibilité clavier
  list.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      const card = e.target.closest(".reciter-card-circle");
      if (!card) return;
      e.preventDefault();
      const id = card.dataset.reciterId;
      const name = card.dataset.reciterName;
      if (id && name) openSurahPanel(id, name);
    }
  });

  // Bouton fermeture panneau
  const closeBtn = document.getElementById("surah-close-btn");
  if (closeBtn) closeBtn.addEventListener("click", closeSurahPanel);

  // Fermeture au clavier
  document.addEventListener("keydown", (e) => {
    const panel = document.getElementById("surahPanel");
    if (e.key === "Escape" && panel && !panel.hidden) closeSurahPanel();
  });
}

async function openSurahPanel(id, name) {
  const panel = document.getElementById("surahPanel");
  const titleEl = document.getElementById("panelReciterName");
  const listEl = document.getElementById("surahListContainer");
  if (!panel || !listEl) return;

  titleEl.textContent = name;
  panel.hidden = false;
  panel.removeAttribute("hidden");
  document.body.style.overflow = "hidden";

  // Stocker pour navigation Prev/Next dans player.html
  localStorage.setItem("tempReciterId", id);
  localStorage.setItem("tempReciterName", name);

  listEl.innerHTML = `
    <div style="text-align:center; padding:60px 20px; color:var(--color-gold)">
      <i class="fas fa-spinner fa-spin fa-2x" aria-hidden="true"></i>
      <p style="margin-top:12px; font-size:.9rem; opacity:.7">Chargement des sourates…</p>
    </div>`;

  try {
    if (!_allSurahs.length) {
      const res = await fetch(`${QURAN_API}/surah`);
      const data = await res.json();
      _allSurahs = data.data || [];
    }
    renderSurahList(_allSurahs, id, name, listEl);
  } catch {
    listEl.innerHTML = `<p style="text-align:center;color:#fff;padding:40px">Erreur de connexion. Vérifiez votre réseau.</p>`;
  }
}

function closeSurahPanel() {
  const panel = document.getElementById("surahPanel");
  if (panel) panel.hidden = true;
  document.body.style.overflow = "";
}

function renderSurahList(surahs, reciterId, reciterName, container) {
  container.innerHTML = surahs
    .map(
      (s) => `
    <div class="surah-item"
         data-reciter-id="${reciterId}"
         data-reciter-name="${encodeURIComponent(reciterName)}"
         data-surah-num="${s.number}"
         data-surah-name="${encodeURIComponent(s.englishName)}"
         role="button" tabindex="0"
         aria-label="Sourate ${s.number} – ${s.englishName}">
      <div class="number-box" aria-hidden="true">${s.number}</div>
      <div class="surah-info-main">
        <div class="surah-text-left">
          <span class="surah-name-fr">${s.englishName}</span>
          <span class="surah-sub-info">${s.revelationType} · ${s.numberOfAyahs} VERSETS</span>
        </div>
        <div class="surah-name-ar" lang="ar">${s.name}</div>
      </div>
    </div>`,
    )
    .join("");

  // Délégation d'événements pour les sourates
  container.addEventListener("click", _onSurahClick);
  container.addEventListener("keydown", _onSurahKeydown);
}

function _onSurahClick(e) {
  const item = e.target.closest(".surah-item");
  if (item) _selectSurah(item);
}

function _onSurahKeydown(e) {
  if (e.key === "Enter" || e.key === " ") {
    const item = e.target.closest(".surah-item");
    if (item) {
      e.preventDefault();
      _selectSurah(item);
    }
  }
}

function _selectSurah(item) {
  const reciterId = item.dataset.reciterId;
  const reciterName = decodeURIComponent(item.dataset.reciterName || "");
  const surahNum = parseInt(item.dataset.surahNum, 10);
  const surahName = decodeURIComponent(item.dataset.surahName || "");
  if (!reciterId || !surahNum) return;

  const padded = String(surahNum).padStart(3, "0");
  const audioUrl = _buildAudioUrl(reciterId, surahNum, padded);

  // Récupérer l'image du récitateur depuis la liste HTML
  let reciterImg = "assets/image/Logo.jpg";
  const card = document.querySelector(
    `.reciter-card-circle[data-reciter-id="${reciterId}"] img`,
  );
  if (card) reciterImg = card.src;

  localStorage.setItem("player_url", audioUrl);
  localStorage.setItem("player_title", surahName);
  localStorage.setItem("player_artist", reciterName);
  localStorage.setItem("player_img", reciterImg);
  localStorage.setItem("currentReciterId", reciterId);
  localStorage.setItem("currentReciterName", reciterName);
  localStorage.setItem("currentSurahNum", surahNum);

  window.location.href = "player.html";
}

function _buildAudioUrl(id, num, padded) {
  const MAP = {
    "ar.abdulbasitmurattal": `https://cdn.islamic.network/quran/audio-surah/128/ar.abdulbasitmurattal/${num}.mp3`,
    "ar.sudais": `https://server11.mp3quran.net/sds/${padded}.mp3`,
    "ar.alafasy": `https://server8.mp3quran.net/afs/${padded}.mp3`,
    "ar.hanirifai": `https://server8.mp3quran.net/hani/${padded}.mp3`,
    "ar.shatri": `https://server11.mp3quran.net/shatri/${padded}.mp3`,
    "ar.basfar": `https://server6.mp3quran.net/bsfr/${padded}.mp3`,
  };
  return (
    MAP[id] ??
    `https://cdn.islamic.network/quran/audio-surah/128/${id}/${num}.mp3`
  );
}

/* ============================================================
   11. PARAMÈTRES
   ============================================================ */
function initSettings() {
  const prefs = _loadPrefs();
  const fontRange = document.getElementById("font-range");
  const fontPreview = document.getElementById("font-preview");
  const genderSel = document.getElementById("pref-gender");
  const themeSel = document.getElementById("pref-theme");
  const timeSel = document.getElementById("time-format");
  const distSel = document.getElementById("distance-unit");
  const dhikrToggle = document.getElementById("pref-dhikr");
  const clearBtn = document.getElementById("clear-cache");

  // Appliquer les préférences sauvegardées
  if (prefs.fontSize && fontRange) {
    fontRange.value = prefs.fontSize;
    if (fontPreview) fontPreview.style.fontSize = prefs.fontSize + "px";
  }
  if (prefs.gender && genderSel) genderSel.value = prefs.gender;
  if (prefs.timeFormat && timeSel) timeSel.value = prefs.timeFormat;
  if (prefs.distanceUnit && distSel) distSel.value = prefs.distanceUnit;
  if (prefs.dhikr !== undefined && dhikrToggle)
    dhikrToggle.checked = prefs.dhikr;

  applyTheme(prefs.theme || "emerald");
  if (themeSel) themeSel.value = prefs.theme || "emerald";

  // Listeners
  fontRange?.addEventListener("input", (e) => {
    if (fontPreview) fontPreview.style.fontSize = e.target.value + "px";
    _savePref("fontSize", e.target.value);
  });
  themeSel?.addEventListener("change", (e) => {
    applyTheme(e.target.value);
    _savePref("theme", e.target.value);
  });
  genderSel?.addEventListener("change", (e) =>
    _savePref("gender", e.target.value),
  );
  timeSel?.addEventListener("change", (e) =>
    _savePref("timeFormat", e.target.value),
  );
  distSel?.addEventListener("change", (e) =>
    _savePref("distanceUnit", e.target.value),
  );
  dhikrToggle?.addEventListener("change", (e) =>
    _savePref("dhikr", e.target.checked),
  );

  clearBtn?.addEventListener("click", () => {
    if (confirm("Cela effacera toutes vos préférences. Continuer ?")) {
      localStorage.removeItem(PREFS_STORAGE_KEY);
      location.reload();
    }
  });
}

function applyTheme(name) {
  document.body.classList.remove("theme-midnight", "theme-dark");
  if (name === "midnight") document.body.classList.add("theme-midnight");
  else if (name === "dark") document.body.classList.add("theme-dark");
}

function _loadPrefs() {
  try {
    return JSON.parse(localStorage.getItem(PREFS_STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}
function _savePref(key, value) {
  const p = _loadPrefs();
  p[key] = value;
  localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(p));
}

/* ============================================================
   12. FLUX DE NOUVELLES
   ============================================================ */
const NEWS_DATA = [
  {
    title:
      "Iran : L'ONU alerte sur des centaines de morts lors des manifestations",
    category: "monde",
    time: "6 min",
    image:
      "https://www.reuters.com/resizer/v2/QEGZ3U6QOVP5DLZNRXQEYBW6XQ.jpg?auth=bc007ef81c9efeba20e6c6ac57aa6a46fcb8ce4a313f0fb18388865868446ab7&width=1920&quality=80",
    link: "https://www.reuters.com/business/media-telecom/un-rights-office-says-hundreds-killed-iran-protests-2026-01-13/",
  },
  {
    title:
      "En Iran, le régime mobilise ses soutiens pour tenter d'étouffer la contestation",
    category: "monde",
    time: "5 min",
    image:
      "https://img.lemde.fr/2026/01/12/0/0/5472/3648/1668/0/75/0/a89d505_ftp-1-7q1w6hfs7x0q-2026-01-12t181028z-961154969-rc2qzia9xlm8-rtrmadp-3-iran-economy-protests.JPG",
    link: "https://www.lemonde.fr/international/article/2026/01/13/en-iran-le-regime-mobilise-ses-soutiens-dans-l-espoir-d-etouffer-la-contestation_6661795_3210.html",
  },
  {
    title:
      "Chute du régime iranien : un séisme externe aux conséquences mondiales",
    category: "monde",
    time: "7 min",
    image: "https://oumma.com/wp-content/uploads/2026/01/iran-1.avif",
    link: "https://oumma.com/chute-du-regime-iranien-un-seisme-externe-aux-consequences-mondiales/",
  },
  {
    title:
      "L'Autriche interdit le port du voile pour les jeunes filles de moins de 14 ans",
    category: "monde",
    time: "4 min",
    image:
      "https://islaminfo.org/wp-content/uploads/2026/01/200416-hijab-day-m_3.jpg",
    link: "https://islaminfo.org/lautriche-interdit-le-port-du-voile-pour-les-jeunes-filles-de-moins-de-14-ans/",
  },
  {
    title: "Ramadan 2026 : un rendez-vous spirituel à ne pas manquer",
    category: "culture",
    time: "5 min",
    image: "https://islaminfo.org/wp-content/uploads/2026/01/IMG_8493.jpeg",
    link: "https://islaminfo.org/ramadan-2026-un-rendez-vous-spirituel-a-ne-pas-manquer/",
  },
  {
    title: "20e FESTIVAL MAWLID DES SOUFIS EN CÔTE D'IVOIRE",
    category: "culture",
    time: "6 min",
    image:
      "https://islaminfo.org/wp-content/uploads/2026/01/IMG_2042-scaled.jpeg",
    link: "https://islaminfo.org/20e-festival-mawlid-des-soufis-en-cote-divoire",
  },
  {
    title: "Ali Abderraziq, le penseur qui a dissocié religion et pouvoir",
    category: "culture",
    time: "8 min",
    image: "https://oumma.com/wp-content/uploads/2026/01/Ali-abderraziq.avif",
    link: "https://oumma.com/ali-abderraziq-1888-1966-le-penseur-qui-a-dissocie-religion-et-pouvoir/",
  },
  {
    title: "Al-Kindi, le philosophe musulman de la raison et de la sagesse",
    category: "culture",
    time: "7 min",
    image: "https://oumma.com/wp-content/uploads/2026/01/alkindiphilosphe.avif",
    link: "https://oumma.com/al-kindi-le-philosophe-musulman-de-la-raison-et-de-la-sagesse/",
  },
  {
    title: "Le Canada investit 2,2 M$ pour renforcer la filière du bœuf halal",
    category: "économie",
    time: "4 min",
    image:
      "https://islaminfo.org/wp-content/uploads/2026/01/attat8-1152x768-1.jpg",
    link: "https://islaminfo.org/le-canada-investit-22-millions-de-dollars-pour-renforcer-la-filiere-du-boeuf-halal/",
  },
  {
    title: "La Foi et l'astronomie au cœur d'une nuit d'élévation scientifique",
    category: "science",
    time: "6 min",
    image: "https://islaminfo.org/wp-content/uploads/2025/11/la-nuit-.jpg",
    link: "https://islaminfo.org/premiere-edition-de-lafter-icha-la-foi-et-lastronomie-au-coeur-dune-nuit-delevation-scientifique/",
  },
  {
    title:
      "Des randonneurs musulmans relèvent le défi de l'Everest pour la solidarité",
    category: "société",
    time: "5 min",
    image: "https://oumma.com/wp-content/uploads/2026/01/muslim.avif",
    link: "https://oumma.com/des-randonneurs-musulmans-relevent-le-defi-de-leverest-et-recoltent-58-000-euros-pour-la-solidarite/",
  },
  {
    title:
      "Un site fiche les musulmans dans un silence médiatique et politique",
    category: "société",
    time: "4 min",
    image: "https://oumma.com/wp-content/uploads/2026/01/site.avif",
    link: "https://oumma.com/un-site-fiche-les-musulmans-dans-un-silence-mediatique-et-politique/",
  },
  {
    title:
      "Construction d'une mosquée à Metz : une subvention municipale annulée",
    category: "société",
    time: "5 min",
    image:
      "https://i.la-croix.com/836x/smart/2025/12/30/2297018-chantier-de-la-grande-mosquee-de-metz-une-subventi.jpg",
    link: "https://www.la-croix.com/societe/construction-d-une-mosquee-a-metz-une-subvention-municipale-annulee-par-la-justice-20251230",
  },
];

function loadNews(filter = "all") {
  const container = document.getElementById("news-feed");
  if (!container) return;

  container.classList.add("fade-out");

  setTimeout(() => {
    const items =
      filter === "all"
        ? NEWS_DATA
        : NEWS_DATA.filter((n) => n.category === filter);

    container.innerHTML = items
      .map(
        (n) => `
      <article class="modern-news-card" data-link="${encodeURIComponent(n.link)}" role="button" tabindex="0" aria-label="${n.title}">
        <div class="news-img-box">
          <img src="${n.image}" alt="" loading="lazy" />
          <span class="category-tag">${n.category}</span>
        </div>
        <div class="news-info-overlay">
          <div class="news-content-top">
            <span class="read-time"><i class="far fa-clock" aria-hidden="true"></i> ${n.time} read</span>
            <h3 class="news-h4">${n.title}</h3>
          </div>
          <div class="news-footer-link">
            <span class="news-link-text">Lire l'article</span>
            <i class="fas fa-arrow-right news-arrow" aria-hidden="true"></i>
          </div>
        </div>
      </article>`,
      )
      .join("");

    // Délégation d'événements sur le conteneur
    container.addEventListener("click", _onNewsClick);
    container.addEventListener("keydown", _onNewsKeydown);
    container.classList.remove("fade-out");
  }, 250);
}

function _onNewsClick(e) {
  const card = e.target.closest(".modern-news-card");
  if (card?.dataset.link)
    window.open(
      decodeURIComponent(card.dataset.link),
      "_blank",
      "noopener,noreferrer",
    );
}

function _onNewsKeydown(e) {
  if (e.key === "Enter" || e.key === " ") {
    const card = e.target.closest(".modern-news-card");
    if (card?.dataset.link) {
      e.preventDefault();
      window.open(
        decodeURIComponent(card.dataset.link),
        "_blank",
        "noopener,noreferrer",
      );
    }
  }
}

function initNewsFilters() {
  const btns = document.querySelectorAll(".filter-btn");
  btns.forEach((btn) => {
    btn.addEventListener("click", () => {
      btns.forEach((b) => {
        b.classList.remove("active");
        b.setAttribute("aria-pressed", "false");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-pressed", "true");
      loadNews(btn.dataset.cat);
    });
  });
}

/* ============================================================
   13. CHATBOT BRIDGE (iframe → parent)
   ============================================================ */
function setupChatbotBridge() {
  window.addEventListener("message", (e) => {
    const iframe = document.querySelector('iframe[src="chatbot.html"]');
    if (!iframe) return;
    if (e.data === "openChat") iframe.classList.add("chat-opened");
    if (e.data === "closeChat") iframe.classList.remove("chat-opened");
  });
}

/* ============================================================
   14. UTILITAIRES
   ============================================================ */
function pad(n) {
  return String(n).padStart(2, "0");
}
