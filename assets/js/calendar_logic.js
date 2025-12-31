// ============================================================
// 1. CONFIGURATION
// ============================================================
let currentGregorianDate = new Date();
const today = new Date();

const calendarGrid = document.getElementById("calendar-grid");
const calendarMonthYear = document.getElementById("calendar-month-year");
const gregorianDateDisplay = document.getElementById("gregorian-date-display");
const hijriDateDisplay = document.getElementById("hijri-date-display");
const eventsList = document.getElementById("monthly-events-list");

const hijriFormatter = new Intl.DateTimeFormat("fr-FR-u-ca-islamic-umalqura", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const islamicEvents = [
  // --- MUHARRAM (Mois Sacré) ---
  { day: 1, month: 1, title: "Nouvel An Hégirien", desc: "1er Muharram : Ouverture de l'année islamique." },
  { day: 9, month: 1, title: "Jeûne de Tasu'a", desc: "Jeûne recommandé précédant Achoura." },
  { day: 10, month: 1, title: "Jour d'Achoura", desc: "Jeûne très recommandé (Délivrance de Moussa AS)." },
  // --- SAFAR ---
  { day: 1, month: 2, title: "Mois de Safar", desc: "Deuxième mois du calendrier." },
  // --- RABI' AL-AWWAL ---
  { day: 12, month: 3, title: "Mawlid al-Nabi", desc: "Naissance du Prophète Muhammad (saws)." },
  // --- RAJAB (Mois Sacré) ---
  { day: 1, month: 7, title: "Mois de Rajab", desc: "Début de l'un des quatre mois sacrés." },
  { day: 27, month: 7, title: "Al-Isra' wal-Mi'raj", desc: "Le voyage nocturne et l'ascension céleste." },
  // --- SHA'BAN ---
  { day: 15, month: 8, title: "Nuit de la Mi-Sha'ban", desc: "Nuit du pardon et du changement de Qibla." },
  // --- RAMADAN ---
  { day: 1, month: 9, title: "1er Ramadan", desc: "Début du mois de jeûne obligatoire." },
  { day: 21, month: 9, title: "10 Dernières Nuits", desc: "Début de la recherche de Laylat al-Qadr." },
  { day: 27, month: 9, title: "Nuit du Destin", desc: "Laylat al-Qadr (nuit estimée la plus sainte)." },
  // --- SHAWWAL ---
  { day: 1, month: 10, title: "Aïd al-Fitr", desc: "Fête de la rupture du jeûne." },
  { day: 2, month: 10, title: "Jeûne de Shawwal", desc: "Début possible des 6 jours de jeûne recommandés." },
  // --- DHUL-QI'DA (Mois Sacré) ---
  { day: 1, month: 11, title: "Mois de Dhul-Qi'dah", desc: "Entrée dans un mois sacré de paix." },
  // --- DHUL-HIJJAH (Mois Sacré) ---
  { day: 1, month: 12, title: "10 jours de Dhul-Hijjah", desc: "Les meilleurs jours de l'année pour les bonnes œuvres." },
  { day: 9, month: 12, title: "Jour d'Arafat", desc: "Jour du Hajj. Jeûne recommandé (efface 2 ans de péchés)." },
  { day: 10, month: 12, title: "Aïd al-Adha", desc: "Fête du sacrifice (Tabaski)." },
  { day: 11, month: 12, title: "Jours de Tashriq", desc: "Célébration et suite du sacrifice (Jour 1)." },
  { day: 12, month: 12, title: "Jours de Tashriq", desc: "Célébration et suite du sacrifice (Jour 2)." },
  { day: 13, month: 12, title: "Jours de Tashriq", desc: "Célébration et suite du sacrifice (Jour 3)." },
];

// ============================================================
// 2. FONCTIONS
// ============================================================

function updateHeaderDate() {
  gregorianDateDisplay.textContent = `Aujourd'hui : ${new Intl.DateTimeFormat(
    "fr-FR",
    { day: "numeric", month: "long", year: "numeric" }
  ).format(today)}`;
  hijriDateDisplay.textContent = hijriFormatter.format(today);
}

function renderCalendar() {
  const year = currentGregorianDate.getFullYear();
  const month = currentGregorianDate.getMonth();

  const gregMonthStr = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" }).format(currentGregorianDate);
  const hijriMonthStr = new Intl.DateTimeFormat("fr-FR-u-ca-islamic-umalqura", { month: "long", year: "numeric" }).format(currentGregorianDate);

  calendarMonthYear.innerHTML = `
        <span class="month-greg">${gregMonthStr}</span> 
        <span class="month-divider">|</span> 
        <span class="month-hijri">${hijriMonthStr}</span>`;

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  calendarGrid.innerHTML = "";
  eventsList.innerHTML = ""; 
  let foundAnyEvent = false;

  for (let i = 0; i < firstDayOfMonth; i++) {
    const empty = document.createElement("div");
    empty.className = "day empty-day";
    calendarGrid.appendChild(empty);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const parts = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", { day: "numeric", month: "numeric" }).formatToParts(date);
    const hDay = parseInt(parts.find((p) => p.type === "day").value);
    const hMonth = parseInt(parts.find((p) => p.type === "month").value);

    const dayElement = document.createElement("div");
    dayElement.className = "day";
    dayElement.innerHTML = `<span class="gregorian-num">${d}</span><span class="hijri-num">${hDay}</span>`;

    if (date.toDateString() === today.toDateString()) dayElement.classList.add("current-day");

    // --- DÉTECTION DES ÉVÉNEMENTS ---
    const event = islamicEvents.find((e) => e.day === hDay && e.month === hMonth);

    if (event) {
      dayElement.classList.add("event-day");
      // Ajout de la petite étoile pour les événements spéciaux
      dayElement.innerHTML += `<span class="event-star" style="position:absolute; top:2px; right:5px; color:var(--gold); font-size:0.7rem;">★</span>`;
      createEventCard(event, date, hDay);
      foundAnyEvent = true;
    }
    else if (hDay === 13 || hDay === 14 || hDay === 15) {
      dayElement.classList.add("white-day");
      createEventCard({ title: "Jour Blanc", desc: "Jeûne prophétique recommandé." }, date, hDay);
      foundAnyEvent = true;
    }

    calendarGrid.appendChild(dayElement);
  }

  if (!foundAnyEvent) {
    eventsList.innerHTML = `<p class="no-event" style="text-align:center; padding:20px; opacity:0.5;">Aucun événement majeur pour ce mois hégirien.</p>`;
  }
}

function createEventCard(event, dateObj, hDay) {
  // Formatage de la date réelle (ex: Vendredi 13 Mars)
  const realDateStr = new Intl.DateTimeFormat("fr-FR", { weekday: 'long', day: 'numeric', month: 'long' }).format(dateObj);
  
  const card = document.createElement("div");
  card.className = "event-card"; 
  card.style.animation = "fadeIn 0.5s ease forwards";
  
  // Utilisation de l'étoile si ce n'est pas un jour blanc
  const icon = event.title === "Jour Blanc" ? "" : "★ ";

  card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-direction:column;">
            <div style="width:100%; display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                <strong style="color:var(--gold); font-size:1.05rem;">${icon}${event.title}</strong>
                <span style="font-size:0.75rem; color:var(--gold-bright); font-weight:700;">${hDay} Hégirien</span>
            </div>
            <span style="font-size:0.8rem; color:rgba(255,255,255,0.6); text-transform: capitalize; margin-bottom:8px;">
                <i class="far fa-calendar-alt" style="margin-right:5px;"></i>${realDateStr}
            </span>
        </div>
        <p style="font-size:0.85rem; margin:0; opacity:0.8; line-height:1.5; border-top:1px solid rgba(176,141,87,0.1); padding-top:8px;">${event.desc}</p>
    `;
  eventsList.appendChild(card);
}

function navigateMonth(delta) {
  currentGregorianDate.setMonth(currentGregorianDate.getMonth() + delta);
  currentGregorianDate.setDate(1); 
  renderCalendar();
}

document.addEventListener("DOMContentLoaded", () => {
  updateHeaderDate();
  renderCalendar();
  document.getElementById("prev-month").onclick = () => navigateMonth(-1);
  document.getElementById("next-month").onclick = () => navigateMonth(1);
});