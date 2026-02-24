/**
 * RAMADAN APP – LOGIC OPTIMISÉ
 * Modules : Étoiles, Calendrier, Countdown, Douas, Check-list, Thème
 * ---------------------------------------------------------------
 * Améliorations :
 * - Canvas étoiles animées en arrière-plan
 * - Gestion propre du localStorage avec expiration par date
 * - Countdown corrigé (prend l'heure locale de l'API)
 * - Checklist multi-jours avec stockage par clé de date
 * - Bascule thème dark/light persistante
 * - Navigation par onglets accessible (ARIA)
 * - Code organisé en fonctions pures et bien séparées
 */

"use strict";

/* ================================================================
   0. CONSTANTES & ÉTAT
   ================================================================ */
const STORAGE_KEY_CHECKLIST = "ramadan_chk_";
const STORAGE_KEY_THEME = "ramadan_theme";
const API_PRAYER_BASE = "https://api.aladhan.com/v1";
const API_GEOCODE_BASE = "https://nominatim.openstreetmap.org/reverse";
const PRAYER_METHOD = 12; // Muslim World League

let countdownInterval = null;
let checklistOffset = 0; // nombre de jours par rapport à aujourd'hui

const TASKS = [
  { id: 0, label: "Les 5 prières quotidiennes", icon: "🕌" },
  { id: 1, label: "Lecture du Coran (portion du jour)", icon: "📖" },
  { id: 2, label: "Prière du Tarawih", icon: "🌙" },
  { id: 3, label: "Acte de charité ou bonne action", icon: "❤️" },
  { id: 4, label: "Dhikr du matin et du soir", icon: "📿" },
];

/* ================================================================
   1. ENTRÉE PRINCIPALE
   ================================================================ */
document.addEventListener("DOMContentLoaded", () => {
  initStars();
  initTheme();
  initNavigation();
  initChecklist();
  renderDouas();
  initRamadanData();
});

/* ================================================================
   2. FOND ÉTOILÉ (CANVAS)
   ================================================================ */
function initStars() {
  const canvas = document.getElementById("stars-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let stars = [];
  let width, height;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  function createStars(count = 180) {
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.3 + 0.2,
      alpha: Math.random(),
      speed: Math.random() * 0.008 + 0.002,
      dir: Math.random() > 0.5 ? 1 : -1,
    }));
  }

  function drawStars() {
    ctx.clearRect(0, 0, width, height);
    stars.forEach((s) => {
      s.alpha += s.speed * s.dir;
      if (s.alpha >= 1 || s.alpha <= 0) s.dir *= -1;

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(212, 188, 150, ${s.alpha})`;
      ctx.fill();
    });
    requestAnimationFrame(drawStars);
  }

  resize();
  createStars();
  drawStars();
  window.addEventListener("resize", () => {
    resize();
    createStars();
  });
}

/* ================================================================
   3. GESTION DU THÈME (DARK / LIGHT)
   ================================================================ */
function initTheme() {
  const saved = localStorage.getItem(STORAGE_KEY_THEME);
  if (saved) document.documentElement.setAttribute("data-theme", saved);

  const btn = document.getElementById("theme-toggle-btn");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const current =
      document.documentElement.getAttribute("data-theme") || "dark";
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem(STORAGE_KEY_THEME, next);
  });
}

/* ================================================================
   4. NAVIGATION PAR ONGLETS
   ================================================================ */
function initNavigation() {
  const tabs = document.querySelectorAll(".tab-btn");
  const panels = document.querySelectorAll(".module-panel");

  if (!tabs.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const targetId = tab.getAttribute("data-target");
      if (!targetId) return;

      // Mettre à jour les onglets
      tabs.forEach((t) => {
        t.classList.remove("active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("active");
      tab.setAttribute("aria-selected", "true");

      // Mettre à jour les panneaux
      panels.forEach((p) => {
        const isTarget = p.id === targetId;
        p.classList.toggle("active", isTarget);
        p.toggleAttribute("hidden", !isTarget);
      });
    });
  });

  // État initial : premier onglet actif
  const firstTab = tabs[0];
  const firstPanel = document.getElementById(
    firstTab.getAttribute("data-target"),
  );
  firstTab.classList.add("active");
  firstTab.setAttribute("aria-selected", "true");
  if (firstPanel) {
    firstPanel.classList.add("active");
    firstPanel.removeAttribute("hidden");
  }
}

/* ================================================================
   5. DONNÉES RAMADAN (GÉOLOC + API)
   ================================================================ */

document.addEventListener("DOMContentLoaded", initRamadanData);

async function initRamadanData() {
  try {
    // Affichage temporaire
    updateLocationUI("Détection...");

    const loc = await getLocation();

    console.log("LOCALISATION :", loc);

    // ✅ Affiche vraie ville
    updateLocationUI(loc.city);

    const now = new Date();

    const hijriData = await fetchHijriDate(now);
    const hijriYear = parseInt(hijriData.year);
    const hijriMonth = parseInt(hijriData.month.number);

    updateHijriYearUI(hijriYear);
    handlePreRamadanNotification(hijriMonth, now);

    const calendarData = await fetchCalendar(loc, hijriYear, hijriMonth, now);

    if (calendarData) renderCalendar(calendarData);
  } catch (err) {
    console.error("[Ramadan] Erreur :", err);
    showCalendarError();
  }
}

/* ================================================================
   GÉOLOCALISATION + NOM DE VILLE (VERSION STABLE)
   ================================================================ */

async function getLocation() {
  const fallback = {
    lat: 48.8566,
    lon: 2.3522,
    city: "Paris, France",
  };

  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(fallback);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
            {
              headers: {
                Accept: "application/json",
              },
            },
          );

          if (!response.ok) throw new Error("Geocode error");

          const data = await response.json();
          const a = data.address || {};

          const city =
            a.city ||
            a.town ||
            a.village ||
            a.municipality ||
            a.county ||
            a.state;

          const country = a.country;

          const cityName =
            city && country
              ? `${city}, ${country}`
              : city || country || "Ma Position";

          resolve({
            lat,
            lon,
            city: cityName,
          });
        } catch (error) {
          console.warn("Reverse geocode failed");

          resolve({
            lat,
            lon,
            city: "Ma Position",
          });
        }
      },

      // GPS refusé
      () => resolve(fallback),

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  });
}

/* ================================================================
   UPDATE UI LOCATION
   ================================================================ */

function updateLocationUI(city) {
  const span = document.querySelector("#location-display span");

  if (!span) {
    console.warn("location-display introuvable");
    return;
  }

  span.textContent = city || "Ma Position";
}

/* ================================================================
   DATE HIJRI
   ================================================================ */

async function fetchHijriDate(date) {
  const d = date.getDate();
  const m = date.getMonth() + 1;
  const y = date.getFullYear();

  const res = await fetch(`${API_PRAYER_BASE}/gToH?date=${d}-${m}-${y}`);

  const json = await res.json();

  return json.data.hijri;
}

/* ================================================================
   CALENDRIER PRIÈRES
   ================================================================ */

async function fetchCalendar(loc, hijriYear, hijriMonth, now) {
  const { lat, lon } = loc;

  const params =
    `latitude=${lat}&longitude=${lon}` +
    `&method=${PRAYER_METHOD}` +
    `&tune=0,0,0,0,0,0,0,0,0`;

  let url;

  if (hijriMonth >= 9) {
    url = `${API_PRAYER_BASE}/hijriCalendar/` + `${hijriYear}/9?${params}`;
  } else {
    const m = now.getMonth() + 1;
    const y = now.getFullYear();

    url = `${API_PRAYER_BASE}/calendar/` + `${y}/${m}?${params}`;
  }

  const res = await fetch(url);
  const json = await res.json();

  return json.code === 200 ? json.data : null;
}
/* ================================================================
   6. MISES À JOUR UI
   ================================================================ */
function updateLocationUI(city) {
  const el = document.getElementById("location-display");
  if (!el) return;
  // Cible le <span> enfant si présent (HTML amélioré avec icône), sinon écrit directement
  const span = el.querySelector("span");
  if (span) {
    span.textContent = city;
  } else {
    el.textContent = city;
  }
}

function updateHijriYearUI(year) {
  const el = document.getElementById("hijri-ramadan-year");
  if (el) el.textContent = `${year}H`;
}

function handlePreRamadanNotification(hijriMonth, now) {
  const box = document.getElementById("ramadan-countdown-notification");
  if (!box) return;

  if (hijriMonth < 9) {
    // Date fixe de début Ramadan 2026 (à mettre à jour chaque année)
    const ramadanStart = new Date(2026, 2, 12);
    const diffDays = Math.ceil((ramadanStart - now) / 86400000);

    if (diffDays > 0) {
      const daysEl = document.getElementById("days-until-ramadan");
      if (daysEl) daysEl.textContent = diffDays;
      box.style.display = "block";
    }
  } else {
    box.style.display = "none";
  }
}

function showCalendarError() {
  const container = document.getElementById("monthly-events-list");
  if (container) {
    container.innerHTML = `
      <div class="loading-state" style="color:var(--iftar)">
        <i class="fas fa-triangle-exclamation" style="font-size:2rem;color:var(--iftar)"></i>
        <p>Impossible de charger les horaires.<br>Vérifiez votre connexion et actualisez.</p>
      </div>`;
  }
}

/* ================================================================
   7. RENDU CALENDRIER & COUNTDOWN
   ================================================================ */
function renderCalendar(days) {
  const container = document.getElementById("monthly-events-list");
  if (!container) return;

  const now = new Date();
  const todayStr = formatGregorianKey(now);

  let html = "";
  let todayTimings = null;
  let tomorrowTimings = null;

  days.forEach((day, index) => {
    const gregDate = day.date.gregorian.date;
    const isToday = gregDate === todayStr;

    if (isToday) {
      todayTimings = day.timings;
      tomorrowTimings = days[index + 1]?.timings || null;
    }

    const [d, m, y] = gregDate.split("-");
    const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));

    const dayFr = capitalize(
      dateObj.toLocaleDateString("fr-FR", { weekday: "long" }),
    );
    const dateFr = capitalize(
      dateObj.toLocaleDateString("fr-FR", { day: "numeric", month: "long" }),
    );
    const dayEn = day.date.hijri.weekday.en || "";
    const hijriDay = parseInt(day.date.hijri.day);

    const monthRaw = day.date.hijri.month.fr || day.date.hijri.month.en || "";
    const monthFr = normalizeHijriMonth(monthRaw);

    const imsak = formatTime(day.timings.Imsak);
    const maghrib = formatTime(day.timings.Maghrib);

    html += `
      <article class="ramadan-card ${isToday ? "active" : ""}" ${isToday ? 'id="active-day"' : ""} role="listitem">
        <div class="hybrid-date-block">
          <div class="day-number-circle" aria-hidden="true">${hijriDay}</div>

          <div class="date-side-fr">
            <span class="day-name">${dayFr}</span>
            <span class="date-val">${dateFr}</span>
          </div>

          <div class="date-separator" aria-hidden="true"></div>

          <div class="date-side-ar" lang="ar">
            <span class="day-name">${dayEn}</span>
            <span class="date-val">${hijriDay} ${monthFr}</span>
          </div>
        </div>

        <div class="card-times" aria-label="Horaires de prière">
          <div class="time-group imsak-box">
            <span class="time-label imsak-label">IMSAK</span>
            <span class="time-value">${imsak}</span>
          </div>
          <div class="time-group iftar-box">
            <span class="time-label iftar-label">IFTAR</span>
            <span class="time-value">${maghrib}</span>
          </div>
        </div>
      </article>`;
  });

  container.innerHTML = html;

  if (todayTimings) startCountdown(todayTimings, tomorrowTimings);

  // Scroll vers aujourd'hui
  setTimeout(() => {
    const active = document.getElementById("active-day");
    if (active) active.scrollIntoView({ behavior: "smooth", block: "center" });
  }, 700);
}

/* -- Countdown -- */
function startCountdown(todayTimings, tomorrowTimings) {
  const labelEl = document.getElementById("countdown-label");
  const timerEl = document.getElementById("countdown-timer");
  if (!labelEl || !timerEl) return;

  if (countdownInterval) clearInterval(countdownInterval);

  function parseLocalTime(timeStr, addDay = false) {
    const clean = timeStr.split(" ")[0];
    const [h, m] = clean.split(":").map(Number);
    const d = new Date();
    if (addDay) d.setDate(d.getDate() + 1);
    d.setHours(h, m, 0, 0);
    return d;
  }

  function tick() {
    const now = new Date();
    const imsak = parseLocalTime(todayTimings.Imsak);
    const iftar = parseLocalTime(todayTimings.Maghrib);

    let target, label;

    if (now < imsak) {
      target = imsak;
      label = "Fin du Suhoor (Imsak) dans";
    } else if (now < iftar) {
      target = iftar;
      label = "Rupture du jeûne (Iftar) dans";
    } else if (tomorrowTimings) {
      target = parseLocalTime(tomorrowTimings.Imsak, true);
      label = "Reprise du jeûne (Imsak) dans";
    } else {
      labelEl.textContent = "Ramadan Moubarak 🌙";
      timerEl.textContent = "00:00:00";
      return;
    }

    labelEl.textContent = label;

    const diff = Math.max(0, target - now);
    const hh = Math.floor(diff / 3600000);
    const mm = Math.floor((diff % 3600000) / 60000);
    const ss = Math.floor((diff % 60000) / 1000);

    timerEl.textContent = `${pad(hh)}:${pad(mm)}:${pad(ss)}`;
  }

  tick();
  countdownInterval = setInterval(tick, 1000);
}

/* ================================================================
   8. CHECK-LIST SPIRITUELLE
   ================================================================ */
function initChecklist() {
  checklistOffset = 0;
  renderChecklist();
}

function changeChecklistDate(delta) {
  checklistOffset += delta;
  renderChecklist();
}

function renderChecklist() {
  const container = document.getElementById("checklist-container");
  const dayFrEl = document.getElementById("chk-day-fr");
  const dateSubEl = document.getElementById("chk-date-detailed");

  if (!container) return;

  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + checklistOffset);

  const dayFr = capitalize(
    targetDate.toLocaleDateString("fr-FR", { weekday: "long" }),
  );
  const dateFr = capitalize(
    targetDate.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
  );

  if (dayFrEl) dayFrEl.textContent = dayFr;
  if (dateSubEl) dateSubEl.textContent = dateFr;

  const key = checklistStorageKey(targetDate);
  const checked = loadCheckedItems(key);

  container.innerHTML = TASKS.map(({ id, label, icon }) => {
    const isChecked = checked.includes(id);
    return `
      <div class="checklist-item ${isChecked ? "checked" : ""}"
           data-index="${id}"
           data-key="${key}"
           role="listitem"
           tabindex="0"
           aria-checked="${isChecked}"
           aria-label="${label}">
        <span>${icon} ${escapeHtml(label)}</span>
        <div class="check-box" aria-hidden="true">
          <i class="fas fa-check"></i>
        </div>
      </div>`;
  }).join("");

  // Délégation d'événements
  container.addEventListener("click", handleChecklistToggle, { once: true });
  container.addEventListener("keydown", handleChecklistKeydown, { once: true });
}

function handleChecklistToggle(e) {
  const item = e.target.closest(".checklist-item");
  if (!item) return;
  toggleCheckItem(item);
}

function handleChecklistKeydown(e) {
  if (e.key === "Enter" || e.key === " ") {
    const item = e.target.closest(".checklist-item");
    if (item) {
      e.preventDefault();
      toggleCheckItem(item);
    }
  }
}

function toggleCheckItem(item) {
  const index = parseInt(item.getAttribute("data-index"), 10);
  const key = item.getAttribute("data-key");
  if (isNaN(index) || !key) return;

  const checked = loadCheckedItems(key);
  const newChecked = checked.includes(index)
    ? checked.filter((i) => i !== index)
    : [...checked, index];

  saveCheckedItems(key, newChecked);
  renderChecklist();
}

function checklistStorageKey(date) {
  return STORAGE_KEY_CHECKLIST + date.toDateString().replace(/ /g, "_");
}

function loadCheckedItems(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCheckedItems(key, items) {
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch (e) {
    console.warn("LocalStorage indisponible :", e);
  }
}

/* ================================================================
   9. MODULE DOUAS
   ================================================================ */
const DOUAS_DATA = [
  {
    category: "Début du Jeûne – Suhoor",
    items: [
      {
        title: "Intention du Jeûne",
        ar: "وَبِصَوْمِ غَدٍ نَّوَيْتُ مِنْ شَهْرِ رَمَضَانَ",
        ph: "Wa bi-sawmi ghadin nawaytu min shahri Ramadan",
        tr: "J'ai l'intention de jeûner demain pour le mois de Ramadan.",
      },
      {
        title: "Invocation après le repas",
        ar: "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ",
        ph: "Al-hamdu lillahi l-ladhi at'amani hadha wa razaqanihi min ghayri hawlin minni wa la quwwatin",
        tr: "Louange à Allah qui m'a nourri de cela sans aucune force ni puissance de ma part.",
      },
      {
        title: "Demande de Baraka",
        ar: "اللَّهُمَّ بَارِكْ لَنَا فِيمَا رَزَقْتَنَا وَقِنَا عَذَابَ النَّارِ",
        ph: "Allahumma barik lana fima razaqtana wa qina 'adhaba n-nar",
        tr: "Ô Allah, bénis ce que Tu nous as accordé comme subsistance et protège-nous du châtiment du Feu.",
      },
    ],
  },
  {
    category: "Fin du Jeûne – Iftar",
    items: [
      {
        title: "Au moment de la rupture",
        ar: "ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الأَجْرُ إِنْ شَاءَ اللَّهُ",
        ph: "Dhahaba dh-dhama'u, wabtallati-l-'uruqu, wa thabata-l-ajru in sha Allah",
        tr: "La soif est partie, les veines sont abreuvées et la récompense est certaine, si Allah le veut.",
      },
      {
        title: "Invocation de gratitude",
        ar: "اللَّهُمَّ لَكَ صُمْتُ وَعَلَى رِزْقِكَ أَفْطَرْتُ",
        ph: "Allahumma laka sumtu wa 'ala rizqika aftartu",
        tr: "Ô Allah, c'est pour Toi que j'ai jeûné et c'est avec Tes bienfaits que je romps mon jeûne.",
      },
      {
        title: "Prière pour l'acceptation",
        ar: "رَبَّنَا تَقَبَّلْ مِنَّا إِنَّكَ أَنْتَ السَّمِيعُ الْعَلِيمُ",
        ph: "Rabbana taqabbal minna innaka anta s-sami'u l-'alim",
        tr: "Seigneur, accepte ceci de notre part, car Tu es Celui qui entend tout et qui sait tout.",
      },
    ],
  },
  {
    category: "Comportement & Patience",
    items: [
      {
        title: "En cas de provocation",
        ar: "إِنِّي صَائِمٌ ، إِنِّي صَائِمٌ",
        ph: "Inni sa'im, inni sa'im",
        tr: "Je jeûne, je jeûne (à dire pour ne pas répondre à la colère).",
      },
      {
        title: "Prière pour les hôtes",
        ar: "أَفْطَرَ عِنْدَكُمُ الصَّائِمُونَ وَأَكَلَ طَعَامَكُمُ الأَبْرَارُ",
        ph: "Aftara 'indakumu s-sa'imuna, wa akala ta'amakumu l-abrar",
        tr: "Que les jeûneurs rompent leur jeûne chez vous et que les pieux mangent votre nourriture.",
      },
      {
        title: "Demande de pardon",
        ar: "اللَّهُمَّ إِنِّي أَسْأَلُكَ بِرَحْمَتِكَ الَّتِي وَسِعَتْ كُلَّ شَيْءٍ أَنْ تَغْفِرَ لِي",
        ph: "Allahumma inni as'aluka bi-rahmatika l-lati wasi'at kulla shay'in an taghfira li",
        tr: "Ô Allah, je Te demande par Ta miséricorde qui englobe toute chose de me pardonner.",
      },
    ],
  },
  {
    category: "Les Dix Dernières Nuits",
    items: [
      {
        title: "Laylatul Qadr (recommandée par le Prophète ﷺ)",
        ar: "اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي",
        ph: "Allahumma innaka 'afuwwun tuhibbu-l-'afwa fa'fu 'anni",
        tr: "Ô Allah, Tu es Pardonneur et Tu aimes le pardon, alors pardonne-moi.",
      },
      {
        title: "Demande de guidée",
        ar: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْهُدَى وَالتُّقَى وَالْعَفَافَ وَالْغِنَى",
        ph: "Allahumma inni as'aluka l-huda wa t-tuqa wa l-'afafa wa l-ghina",
        tr: "Ô Allah, je Te demande la guidée, la piété, la pudeur et la richesse spirituelle.",
      },
      {
        title: "Protection contre les soucis",
        ar: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ وَالْعَجْزِ وَالْكَسَلِ",
        ph: "Allahumma inni a'udhu bika mina l-hammi wa l-hazani wa l-'ajzi wa l-kasal",
        tr: "Ô Allah, je cherche protection auprès de Toi contre l'angoisse, la tristesse, l'impuissance et la paresse.",
      },
      {
        title: "Réussite ici-bas et dans l'au-delà",
        ar: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
        ph: "Rabbana atina fi d-dunya hasanatan wa fi l-akhirati hasanatan wa qina 'adhaba n-nar",
        tr: "Seigneur, accorde-nous un bien ici-bas et un bien dans l'au-delà, et protège-nous du châtiment du Feu.",
      },
      {
        title: "Fermeté du cœur",
        ar: "يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِكَ",
        ph: "Ya muqalliba l-qulubi thabbit qalbi 'ala dinik",
        tr: "Ô Toi qui retournes les cœurs, affermis mon cœur sur Ta religion.",
      },
      {
        title: "Demande du Paradis",
        ar: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْجَنَّةَ وَأَعُوذُ بِكَ مِنَ النَّارِ",
        ph: "Allahumma inni as'aluka l-jannata wa a'udhu bika mina n-nar",
        tr: "Ô Allah, je Te demande le Paradis et je cherche protection auprès de Toi contre l'Enfer.",
      },
    ],
  },
];

function renderDouas() {
  const container = document.getElementById("douas-container");
  if (!container) return;

  container.innerHTML = DOUAS_DATA.map(
    (cat) => `
    <section class="doua-category-section" role="listitem">
      <h3 class="category-title">${escapeHtml(cat.category)}</h3>
      ${cat.items
        .map(
          (d) => `
        <article class="doua-card">
          <p class="doua-card-title">${escapeHtml(d.title)}</p>
          <p class="arabic-text" lang="ar">${d.ar}</p>
          <p class="phonetic-text">${escapeHtml(d.ph)}</p>
          <div class="translation-text">${escapeHtml(d.tr)}</div>
        </article>
      `,
        )
        .join("")}
    </section>
  `,
  ).join("");
}

/* ================================================================
   10. UTILITAIRES
   ================================================================ */

/** Formate une date en clé "dd-MM-yyyy" */
function formatGregorianKey(date) {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  return `${d}-${m}-${y}`;
}

/** Extrait HH:MM depuis un string d'horaire API ("05:23 (CEST)" → "05:23") */
function formatTime(timeStr) {
  return (timeStr || "").split(" ")[0];
}

/** Pad un nombre à 2 chiffres */
function pad(n) {
  return String(n).padStart(2, "0");
}

/** Capitalize 1ère lettre */
function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : str;
}

/** Normalise les noms de mois hijri (enlève diacritiques arabes latins) */
function normalizeHijriMonth(name) {
  if (!name) return "";
  const n = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (/ramadan/i.test(n)) return "Ramadan";
  if (/sha.?ban|chaabane/i.test(n)) return "Chaabane";
  if (/rajab/i.test(n)) return "Rajab";
  return n;
}

/** Sécurise le HTML (anti-XSS basique) */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/* ================================================================
   11. EXPOSITION GLOBALE (pour les onclick HTML)
   ================================================================ */
window.changeChecklistDate = changeChecklistDate;
