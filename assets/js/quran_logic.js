// Données des sourates (ton tableau surahData commence ici...)
const surahData = [
  // ... tes données de sourates ici ...
  {
    num: 1,
    name: "Al-Fatiha",
    arabic: "الفاتحة",
    verseCount: 7,
    location: "Mecquoise",
  },
  {
    num: 2,
    name: "Al-Baqarah",
    arabic: "البقرة",
    verseCount: 286,
    location: "Médinoise",
  },
  {
    num: 3,
    name: "Al-Imran",
    arabic: "آل عمران",
    verseCount: 200,
    location: "Médinoise",
  },
  {
    num: 4,
    name: "An-Nisa",
    arabic: "النساء",
    verseCount: 176,
    location: "Médinoise",
  },
  {
    num: 5,
    name: "Al-Ma'idah",
    arabic: "المائدة",
    verseCount: 120,
    location: "Médinoise",
  },
  {
    num: 6,
    name: "Al-An'am",
    arabic: "الأنعام",
    verseCount: 165,
    location: "Mecquoise",
  },
  {
    num: 7,
    name: "Al-A'raf",
    arabic: "الأعراف",
    verseCount: 206,
    location: "Mecquoise",
  },
  {
    num: 8,
    name: "Al-Anfal",
    arabic: "الأنفال",
    verseCount: 75,
    location: "Médinoise",
  },
  {
    num: 9,
    name: "At-Tawbah",
    arabic: "التوبة",
    verseCount: 129,
    location: "Médinoise",
  },
  {
    num: 10,
    name: "Yunus",
    arabic: "يونس",
    verseCount: 109,
    location: "Mecquoise",
  },
  {
    num: 11,
    name: "Hud",
    arabic: "هود",
    verseCount: 123,
    location: "Mecquoise",
  },
  {
    num: 12,
    name: "Yusuf",
    arabic: "يوسف",
    verseCount: 111,
    location: "Mecquoise",
  },
  {
    num: 13,
    name: "Ar-Ra'd",
    arabic: "الرعد",
    verseCount: 43,
    location: "Médinoise",
  },
  {
    num: 14,
    name: "Ibrahim",
    arabic: "إبراهيم",
    verseCount: 52,
    location: "Mecquoise",
  },
  {
    num: 15,
    name: "Al-Hijr",
    arabic: "الحجر",
    verseCount: 99,
    location: "Mecquoise",
  },
  {
    num: 16,
    name: "An-Nahl",
    arabic: "النحل",
    verseCount: 128,
    location: "Mecquoise",
  },
  {
    num: 17,
    name: "Al-Isra",
    arabic: "الإسراء",
    verseCount: 111,
    location: "Mecquoise",
  },
  {
    num: 18,
    name: "Al-Kahf",
    arabic: "الكهف",
    verseCount: 110,
    location: "Mecquoise",
  },
  {
    num: 19,
    name: "Maryam",
    arabic: "مريم",
    verseCount: 98,
    location: "Mecquoise",
  },
  {
    num: 20,
    name: "Ta-Ha",
    arabic: "طه",
    verseCount: 135,
    location: "Mecquoise",
  },
  {
    num: 21,
    name: "Al-Anbiya",
    arabic: "الأنبياء",
    verseCount: 112,
    location: "Mecquoise",
  },
  {
    num: 22,
    name: "Al-Hajj",
    arabic: "الحج",
    verseCount: 78,
    location: "Médinoise",
  },
  {
    num: 23,
    name: "Al-Mu'minun",
    arabic: "المؤمنون",
    verseCount: 118,
    location: "Mecquoise",
  },
  {
    num: 24,
    name: "An-Nur",
    arabic: "النور",
    verseCount: 64,
    location: "Médinoise",
  },
  {
    num: 25,
    name: "Al-Furqan",
    arabic: "الفرقان",
    verseCount: 77,
    location: "Mecquoise",
  },
  {
    num: 26,
    name: "Ash-Shu'ara",
    arabic: "الشعراء",
    verseCount: 227,
    location: "Mecquoise",
  },
  {
    num: 27,
    name: "An-Naml",
    arabic: "النمل",
    verseCount: 93,
    location: "Mecquoise",
  },
  {
    num: 28,
    name: "Al-Qasas",
    arabic: "القصص",
    verseCount: 88,
    location: "Mecquoise",
  },
  {
    num: 29,
    name: "Al-Ankabut",
    arabic: "العنكبوت",
    verseCount: 69,
    location: "Mecquoise",
  },
  {
    num: 30,
    name: "Ar-Rum",
    arabic: "الروم",
    verseCount: 60,
    location: "Mecquoise",
  },
  {
    num: 31,
    name: "Luqman",
    arabic: "لقمان",
    verseCount: 34,
    location: "Mecquoise",
  },
  {
    num: 32,
    name: "As-Sajdah",
    arabic: "السجدة",
    verseCount: 30,
    location: "Mecquoise",
  },
  {
    num: 33,
    name: "Al-Ahzab",
    arabic: "الأحزاب",
    verseCount: 73,
    location: "Médinoise",
  },
  {
    num: 34,
    name: "Saba",
    arabic: "سبأ",
    verseCount: 54,
    location: "Mecquoise",
  },
  {
    num: 35,
    name: "Fatir",
    arabic: "فاطر",
    verseCount: 45,
    location: "Mecquoise",
  },
  {
    num: 36,
    name: "Ya-Sin",
    arabic: "يس",
    verseCount: 83,
    location: "Mecquoise",
  },
  {
    num: 37,
    name: "As-Saffat",
    arabic: "الصافات",
    verseCount: 182,
    location: "Mecquoise",
  },
  { num: 38, name: "Sad", arabic: "ص", verseCount: 88, location: "Mecquoise" },
  {
    num: 39,
    name: "Az-Zumar",
    arabic: "الزمر",
    verseCount: 75,
    location: "Mecquoise",
  },
  {
    num: 40,
    name: "Ghafir",
    arabic: "غافر",
    verseCount: 85,
    location: "Mecquoise",
  },
  {
    num: 41,
    name: "Fussilat",
    arabic: "فصلت",
    verseCount: 54,
    location: "Mecquoise",
  },
  {
    num: 42,
    name: "Ash-Shura",
    arabic: "الشورى",
    verseCount: 53,
    location: "Mecquoise",
  },
  {
    num: 43,
    name: "Az-Zukhruf",
    arabic: "الزخرف",
    verseCount: 89,
    location: "Mecquoise",
  },
  {
    num: 44,
    name: "Ad-Dukhan",
    arabic: "الدخان",
    verseCount: 59,
    location: "Mecquoise",
  },
  {
    num: 45,
    name: "Al-Jathiyah",
    arabic: "الجاثية",
    verseCount: 37,
    location: "Mecquoise",
  },
  {
    num: 46,
    name: "Al-Ahqaf",
    arabic: "الأحقاف",
    verseCount: 35,
    location: "Mecquoise",
  },
  {
    num: 47,
    name: "Muhammad",
    arabic: "محمد",
    verseCount: 38,
    location: "Médinoise",
  },
  {
    num: 48,
    name: "Al-Fath",
    arabic: "الفتح",
    verseCount: 29,
    location: "Médinoise",
  },
  {
    num: 49,
    name: "Al-Hujurat",
    arabic: "الحجرات",
    verseCount: 18,
    location: "Médinoise",
  },
  { num: 50, name: "Qaf", arabic: "ق", verseCount: 45, location: "Mecquoise" },
  {
    num: 51,
    name: "Adh-Dhariyat",
    arabic: "الذاريات",
    verseCount: 60,
    location: "Mecquoise",
  },
  {
    num: 52,
    name: "At-Tur",
    arabic: "الطور",
    verseCount: 49,
    location: "Mecquoise",
  },
  {
    num: 53,
    name: "An-Najm",
    arabic: "النجم",
    verseCount: 62,
    location: "Mecquoise",
  },
  {
    num: 54,
    name: "Al-Qamar",
    arabic: "القمر",
    verseCount: 55,
    location: "Mecquoise",
  },
  {
    num: 55,
    name: "Ar-Rahman",
    arabic: "الرحمن",
    verseCount: 78,
    location: "Médinoise",
  },
  {
    num: 56,
    name: "Al-Waqi'ah",
    arabic: "الواقعة",
    verseCount: 96,
    location: "Mecquoise",
  },
  {
    num: 57,
    name: "Al-Hadid",
    arabic: "الحديد",
    verseCount: 29,
    location: "Médinoise",
  },
  {
    num: 58,
    name: "Al-Mujadila",
    arabic: "المجادلة",
    verseCount: 22,
    location: "Médinoise",
  },
  {
    num: 59,
    name: "Al-Hashr",
    arabic: "الحشر",
    verseCount: 24,
    location: "Médinoise",
  },
  {
    num: 60,
    name: "Al-Mumtahanah",
    arabic: "الممتحنة",
    verseCount: 13,
    location: "Médinoise",
  },
  {
    num: 61,
    name: "As-Saff",
    arabic: "الصف",
    verseCount: 14,
    location: "Médinoise",
  },
  {
    num: 62,
    name: "Al-Jumu'ah",
    arabic: "الجمعة",
    verseCount: 11,
    location: "Médinoise",
  },
  {
    num: 63,
    name: "Al-Munafiqun",
    arabic: "المنافقون",
    verseCount: 11,
    location: "Médinoise",
  },
  {
    num: 64,
    name: "At-Taghabun",
    arabic: "التغابن",
    verseCount: 18,
    location: "Médinoise",
  },
  {
    num: 65,
    name: "At-Talaq",
    arabic: "الطلاق",
    verseCount: 12,
    location: "Médinoise",
  },
  {
    num: 66,
    name: "At-Tahrim",
    arabic: "التحريم",
    verseCount: 12,
    location: "Médinoise",
  },
  {
    num: 67,
    name: "Al-Mulk",
    arabic: "الملك",
    verseCount: 30,
    location: "Mecquoise",
  },
  {
    num: 68,
    name: "Al-Qalam",
    arabic: "القلم",
    verseCount: 52,
    location: "Mecquoise",
  },
  {
    num: 69,
    name: "Al-Haqqah",
    arabic: "الحاقة",
    verseCount: 52,
    location: "Mecquoise",
  },
  {
    num: 70,
    name: "Al-Ma'arij",
    arabic: "المعارج",
    verseCount: 44,
    location: "Mecquoise",
  },
  {
    num: 71,
    name: "Nuh",
    arabic: "نوح",
    verseCount: 28,
    location: "Mecquoise",
  },
  {
    num: 72,
    name: "Al-Jinn",
    arabic: "الجن",
    verseCount: 28,
    location: "Mecquoise",
  },
  {
    num: 73,
    name: "Al-Muzzammil",
    arabic: "المزمل",
    verseCount: 20,
    location: "Mecquoise",
  },
  {
    num: 74,
    name: "Al-Muddaththir",
    arabic: "المدثر",
    verseCount: 56,
    location: "Mecquoise",
  },
  {
    num: 75,
    name: "Al-Qiyamah",
    arabic: "القيامة",
    verseCount: 40,
    location: "Mecquoise",
  },
  {
    num: 76,
    name: "Al-Insan",
    arabic: "الإنسان",
    verseCount: 31,
    location: "Médinoise",
  },
  {
    num: 77,
    name: "Al-Mursalat",
    arabic: "المرسلات",
    verseCount: 50,
    location: "Mecquoise",
  },
  {
    num: 78,
    name: "An-Naba",
    arabic: "النبأ",
    verseCount: 40,
    location: "Mecquoise",
  },
  {
    num: 79,
    name: "An-Nazi'at",
    arabic: "النازعات",
    verseCount: 46,
    location: "Mecquoise",
  },
  {
    num: 80,
    name: "Abasa",
    arabic: "عبس",
    verseCount: 42,
    location: "Mecquoise",
  },
  {
    num: 81,
    name: "At-Takwir",
    arabic: "التكوير",
    verseCount: 29,
    location: "Mecquoise",
  },
  {
    num: 82,
    name: "Al-Infitar",
    arabic: "الانفطار",
    verseCount: 19,
    location: "Mecquoise",
  },
  {
    num: 83,
    name: "Al-Mutaffifin",
    arabic: "المطففين",
    verseCount: 36,
    location: "Mecquoise",
  },
  {
    num: 84,
    name: "Al-Inshiqaq",
    arabic: "الانشقاق",
    verseCount: 25,
    location: "Mecquoise",
  },
  {
    num: 85,
    name: "Al-Buruj",
    arabic: "البروج",
    verseCount: 22,
    location: "Mecquoise",
  },
  {
    num: 86,
    name: "At-Tariq",
    arabic: "الطارق",
    verseCount: 17,
    location: "Mecquoise",
  },
  {
    num: 87,
    name: "Al-A'la",
    arabic: "الأعلى",
    verseCount: 19,
    location: "Mecquoise",
  },
  {
    num: 88,
    name: "Al-Ghashiyah",
    arabic: "الغاشية",
    verseCount: 26,
    location: "Mecquoise",
  },
  {
    num: 89,
    name: "Al-Fajr",
    arabic: "الفجر",
    verseCount: 30,
    location: "Mecquoise",
  },
  {
    num: 90,
    name: "Al-Balad",
    arabic: "البلد",
    verseCount: 20,
    location: "Mecquoise",
  },
  {
    num: 91,
    name: "Ash-Shams",
    arabic: "الشمس",
    verseCount: 15,
    location: "Mecquoise",
  },
  {
    num: 92,
    name: "Al-Layl",
    arabic: "الليل",
    verseCount: 21,
    location: "Mecquoise",
  },
  {
    num: 93,
    name: "Ad-Duha",
    arabic: "الضحى",
    verseCount: 11,
    location: "Mecquoise",
  },
  {
    num: 94,
    name: "Ash-Sharh",
    arabic: "الشرح",
    verseCount: 8,
    location: "Mecquoise",
  },
  {
    num: 95,
    name: "At-Tin",
    arabic: "التين",
    verseCount: 8,
    location: "Mecquoise",
  },
  {
    num: 96,
    name: "Al-Alaq",
    arabic: "العلق",
    verseCount: 19,
    location: "Mecquoise",
  },
  {
    num: 97,
    name: "Al-Qadr",
    arabic: "القدر",
    verseCount: 5,
    location: "Mecquoise",
  },
  {
    num: 98,
    name: "Al-Bayyinah",
    arabic: "البينة",
    verseCount: 8,
    location: "Médinoise",
  },
  {
    num: 99,
    name: "Az-Zalzalah",
    arabic: "الزلزلة",
    verseCount: 8,
    location: "Médinoise",
  },
  {
    num: 100,
    name: "Al-Adiyat",
    arabic: "العاديات",
    verseCount: 11,
    location: "Mecquoise",
  },
  {
    num: 101,
    name: "Al-Qari'ah",
    arabic: "القارعة",
    verseCount: 11,
    location: "Mecquoise",
  },
  {
    num: 102,
    name: "At-Takathur",
    arabic: "التكاثر",
    verseCount: 8,
    location: "Mecquoise",
  },
  {
    num: 103,
    name: "Al-Asr",
    arabic: "العصر",
    verseCount: 3,
    location: "Mecquoise",
  },
  {
    num: 104,
    name: "Al-Humazah",
    arabic: "الهمزة",
    verseCount: 9,
    location: "Mecquoise",
  },
  {
    num: 105,
    name: "Al-Fil",
    arabic: "الفيل",
    verseCount: 5,
    location: "Mecquoise",
  },
  {
    num: 106,
    name: "Quraysh",
    arabic: "قريش",
    verseCount: 4,
    location: "Mecquoise",
  },
  {
    num: 107,
    name: "Al-Ma'un",
    arabic: "الماعون",
    verseCount: 7,
    location: "Mecquoise",
  },
  {
    num: 108,
    name: "Al-Kawthar",
    arabic: "الكوثر",
    verseCount: 3,
    location: "Mecquoise",
  },
  {
    num: 109,
    name: "Al-Kafirun",
    arabic: "الكافرون",
    verseCount: 6,
    location: "Mecquoise",
  },
  {
    num: 110,
    name: "An-Nasr",
    arabic: "النصر",
    verseCount: 3,
    location: "Médinoise",
  },
  {
    num: 111,
    name: "Al-Masad",
    arabic: "المسد",
    verseCount: 5,
    location: "Mecquoise",
  },
  {
    num: 112,
    name: "Al-Ikhlas",
    arabic: "الإخلاص",
    verseCount: 4,
    location: "Mecquoise",
  },
  {
    num: 113,
    name: "Al-Falaq",
    arabic: "الفلق",
    verseCount: 5,
    location: "Mecquoise",
  },
  {
    num: 114,
    name: "An-Nas",
    arabic: "الناس",
    verseCount: 6,
    location: "Mecquoise",
  },
];

// ============================================================
// 1. CONFIGURATION ET VARIABLES (API AMÉLIORÉE)
// ============================================================
// API Quran.com + AlQuran.cloud (double fallback)
const QURAN_API_URL = "https://api.alquran.cloud/v1";
const QURAN_COM_API_URL = "https://api.quran.com/api/v4";
const DEFAULT_RECITER_ID = "ar.alafasy";

// ✅ URLs GRATUITES pour les formules (hébérgées publiquement)
const AUDIO_ISTIDHA = "https://server10.mp3quran.net/ala/001.mp3";
const AUDIO_BASMALA = "https://server10.mp3quran.net/ala/002.mp3";

let currentSurahNumber = 1;
let currentAyahs = [];
let currentAyahIndex = 0;
let globalAudio = new Audio();
let audioStep = 0; // 0: rien, 1: istiaadha, 2: basmala, 3: versets

globalAudio.onerror = () => {
  console.warn("Erreur de lecture audio, on passe directement au suivant.");
  if (audioStep === 1) {
    // Si Istiaadha échoue
    if (currentSurahNumber !== 1 && currentSurahNumber !== 9) {
      audioStep = 2;
      globalAudio.src = AUDIO_BASMALA;
      globalAudio.play().catch(startSurahPlayback);
    } else startSurahPlayback();
  } else if (audioStep === 2) {
    startSurahPlayback();
  }
};

// Éléments DOM
const brandHeader = document.getElementById("brand-header");
const listView = document.getElementById("quran-list-view");
const readerView = document.getElementById("quran-reader-view");
const controlsBar = document.getElementById("quran-controls-bar");
const btnToHome = document.getElementById("btn-to-home");
const btnToList = document.getElementById("btn-to-list");

// ============================================================
// 2. NAVIGATION ET VUES (INCHANGÉ)
// ============================================================
function switchView(view) {
  // Récupération DOM à chaque appel (plus sûr)
  const brandHeader = document.getElementById("brand-header");
  const listView = document.getElementById("quran-list-view");
  const readerView = document.getElementById("quran-reader-view");
  const controlsBar = document.getElementById("quran-controls-bar");
  const btnToList = document.getElementById("btn-to-list");

  if (view === "reader") {
    // Mode lecteur (sourate complète)
    if (brandHeader) brandHeader.style.display = "none";
    if (listView) listView.style.display = "none";
    if (readerView) readerView.style.display = "block";
    if (controlsBar) controlsBar.style.display = "flex";

    // Masquer bouton home, afficher bouton retour liste
    if (btnToList) {
      btnToList.style.display = "inline-flex";
      // Liaison événementielle pour retour à la liste
      btnToList.onclick = (e) => {
        e.preventDefault();
        switchView("list");
      };
    }
  } else {
    // Mode liste des sourates
    if (brandHeader) brandHeader.style.display = "block";
    if (listView) listView.style.display = "block";
    if (readerView) readerView.style.display = "none";
    if (controlsBar) controlsBar.style.display = "none";

    // Masquer bouton retour liste
    if (btnToList) btnToList.style.display = "none";

    // Arrêt audio lors du retour à la liste
    globalAudio.pause();
    audioStep = 0;
    updatePlayButtonUI(false);
  }

  // Scroll fluide en haut de page
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ============================================================
// 3. LISTE DES SOURATES (INCHANGÉ)
// ============================================================
function renderSurahList(list) {
  const container = document.getElementById("surah-list");
  if (!container) return;

  if (!list || list.length === 0) {
    container.innerHTML = `<p class="error-msg">Aucune sourate trouvée.</p>`;
    return;
  }

  container.innerHTML = list
    .map(
      (s) => `
        <div class="surah-premium-card" onclick="openSurah(${s.num})">
          <div class="surah-card-inner">
            <div class="surah-number-wrapper">
              <span class="surah-id">${s.num}</span>
            </div>
            <div class="surah-info-center">
              <h4 class="surah-name-en">${s.name}</h4>
              <p class="surah-sub-details">
                ${s.location} • <span class="gold-text">${s.verseCount} VERSETS</span>
              </p>
            </div>
            <div class="surah-arabic-end">
              <span class="surah-name-ar">${s.arabic}</span>
            </div>
          </div>
        </div>`
    )
    .join("");
}

function openSurah(num) {
  switchView("reader");
  loadSurahData(num, false);
}

// ============================================================
// 4. CHARGEMENT AMÉLIORÉ AVEC Fallback API
// ============================================================
async function loadSurahData(surahNumber, shouldAutoPlay = false) {
  const ayatDisplay = document.getElementById("ayat-display");

  // Stop audio + reset
  globalAudio.pause();
  globalAudio.removeAttribute("src");
  globalAudio.load();

  audioStep = 0;
  currentAyahIndex = 0;
  updatePlayButtonUI(false);

  if (ayatDisplay) {
    ayatDisplay.innerHTML = `<div class="loader-container"><div class="gold-spinner"></div></div>`;
  }

  try {
    const [resAr, resFr, resLatin, resAudio] = await Promise.all([
      fetch(`${QURAN_API_URL}/surah/${surahNumber}/quran-uthmani`),
      fetch(`${QURAN_API_URL}/surah/${surahNumber}/fr.hamidullah`),
      fetch(`${QURAN_API_URL}/surah/${surahNumber}/en.transliteration`),
      fetch(`${QURAN_API_URL}/surah/${surahNumber}/${DEFAULT_RECITER_ID}`),
    ]);

    const arData = await resAr.json();
    const frData = await resFr.json();
    const latinData = await resLatin.json();
    const audioData = await resAudio.json();

    if (arData.status === "OK" && audioData.status === "OK") {
      currentSurahNumber = parseInt(surahNumber, 10);
      currentAyahs = audioData.data.ayahs;
      document.title = `${arData.data.englishName} - QuranLight`;

      renderReaderView(arData.data, frData.data, latinData.data);
      updateNavigationButtons();
      setupGlobalAudio(currentAyahs[0]?.audio || "");

      if (shouldAutoPlay) playWithIntro();
    } else {
      throw new Error("Données API invalides");
    }
    // Remplacez votre bloc catch actuel dans loadSurahData par celui-ci :
  } catch (error) {
    console.warn("Échec AlQuran.cloud, tentative de secours sur Quran.com...");
    try {
      // Fallback spécifique vers Quran.com pour ne pas laisser l'utilisateur sans rien
      const resFallback = await fetch(
        `${QURAN_COM_API_URL}/quran/verses/uthmani?chapter_number=${surahNumber}`
      );
      const fallbackData = await resFallback.json();

      if (fallbackData.verses) {
        // Logique de secours simplifiée (ou affichage d'un message dédié)
        ayatDisplay.innerHTML = `<p class="error-msg">Serveur principal indisponible. Mode lecture seule activé via Quran.com.</p>`;
      }
    } catch (finalError) {
      ayatDisplay.innerHTML = `
            <div class="error-msg">
                <p>⚠️ Connexion impossible aux serveurs du Coran.</p>
                <button onclick="loadSurahData(${surahNumber})" class="retry-btn">Réessayer</button>
            </div>`;
    }
  }
}

// ============================================================
// 4. RENDU DE LA VUE LECTEUR AMÉLIORÉE
// ============================================================
function renderReaderView(ar, fr, latin) {
  const headerCard = document.querySelector(".surah-header-card");
  const ayatDisplay = document.getElementById("ayat-display");
  if (!headerCard || !ayatDisplay) return;

  // ✅ EN-TÊTE COMPLET : Numéro + Français + Arabe
  let headerHTML = `
    <h2 class="surah-meta">SOURATE ${ar.number}</h2>
    <h3 class="surah-name-fr">${ar.englishName}</h3>
    <h1 class="arabic-title">${ar.name}</h1>
  `;

  // Afficher Istiaadha + Basmala pour TOUTES les sourates sauf la 9
  if (ar.number !== 9) {
    headerHTML += `
      <div class="sacred-formulas">
        <div class="formula-group">
          <p class="istidha-text">أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ</p>
          <p class="formula-translation">Aʿūdhu billāhi mina sh‑shayṭāni r‑rajīm</p>
        </div>
        <div class="formula-group">
          <p class="basmala-text">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</p>
          <p class="formula-translation">Bismillāhi r‑raḥmāni r‑raḥīm</p>
        </div>
        <div class="formula-divider"></div>
      </div>`;
  }

  headerCard.innerHTML = headerHTML;

  // 2. Versets avec numéro + bouton play individuel
  ayatDisplay.innerHTML = "";
  ar.ayahs.forEach((ayah, index) => {
    const ayahCard = document.createElement("div");
    ayahCard.classList.add("ayah-card");
    ayahCard.dataset.index = index;

    let arabicText = ayah.text;

    // Pour toutes les sourates sauf la 1, on enlève la basmala écrite au premier verset
    if (ar.number !== 1 && index === 0) {
      arabicText = arabicText
        .replace("بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ", "")
        .trim();
    }

    ayahCard.innerHTML = `
      <div class="ayah-header">
        <span class="ayah-number-badge">${index + 1}</span>
        <div class="ayah-actions">
          <i class="far fa-play-circle play-v-btn" onclick="playSingleAyah(${index})"></i>
        </div>
      </div>
      <p class="arabic-text">${arabicText}</p>
      <p class="latin-text">${latin.ayahs[index]?.text || ""}</p>
      <p class="translation-text">${fr.ayahs[index]?.text || ""}</p>
    `;

    ayatDisplay.appendChild(ayahCard);
  });
}

// ============================================================
// 5. AUDIO & INTRO AMÉLIORÉ (AVEC URLs VRAIES)
// ============================================================
globalAudio.onended = () => {
  if (audioStep === 1) {
    // Fin Istiaadha
    // On joue la Basmala sauf pour la 9 (Tawbah)
    // Note: Pour la 1 (Fatiha), la basmala est incluse dans le verset 1,
    // mais jouer la formule séparée avant ne fait pas de mal ou peut être sautée.
    if (currentSurahNumber !== 9) {
      audioStep = 2;
      globalAudio.src = AUDIO_BASMALA;
      globalAudio.play().catch(() => startSurahPlayback());
    } else {
      startSurahPlayback();
    }
  } else if (audioStep === 2) {
    // Fin Basmala
    startSurahPlayback();
  } else if (audioStep === 3) {
    // Fin d'un verset
    playNextAyah();
  }
};

function playWithIntro() {
  audioStep = 1;
  currentAyahIndex = 0;

  globalAudio.pause();
  globalAudio.src = AUDIO_ISTIDHA; // ✅ URL GRATUITE fonctionne
  globalAudio.play().catch((e) => {
    console.error("Erreur Istiaadha:", e);
    // Fallback automatique
    if (currentSurahNumber !== 1 && currentSurahNumber !== 9) {
      audioStep = 2;
      globalAudio.src = AUDIO_BASMALA;
      globalAudio.play().catch((e2) => {
        console.error("Erreur Basmala:", e2);
        startSurahPlayback();
      });
    } else {
      startSurahPlayback();
    }
  });

  updatePlayButtonUI(true);
}

function startSurahPlayback() {
  audioStep = 3;
  currentAyahIndex = 0;

  if (currentAyahs && currentAyahs[0]) {
    globalAudio.src = currentAyahs[0].audio;
    globalAudio.play().catch((e) => console.error("Erreur Verset 1:", e));
    updatePlayButtonUI(true);
    syncAyahUI(0);
  } else {
    updatePlayButtonUI(false);
  }
}

function setupGlobalAudio(firstAyahUrl) {
  const playBtn = document.querySelector(".listen-button");
  if (!playBtn) return;

  if (firstAyahUrl) globalAudio.src = firstAyahUrl;

  playBtn.onclick = () => {
    if (globalAudio.paused) {
      if (audioStep === 0 && globalAudio.currentTime === 0) {
        playWithIntro(); // ✅ Démarre TOUJOURS par istiaadha + basmala
      } else {
        globalAudio.play().catch(console.error);
        updatePlayButtonUI(true);
      }
    } else {
      globalAudio.pause();
      updatePlayButtonUI(false);
    }
  };
}

function playSingleAyah(index) {
  audioStep = 3;
  currentAyahIndex = index;

  if (currentAyahs && currentAyahs[index]) {
    globalAudio.pause();
    globalAudio.src = currentAyahs[index].audio;
    globalAudio.play().catch(console.error);
    updatePlayButtonUI(true);
    syncAyahUI(index);
  }
}

function playNextAyah() {
  if (currentAyahs && currentAyahIndex < currentAyahs.length - 1) {
    currentAyahIndex++;
    audioStep = 3;
    globalAudio.pause();
    globalAudio.src = currentAyahs[currentAyahIndex].audio;
    globalAudio.play().catch(console.error);
    updatePlayButtonUI(true);
    syncAyahUI(currentAyahIndex);
  } else {
    updatePlayButtonUI(false);
    goToNextSurah();
  }
}

function playPreviousAyah() {
  if (currentAyahIndex > 0) {
    currentAyahIndex--;
    playSingleAyah(currentAyahIndex);
  } else {
    goToPrevSurah();
  }
}

// ============================================================
// 6. NAVIGATION & UI (INCHANGÉ)
// ============================================================
function updateNavigationButtons() {
  const prevBtn = document.querySelector(".prev-surah");
  const nextBtn = document.querySelector(".next-surah");
  if (prevBtn) prevBtn.disabled = currentSurahNumber <= 1;
  if (nextBtn) nextBtn.disabled = currentSurahNumber >= 114;
}

function syncAyahUI(index) {
  const activeAyah = document.querySelector(`[data-index="${index}"]`);
  if (!activeAyah) return;

  document
    .querySelectorAll(".ayah-card")
    .forEach((el) => el.classList.remove("active-reading"));
  activeAyah.classList.add("active-reading");
  activeAyah.scrollIntoView({ behavior: "smooth", block: "center" });
}

function updatePlayButtonUI(isPlaying) {
  const playBtn = document.querySelector(".listen-button");
  if (!playBtn) return;
  const icon = playBtn.querySelector("i");
  const span = playBtn.querySelector("span");

  if (isPlaying) {
    if (icon) icon.className = "fas fa-pause";
    if (span) span.textContent = "PAUSE";
    playBtn.classList.add("is-playing");
  } else {
    if (icon) icon.className = "fas fa-play";
    if (span) span.textContent = "ÉCOUTER";
    playBtn.classList.remove("is-playing");
  }
}

function goToNextSurah() {
  if (currentSurahNumber < 114) {
    loadSurahData(currentSurahNumber + 1, true);
  }
}

function goToPrevSurah() {
  if (currentSurahNumber > 1) {
    loadSurahData(currentSurahNumber - 1, true);
  }
}

// ============================================================
// 7. FONCTION D'INITIALISATION COMPLÈTE
// ============================================================
function initQuranApp() {
  console.log("QuranLight: Initialisation du module Sourates...");

  // --- A. Rendu Initial de la Liste ---
  const container = document.getElementById("surah-list");

  if (container) {
    if (typeof surahData !== "undefined" && surahData.length > 0) {
      renderSurahList(surahData);
    } else {
      container.innerHTML = `<p style="color:white; text-align:center; padding:20px;">
                Erreur : Les données des sourates sont introuvables.
            </p>`;
      console.error("Data Error: surahData est vide ou non défini.");
    }
  } else {
    console.warn(
      "DOM Error: L'élément #surah-list est introuvable dans le HTML."
    );
  }

  // --- B. Gestion de la Recherche ---
  const searchInput = document.getElementById("surah-search");
  if (searchInput && typeof surahData !== "undefined") {
    searchInput.addEventListener("input", (e) => {
      const term = e.target.value.toLowerCase().trim();

      // Filtrage intelligent (Nom, Numéro ou Arabe)
      const filtered = surahData.filter(
        (s) =>
          s.name.toLowerCase().includes(term) ||
          s.num.toString() === term ||
          s.arabic.includes(term)
      );

      renderSurahList(filtered);
    });
  }

 // --- C. Liaison des Contrôles du Lecteur ---
const controls = [
  { selector: ".prev-surah", action: goToPrevSurah },
  { selector: ".prev-ayah", action: playPreviousAyah },
  { selector: ".next-ayah", action: playNextAyah },
  { selector: ".next-surah", action: goToNextSurah },
  { selector: "#btn-to-list", action: () => switchView("list") },
];

// ✅ Liaison des contrôles avec preventDefault pour éviter navigation
controls.forEach((control) => {
  const btn = document.querySelector(control.selector);
  if (btn) {
    btn.onclick = (e) => {
      e.preventDefault();  // ✅ Empêche navigation pour ces boutons
      control.action();
    };
  }
});

console.log("QuranLight: Initialisation terminée avec succès.");
}

// ============================================================
// DÉCLENCHEMENT SÉCURISÉ
// ============================================================
// Cette partie s'assure que la fonction se lance peu importe
// quand le script est chargé (début ou fin de fichier)
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initQuranApp);
} else {
  initQuranApp();
}
