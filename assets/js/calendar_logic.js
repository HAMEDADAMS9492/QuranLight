// ============================================================
// 1. CONFIGURATION ET ÉLÉMENTS DU DOM
// ============================================================

let currentGregorianDate = new Date(); // Date de navigation
const today = new Date(); // Date réelle du jour

const calendarGrid = document.getElementById("calendar-grid");
const calendarMonthYear = document.getElementById("calendar-month-year");
const gregorianDateDisplay = document.getElementById("gregorian-date-display");
const hijriDateDisplay = document.getElementById("hijri-date-display");
const eventsList = document.getElementById("monthly-events-list");

/** * Formatters Intl pour la précision Hégirienne (Umm al-Qura)
 */
const hijriFormatter = new Intl.DateTimeFormat("fr-FR-u-ca-islamic-umalqura", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const hijriMonthOnly = new Intl.DateTimeFormat("fr-FR-u-ca-islamic-umalqura", {
  month: "long",
  year: "numeric",
});

const gregorianFormatterFull = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

/**
 * Base de données des événements majeurs
 */
const islamicEvents = [
  {
    day: 1,
    month: "Ramadan",
    title: "Début du Ramadan",
    desc: "Mois de jeûne, de prière et de réflexion.",
  },
  {
    day: 27,
    month: "Ramadan",
    title: "Laylat al-Qadr",
    desc: "La nuit la plus sainte de l'année.",
  },
  {
    day: 1,
    month: "Shawwal",
    title: "Aïd al-Fitr",
    desc: "Célébration de la fin du Ramadan.",
  },
  {
    day: 10,
    month: "Dhuʻ l-Hijjah",
    title: "Aïd al-Adha",
    desc: "Fête du sacrifice et fin du Hajj.",
  },
  {
    day: 1,
    month: "Muharram",
    title: "Nouvel An Hégirien",
    desc: "Premier jour de l'année islamique.",
  },
  {
    day: 10,
    month: "Muharram",
    title: "Achoura",
    desc: "Jour de jeûne et de commémoration.",
  },
  {
    day: 12,
    month: "Rabiʻ al-awwal",
    title: "Mawlid al-Nabi",
    desc: "Naissance du Prophète Muhammad (saws).",
  },
];

// ============================================================
// 2. FONCTIONS DE CONVERSION ET D'AFFICHAGE
// ============================================================

function getHijriDate(date) {
  return hijriFormatter.format(date);
}

function updateHeaderDate() {
  gregorianDateDisplay.textContent = `Aujourd'hui : ${gregorianFormatterFull.format(
    today
  )}`;
  hijriDateDisplay.textContent = getHijriDate(today);
}

/**
 * Génère la grille du calendrier
 */
function renderCalendar() {
  const year = currentGregorianDate.getFullYear();
  const month = currentGregorianDate.getMonth();

  // Titre : Double affichage nettoyé des styles inline pour le responsive
  const gregMonthStr = new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    year: "numeric",
  }).format(currentGregorianDate);
  const hijriMonthStr = hijriMonthOnly.format(currentGregorianDate);

  // On utilise des spans avec classes pour laisser le CSS gérer la taille
  calendarMonthYear.innerHTML = `
        <span class="month-greg">${
          gregMonthStr.charAt(0).toUpperCase() + gregMonthStr.slice(1)
        }</span> 
        <span class="month-divider">|</span> 
        <span class="month-hijri">${hijriMonthStr}</span>
    `;

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  calendarGrid.innerHTML = "";
  eventsList.innerHTML = "";
  let foundAnyEvent = false;

  for (let i = 0; i < firstDayOfMonth; i++) {
    const emptyDay = document.createElement("div");
    emptyDay.classList.add("day", "empty-day");
    calendarGrid.appendChild(emptyDay);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const dayElement = document.createElement("div");
    dayElement.classList.add("day");

    const parts = hijriFormatter.formatToParts(date);
    const hDay = parts.find((p) => p.type === "day").value;
    const hMonth = parts.find((p) => p.type === "month").value;

    dayElement.innerHTML = `
            <span class="gregorian-num">${d}</span>
            <span class="hijri-num">${hDay}</span>
        `;

    if (date.toDateString() === today.toDateString()) {
      dayElement.classList.add("current-day");
    }

    const event = islamicEvents.find((e) => e.day == hDay && e.month == hMonth);
    if (event) {
      dayElement.classList.add("event-day"); // Utilisation d'une classe au lieu de .style
      dayElement.title = event.title;
      createEventCard(event, d, hDay);
      foundAnyEvent = true;
    }

    calendarGrid.appendChild(dayElement);
  }

  if (!foundAnyEvent) {
    eventsList.innerHTML = `<p class="no-event">Aucun événement majeur pour ce mois.</p>`;
  }
}
/**
 * Crée une carte d'événement dans la section du bas
 */
function createEventCard(event, gDay, hDay) {
  const card = document.createElement("div");
  card.style.cssText = `
        background: rgba(255, 255, 255, 0.03);
        border-left: 3px solid var(--gold);
        padding: 15px;
        border-radius: 12px;
        margin-bottom: 12px;
        animation: fadeIn 0.5s ease forwards;
    `;

  card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
            <strong style="color:var(--gold); font-size:1rem;">${event.title}</strong>
            <span style="font-size:0.75rem; color:var(--gold-bright); opacity:0.8;">${gDay} Grég. / ${hDay} Hég.</span>
        </div>
        <p style="font-size:0.85rem; margin:0; opacity:0.7; line-height:1.4;">${event.desc}</p>
    `;
  eventsList.appendChild(card);
}

// ============================================================
// 3. LOGIQUE DE NAVIGATION
// ============================================================

function navigateMonth(delta) {
  currentGregorianDate.setMonth(currentGregorianDate.getMonth() + delta);
  currentGregorianDate.setDate(1);
  renderCalendar();
}

// ============================================================
// 4. INITIALISATION
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  updateHeaderDate();
  renderCalendar();

  document
    .getElementById("prev-month")
    .addEventListener("click", () => navigateMonth(-1));
  document
    .getElementById("next-month")
    .addEventListener("click", () => navigateMonth(1));
});
