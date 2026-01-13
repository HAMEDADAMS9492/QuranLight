document.addEventListener("DOMContentLoaded", () => {
  const chatWindow = document.getElementById("chatbot-window");
  const openBtn = document.getElementById("open-chat");
  const closeBtn = document.getElementById("close-chat");
  const sendBtn = document.getElementById("send-msg");
  const userInput = document.getElementById("user-input");
  const messagesArea = document.getElementById("chat-messages");

  let currentLang = "FR";

  // === Données du chatbot ===
  const data = {
    FR: {
      welcome:
        "As-salamu alaykum 👋 Je suis votre assistant QuranLight. Comment puis-je vous aider ?",
      subtitle: "Guidance Spirituelle",
      placeholder: "Exprimez-vous ici...",
      typing: "QuranLight réfléchit...",
      options: [
        {
          id: "coran",
          text: "Lire le Noble Coran",
          icon: "fa-book-open",
          url: "/quran.html",
        },
        {
          id: "priere",
          text: "Horaires de Prière",
          icon: "fa-clock",
          url: "/salat.html",
        },
        {
          id: "hadith",
          text: "Hadiths du Jour",
          icon: "fa-quote-left",
          url: "/hadiths.html",
        },
        {
          id: "qibla",
          text: "Direction de la Qibla",
          icon: "fa-compass",
          url: "/qibla.html",
        },
      ],
      actionResponses: {
        coran:
          "📖 Le Coran est une lumière et une guidée pour l'âme. Accédez à la lecture ici :",
        priere:
          "🕋 La prière est le lien entre le serviteur et son Créateur. Voici les horaires :",
        hadith: "💫 Découvrez un hadith inspirant du Prophète (psl) :",
        qibla:
          "🕌 Orientez-vous vers la Kaaba avec précision grâce à notre boussole :",
      },
      smartResponses: [
        {
          keywords: ["salam", "bonjour", "salut"],
          msg: "Wa Alaykum As-Salam 🌸 Que la paix soit sur vous. Comment puis-je vous aider aujourd’hui ?",
        },
        {
          keywords: ["merci", "shukran"],
          msg: "Barakallahu feek 🤍 Qu’Allah vous couvre de Sa miséricorde.",
        },
      ],
      fallback:
        "Je n’ai pas bien saisi 🌙. Voulez-vous reformuler ou choisir une option ci-dessus ?",
    },
    EN: {
      welcome:
        "As-salamu alaykum 👋 I am your QuranLight assistant. How can I help you?",
      subtitle: "Spiritual Guidance",
      placeholder: "Type here...",
      typing: "QuranLight is thinking...",
      options: [
        {
          id: "coran",
          text: "Read Noble Quran",
          icon: "fa-book-open",
          url: "/quran.html",
        },
        {
          id: "priere",
          text: "Prayer Timings",
          icon: "fa-clock",
          url: "/salat.html",
        },
        {
          id: "hadith",
          text: "Hadiths of the Day",
          icon: "fa-quote-left",
          url: "/hadiths.html",
        },
        {
          id: "qibla",
          text: "Qibla Direction",
          icon: "fa-compass",
          url: "/qibla.html",
        },
      ],
      actionResponses: {
        coran:
          "📖 The Quran is light and guidance for the soul. Access it here:",
        priere:
          "🕌 Prayer is the link between the servant and the Creator. Here are the times:",
        hadith: "💫 Discover the Prophet’s wisdom (pbuh):",
        qibla:
          "🕋 Align yourself toward the Kaaba with precision using our compass:",
      },
      smartResponses: [
        {
          keywords: ["hello", "hi", "salam"],
          msg: "Wa Alaykum As-Salam 🌷 How can I assist your spiritual reflection today?",
        },
      ],
      fallback:
        "I didn’t quite catch that 🌙. Could you rephrase or pick an option above?",
    },
  };

  // === Gestion du changement de langue ===
  window.changeLang = function (lang) {
    currentLang = lang;
    const btnFr = document.getElementById("btn-fr");
    const btnEn = document.getElementById("btn-en");
    if (btnFr) btnFr.classList.toggle("active", lang === "FR");
    if (btnEn) btnEn.classList.toggle("active", lang === "EN");
    document.getElementById("ui-subtitle").innerText = data[lang].subtitle;
    userInput.placeholder = data[lang].placeholder;
    renderInitialState();
  };

  // === Message d’accueil et options ===
  function renderInitialState() {
    messagesArea.innerHTML = `
      <div class="msg bot-msg">${data[currentLang].welcome}</div>
      <div class="options-list">
        ${data[currentLang].options
          .map(
            (opt) => `
            <button class="option-button" onclick="handleAction('${opt.id}', '${opt.text}', '${opt.url}')">
              <span>${opt.text}</span>
              <i class="fas ${opt.icon}"></i>
            </button>`
          )
          .join("")}
      </div>
      <div id="typing" class="typing" style="display:none">${
        data[currentLang].typing
      }</div>
    `;
    messagesArea.scrollTop = messagesArea.scrollHeight;
  }

  // === Actions prédéfinies ===
  window.handleAction = function (id, label, url) {
    appendMessage(label, "user");
    showTyping(true);

    setTimeout(() => {
      showTyping(false);
      const introText = data[currentLang].actionResponses[id];
      const responseHtml = `
        <div class="bot-response-content">
          ${introText}
          <div class="redirect-container">
            <button class="redirect-confirm-btn" onclick="redirectTo('${url}')">
              ${label} <i class="fas fa-arrow-right"></i>
            </button>
          </div>
        </div>`;
      appendMessage(responseHtml, "bot");
    }, 800);
  };

  // CORRECTION : Mise en global pour que le bouton fonctionne
  window.redirectTo = function (url) {
    const fullUrl = new URL(url, window.location.origin);
    window.open(fullUrl.href, "_blank");
  };

  // === Module intelligent — détection de thèmes ===
  function processSmartResponse(input) {
    const text = input
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    const locale = data[currentLang];

    // 0️⃣ Intelligence : Revenir au début (Commencer / Menu)
    if (
      text.includes("commencer") ||
      text.includes("menu") ||
      text.includes("start") ||
      text.includes("aide")
    ) {
      renderInitialState();
      return null; // On ne retourne rien car renderInitialState s'en occupe
    }

    // 1️⃣ Salutations et remerciements
    for (let item of locale.smartResponses) {
      if (item.keywords.some((k) => text.includes(k))) return item.msg;
    }

    // 2️⃣ Détection auto des services pour afficher les BOUTONS
    const mapping = {
      coran: ["coran", "verset", "sourate", "lecture", "lire"],
      priere: ["salat", "prier", "adhan", "horaire", "priere"],
      hadith: ["hadith", "sunna"],
      qibla: ["kaaba", "qibla", "direction"],
    };

    for (let key in mapping) {
      if (mapping[key].some((k) => text.includes(k))) {
        const opt = locale.options.find((o) => o.id === key);
        // On simule un clic sur l'action
        setTimeout(() => {
          const introText = locale.actionResponses[key];
          const html = `
                <div class="bot-response-content">
                    ${introText}
                    <div class="redirect-container">
                        <button class="redirect-confirm-btn" onclick="redirectTo('${opt.url}')">
                            ${opt.text} <i class="fas fa-arrow-right"></i>
                        </button>
                    </div>
                </div>`;
          appendMessage(html, "bot");
        }, 500);
        return "Voici ce que j'ai trouvé pour vous :";
      }
    }

    // 3️⃣ Questions historiques et spirituelles (TA LISTE COMPLÈTE)
    const historyAnswers = {
      adam: "🧬 Adam (‘alayhi as-salam) est le premier homme créé par Allah, formé d’argile. Il fut le premier Prophète et le père de l’humanité.",
      hawwa:
        "🌸 Hawwa (Ève) fut la première femme et l'épouse d’Adam. Ensemble, ils peuplèrent la Terre après avoir quitté le paradis.",
      ibrahim:
        "🔥 Ibrahim (Abraham) est le père du monothéisme. Il a reconstruit la Kaaba avec son fils Ismaël et fut éprouvé par l’ordre du sacrifice.",
      ismail:
        "🕊️ Ismaël (‘alayhi as-salam) est le fils d’Ibrahim et ancêtre du Prophète Muhammad ﷺ. Il fit preuve d’une foi et d’une obéissance exemplaire.",
      ishak:
        "🌿 Ishaq (Isaac) fut fils d’Ibrahim et père de Ya‘qub (Jacob). Il est parmi les prophètes bénis d’Allah.",
      yaqub:
        "🕊️ Ya‘qub (Jacob) fut le père de douze fils, ancêtres des tribus d’Israël. Il était connu pour sa piété et sa patience.",
      yusuf:
        "🌹 Yusuf (Joseph) est célèbre pour sa beauté et sa sagesse. Son histoire dans le Coran symbolise la patience et la pureté face à l’épreuve.",
      moussa:
        "🌊 Moussa (Moïse) fut envoyé à Pharaon. Allah lui permit de séparer la mer pour sauver les enfants d’Israël.",
      harun:
        "🤲 Harun (Aaron) était le frère de Moussa, choisi comme soutien dans la mission prophétique.",
      dawud:
        "🎵 Dawud (David) était roi et prophète. Il fut doté d’une voix merveilleuse et reçut les Psaumes (Zabur).",
      soulayman:
        "👑 Soulayman (Salomon) avait le don de parler aux animaux et aux djinns. Son royaume fut symbole de justice et de sagesse.",
      yunus:
        "🐋 Yunus (Jonas) fut avalé par un grand poisson. Il invoqua Allah dans les ténèbres et fut délivré.",
      ayyub:
        "💧 Ayyub (Job) est l’exemple de la patience absolue. Malgré la maladie et la perte, il resta reconnaissant envers Allah.",
      zakaria:
        "🌿 Zakariya (Zacharie) fut exaucé dans sa vieillesse par la naissance de Yahya (Jean-Baptiste).",
      yahya:
        "🌱 Yahya (Jean) fut un prophète pur et pieux, au message d’humilité et de repentir.",
      isa: "🌹 Issa (Jésus), né miraculeusement, est un grand prophète de l’islam, né de Maryam sans père par la volonté d’Allah.",
      maryam:
        "👩‍🦰 Maryam (Marie) est honorée comme la plus vertueuse des femmes. Elle consacra sa vie à l’adoration et éleva son fils Issa avec foi.",
      muhammad:
        "🌟 Muhammad ﷺ est le dernier Prophète, envoyé comme miséricorde pour l’humanité. Il reçut la révélation finale, le Noble Coran.",
      idris:
        "📜 Idris (‘alayhi as-salam) fut un prophète très savant, mentionné comme ayant été élevé vers un haut rang.",
      nuh: "⛵ Nuh (Noé) appela son peuple à adorer Allah pendant des siècles avant le grand déluge.",
      houd: "🌪️ Houd appela son peuple `Ad à délaisser l’idolâtrie avant qu’un vent dévastateur ne les anéantisse.",
      saleh:
        "🐪 Saleh prêcha au peuple de Thamud, à qui un miracle fut donné : la chamelle sortie du rocher.",
      choueib:
        "⚖️ Chouaïb (Jethro) avertit son peuple Midian de l’injustice dans le commerce et la trahison de la foi.",
      ilyas:
        "🔥 Ilyas (Élie) combattit l’idolâtrie et rappela son peuple à la crainte d’Allah.",
      al_yasa:
        "🌾 Al-Yasa‘ (Élisée) poursuivit le message de droiture après Ilyas.",
      lut: "⚡ Lut (Lot) fut envoyé à un peuple qui commit des péchés graves. Allah le sauva de leur châtiment.",
      dhulkifl:
        "🌠 Dhul-Kifl (‘alayhi as-salam) est cité comme un homme juste et patient, parmi les prophètes bénis.",
      yusha:
        "🛡️ Yusha‘ (Josué) fut le successeur de Moussa, qui guida les enfants d’Israël vers la Terre promise.",
      anges:
        "🕊️ Les anges (malaika) sont faits de lumière. Ils obéissent à Allah sans jamais désobéir.",
      djinn:
        "👁️‍🗨️ Les djinns sont créés d’un feu sans fumée. Ils vivent dans un monde parallèle au nôtre.",
      iblis:
        "🔥 Iblis (Satan) était un djinn orgueilleux refusant de se prosterner devant Adam. Il devint l’ennemi de l’humanité jusqu’au Jour du Jugement.",
      jibril:
        "⚡ Jibril (Gabriel) est l’ange de la révélation, porteur du message divin au Prophète Muhammad ﷺ.",
      mikail:
        "🌧️ Mikail (Michel) est l’ange chargé de la pluie et de la subsistance.",
      israfil:
        "📯 Israfil soufflera dans la trompe pour annoncer la fin du monde et la résurrection.",
      malak_al_mawt:
        "☁️ Malak al-Mawt est l’ange de la mort, chargé de retirer les âmes par ordre d’Allah.",
      kaaba:
        "🕋 La Kaaba est la première Maison d’adoration établie sur Terre. Reconnue comme Qibla, elle symbolise l’unité des croyants.",
      zamzam:
        "💧 Le puits de Zamzam apparut miraculeusement pour Hajar et Ismaël dans le désert de La Mecque.",
      madina:
        "🌴 Médine est la ville du Prophète où il établit la première communauté islamique.",
      jerusalem:
        "🕌 Jérusalem (Al-Quds) abrite la Mosquée Al-Aqsa, première Qibla et lieu du voyage nocturne Isra’ wa Mi‘raj.",
      hira: "🌑 La grotte de Hira fut le lieu de la première révélation du Coran au Prophète Muhammad ﷺ.",
      badr: "⚔️ La bataille de Badr fut la première grande victoire des musulmans, assistés par les anges.",
      uhud: "🛡️ La bataille d’Uhud rappela l’importance de l’obéissance et de la persévérance dans la foi.",
      hijra:
        "🌙 La Hijra (migration) marque le départ du Prophète de La Mecque vers Médine, début du calendrier hégirien.",
      mecca:
        "🕋 La Mecque est la ville sainte abritant la Kaaba, cœur du pèlerinage (Hajj).",
      medine:
        "🌴 Médine est Al-Madinah Al-Munawwarah, lieu de la tombe bénie du Prophète ﷺ.",
      aqsa: "🕌 Al-Aqsa, à Jérusalem, est la troisième mosquée sacrée de l’islam.",
      paradis:
        "🏞️ Le paradis (Jannah) est un lieu de bonheur éternel, où coulent des rivières et où les croyants verront leur Seigneur.",
      enfer:
        "🔥 L’enfer (Jahannam) est une demeure de châtiment pour ceux qui rejettent la foi après la vérité.",
      qadr: "🌌 Al-Qadr (Destin) est le décret divin que tout être doit traverser, écrit par Allah depuis l’éternité.",
      laylat_al_qadr:
        "🌠 Laylat al-Qadr (Nuit du Destin) est la nuit bénie où fut révélé le Coran, plus précieuse que mille mois d’adoration.",
      ramadan:
        "🌙 Ramadan est le mois du jeûne, du pardon et de la révélation du Coran.",
      eid_al_fitr:
        "🎉 L’Aïd al-Fitr marque la fin du jeûne de Ramadan, symbole de gratitude et de joie spirituelle.",
      eid_al_adha:
        "🐏 L’Aïd al-Adha commémore le sacrifice d’Ibrahim, preuve de sa soumission à Allah.",
      zakat:
        "💰 La Zakat est une aumône purificatrice obligatoire sur les biens, destinée à aider les nécessiteux.",
      hajj: "🕋 Le Hajj est le grand pèlerinage à La Mecque, pilier central de l’islam, effectué une fois dans la vie si possible.",
      sabr: "🪽 As-Sabr, la patience, est une lumière du croyant. Elle mène à la récompense et au succès dans l’épreuve.",
      shukr:
        "🤲 Ash-Shukr, la reconnaissance, consiste à remercier Allah pour Ses bienfaits apparents et cachés.",
      dhikr:
        "💗 Le Dhikr est le souvenir d’Allah par la langue et le cœur, source de paix intérieure.",
      dunya:
        "🌏 Le monde (Dunya) est un lieu d’épreuve temporaire avant la vie éternelle dans l’au-delà.",
      akhirah:
        "🌌 L’au-delà (Akhirah) est la vie éternelle où chaque âme récoltera ce qu’elle a semé.",
      tawhid:
        "☝️ At-Tawhid est l’unicité d’Allah, fondement de toute la foi islamique.",
      shirk:
        "⚠️ Le Shirk est l’association d’un autre à Allah – le plus grand péché si non repenti.",
      jihad:
        "🗡️ Le Jihad signifie effort pour Allah – spirituel avant tout, contre le mal et les passions.",
      wudu: "🚿 Le Wudû’ (ablution) purifie le corps et l’âme avant la prière.",
      salah:
        "🙏 La Salâh est la prière rituelle, reliant le croyant à son Créateur cinq fois par jour.",
      ilm: "📚 Al-‘Ilm (la science) est une lumière. Chercher la connaissance est un devoir pour tout musulman.",
      baraka:
        "🌺 La Barakah est la bénédiction qu’Allah met dans les choses pures, multiplie le bien et apaise le cœur.",
    };

    for (const key in historyAnswers) {
      if (text.includes(key)) return historyAnswers[key];
    }

    // 4️⃣ Réponses inspirantes par défaut
    const altFR = [
      "🌙 « Et dis : Seigneur, augmente-moi en savoir. » (Sourate Taha, 114)",
      "✨ Allah connaît nos pensées avant même qu’elles ne soient exprimées.",
      "🕊️ La foi s’entretient par la connaissance et la patience.",
      "🌿 Chaque épreuve porte un sens caché, même si nous ne le voyons pas encore.",
    ];
    const altEN = [
      "🌙 “And say: My Lord, increase me in knowledge.” (Surah Taha 20:114)",
      "✨ Allah knows what lies in every heart even before it’s spoken.",
      "🕊️ Faith grows with patience and understanding.",
      "🌿 Every hardship carries divine wisdom you may uncover later.",
    ];
    return (currentLang === "FR" ? altFR : altEN)[
      Math.floor(Math.random() * 4)
    ];
  }

  // === Affichage des messages ===
  function appendMessage(content, side) {
    const msg = document.createElement("div");
    msg.className = `msg ${side}-msg`;
    msg.innerHTML = content;
    const typingElem = document.getElementById("typing");
    if (typingElem) messagesArea.insertBefore(msg, typingElem);
    else messagesArea.appendChild(msg);
    messagesArea.scrollTop = messagesArea.scrollHeight;
  }

  function showTyping(status) {
    const t = document.getElementById("typing");
    if (t) t.style.display = status ? "block" : "none";
    messagesArea.scrollTop = messagesArea.scrollHeight;
  }

  // === Interaction utilisateur ===
  sendBtn.onclick = () => {
    const val = userInput.value.trim();
    if (!val) return;
    appendMessage(val, "user");
    userInput.value = "";
    showTyping(true);
    setTimeout(() => {
      showTyping(false);
      const botResponse = processSmartResponse(val);
      if (botResponse) appendMessage(botResponse, "bot");
    }, 900);
  };

  userInput.onkeypress = (e) => {
    if (e.key === "Enter") sendBtn.click();
  };

  // === Ouverture/Fermeture ===
  openBtn.onclick = () => {
    chatWindow.style.display = "flex";
    openBtn.style.display = "none";
    window.parent.postMessage("openChat", "*");
  };

  closeBtn.onclick = () => {
    chatWindow.style.display = "none";
    openBtn.style.display = "flex";
    window.parent.postMessage("closeChat", "*");
  };

  // === Initialisation ===
  renderInitialState();
});
