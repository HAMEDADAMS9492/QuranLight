/**
 * --- assets/js/salat_logic.js ---
 */

const PRAYER_NAMES = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];
const PRAYER_NAMES_FR = ["Fajr", "Chourouk", "Dohr", "'Asr", "Maghreb", "Icha"];

const PRAYER_ICONS = [
  "fas fa-cloud-sun", // Fajr
  "fas fa-sun", // Chourouk (Sunrise)
  "fas fa-certificate", // Dohr
  "fas fa-cloud", // 'Asr
  "fas fa-adjust", // Maghreb
  "fas fa-moon", // Icha
];

let currentDisplayDate = new Date();

// ============================================================
// 1. GESTION DES COORDONNÉES ET PRÉFÉRENCES
// ============================================================
function getCoords() {
  const stored = localStorage.getItem("userLocation");
  if (stored) {
    return JSON.parse(stored);
  }
  return { lat: 9.0765, lng: 7.3986, city: "Abuja, Nigeria" };
}

// ============================================================
// 2. RÉCUPÉRATION DES HORAIRES (API ALADHAN)
// ============================================================
async function getPrayerTimes(date) {
  const coords = getCoords();
  const timestamp = Math.floor(date.getTime() / 1000);
  const url = `https://api.aladhan.com/v1/timings/${timestamp}?latitude=${coords.lat}&longitude=${coords.lng}&method=3`;

  try {
    const response = await fetch(url);
    const resData = await response.json();
    const t = resData.data.timings;

    return [
      parseTimeToDate(t.Fajr, date),
      parseTimeToDate(t.Sunrise, date),
      parseTimeToDate(t.Dhuhr, date),
      parseTimeToDate(t.Asr, date),
      parseTimeToDate(t.Maghrib, date),
      parseTimeToDate(t.Isha, date),
    ];
  } catch (error) {
    console.error("Erreur API", error);
    return simulateTimes(date);
  }
}

function parseTimeToDate(timeStr, baseDate) {
  const [hrs, mins] = timeStr.split(":");
  const d = new Date(baseDate);
  d.setHours(parseInt(hrs), parseInt(mins), 0, 0);
  return d;
}

// ============================================================
// 3. LOGIQUE DE CALCUL
// ============================================================
function findNextPrayer(times) {
  const now = new Date();
  for (let i = 0; i < times.length; i++) {
    // On ignore Sunrise (index 1) pour la prochaine prière
    if (i !== 1 && times[i] > now) {
      return {
        name: PRAYER_NAMES_FR[i],
        time: times[i],
        index: i,
        tomorrow: false,
      };
    }
  }
  // Si aucune trouvée, c'est le Fajr du lendemain
  const tomorrowFajr = new Date(times[0]);
  tomorrowFajr.setDate(tomorrowFajr.getDate() + 1);
  return {
    name: PRAYER_NAMES_FR[0],
    time: tomorrowFajr,
    index: 0,
    tomorrow: true,
  };
}

function findCurrentPrayer(times) {
  const now = new Date();
  let currentIdx = 0;
  for (let i = 0; i < times.length; i++) {
    if (i !== 1 && times[i] <= now) currentIdx = i;
  }
  return { name: PRAYER_NAMES_FR[currentIdx], index: currentIdx };
}

// ============================================================
// 4. MISES À JOUR DE L'INTERFACE
// ============================================================
async function updateSalatUI() {
  const coords = getCoords();
  const times = await getPrayerTimes(currentDisplayDate);
  const isToday =
    currentDisplayDate.toDateString() === new Date().toDateString();

  const cityEl = document.getElementById("header-location");
  if (cityEl) {
    cityEl.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${coords.city}`;
  }

  document.getElementById("gregorian-date").textContent =
    currentDisplayDate.toLocaleDateString("fr-FR", {
      weekday: "short",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const hijriSmall = document.getElementById("hijri-date-small");
  if (hijriSmall) {
    hijriSmall.textContent = new Intl.DateTimeFormat("fr-TN-u-ca-islamic", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(currentDisplayDate);
  }

  // LISTE DES PRIÈRES
  const listContainer = document.getElementById("prayer-list-container");
  if (listContainer) {
    listContainer.innerHTML = "";
    const curr = isToday ? findCurrentPrayer(times) : { index: -1 };

    PRAYER_NAMES_FR.forEach((name, i) => {
      const wrapper = document.createElement("div");
      wrapper.className = "prayer-full-row";
      const showAlarm = i !== 1;

      wrapper.innerHTML = `
                <li class="prayer-row ${
                  isToday && i === curr.index ? "current-prayer" : ""
                }">
                    <div class="prayer-name-wrapper">
                        <i class="${PRAYER_ICONS[i]}"></i>
                        <span class="prayer-name-text">${name}</span>
                    </div>
                    <span class="prayer-time-value">${times[
                      i
                    ].toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}</span>
                </li>
                ${
                  showAlarm
                    ? `<button class="notification-btn active"><i class="fas fa-bell"></i></button>`
                    : `<div style="width:40px"></div>`
                }
            `;
      listContainer.appendChild(wrapper);
    });
  }

  if (isToday) {
    const next = findNextPrayer(times);
    const curr = findCurrentPrayer(times);

    const currNameEl = document.getElementById("current-prayer-name");
    const nextNameEl = document.getElementById("next-prayer-name-detail");
    const nextTimeEl = document.getElementById("next-prayer-time-detail");

    if (currNameEl) currNameEl.textContent = curr.name;
    if (nextNameEl) nextNameEl.textContent = next.name;
    if (nextTimeEl) {
      nextTimeEl.textContent = next.time.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    updateCountdown(next.time);
    generatePrayerCarousel(times, next.index);
  } else {
    const timerEl = document.getElementById("countdown-timer");
    if (timerEl) timerEl.textContent = "--:--:--";
  }
}

function updateCountdown(nextTime) {
  const timerEl = document.getElementById("countdown-timer");
  if (!timerEl) return;

  const tick = () => {
    const diff = nextTime - new Date();
    if (diff <= 0) {
      updateSalatUI();
      return;
    }

    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    timerEl.textContent = `${String(h).padStart(2, "0")}:${String(m).padStart(
      2,
      "0"
    )}:${String(s).padStart(2, "0")}`;
  };

  if (window.countdownInterval) clearInterval(window.countdownInterval);
  window.countdownInterval = setInterval(tick, 1000);
  tick();
}

function generatePrayerCarousel(times, nextIdx) {
  const carousel = document.getElementById("prayer-carousel-list");
  if (!carousel) return;

  carousel.innerHTML = "";
  const prayerIndices = [0, 2, 3, 4, 5];
  const angleStep = 180 / (prayerIndices.length - 1);
  const activePos = prayerIndices.indexOf(nextIdx);
  const rotation = activePos !== -1 ? 90 - activePos * angleStep : 0;

  carousel.style.transform = `rotate(${rotation}deg)`;

  prayerIndices.forEach((pIdx, i) => {
    const angle = i * angleStep;
    const rad = (angle * Math.PI) / 180;
    const li = document.createElement("li");
    li.className = pIdx === nextIdx ? "active" : "";
    li.textContent = PRAYER_NAMES_FR[pIdx];

    const x = 125 + 100 * Math.cos(rad);
    const y = 125 - 100 * Math.sin(rad);

    li.style.left = `${x}px`;
    li.style.top = `${y}px`;
    li.style.transform = `translate(-50%, -50%) rotate(${-rotation}deg)`;
    carousel.appendChild(li);
  });
}

// ============================================================
// 5. INITIALISATION ET GESTION SIDEBAR
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  // Navigation jours
  const prevBtn = document.getElementById("prev-day-btn");
  const nextBtn = document.getElementById("next-day-btn");

  if (prevBtn) {
    prevBtn.onclick = () => {
      currentDisplayDate.setDate(currentDisplayDate.getDate() - 1);
      updateSalatUI();
    };
  }
  if (nextBtn) {
    nextBtn.onclick = () => {
      currentDisplayDate.setDate(currentDisplayDate.getDate() + 1);
      updateSalatUI();
    };
  }

  // Sync / Refresh Localisation
  const syncBtn = document.getElementById("sync-location-btn");
  if (syncBtn) {
    syncBtn.addEventListener("click", () => {
      // Option A : Si tu veux juste rafraîchir la page actuelle
      window.location.reload(); 

      // Option B : Si tu veux réinitialiser la position ET rester sur salat.html
      // localStorage.removeItem("userLocation");
      // window.location.reload();
    });
  }

  // AJOUT : Gestion de la sidebar pour cette page
  const sidebar = document.getElementById("sidebar");
  const menuToggle = document.getElementById("menu-toggle");
  const overlay = document.getElementById("sidebar-overlay");

  if (menuToggle && sidebar && overlay) {
    menuToggle.onclick = () => {
      sidebar.classList.add("open");
      overlay.style.display = "block";
    };
    overlay.onclick = () => {
      sidebar.classList.remove("open");
      overlay.style.display = "none";
    };
  }

  updateSalatUI();
});

function simulateTimes(date) {
  const d = new Date(date);
  return [
    new Date(d.setHours(5, 30)),
    new Date(d.setHours(6, 45)),
    new Date(d.setHours(12, 30)),
    new Date(d.setHours(15, 45)),
    new Date(d.setHours(18, 20)),
    new Date(d.setHours(19, 45)),
  ];
}
