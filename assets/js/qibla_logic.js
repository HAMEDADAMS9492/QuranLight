/* ==========================================================
   QIBLA LOGIC – QuranLight (OPTIMISÉE)
========================================================== */

let deviceHeading = 0;
let qiblaBearing = null;
let lastRotation = 0;
let map = null;
let isArMode = false;

// ELEMENTS DOM
const qiblaDisplay = document.getElementById("qibla-display");
const deviceAngleEl = document.getElementById("device-angle");
const qiblaAngleEl = document.getElementById("qibla-angle");
const statusBadge = document.getElementById("qibla-status");
const calibrateBtn = document.getElementById("calibrate-btn");
const btnAr = document.getElementById("btn-ar");
const navButtons = document.querySelectorAll(".nav-btn");

// ==============================
// GÉOLOCALISATION & INITIALISATION
// ==============================
function getUserLocation() {
  if (!navigator.geolocation) {
    statusBadge.innerHTML =
      '<i class="fas fa-exclamation-triangle"></i> GPS non supporté';
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      qiblaBearing = calculateQiblaDirection(latitude, longitude);
      qiblaAngleEl.textContent = `${Math.round(qiblaBearing)}°`;

      initLeafletMap(latitude, longitude);
      initCompass();
    },
    (err) => {
      statusBadge.innerHTML =
        '<i class="fas fa-map-marker-alt"></i> Erreur de localisation';
      console.error(err);
    },
    { enableHighAccuracy: true }
  );
}

// ==============================
// CALCUL DE LA DIRECTION
// ==============================
function calculateQiblaDirection(lat, lon) {
  const kaabaLat = 21.4225 * (Math.PI / 180);
  const kaabaLon = 39.8262 * (Math.PI / 180);
  const userLat = lat * (Math.PI / 180);
  const userLon = lon * (Math.PI / 180);

  const y = Math.sin(kaabaLon - userLon);
  const x =
    Math.cos(userLat) * Math.tan(kaabaLat) -
    Math.sin(userLat) * Math.cos(kaabaLon - userLon);

  let bearing = Math.atan2(y, x) * (180 / Math.PI);
  return (bearing + 360) % 360;
}

// ==============================
// GESTION DE LA BOUSSOLE (CORRIGÉE)
// ==============================

function handleOrientation(event) {
  let heading = 0;

  if (event.webkitCompassHeading) {
    heading = event.webkitCompassHeading; // iOS (Direction réelle)
  } else if (event.alpha !== null) {
    // Sur Android, l'alpha augmente dans le sens anti-horaire
    heading = 360 - event.alpha;
  }

  deviceHeading = heading;
  deviceAngleEl.textContent = `${Math.round(heading)}°`;

  // On lance la mise à jour visuelle
  requestAnimationFrame(updateUI);
}

function updateUI() {
  if (qiblaBearing === null) return;

  // 1. ROTATION DU CADRAN (NESO)
  // Le cadran doit tourner à l'opposé du mouvement du téléphone pour que le N reste au Nord.
  const dialRotation = -deviceHeading;
  qiblaDisplay.style.transform = `rotate(${dialRotation}deg)`;

  // 2. ROTATION DE LA FLÈCHE (QIBLA)
  // La flèche est dans le groupe qui tourne avec le cadran,
  // on lui donne l'angle calculé de la Qibla (ex: 119°).
  const pointerGroup = document.querySelector(".qibla-pointer-group");
  if (pointerGroup) {
    pointerGroup.style.transform = `rotate(${qiblaBearing}deg)`;
  }

  // 3. ÉTAT DE L'ALIGNEMENT
  // On est aligné quand le téléphone pointe (0°) vers la direction de la Qibla (qiblaBearing)
  let diff = qiblaBearing - deviceHeading;
  let normalizedDiff = ((diff + 540) % 360) - 180;

  const isAligned = Math.abs(normalizedDiff) < 8; // Tolérance de 8 degrés

  if (isAligned) {
    statusBadge.classList.add("aligned");
    statusBadge.innerHTML = "🕋 Vous êtes face à la Qibla";
    // Vibration (une seule fois pour ne pas vider la batterie)
    if (navigator.vibrate && !this.hasVibrated) {
      navigator.vibrate(50);
      this.hasVibrated = true;
    }
  } else {
    statusBadge.classList.remove("aligned");
    statusBadge.innerHTML = "🧭 Ajustez votre direction";
    this.hasVibrated = false;
  }
}
// ==============================
// CARTE LEAFLET (AVEC LIGNE DYNAMIQUE)
// ==============================
function initLeafletMap(lat, lon) {
  if (map) return;

  map = L.map("qibla-map", { zoomControl: false }).setView([lat, lon], 4);

  L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
  ).addTo(map);

  const kaabaIcon = L.divIcon({
    html: "🕋",
    className: "kaaba-icon",
    iconSize: [30, 30],
  });
  L.marker([21.4225, 39.8262], { icon: kaabaIcon }).addTo(map);

  L.marker([lat, lon]).addTo(map);

  const qiblaLine = L.polyline(
    [
      [lat, lon],
      [21.4225, 39.8262],
    ],
    {
      color: "#b08d57",
      weight: 3,
      dashArray: "5, 10",
    }
  ).addTo(map);
}

// ==============================
// GESTION DES BOUTONS & OPTIONS (OPTIMISÉE)
// ==============================
const btnCompass = document.querySelector(".nav-btn:first-child"); // Prend le 1er bouton
const mapContainer = document.querySelector(".qibla-map-container");

if (btnAr) {
  btnAr.addEventListener("click", async () => {
    isArMode = true;
    const video = document.getElementById("ar-video");

    btnAr.classList.add("active");
    btnCompass.classList.remove("active");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      video.srcObject = stream;
      video.style.display = "block";

      if (mapContainer) mapContainer.style.display = "none";

      // On rend l'interface semi-transparente pour voir à travers
      const wrapper = document.querySelector(".qibla-content-wrapper");
      if (wrapper) wrapper.style.backgroundColor = "rgba(0,0,0,0.2)";

      statusBadge.innerHTML =
        '<i class="fas fa-camera"></i> Mode AR : Visez l\'horizon';
    } catch (err) {
      statusBadge.innerHTML = "❌ Caméra non supportée ou refusée";
      isArMode = false;
      btnAr.classList.remove("active");
      btnCompass.classList.add("active");
    }
  });
}

if (btnCompass) {
  btnCompass.addEventListener("click", () => {
    isArMode = false;
    const video = document.getElementById("ar-video");

    btnCompass.classList.add("active");
    btnAr.classList.remove("active");

    if (video && video.srcObject) {
      video.srcObject.getTracks().forEach((track) => track.stop());
      video.srcObject = null;
    }
    video.style.display = "none";

    if (mapContainer) mapContainer.style.display = "block";

    const wrapper = document.querySelector(".qibla-content-wrapper");
    if (wrapper) wrapper.style.backgroundColor = "";

    statusBadge.innerHTML = "🧭 Mode Boussole activé";
  });
}
document.addEventListener("DOMContentLoaded", getUserLocation);
