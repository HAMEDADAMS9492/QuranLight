/**
 * RAMADAN APP - LOGIC
 * Modules: Calendrier, Douas (Phonétique), Check-list Spirituelle, Countdown
 */

const listContainer = document.getElementById("monthly-events-list");
let countdownInterval;

// 1. INITIALISATION GÉNÉRALE
async function initRamadanApp() {
  setupNavigation();
  setupChecklist();
  renderDouas();

  try {
    // Détection Position (GPS)
    const locationData = await new Promise((res) => {
      navigator.geolocation.getCurrentPosition(
        async (p) => {
          const lat = p.coords.latitude;
          const lon = p.coords.longitude;
          let cityName = "Ma Position";
          try {
            const geoRes = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`
            );
            const geoData = await geoRes.json();
            const a = geoData.address;
            let city =
              a.city ||
              a.town ||
              a.village ||
              a.municipality ||
              a.county ||
              a.state ||
              "";
            if (city.toLowerCase().includes("municipal"))
              city = a.city_district || "Abuja";
            city = city.replace(/^(du |de |de la |des |the )/gi, "").trim();
            cityName = city ? `${city}, ${a.country}` : a.country;
          } catch (e) {
            console.error("Geo error");
          }
          res({ lat, lon, city: cityName });
        },
        () => res({ lat: 48.8566, lon: 2.3522, city: "Paris, France" }),
        { timeout: 5000 }
      );
    });

    document.getElementById("location-display").innerText = locationData.city;

    // Récupération Année Hijri & Calendrier
    const now = new Date();
    const dateCheckRes = await fetch(
      `https://api.aladhan.com/v1/gToH?date=${now.getDate()}-${
        now.getMonth() + 1
      }-${now.getFullYear()}`
    );
    const dateCheckData = await dateCheckRes.json();
    const hijriYear = dateCheckData.data.hijri.year;
    document.getElementById("hijri-ramadan-year").innerText = hijriYear + "H";

    const response = await fetch(
      `https://api.aladhan.com/v1/hijriCalendar/${hijriYear}/9?latitude=${locationData.lat}&longitude=${locationData.lon}&method=3`
    );
    const result = await response.json();

    if (result.code === 200) renderCalendar(result.data);
  } catch (error) {
    console.error("Init Error:", error);
  }
}

// 2. GESTION DE LA NAVIGATION (TUILES)
function setupNavigation() {
  const cards = document.querySelectorAll(".option-card");
  const sections = document.querySelectorAll(".module-content");

  cards.forEach((card) => {
    card.addEventListener("click", () => {
      const target = card.getAttribute("data-target");
      cards.forEach((c) => c.classList.remove("active"));
      card.classList.add("active");
      sections.forEach((s) => s.classList.remove("active"));
      document.getElementById(target).classList.add("active");
    });
  });
}

// 3. MODULE CALENDRIER ET COMPTE À REBOURS
function renderCalendar(days) {
  const now = new Date();
  const todayStr = `${String(now.getDate()).padStart(2, "0")}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}-${now.getFullYear()}`;

  let html = "";
  let todayTimings = null;

  days.forEach((day) => {
    const gregorianDate = day.date.gregorian.date;
    const isToday = gregorianDate === todayStr;

    if (isToday) todayTimings = day.timings;

    const [d, m, y] = gregorianDate.split("-");
    const dateObj = new Date(y, m - 1, d);
    let displayDate = dateObj.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
    });
    displayDate = displayDate.replace(/(\s|^)\w/g, (l) => l.toUpperCase());

    html += `
            <div class="ramadan-card ${isToday ? "active" : ""}" ${
      isToday ? 'id="active-day"' : ""
    }>
                <div class="card-date">
                    <span class="h-day">${parseInt(day.date.hijri.day)}</span>
                    <div class="g-day-info">
                        <span class="g-day">Ramadan</span>
                        <span class="g-date">${displayDate}</span>
                    </div>
                </div>
                <div class="card-times">
                    <div class="time-item">
                        <span class="time-label imsak-color">IMSAK</span>
                        <span class="time-value imsak-color">${
                          day.timings.Imsak.split(" ")[0]
                        }</span>
                    </div>
                    <div class="time-item">
                        <span class="time-label iftar-color">IFTAR</span>
                        <span class="time-value iftar-color">${
                          day.timings.Maghrib.split(" ")[0]
                        }</span>
                    </div>
                </div>
            </div>`;
  });

  listContainer.innerHTML = html;

  if (todayTimings) startCountdown(todayTimings);

  if (document.getElementById("active-day")) {
    setTimeout(
      () =>
        document
          .getElementById("active-day")
          .scrollIntoView({ behavior: "smooth", block: "center" }),
      600
    );
  }
}

// --- LOGIQUE DU COMPTE À REBOURS ---
function startCountdown(timings) {
  const container = document.getElementById("countdown-container");
  const label = document.getElementById("countdown-label");
  const timer = document.getElementById("countdown-timer");

  if (countdownInterval) clearInterval(countdownInterval);

  function update() {
    const now = new Date();
    const parseTime = (timeStr) => {
      const [h, m] = timeStr.split(":");
      const d = new Date();
      d.setHours(parseInt(h), parseInt(m), 0, 0);
      return d;
    };

    const imsak = parseTime(timings.Imsak.split(" ")[0]);
    const iftar = parseTime(timings.Maghrib.split(" ")[0]);

    let target, text;

    if (now < imsak) {
      target = imsak;
      text = "Temps restant avant l'Imsak";
    } else if (now < iftar) {
      target = iftar;
      text = "Temps restant avant l'Iftar";
    } else {
      container.style.display = "none";
      return;
    }

    container.style.display = "block";
    label.innerText = text;

    const diff = target - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    timer.innerText = `${String(hours).padStart(2, "0")}:${String(
      minutes
    ).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  update();
  countdownInterval = setInterval(update, 1000);
}

// 4. MODULE CHECK-LIST (LocalStorage)
function setupChecklist() {
  const container = document.getElementById("checklist-container");
  const tasks = [
    "Les 5 prières quotidiennes",
    "Lecture du Coran (portion du jour)",
    "Prière du Tarawih",
    "Acte de charité ou bonne action",
  ];

  const today = new Date().toDateString();
  let savedData = JSON.parse(localStorage.getItem("ramadan_checklist")) || {
    date: today,
    items: [],
  };

  if (savedData.date !== today) {
    savedData = { date: today, items: [] };
  }

  container.innerHTML = tasks
    .map(
      (task, index) => `
        <div class="checklist-item ${
          savedData.items.includes(index) ? "checked" : ""
        }" onclick="toggleTask(${index})">
            <span>${task}</span>
            <div class="check-box"><i class="fas fa-check"></i></div>
        </div>
    `
    )
    .join("");
}

window.toggleTask = function (index) {
  const today = new Date().toDateString();
  let savedData = JSON.parse(localStorage.getItem("ramadan_checklist")) || {
    date: today,
    items: [],
  };

  if (savedData.items.includes(index)) {
    savedData.items = savedData.items.filter((i) => i !== index);
  } else {
    savedData.items.push(index);
  }

  localStorage.setItem("ramadan_checklist", JSON.stringify(savedData));
  setupChecklist();
};

// 5. MODULE DOUAS (Finalisé avec Phonétique)
function renderDouas() {
  const douas = [
    {
      title: "Rupture du jeûne (Iftar)",
      arabic:
        "ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الأَجْرُ إِنْ شَاءَ اللَّهُ",
      phonetic:
        "Dhahaba dh-dhama'u, wabtallati-l-'uruqu, wa thabata-l-ajru in sha Allah",
      translation:
        "La soif est partie, les veines sont abreuvées et la récompense est certaine, si Allah le veut.",
    },
    {
      title: "En rompant le jeûne",
      arabic: "اللَّهُمَّ لَكَ صُمْتُ وَعَلَى رِزْقِكَ أَفْطَرْتُ",
      phonetic: "Allahumma laka sumtu wa 'ala rizqika aftartu",
      translation:
        "Ô Allah, c'est pour Toi que j'ai jeûné et c'est avec Tes bienfaits que je romps mon jeûne.",
    },
    {
      title: "Intention du jeûne (Suhoor)",
      arabic: "وَبِصَوْمِ غَدٍ نَّوَيْتُ مِنْ شَهْرِ رَمَضَانَ",
      phonetic: "Wa bi-sawmi ghadin nawaytu min shahri Ramadan",
      translation: "J'ai l'intention de jeûner demain pour le mois de Ramadan.",
    },
    {
      title: "Pour les 10 dernières nuits (Laylat al-Qadr)",
      arabic: "اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي",
      phonetic: "Allahumma innaka 'afuwwun tuhibbu-l-'afwa fa'fu 'anni",
      translation:
        "Ô Allah, Tu es Pardonneur et Tu aimes le pardon, alors pardonne-moi.",
    },
    {
      title: "Si quelqu'un vous provoque",
      arabic: "إِنِّي صَائِمٌ ، إِنِّي صَائِمٌ",
      phonetic: "Inni sa'im, inni sa'im",
      translation: "Je jeûne, je jeûne.",
    },
  ];

  document.getElementById("douas-container").innerHTML = douas
    .map(
      (d) => `
        <div class="ramadan-card" style="flex-direction:column; align-items:flex-start; gap:10px; margin-bottom:15px; padding: 20px;">
            <h3 style="color:var(--gold); font-size:1rem; margin-bottom: 5px;">${d.title}</h3>
            <p style="font-family:'Amiri',serif; font-size:1.5rem; text-align:right; width:100%; line-height:1.6; margin: 5px 0;">${d.arabic}</p>
            <p style="font-size:0.85rem; color:var(--gold); font-style:italic; opacity: 0.9;">${d.phonetic}</p>
            <p style="font-size:0.85rem; color:rgba(255,255,255,0.7); line-height:1.4;">${d.translation}</p>
        </div>
    `
    )
    .join("");
}

document.addEventListener("DOMContentLoaded", initRamadanApp);
