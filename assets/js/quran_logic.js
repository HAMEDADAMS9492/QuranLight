// --- assets/js/quran_logic.js ---

// ============================================================
// 1. CONFIGURATION ET ÉLÉMENTS DU DOM
// ============================================================
const QURAN_API_URL = "https://api.alquran.cloud/v1";
const DEFAULT_RECITER_ID = "ar.alafasy";

// Variables d'état (Centralisées pour éviter les erreurs de redéclaration)
let currentSurahNumber = 1; 
let currentAyahs = [];      // Ajouté pour la lecture continue
let currentAyahIndex = 0;   // Ajouté pour savoir quel verset est lu
let globalAudio = new Audio();

// Éléments Vues Principales
const brandHeader = document.getElementById("brand-header");
const listView = document.getElementById("quran-list-view");
const readerView = document.getElementById("quran-reader-view");
const controlsBar = document.getElementById("quran-controls-bar");

// Nouveaux boutons de navigation fixes (Style Hadith)
const btnToHome = document.getElementById("btn-to-home"); 
const btnToList = document.getElementById("btn-to-list"); 

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
// 2. NAVIGATION ET VUES (AJUSTÉ : STYLE HADITH FIXE)
// ============================================================

function switchView(view) {
  if (view === "reader") {
    // Mode Lecture
    brandHeader.style.display = "none";
    listView.style.display = "none";
    readerView.style.display = "block";
    controlsBar.style.display = "flex";

    // Gestion des boutons fixes
    if (btnToHome) btnToHome.style.display = "none";
    if (btnToList) btnToList.style.display = "inline-flex";

    btnToList.onclick = (e) => {
      e.preventDefault();
      switchView("list");
    };

    window.scrollTo({ top: 0, behavior: "smooth" });
  } else {
    // Mode Liste
    brandHeader.style.display = "block";
    listView.style.display = "block";
    readerView.style.display = "none";
    controlsBar.style.display = "none";

    // Gestion des boutons fixes
    if (btnToHome) btnToHome.style.display = "inline-flex";
    if (btnToList) btnToList.style.display = "none";

    globalAudio.pause();
    const playBtn = document.querySelector(".listen-button");
    if (playBtn)
      playBtn.innerHTML = `<div class="play-icon-bg"><i class="fas fa-play"></i></div><span>ÉCOUTER</span>`;
  }
}

// ============================================================
// 3. CHARGEMENT ET RENDU (NETTOYÉ)
// ============================================================

/**
 * Charge les données avec support de la lecture automatique (shouldAutoPlay)
 */
async function loadSurahData(surahNumber, shouldAutoPlay = false) {
  const ayatDisplay = document.getElementById("ayat-display");
  ayatDisplay.innerHTML = `<div class="loader-container"><div class="gold-spinner"></div></div>`;

  try {
    const editions = `quran-uthmani,fr.hamidullah,${DEFAULT_RECITER_ID}`;
    const response = await fetch(
      `${QURAN_API_URL}/surah/${surahNumber}/editions/${editions}`
    );
    const result = await response.json();

    if (result.status === "OK") {
      const [arText, frText, audioData] = result.data;

      // MISE À JOUR DES RÉFÉRENCES GLOBALES
      currentSurahNumber = surahNumber;
      currentAyahs = audioData.ayahs; // On stocke les données audio ici
      currentAyahIndex = 0; // On reset l'index

      document.title = `${arText.englishName} - Coran`;

      renderReaderView(arText, frText, audioData);
      updateNavigationButtons();

      // Si on vient d'une transition "Suivant", on lance la lecture direct
      if (shouldAutoPlay && currentAyahs.length > 0) {
        playSingleAyah(currentAyahs[0].audio, 0);
      }

      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  } catch (error) {
    console.error(error);
    ayatDisplay.innerHTML = `<p class="error-msg">Erreur de chargement des données.</p>`;
  }
}

function renderReaderView(ar, fr, audio) {
  document.getElementById(
    "surah-number-name"
  ).textContent = `SOURATE ${ar.number}`;
  document.getElementById("surah-arabic-name").textContent = ar.name;

  const bismillahArea = document.getElementById("bismillah-area");

  if (ar.number !== 9) {
    bismillahArea.style.display = "block";
    bismillahArea.innerHTML = `
        <div class="sacred-formulas">
            <div class="formula-group">
                <p class="istidha-text">أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ</p>
                <p class="formula-translation">Je cherche protection auprès d’Allah contre Satan le maudit</p>
            </div>
            <div class="formula-group">
                <p class="basmala-text">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
                <p class="formula-translation">Au nom d’Allah, le Tout Miséricordieux, le Très Miséricordieux</p>
            </div>
            <div class="formula-divider"></div>
        </div>`;
  } else {
    bismillahArea.style.display = "none";
  }

  const ayatDisplay = document.getElementById("ayat-display");
  ayatDisplay.innerHTML = "";

  ar.ayahs.forEach((ayah, index) => {
    const ayahCard = document.createElement("div");
    ayahCard.classList.add("ayah-card");

    let arabic = ayah.text;
    if (ar.number !== 1 && index === 0) {
      arabic = arabic
        .replace("بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ", "")
        .trim();
    }

    // AJUSTEMENT : On passe l'index à playSingleAyah pour que le bouton play du verset marche
    ayahCard.innerHTML = `
            <div class="ayah-header">
                <span class="ayah-number-badge">${index + 1}</span>
                <div class="ayah-actions">
                    <i class="far fa-play-circle play-v-btn" onclick="playSingleAyah('${
                      audio.ayahs[index].audio
                    }', ${index})"></i>
                </div>
            </div>
            <p class="arabic-text">${arabic}</p>
            <p class="translation-text">${fr.ayahs[index].text}</p>`;
    ayatDisplay.appendChild(ayahCard);
  });

  setupGlobalAudio(audio.ayahs[0].audio);
}

// ============================================================
// 4. AUDIO ET RECHERCHE
// ============================================================

function setupGlobalAudio(url) {
  const playBtn = document.querySelector(".listen-button");

  if (!globalAudio.src || globalAudio.src !== url) {
    globalAudio.src = url;
  }

  globalAudio.onended = () => {
    console.log("Fin du verset, passage au suivant...");
    playNextAyah(); // Cette fonction gère la suite ou la sourate suivante
  };

  playBtn.onclick = () => {
    if (globalAudio.paused) {
      if (!globalAudio.src && currentAyahs.length > 0) {
        playSingleAyah(currentAyahs[0].audio, 0);
      } else {
        globalAudio.play();
        updatePlayButtonUI(true);
      }
    } else {
      globalAudio.pause();
      updatePlayButtonUI(false);
    }
  };
}

function updatePlayButtonUI(isPlaying) {
  const playBtn = document.querySelector(".listen-button");
  if (!playBtn) return;
  if (isPlaying) {
    playBtn.innerHTML = `<div class="play-icon-bg"><i class="fas fa-pause"></i></div><span>PAUSE</span>`;
  } else {
    playBtn.innerHTML = `<div class="play-icon-bg"><i class="fas fa-play"></i></div><span>ÉCOUTER</span>`;
  }
}

function playSingleAyah(url, index) {
  if (globalAudio.src === url && globalAudio.src !== "") {
    if (!globalAudio.paused) {
      globalAudio.pause();
      updatePlayButtonUI(false);
    } else {
      globalAudio.play();
      updatePlayButtonUI(true);
    }
    return;
  }

  currentAyahIndex = index; // Synchronise l'index global
  globalAudio.src = url;
  globalAudio
    .play()
    .then(() => updatePlayButtonUI(true))
    .catch((error) => console.error("Erreur de lecture :", error));
}

// ------------------------------------------------------------
// LOGIQUE DE NAVIGATION (LES 5 BOUTONS)
// ------------------------------------------------------------

function playNextAyah() {
  if (currentAyahs && currentAyahIndex < currentAyahs.length - 1) {
    currentAyahIndex++;
    playSingleAyah(currentAyahs[currentAyahIndex].audio, currentAyahIndex);
  } else {
    goToNextSurah(); // Si c'est le dernier verset, on change de sourate
  }
}

function playPreviousAyah() {
  if (currentAyahIndex > 0) {
    currentAyahIndex--;
    playSingleAyah(currentAyahs[currentAyahIndex].audio, currentAyahIndex);
  } else {
    goToPrevSurah(); // Si c'est le premier verset, on remonte à la sourate précédente
  }
}

function goToNextSurah() {
  if (currentSurahNumber < 114) {
    loadSurahData(currentSurahNumber + 1, true); // true = lance l'audio direct
  }
}

function goToPrevSurah() {
  if (currentSurahNumber > 1) {
    loadSurahData(currentSurahNumber - 1, true); // true = lance l'audio direct
  }
}

function renderSurahList(list) {
  const surahListContainer = document.getElementById("surah-list");
  if (list.length === 0) {
    surahListContainer.innerHTML = `<p class="error-msg">Aucune sourate trouvée.</p>`;
    return;
  }
  surahListContainer.innerHTML = list
    .map(
      (surah) => `
         <div class="surah-premium-card" onclick="openSurah(${surah.num})">
             <div class="surah-card-inner">
                 <div class="surah-number-wrapper"><span class="surah-id">${surah.num}</span></div>
                 <div class="surah-info-center">
                     <h4 class="surah-name-en">${surah.name}</h4>
                     <p class="surah-sub-details">${surah.location} • <span class="gold-text">${surah.verseCount} VERSETS</span></p>
                 </div>
                 <div class="surah-arabic-end"><span class="surah-name-ar">${surah.arabic}</span></div>
             </div>
         </div>`
    )
    .join("");
}

function openSurah(num) {
  switchView("reader");
  loadSurahData(num, false);
}

function updateNavigationButtons() {
  const prevBtn = document.querySelector(".prev-surah");
  const nextBtn = document.querySelector(".next-surah");
  if (prevBtn) prevBtn.disabled = currentSurahNumber <= 1;
  if (nextBtn) nextBtn.disabled = currentSurahNumber >= 114;
}

document.addEventListener("DOMContentLoaded", () => {
  if (typeof surahData !== "undefined") {
    renderSurahList(surahData);
  }

  const searchInput = document.getElementById("surah-search");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const term = e.target.value.toLowerCase();
      const filtered = surahData.filter(
        (s) =>
          s.name.toLowerCase().includes(term) ||
          s.num.toString() === term ||
          s.arabic.includes(term)
      );
      renderSurahList(filtered);
    });
  }

  const btnPrevSurah = document.querySelector(".prev-surah");
  const btnPrevAyah = document.querySelector(".prev-ayah");
  const btnNextAyah = document.querySelector(".next-ayah");
  const btnNextSurah = document.querySelector(".next-surah");

  if (btnPrevSurah) btnPrevSurah.onclick = goToPrevSurah;
  if (btnPrevAyah) btnPrevAyah.onclick = playPreviousAyah;
  if (btnNextAyah) btnNextAyah.onclick = playNextAyah;
  if (btnNextSurah) btnNextSurah.onclick = goToNextSurah;
});
