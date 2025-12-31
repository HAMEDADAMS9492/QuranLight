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
// GESTION DE LA BOUSSOLE
// ==============================
function initCompass() {
  const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  if (isIOS && typeof DeviceOrientationEvent.requestPermission === "function") {
    statusBadge.innerHTML =
      '<i class="fas fa-hand-pointer"></i> Cliquez sur ↻ pour activer';
  } else {
    window.addEventListener(
      "deviceorientationabsolute",
      handleOrientation,
      true
    );
    window.addEventListener("deviceorientation", handleOrientation, true);
  }
}

function handleOrientation(event) {
  let heading = 0;

  if (event.webkitCompassHeading) {
    heading = event.webkitCompassHeading; // iOS
  } else if (event.alpha !== null) {
    heading = 360 - event.alpha; // Android (mouvement inverse)
  }

  deviceHeading = heading;
  deviceAngleEl.textContent = `${Math.round(heading)}°`;

  // Animation fluide
  requestAnimationFrame(updateUI);
}

function updateUI() {
  if (qiblaBearing === null) return;

  // Calcul de la différence d'angle
  let diff = qiblaBearing - deviceHeading;

  // Normalisation pour rotation la plus courte
  let rotation = ((diff + 540) % 360) - 180;

  // Lissage (Lerp)
  lastRotation += (rotation - lastRotation) * 0.15;
  qiblaDisplay.style.transform = `rotate(${lastRotation}deg)`;

  // État de l'alignement
  const isAligned = Math.abs(rotation) < 5;
  if (isAligned) {
    statusBadge.classList.add("aligned");
    statusBadge.innerHTML = "🕋 Vous êtes face à la Qibla";
    if (navigator.vibrate) navigator.vibrate(50); // Petite vibration si aligné
  } else {
    statusBadge.classList.remove("aligned");
    statusBadge.innerHTML = "🧭 Ajustez votre direction";
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
// GESTION DES BOUTONS & OPTIONS
// ==============================
if (calibrateBtn) {
  calibrateBtn.addEventListener("click", async () => {
    if (typeof DeviceOrientationEvent.requestPermission === "function") {
      const permission = await DeviceOrientationEvent.requestPermission();
      if (permission === "granted") {
        window.addEventListener("deviceorientation", handleOrientation, true);
      }
    } else {
      location.reload(); // Simple refresh pour les autres
    }
  });
}

// Gestion de l'option Réalité Augmentée (Simulation)
if (btnAr) {
  btnAr.addEventListener("click", () => {
    isArMode = !isArMode;
    if (isArMode) {
      statusBadge.innerHTML = "📸 Mode AR activé (Caméra requise)";
      btnAr.classList.add("active");
      // Ici, tu pourrais activer l'accès caméra via WebRTC
    } else {
      btnAr.classList.remove("active");
      getUserLocation();
    }
  });
}

// Navigation Tabs
navButtons.forEach((btn) => {
  btn.addEventListener("click", function () {
    navButtons.forEach((b) => b.classList.remove("active"));
    this.classList.add("active");
  });
});

document.addEventListener("DOMContentLoaded", getUserLocation);
