/**
 * HADITHS LOGIC - QuranLight
 * Base de données locale de 60 Hadiths (20 par catégorie)
 */

const hadithDatabase = [
    // ==========================================
    // CATEGORIE: NAWAWI (20 Hadiths)
    // ==========================================
    { id: 1, cat: "nawawi", arabic: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ", french: "Les actions ne valent que par les intentions.", ref: "40 Nawawi, 1" },
    { id: 2, cat: "nawawi", arabic: "الدِّينُ النَّصِيحَةُ", french: "La religion est la sincérité (le bon conseil).", ref: "40 Nawawi, 7" },
    { id: 3, cat: "nawawi", arabic: "اتَّقِ اللَّهَ حَيْثُمَا كُنْتَ", french: "Crains Allah où que tu sois.", ref: "40 Nawawi, 18" },
    { id: 4, cat: "nawawi", arabic: "الْبِرُّ حُسْنُ الْخُلُقِ", french: "La piété, c'est le bon comportement.", ref: "40 Nawawi, 27" },
    { id: 5, cat: "nawawi", arabic: "ازْهَدْ فِي الدُّنْيَا يُحِبَّكَ اللَّهُ", french: "Détache-toi de ce monde, Allah t'aimera.", ref: "40 Nawawi, 31" },
    { id: 6, cat: "nawawi", arabic: "لاَ تَغْضَبْ", french: "Ne te mets pas en colère.", ref: "40 Nawawi, 16" },
    { id: 7, cat: "nawawi", arabic: "مِنْ حُسْنِ إِسْلامِ الْمَرْءِ تَرْكُهُ مَا لا يَعْنِيهِ", french: "Fait partie du bel Islam d'un homme le fait de délaisser ce qui ne le regarde pas.", ref: "40 Nawawi, 12" },
    { id: 8, cat: "nawawi", arabic: "لا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ", french: "Nul d'entre vous n'est véritablement croyant tant qu'il n'aime pas pour son frère ce qu'il aime pour lui-même.", ref: "40 Nawawi, 13" },
    { id: 9, cat: "nawawi", arabic: "قُلْ آمَنْتُ بِاللَّهِ ثُمَّ اسْتَقِمْ", french: "Dis : J'ai cru en Allah, puis sois droit.", ref: "40 Nawawi, 21" },
    { id: 10, cat: "nawawi", arabic: "الْحَيَاءُ لا يَأْتِي إِلا بِخَيْرٍ", french: "La pudeur n'apporte que le bien.", ref: "40 Nawawi, 20" },
    { id: 11, cat: "nawawi", arabic: "كُلُّ سُلامَى مِنَ النَّاسِ عَلَيْهِ صَدَقَةٌ", french: "Chaque articulation humaine doit une aumône chaque jour.", ref: "40 Nawawi, 26" },
    { id: 12, cat: "nawawi", arabic: "انْصُرْ أَخَاكَ ظَالِمًا أَوْ مَظْلُومًا", french: "Secours ton frère, qu'il soit oppresseur ou oppressé.", ref: "40 Nawawi, 29 (Sens)" },
    { id: 13, cat: "nawawi", arabic: "الظُّلْمُ ظُلُمَاتٌ يَوْمَ الْقِيَامَةِ", french: "L'injustice sera ténèbres au Jour de la Résurrection.", ref: "40 Nawawi, 24" },
    { id: 14, cat: "nawawi", arabic: "اللَّهُ فِي عَوْنِ الْعَبْدِ مَا كَانَ الْعَبْدُ فِي عَوْنِ أَخِيهِ", french: "Allah aide Son serviteur tant que celui-ci aide son frère.", ref: "40 Nawawi, 36" },
    { id: 15, cat: "nawawi", arabic: "لا تَحَاسَدُوا وَلا تَنَاجَشُوا", french: "Ne vous enviez pas, ne vous haïssez pas.", ref: "40 Nawawi, 35" },
    { id: 46, cat: "nawawi", arabic: "الدُّنْيَا مَزْرَعَةُ الآخِرَةِ", french: "Ce bas-monde est le champ de culture de l'au-delà.", ref: "40 Nawawi (Sagesse)" },
    { id: 47, cat: "nawawi", arabic: "الْحَلالُ بَيِّنٌ وَالْحَرَامُ بَيِّنٌ", french: "Le licite est clair et l'illicite est clair.", ref: "40 Nawawi, 6" },
    { id: 48, cat: "nawawi", arabic: "فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ", french: "Qu'il dise du bien ou qu'il se taise.", ref: "40 Nawawi, 15" },
    { id: 49, cat: "nawawi", arabic: "يَا عِبَادِي إِنِّي حَرَّمْتُ الظُّلْمَ عَلَى نَفْسِي", french: "Ô Mes serviteurs ! Je Me suis interdit l'injustice.", ref: "40 Nawawi, 24" },
    { id: 50, cat: "nawawi", arabic: "احْفَظِ اللَّهَ يَحْفَظْكَ", french: "Préserve Allah, Il te préservera.", ref: "40 Nawawi, 19" },

    // ==========================================
    // CATEGORIE: BUKHARI (20 Hadiths)
    // ==========================================
    { id: 16, cat: "bukhari", arabic: "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ", french: "Le meilleur d'entre vous est celui qui apprend le Coran et l'enseigne.", ref: "Sahih Bukhari" },
    { id: 17, cat: "bukhari", arabic: "يَسِّرُوا وَلا تُعَسِّرُوا", french: "Facilitez les choses et ne les rendez pas difficiles.", ref: "Sahih Bukhari" },
    { id: 18, cat: "bukhari", arabic: "لا يَدْخُلُ الْجَنَّةَ قَاطِعٌ", french: "Celui qui rompt les liens de parenté n'entrera pas au Paradis.", ref: "Sahih Bukhari" },
    { id: 19, cat: "bukhari", arabic: "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ", french: "Que celui qui croit en Allah et au Jour dernier dise du bien ou se taise.", ref: "Sahih Bukhari" },
    { id: 20, cat: "bukhari", arabic: "إِنَّ اللَّهَ رَفِيقٌ يُحِبُّ الرِّفْقَ", french: "Certes Allah est doux et Il aime la douceur.", ref: "Sahih Bukhari" },
    { id: 21, cat: "bukhari", arabic: "بُنِيَ الإِسْلامُ عَلَى خَمْسٍ", french: "L'Islam est bâti sur cinq piliers.", ref: "Sahih Bukhari" },
    { id: 22, cat: "bukhari", arabic: "الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ", french: "Le musulman est celui dont les musulmans sont à l'abri de sa langue et de sa main.", ref: "Sahih Bukhari" },
    { id: 23, cat: "bukhari", arabic: "تَهَادَوْا تَحَابُّوا", french: "Échangez des cadeaux, vous vous aimerez.", ref: "Al-Adab Al-Mufrad (Bukhari)" },
    { id: 24, cat: "bukhari", arabic: "كُلُّكُمْ رَاعٍ وَكُلُّكُمْ مَسْئُولٌ عَنْ رَعِيَّتِهِ", french: "Chacun de vous est un berger et sera responsable de son troupeau.", ref: "Sahih Bukhari" },
    { id: 25, cat: "bukhari", arabic: "مَنْ يُرِدِ اللَّهُ بِهِ خَيْرًا يُفَقِّهْهُ فِي الدِّينِ", french: "Celui à qui Allah veut du bien, Il lui accorde la compréhension de la religion.", ref: "Sahih Bukhari" },
    { id: 26, cat: "bukhari", arabic: "الدُّعَاءُ هُوَ الْعِبَادَةُ", french: "L'invocation, c'est cela l'adoration.", ref: "Sahih Bukhari (Sens)" },
    { id: 27, cat: "bukhari", arabic: "لَيْسَ الْغِنَى عَنْ كَثْرَةِ الْعَرَضِ وَلَكِنَّ الْغِنَى غِنَى النَّفْسِ", french: "La richesse ne réside pas dans l'abondance des biens, mais dans la richesse de l'âme.", ref: "Sahih Bukhari" },
    { id: 28, cat: "bukhari", arabic: "الصِّيَامُ جُنَّةٌ", french: "Le jeûne est un bouclier.", ref: "Sahih Bukhari" },
    { id: 29, cat: "bukhari", arabic: "أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ", french: "L'œuvre la plus aimée d'Allah est la plus régulière, même si elle est petite.", ref: "Sahih Bukhari" },
    { id: 30, cat: "bukhari", arabic: "السَّاعِي عَلَى الأَرْمَلَةِ وَالْمِسْكِينِ كَالْمُجَاهِدِ فِي سَبِيلِ اللَّهِ", french: "Celui qui s'occupe de la veuve et du pauvre est comme le combattant sur le sentier d'Allah.", ref: "Sahih Bukhari" },
    { id: 51, cat: "bukhari", arabic: "الآيَةُ الْمُنَافِقِ ثَلاثٌ", french: "Les signes de l'hypocrite sont au nombre de trois.", ref: "Sahih Bukhari" },
    { id: 52, cat: "bukhari", arabic: "تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ لَكَ صَدَقَةٌ", french: "Ton sourire face à ton frère est une aumône.", ref: "Sahih Bukhari (Sens)" },
    { id: 53, cat: "bukhari", arabic: "إِنَّ الصِّدْقَ يَهْدِي إِلَى الْبِرِّ", french: "La vérité mène à la piété.", ref: "Sahih Bukhari" },
    { id: 54, cat: "bukhari", arabic: "لا تُمِيتُوا الْقُلُوبَ بِكَثْرَةِ الطَّعَامِ", french: "Ne faites pas mourir les cœurs par l'excès de nourriture.", ref: "Sahih Bukhari (Sagesse)" },
    { id: 55, cat: "bukhari", arabic: "سِبَابُ الْمُسْلِمِ فُسُوقٌ", french: "Insulter un musulman est un acte de perversité.", ref: "Sahih Bukhari" },

    // ==========================================
    // CATEGORIE: MUSLIM (20 Hadiths)
    // ==========================================
    { id: 31, cat: "muslim", arabic: "الطُّهُورُ شَطْرُ الإِيمَانِ", french: "La propreté est la moitié de la foi.", ref: "Sahih Muslim" },
    { id: 32, cat: "muslim", arabic: "كُلُّ مَعْرُوفٍ صَدَقَةٌ", french: "Chaque bonne action est une aumône.", ref: "Sahih Muslim" },
    { id: 33, cat: "muslim", arabic: "الْمُسْلِمُ أَخُو الْمُسْلِمِ", french: "Le musulman est le frère du musulman.", ref: "Sahih Muslim" },
    { id: 34, cat: "muslim", arabic: "الدُّنْيَا سِجْنُ الْمُؤْمِنِ وَجَنَّةُ الْكَافِرِ", french: "Ce monde est la prison du croyant et le paradis du non-croyant.", ref: "Sahih Muslim" },
    { id: 35, cat: "muslim", arabic: "مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ طَرِيقًا إِلَى الْجَنَّةِ", french: "Celui qui emprunte un chemin pour acquérir un savoir, Allah lui facilite un chemin vers le Paradis.", ref: "Sahih Muslim" },
    { id: 36, cat: "muslim", arabic: "وَأَفْضَلُ الصَّلاةِ بَعْدَ الْفَرِيضَةِ صَلاةُ اللَّيْلِ", french: "La meilleure prière après la prière obligatoire est celle de la nuit.", ref: "Sahih Muslim" },
    { id: 37, cat: "muslim", arabic: "إِنَّ اللَّهَ لا يَنْظُرُ إِلَى أَجْسَادِكُمْ وَلا إِلَى صُوَرِكُمْ وَلَكِنْ يَنْظُرُ إِلَى قُلُوبِكُمْ", french: "Allah ne regarde pas vos corps ni vos visages, mais Il regarde vos cœurs.", ref: "Sahih Muslim" },
    { id: 38, cat: "muslim", arabic: "مَنْ دَلَّ عَلَى خَيْرٍ فَلَهُ مِثْلُ أَجْرِ فَاعِلِهِ", french: "Celui qui montre le chemin d'un bien aura la même récompense que celui qui l'aura accompli.", ref: "Sahih Muslim" },
    { id: 39, cat: "muslim", arabic: "مَنْ صَامَ رَمَضَانَ ثُمَّ أَتْبَعَهُ سِتًّا مِنْ شَوَّالٍ كَانَ كَصِيَامِ الدَّهْرِ", french: "Quiconque jeûne le Ramadan puis le suit de six jours de Chawwal sera comme s'il avait jeûné toute l'année.", ref: "Sahih Muslim" },
    { id: 40, cat: "muslim", arabic: "الْكَلِمَةُ الطَّيِّبَةُ صَدَقَةٌ", french: "La bonne parole est une aumône.", ref: "Sahih Muslim" },
    { id: 41, cat: "muslim", arabic: "لا تَدْخُلُونَ الْجَنَّةَ حَتَّى تُؤْمِنُوا", french: "Vous n'entrerez pas au Paradis tant que vous ne croirez pas.", ref: "Sahih Muslim" },
    { id: 42, cat: "muslim", arabic: "حُجِبَتِ النَّارُ بِالشَّهَوَاتِ وَحُجِبَتِ الْجَنَّةُ بِالْمَكَارِهِ", french: "L'Enfer est voilé par les plaisirs et le Paradis par les épreuves.", ref: "Sahih Muslim" },
    { id: 43, cat: "muslim", arabic: "مَنْ قَرَأَ حَرْفًا مِنْ كِتَابِ اللَّهِ فَلَهُ بِهِ حَسَنَةٌ", french: "Quiconque lit une lettre du Livre d'Allah a pour cela une bonne action.", ref: "Sahih Muslim (Sens)" },
    { id: 44, cat: "muslim", arabic: "خَيْرُ الصَّدَقَةِ مَا كَانَ عَنْ ظَهْرِ غِنًى", french: "La meilleure aumône est celle faite par celui qui est riche (qui a le nécessaire).", ref: "Sahih Muslim" },
    { id: 45, cat: "muslim", arabic: "الصَّلَوَاتُ الْخَمْسُ كَفَّارَاتٌ لِمَا بَيْنَهُنَّ", french: "Les cinq prières quotidiennes sont une expiation pour ce qui les sépare.", ref: "Sahih Muslim" },
    { id: 56, cat: "muslim", arabic: "أَحَبُّ الْبِلادِ إِلَى اللَّهِ مَسَاجِدُهَا", french: "Les lieux les plus aimés d'Allah sont les mosquées.", ref: "Sahih Muslim" },
    { id: 57, cat: "muslim", arabic: "مَنْ غَشَّ فَلَيْسَ مِنِّي", french: "Celui qui nous trompe n'est pas des nôtres.", ref: "Sahih Muslim" },
    { id: 58, cat: "muslim", arabic: "يَا عِبَادِي كُلُّكُمْ ضَالٌّ إِلا مَنْ هَدَيْتُهُ", french: "Ô Mes serviteurs ! Vous êtes tous égarés, sauf celui que Je guide.", ref: "Sahih Muslim" },
    { id: 59, cat: "muslim", arabic: "لا تَدْخُلُوا الْجَنَّةَ حَتَّى تَحَابُّوا", french: "Vous n'entrerez pas au Paradis tant que vous ne vous aimerez pas.", ref: "Sahih Muslim" },
    { id: 60, cat: "muslim", arabic: "الْيَدُ الْعُلْيَا خَيْرٌ مِنَ الْيَدِ السُّفْلَى", french: "La main qui donne est meilleure que celle qui reçoit.", ref: "Sahih Muslim" }
];

const displayContainer = document.getElementById('hadiths-display');
const searchInput = document.getElementById('hadith-search');
const filterBtns = document.querySelectorAll('.tab-btn');

/**
 * Fonction principale de rendu
 */
function renderHadiths(filter = 'all', keyword = '') {
    displayContainer.innerHTML = '';
    
    const filteredList = hadithDatabase.filter(h => {
        const matchesCat = (filter === 'all' || h.cat === filter);
        const matchesKey = (h.french.toLowerCase().includes(keyword.toLowerCase()) || 
                            h.ref.toLowerCase().includes(keyword.toLowerCase()) ||
                            h.cat.toLowerCase().includes(keyword.toLowerCase()) ||
                            h.arabic.includes(keyword));
        return matchesCat && matchesKey;
    });

    if (filteredList.length === 0) {
        displayContainer.innerHTML = `<div class="no-result" style="text-align:center; padding:40px; color:var(--mp-gold);">Aucun hadith trouvé pour cette recherche.</div>`;
        return;
    }

    filteredList.forEach(h => {
        const card = `
            <div class="hadith-card" style="animation: fadeIn 0.5s ease forwards;">
                <div class="hadith-header">
                    <span class="badge">${h.cat.toUpperCase()}</span>
                    <button class="copy-btn" onclick="copyHadith('${h.french.replace(/'/g, "\\'")}')" title="Copier le texte">
                        <i class="far fa-copy"></i>
                    </button>
                </div>
                <div class="hadith-arabic" dir="rtl">${h.arabic}</div>
                <div class="hadith-french">${h.french}</div>
                <div class="hadith-ref"><i class="fas fa-book-reader"></i> ${h.ref}</div>
            </div>
        `;
        displayContainer.insertAdjacentHTML('beforeend', card);
    });
}

/**
 * Fonction de copie dans le presse-papier avec notification élégante (Toast)
 */
window.copyHadith = (text) => {
    navigator.clipboard.writeText(text).then(() => {
        showToast("Hadith copié dans le presse-papier !");
    }).catch(err => {
        console.error('Erreur lors de la copie : ', err);
    });
};

/**
 * Système de notification (Toast)
 */
function showToast(message) {
    const existingToast = document.querySelector('.quranlight-toast');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.className = 'quranlight-toast';
    toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--mp-gold, #b08d57);
        color: #fff;
        padding: 12px 24px;
        border-radius: 50px;
        z-index: 9999;
        font-family: 'Poppins', sans-serif;
        font-size: 0.9rem;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        animation: slideUpFade 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.5s ease';
        setTimeout(() => toast.remove(), 500);
    }, 2500);
}

/**
 * Écouteur pour la barre de recherche (avec petit délai pour performance)
 */
let searchTimeout;
searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        const activeBtn = document.querySelector('.tab-btn.active');
        renderHadiths(activeBtn.dataset.cat, e.target.value);
    }, 200);
});

/**
 * Écouteurs pour les boutons de filtrage
 */
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderHadiths(btn.dataset.cat, searchInput.value);
    });
});

// Lancement initial au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    renderHadiths();
});