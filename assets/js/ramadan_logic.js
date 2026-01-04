/**
 * RAMADAN APP - LOGIC
 * Modules: Calendrier, Douas (Phonétique), Check-list Spirituelle, Countdown
 */

const listContainer = document.getElementById("monthly-events-list");
let countdownInterval;

async function initRamadanApp() {
  setupNavigation();
  setupChecklist();
  renderDouas();

  try {
    const locationData = await new Promise((res) => {
      navigator.geolocation.getCurrentPosition(
        async (p) => {
          const lat = p.coords.latitude;
          const lon = p.coords.longitude;
          let cityName = "Ma Position";
          try {
            const geoRes = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`
            );
            const geoData = await geoRes.json();
            const a = geoData.address;
            let city = a.city || a.town || a.village || a.municipality || "";
            let country = a.country || "";
            cityName =
              city && country
                ? `${city}, ${country}`
                : city || country || "Position inconnue";
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

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // 1. Vérifier la date Hijri actuelle
    const dateCheckRes = await fetch(
      `https://api.aladhan.com/v1/gToH?date=${now.getDate()}-${currentMonth}-${currentYear}`
    );
    const dateCheckData = await dateCheckRes.json();
    const hijriDate = dateCheckData.data.hijri;
    const hijriYear = hijriDate.year;
    const hijriMonthNumber = parseInt(hijriDate.month.number);

    document.getElementById("hijri-ramadan-year").innerText = hijriYear + "H";

    // --- LOGIQUE DE NOTIFICATION ---
    const notificationBox = document.getElementById(
      "ramadan-countdown-notification"
    );
    if (hijriMonthNumber < 9) {
      // Date estimée du 1er Ramadan (12 Mars 2026)
      const ramadanStartDate = new Date(2026, 2, 12); // Mois 2 car Janvier=0
      const diffInMs = ramadanStartDate - now;
      const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

      if (diffInDays > 0) {
        notificationBox.style.display = "block";
        document.getElementById("days-until-ramadan").innerText = diffInDays;
      }
    } else {
      notificationBox.style.display = "none";
    }

    // --- LOGIQUE D'AFFICHAGE DU CALENDRIER ---
    let apiUrl;
    const method = 12;

    if (hijriMonthNumber >= 9) {
      apiUrl = `https://api.aladhan.com/v1/hijriCalendar/${hijriYear}/9?latitude=${locationData.lat}&longitude=${locationData.lon}&method=${method}&tune=0,0,0,0,0,0,0,0,0`;
    } else {
      apiUrl = `https://api.aladhan.com/v1/calendar/${currentYear}/${currentMonth}?latitude=${locationData.lat}&longitude=${locationData.lon}&method=${method}&tune=0,0,0,0,0,0,0,0,0`;
    }

    const response = await fetch(apiUrl);
    const result = await response.json();

    if (result.code === 200) {
      renderCalendar(result.data);
    }
  } catch (error) {
    console.error("Init Error:", error);
  }
}
// 2. GESTION DE LA NAVIGATION (TUILES)
function setupNavigation() {
  const cards = document.querySelectorAll(".option-card");
  const sections = document.querySelectorAll(".module-content");

  if (!cards.length || !sections.length) return;

  cards.forEach((card) => {
    card.addEventListener("click", () => {
      const target = card.getAttribute("data-target");
      const targetSection = document.getElementById(target);

      if (!targetSection) return;

      cards.forEach((c) => c.classList.remove("active"));
      sections.forEach((s) => s.classList.remove("active"));

      card.classList.add("active");
      targetSection.classList.add("active");
    });
  });

  const firstCard = cards[0];
  const firstTarget = document.getElementById(
    firstCard.getAttribute("data-target")
  );

  if (firstCard && firstTarget) {
    firstCard.classList.add("active");
    firstTarget.classList.add("active");
  }
}

// 3. MODULE CALENDRIER ET COMPTE À REBOURS
function renderCalendar(days) {
  const now = new Date();
  const todayStr = `${String(now.getDate()).padStart(2, "0")}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}-${now.getFullYear()}`;

  let html = "";
  let todayTimings = null;
  let tomorrowTimings = null;

  // Fonction pour forcer la bonne orthographe de Ramadan et Chaabane
  const formatMonthName = (name) => {
    if (!name) return "";
    let formatted = name.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Enlève les accents/points (ḍ, ā...)
    if (formatted.toLowerCase().includes("ramadan")) return "Ramadan";
    if (
      formatted.toLowerCase().includes("sha'ban") ||
      formatted.toLowerCase().includes("chaabane")
    )
      return "Chaabane";
    return formatted;
  };

  days.forEach((day, index) => {
    const gregorianDate = day.date.gregorian.date;
    const isToday = gregorianDate === todayStr;

    if (isToday) {
      todayTimings = day.timings;
      if (days[index + 1]) tomorrowTimings = days[index + 1].timings;
    }

    const [d, m, y] = gregorianDate.split("-");
    const dateObj = new Date(y, m - 1, d);

    const dayNameFr = dateObj
      .toLocaleDateString("fr-FR", { weekday: "long" })
      .replace(/^\w/, (l) => l.toUpperCase());

    let displayDate = dateObj.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
    });
    displayDate = displayDate.replace(/(\s|^)\w/g, (l) => l.toUpperCase());

    // --- GESTION DYNAMIQUE ET CORRIGÉE DU MOIS HIJRI ---
    const monthNameRaw = day.date.hijri.month.fr || day.date.hijri.month.en;
    const monthNameFr = formatMonthName(monthNameRaw); // Force l'écriture propre
    const dayPhonetic = day.date.hijri.weekday.en;

    html += `
      <div class="ramadan-card ${isToday ? "active" : ""}" ${
      isToday ? 'id="active-day"' : ""
    }>
        <div class="hybrid-date-block">
          <div class="day-number-circle">${parseInt(day.date.hijri.day)}</div>
          
          <div class="date-side-fr">
            <span class="day-name">${dayNameFr}</span>
            <span class="date-val">${displayDate}</span>
          </div>
          
          <div class="date-separator"></div>
          
          <div class="date-side-ar">
            <span class="day-name">${dayPhonetic}</span>
            <span class="date-val">${day.date.hijri.day} ${monthNameFr}</span>
          </div>
        </div>

        <div class="card-times">
          <div class="time-group imsak-box">
            <span class="time-label imsak-label">IMSAK</span>
            <span class="time-value">${day.timings.Imsak.split(" ")[0]}</span>
          </div>
          <div class="time-group iftar-box">
            <span class="time-label iftar-label">IFTAR</span>
            <span class="time-value">${day.timings.Maghrib.split(" ")[0]}</span>
          </div>
        </div>
      </div>`;
  });

  listContainer.innerHTML = html;

  if (todayTimings) startCountdown(todayTimings, tomorrowTimings);

  if (document.getElementById("active-day")) {
    setTimeout(() => {
      document
        .getElementById("active-day")
        .scrollIntoView({ behavior: "smooth", block: "center" });
    }, 800);
  }
}
// --- LOGIQUE DU COMPTE À REBOURS ---
function startCountdown(todayTimings, tomorrowTimings) {
  const label = document.getElementById("countdown-label");
  const timer = document.getElementById("countdown-timer");

  if (countdownInterval) clearInterval(countdownInterval);

  function update() {
    const now = new Date();

    const parseTime = (timeStr, isTomorrow = false) => {
      const [h, m] = timeStr.split(":");
      const d = new Date();
      if (isTomorrow) d.setDate(d.getDate() + 1);
      d.setHours(parseInt(h), parseInt(m), 0, 0);
      return d;
    };

    const imsakToday = parseTime(todayTimings.Imsak.split(" ")[0]);
    const iftarToday = parseTime(todayTimings.Maghrib.split(" ")[0]);

    let target, text;

    if (now < imsakToday) {
      target = imsakToday;
      text = "Fin du Suhoor (Imsak) dans";
    } else if (now < iftarToday) {
      target = iftarToday;
      text = "Rupture du jeûne (Iftar) dans";
    } else if (tomorrowTimings) {
      target = parseTime(tomorrowTimings.Imsak.split(" ")[0], true);
      text = "Reprise du jeûne (Imsak) dans";
    } else {
      label.innerText = "Ramadan Moubarak";
      timer.innerText = "00:00:00";
      return;
    }

    label.innerText = text;

    const diff = target - now;
    if (diff <= 0) {
      timer.innerText = "00:00:00";
      return;
    }

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

// 4. MODULE CHECK-LIST
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

// 5. MODULE DOUAS
function renderDouas() {
  const categories = [
    {
      name: "Début du Jeûne (Suhoor)",
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
          title: "Demande de bénédiction (Baraka)",
          ar: "اللَّهُمَّ بَارِكْ لَنَا فِيمَا رَزَقْتَنَا وَقِنَا عَذَابَ النَّارِ",
          ph: "Allahumma barik lana fima razaqtana wa qina 'adhaba n-nar",
          tr: "Ô Allah, bénis ce que Tu nous as accordé comme subsistance et protège-nous du châtiment du Feu.",
        },
      ],
    },
    {
      name: "Fin du Jeûne (Iftar)",
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
      name: "Comportement et Patience",
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
      name: "Les Dix Dernières Nuits",
      items: [
        {
          title: "Laylatul Qadr (Recommandée)",
          ar: "اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي",
          ph: "Allahumma innaka 'afuwwun tuhibbu-l-'afwa fa'fu 'anni",
          tr: "Ô Allah, Tu es Pardonneur et Tu aimes le pardon, alors pardonne-moi.",
        },
        {
          title: "Pour la guidée (Nouveau)",
          ar: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْهُدَى وَالتُّقَى وَالْعَفَافَ وَالْغِنَى",
          ph: "Allahumma inni as'aluka l-huda wa t-tuqa wa l-'afafa wa l-ghina",
          tr: "Ô Allah, je Te demande la guidée, la piété, la pudeur et la richesse (spirituelle).",
        },
        {
          title: "Protection contre les soucis (Nouveau)",
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
          title: "Demande de Paradis (Nouveau)",
          ar: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْجَنَّةَ وَأَعُوذُ بِكَ مِنَ النَّارِ",
          ph: "Allahumma inni as'aluka l-jannata wa a'udhu bika mina n-nar",
          tr: "Ô Allah, je Te demande le Paradis et je cherche protection auprès de Toi contre l'Enfer.",
        },
      ],
    },
  ];

  const container = document.getElementById("douas-container");
  if (container) {
    container.innerHTML = categories
      .map(
        (cat) => `
            <div class="doua-category-section" style="margin-bottom: 30px;">
                <h3 class="category-title" style="color:var(--gold); font-size:1.2rem; border-left: 3px solid var(--gold); padding-left: 10px; margin-bottom: 15px;">${
                  cat.name
                }</h3>
                ${cat.items
                  .map(
                    (d) => `
                    <div class="ramadan-card" style="flex-direction:column; align-items:flex-start; gap:10px; margin-bottom:15px; padding: 25px; border-radius:35px;">
                        <h4 style="color:var(--gold); font-size:0.9rem; margin-bottom: 5px; opacity: 0.8; letter-spacing:1px;">${d.title}</h4>
                        <p style="font-family:'Amiri',serif; font-size:1.8rem; text-align:right; width:100%; line-height:1.6; margin: 10px 0; background: linear-gradient(180deg, #ffffff, var(--gold-bright)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">${d.ar}</p>
                        <p style="font-size:0.9rem; color:var(--gold-bright); font-style:italic; opacity: 0.9;">${d.ph}</p>
                        <p style="font-size:0.9rem; color:rgba(255,255,255,0.7); line-height:1.5;">${d.tr}</p>
                    </div>
                `
                  )
                  .join("")}
            </div>
        `
      )
      .join("");
  }
}

document.addEventListener("DOMContentLoaded", initRamadanApp);
