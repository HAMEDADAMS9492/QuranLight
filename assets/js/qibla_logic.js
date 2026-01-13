/* ==========================================================
    QIBLA LOGIC – QuranLight (VERSION FINALE OPTIMISÉE)
========================================================== */

let deviceHeading = 0;
let smoothedHeading = 0; // Pour le lissage des mouvements
let qiblaBearing = null;
let lastRotation = 0;
let map = null;
let isArMode = false;
let hasVibrated = false;
let userCoords = null;
const kaabaCoords = [21.4225, 39.8262];

// ELEMENTS DOM
const qiblaDisplay = document.getElementById("qibla-display");
const deviceAngleEl = document.getElementById("device-angle");
const qiblaAngleEl = document.getElementById("qibla-angle");
const statusBadge = document.getElementById("qibla-status");
const calibrateBtn = document.getElementById("calibrate-btn");
const btnAr = document.getElementById("btn-ar");
const btnCompass = document.querySelector(".nav-btn:first-child");
const btnCloseAr = document.getElementById("close-ar");
const arControls = document.getElementById("ar-controls");
const mapContainer = document.querySelector(".qibla-map-container");

/* Petite aide pour mettre à jour le statut en sécurité */
function setStatus(html) {
  if (!statusBadge) return;
  statusBadge.innerHTML = html;
}

// ==============================
// GÉOLOCALISATION & INITIALISATION
// ==============================
function getUserLocation() {
  if (!navigator.geolocation) {
    setStatus(
      '<i class="fas fa-exclamation-triangle"></i> GPS non supporté'
    );
    return;
  }

  setStatus('<i class="fas fa-sync-alt fa-spin"></i> Localisation en cours...');

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      userCoords = [latitude, longitude];
      qiblaBearing = calculateQiblaDirection(latitude, longitude);

      if (qiblaAngleEl) {
        qiblaAngleEl.textContent = `${Math.round(qiblaBearing)}°`;
      }

      initLeafletMap(latitude, longitude);
      initCompass();
    },
    (err) => {
      console.error(err);
      setStatus(
        '<i class="fas fa-map-marker-alt"></i> Erreur de localisation'
      );
    },
    { enableHighAccuracy: true }
  );
}

// ==============================
// CALCUL DE LA DIRECTION
// ==============================
function calculateQiblaDirection(lat, lon) {
  const kaabaLatRad = kaabaCoords[0] * (Math.PI / 180);
  const kaabaLonRad = kaabaCoords[1] * (Math.PI / 180);
  const userLatRad = lat * (Math.PI / 180);
  const userLonRad = lon * (Math.PI / 180);

  const y = Math.sin(kaabaLonRad - userLonRad);
  const x =
    Math.cos(userLatRad) * Math.tan(kaabaLatRad) -
    Math.sin(userLatRad) * Math.cos(kaabaLonRad - userLonRad);

  let bearing = Math.atan2(y, x) * (180 / Math.PI);
  return (bearing + 360) % 360;
}

// ==============================
// GESTION DE LA BOUSSOLE
// ==============================
function initCompass() {
  // Garde : support des événements d’orientation
  if (typeof window.DeviceOrientationEvent === "undefined") {
    setStatus("❌ Boussole non supportée sur ce navigateur");
    return;
  }

  // Garde : contexte sécurisé recommandé pour les capteurs
  if (location.protocol !== "https:") {
    console.warn(
      "DeviceOrientation fonctionne mieux en HTTPS. Pense à servir la page en HTTPS."
    );
  }

  const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  if (isIOS && typeof DeviceOrientationEvent.requestPermission === "function") {
    setStatus(
      '<button id="start-qibla" class="btn-calibrate">📍 Activer la Boussole</button>'
    );
    const startBtn = document.getElementById("start-qibla");
    if (startBtn) {
      startBtn.addEventListener("click", async () => {
        try {
          const permission = await DeviceOrientationEvent.requestPermission();
          if (permission === "granted") {
            window.addEventListener(
              "deviceorientation",
              handleOrientation,
              true
            );
            setStatus("🧭 Boussole activée");
          } else {
            setStatus("❌ Accès au capteur refusé");
          }
        } catch (err) {
          console.error(err);
          setStatus("❌ Erreur d'autorisation");
        }
      });
    }
  } else {
    if ("ondeviceorientationabsolute" in window) {
      window.addEventListener(
        "deviceorientationabsolute",
        handleOrientation,
        true
      );
    } else {
      window.addEventListener("deviceorientation", handleOrientation, true);
    }
    setStatus("🧭 Boussole en attente de mouvement...");
  }
}

function handleOrientation(event) {
  let heading = 0;

  if (typeof event.webkitCompassHeading === "number") {
    // iOS
    heading = event.webkitCompassHeading;
  } else if (event.alpha !== null) {
    // Android / autres
    heading = 360 - event.alpha;
  } else {
    // Aucun angle exploitable
    return;
  }

  // Lissage du mouvement (Smoothing) pour éviter les tremblements
  // On utilise un facteur de 0.2 pour une rotation fluide
  smoothedHeading = smoothedHeading + 0.2 * (heading - smoothedHeading);
  deviceHeading = smoothedHeading;

  if (deviceAngleEl) {
    deviceAngleEl.textContent = `${Math.round(deviceHeading)}°`;
  }

  requestAnimationFrame(updateUI);
}

function updateUI() {
  if (qiblaBearing === null) return;

  // 1. LE CADRAN RESTE FIXE
  // On s'assure que le qiblaDisplay n'a plus de rotation pour que le 'N' reste en haut
  if (qiblaDisplay) {
    qiblaDisplay.style.transform = "translateZ(0) rotate(0deg)";
  }

  // 2. SEULE L'AIGUILLE TOURNE
  // Calcul de l'angle relatif : (Direction Kaaba - Orientation du téléphone)
  const pointerGroup = document.querySelector(".qibla-pointer-group");
  if (pointerGroup) {
    // On calcule l'angle final que l'aiguille doit prendre par rapport au 'N' fixe
    const finalRotation = qiblaBearing - deviceHeading;

    // Application de la rotation avec accélération matérielle
    pointerGroup.style.transform = `translateZ(0) rotate(${finalRotation}deg)`;
    lastRotation = finalRotation;
  }

  // 3. GESTION DE L'ALIGNEMENT (PRÉCISION)
  let diff = qiblaBearing - deviceHeading;
  // Normalisation de l'angle entre -180 et 180 pour un calcul propre
  let normalizedDiff = ((diff + 540) % 360) - 180;
  const isAligned = Math.abs(normalizedDiff) < 5;

  if (!statusBadge) return;

  if (isAligned) {
    if (!statusBadge.classList.contains("aligned")) {
      statusBadge.classList.add("aligned");
      // Optionnel : Ajout d'une lueur dorée plus forte sur l'aiguille quand aligné
      if (pointerGroup) {
        pointerGroup.style.filter = "drop-shadow(0 0 15px #2ecc71)";
      }

      if (navigator.vibrate && !hasVibrated) {
        navigator.vibrate(40);
        hasVibrated = true;
      }
    }
    statusBadge.textContent = "🕋 Vous êtes face à la Kaaba";
  } else {
    statusBadge.classList.remove("aligned");
    if (pointerGroup) {
      pointerGroup.style.filter =
        "drop-shadow(0 0 10px rgba(176, 141, 87, 0.8))";
    }
    statusBadge.textContent = "🧭 Ajustez votre direction";
    hasVibrated = false;
  }
}

// ==============================
// CARTE LEAFLET
// ==============================
function initLeafletMap(lat, lon) {
  if (map) return;
  if (typeof L === "undefined") {
    console.warn("Leaflet non chargé. Vérifie l'inclusion du script Leaflet.");
    return;
  }

  map = L.map("qibla-map", { zoomControl: false }).setView([lat, lon], 4);

  L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    {
      attribution:
        '&copy; OpenStreetMap &copy; <a href="https://carto.com/">CARTO</a>',
    }
  ).addTo(map);

  const kaabaIcon = L.divIcon({
    html: '<i class="fas fa-kaaba"></i>',
    className: "kaaba-marker-icon",
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });

  L.marker(kaabaCoords, { icon: kaabaIcon }).addTo(map);

  L.circleMarker([lat, lon], {
    color: "#fff",
    fillColor: "#b08d57",
    fillOpacity: 1,
    radius: 8,
  }).addTo(map);

  L.polyline([[lat, lon], kaabaCoords], {
    color: "#b08d57",
    weight: 2,
    dashArray: "5, 10",
    opacity: 0.6,
  }).addTo(map);

  if (calibrateBtn) {
    calibrateBtn.addEventListener("click", () => {
      if (userCoords) {
        const bounds = L.latLngBounds([userCoords, kaabaCoords]);
        map.fitBounds(bounds, { padding: [50, 50] });

        const icon = calibrateBtn.querySelector("i");
        if (icon) {
          icon.style.transition = "transform 0.5s ease";
          icon.style.transform = "rotate(360deg)";
          setTimeout(() => (icon.style.transform = "rotate(0deg)"), 500);
        }
      }
    });
  }
}

// ==============================
// LOGIQUE AR (CAMÉRA & RETOUR)
// ==============================
function stopAR() {
  isArMode = false;
  const video = document.getElementById("ar-video");

  if (video && video.srcObject) {
    video.srcObject.getTracks().forEach((track) => track.stop());
    video.srcObject = null;
  }
  if (video) {
    video.style.display = "none";
  }

  if (arControls) {
    arControls.style.display = "none";
  }
  if (mapContainer) {
    mapContainer.style.display = "block";
  }

  const wrapper = document.querySelector(".qibla-content-wrapper");
  if (wrapper) {
    wrapper.style.backgroundColor = "";
  }

  if (btnCompass) {
    btnCompass.classList.add("active");
  }
  if (btnAr) {
    btnAr.classList.remove("active");
  }
  setStatus("🧭 Mode Boussole activé");
}

if (btnAr) {
  btnAr.addEventListener("click", async () => {
    isArMode = true;
    const video = document.getElementById("ar-video");

    btnAr.classList.add("active");
    if (btnCompass) {
      btnCompass.classList.remove("active");
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setStatus("❌ Caméra non supportée");
      stopAR();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (video) {
        video.srcObject = stream;
        video.style.display = "block";
      }

      if (mapContainer) {
        mapContainer.style.display = "none";
      }
      if (arControls) {
        arControls.style.display = "block";
      }

      const wrapper = document.querySelector(".qibla-content-wrapper");
      if (wrapper) {
        wrapper.style.backgroundColor = "rgba(0,0,0,0.2)";
      }

      setStatus('<i class="fas fa-camera"></i> Mode AR : Visez l\'horizon');
    } catch (err) {
      console.error(err);
      setStatus("❌ Caméra non supportée");
      stopAR();
    }
  });
}

if (btnCloseAr) {
  btnCloseAr.addEventListener("click", stopAR);
}
if (btnCompass) {
  btnCompass.addEventListener("click", stopAR);
}

document.addEventListener("DOMContentLoaded", getUserLocation);
