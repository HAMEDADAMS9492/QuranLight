/* ==========================================================
   QIBLA LOGIC – QuranLight (VERSION LEAFLET - GRATUITE)
========================================================== */

let deviceHeading = null;
let qiblaBearing = null;
let lastRotation = 0;
let map = null; // Variable pour la carte Leaflet

// ==============================
// ELEMENTS DOM
// ==============================
const qiblaDisplay = document.getElementById("qibla-display");
const deviceAngleEl = document.getElementById("device-angle");
const qiblaAngleEl = document.getElementById("qibla-angle");
const statusBadge = document.getElementById("qibla-status");
const calibrateBtn = document.getElementById("calibrate-btn");

// ==============================
// GEOLOCATION
// ==============================
function getUserLocation() {
  if (!navigator.geolocation) {
    statusBadge.textContent = "❌ Géolocalisation indisponible";
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      qiblaBearing = calculateQiblaDirection(latitude, longitude);
      qiblaAngleEl.textContent = `${qiblaBearing.toFixed(0)}°`;

      // Initialisation de la carte Leaflet
      initLeafletMap(latitude, longitude);

      initCompass();
    },
    () => {
      statusBadge.textContent = "❌ Localisation refusée";
    },
    { enableHighAccuracy: true }
  );
}

// ==============================
// INITIALISATION LEAFLET
// ==============================
function initLeafletMap(lat, lon) {
  const userLocation = [lat, lon];
  const kaabaLocation = [21.4225, 39.8262];

  if (map) return;

  map = L.map("qibla-map", {
    zoomControl: false,
    attributionControl: false,
  }).setView(userLocation, 13);

  // Style Voyager (Clair et coloré)
  L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    {
      maxZoom: 19,
    }
  ).addTo(map);

  // Logo Utilisateur
  const userIcon = L.divIcon({
    html: '<i class="fas fa-street-view" style="color: #007bff; font-size: 24px; text-shadow: 0 0 5px white;"></i>',
    className: "custom-div-icon",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

  // Logo Kaaba
  const kaabaIcon = L.divIcon({
    html: '<span style="font-size: 30px;">🕋</span>',
    className: "custom-div-icon",
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });

  L.marker(userLocation, { icon: userIcon }).addTo(map);
  L.marker(kaabaLocation, { icon: kaabaIcon }).addTo(map);

  // Ligne dorée
  const qiblaLine = L.polyline([userLocation, kaabaLocation], {
    color: "#FFC107",
    weight: 4,
    opacity: 0.9,
    dashArray: "10, 10",
  }).addTo(map);

  map.panTo(userLocation);
}

// ==============================
// CALCUL QIBLA
// ==============================
function calculateQiblaDirection(lat, lon) {
  const kaabaLat = (21.4225 * Math.PI) / 180;
  const kaabaLon = (39.8262 * Math.PI) / 180;

  lat = (lat * Math.PI) / 180;
  lon = (lon * Math.PI) / 180;

  const dLon = kaabaLon - lon;
  const y = Math.sin(dLon);
  const x = Math.cos(lat) * Math.tan(kaabaLat) - Math.sin(lat) * Math.cos(dLon);

  let bearing = (Math.atan2(y, x) * 180) / Math.PI;
  return (bearing + 360) % 360;
}

// ==============================
// COMPASS INIT (AVEC GESTION PERMISSION)
// ==============================
function initCompass() {
  // Vérification spécifique pour iOS (Safari)
  if (
    typeof DeviceOrientationEvent !== "undefined" &&
    typeof DeviceOrientationEvent.requestPermission === "function"
  ) {
    statusBadge.textContent = "⚠️ Touchez ↻ pour activer la boussole";
    return;
  }

  // Pour Android ou navigateurs sans gestion de permission explicite au clic
  window.addEventListener("deviceorientationabsolute", handleOrientation, true);
  window.addEventListener("deviceorientation", handleOrientation, true);
  statusBadge.textContent = "🧭 Boussole active";
}

// ==============================
// ORIENTATION & UPDATE
// ==============================
function handleOrientation(event) {
  let heading = null;
  if (event.webkitCompassHeading !== undefined) {
    heading = event.webkitCompassHeading;
  } else if (event.alpha !== null) {
    heading = 360 - event.alpha;
  }

  if (heading === null) return;

  deviceHeading = heading;
  deviceAngleEl.textContent = `${heading.toFixed(0)}°`;
  updateCompass();
}

function updateCompass() {
  if (deviceHeading === null || qiblaBearing === null) return;

  let rotation = qiblaBearing - deviceHeading;
  rotation = ((rotation + 540) % 360) - 180;

  // Interpolation pour un mouvement fluide
  lastRotation += (rotation - lastRotation) * 0.15;
  qiblaDisplay.style.transform = `rotate(${lastRotation}deg)`;

  updateStatus(Math.abs(rotation));
}

function updateStatus(diff) {
  if (diff < 3) {
    statusBadge.classList.add("aligned");
    statusBadge.innerHTML = "🕋 Vous êtes face à la Qibla";
  } else {
    statusBadge.classList.remove("aligned");
    statusBadge.innerHTML = "🧭 Ajustez votre direction";
  }
}

// ==============================
// EVENT LISTENERS & INITIALISATION
// ==============================
if (calibrateBtn) {
  calibrateBtn.addEventListener("click", async () => {
    statusBadge.innerHTML = "🔄 Recalibration…";

    // Gestion de la permission pour iOS au clic
    if (
      typeof DeviceOrientationEvent !== "undefined" &&
      typeof DeviceOrientationEvent.requestPermission === "function"
    ) {
      try {
        const permission = await DeviceOrientationEvent.requestPermission();
        if (permission === "granted") {
          window.addEventListener("deviceorientation", handleOrientation, true);
          statusBadge.innerHTML = "🧭 Boussole prête";
        } else {
          statusBadge.innerHTML = "❌ Permission refusée";
        }
      } catch (error) {
        console.error(error);
        statusBadge.innerHTML = "❌ Erreur boussole";
      }
    } else {
      // Android ou PC : Simple reset visuel
      lastRotation = 0;
      setTimeout(() => {
        statusBadge.innerHTML = "🧭 Boussole prête";
      }, 1000);
    }
  });
}

document.addEventListener("DOMContentLoaded", getUserLocation);
