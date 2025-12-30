/**
 * RAMADAN APP - LOGIC
 * Support: GPS + Nominatim (Ville, Pays) + AlAdhan API
 */

const listContainer = document.getElementById("monthly-events-list");

async function initRamadanApp() {
  try {
    // 1. Détection de la position réelle (GPS)
    const locationData = await new Promise((res) => {
      navigator.geolocation.getCurrentPosition(
        async (p) => {
          const lat = p.coords.latitude;
          const lon = p.coords.longitude;

          let cityName = "Ma Position";

          // Récupération du nom de la ville via Nominatim (Logique Universelle)
          try {
            const geoRes = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`
            );
            const geoData = await geoRes.json();
            const a = geoData.address;

            // Sélection de la ville
            let city =
              a.city ||
              a.town ||
              a.village ||
              a.municipality ||
              a.county ||
              a.state ||
              "";

            // Correction spécifique pour les noms administratifs (ex: Abuja)
            if (
              city.toLowerCase().includes("municipal") ||
              city.toLowerCase().includes("capital territory")
            ) {
              city = a.city_district || a.suburb || a.town || "Abuja";
            }

            // Nettoyage des prépositions
            city = city.replace(/^(du |de |de la |des |the )/gi, "").trim();
            const country = a.country || "";

            // Format Final : Ville, Pays
            if (country && city.toLowerCase() !== country.toLowerCase()) {
              cityName = `${city}, ${country}`;
            } else {
              cityName = city || country || "Ma Position";
            }
          } catch (e) {
            console.error("Erreur de nom de ville, utilisation fallback.");
          }

          res({ lat, lon, city: cityName });
        },
        () => res({ lat: 48.8566, lon: 2.3522, city: "Paris, France" }), // Fallback si GPS refusé
        { timeout: 5000 }
      );
    });

    // 2. Récupération des données du mois actuel via AlAdhan
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    const response = await fetch(
      `https://api.aladhan.com/v1/calendar/${year}/${month}?latitude=${locationData.lat}&longitude=${locationData.lon}&method=3`
    );
    const result = await response.json();

    if (result.code === 200 && result.data) {
      const firstDay = result.data[0];
      const hYear = firstDay.date.hijri.year;

      // 3. Mise à jour du Dashboard (Ville, Pays propre)
      const infoBox = document.querySelector(".info-highlight-box");
      if (infoBox) {
        infoBox.innerHTML = `
          <div class="info-item">
            <span><i class="fas fa-calendar-alt"></i> Calendrier</span>
            <b id="hijri-ramadan-year">${hYear}H</b>
          </div>
          <div class="info-item">
            <span><i class="fas fa-map-marker-alt"></i> Localisation</span>
            <b id="location-display">${locationData.city}</b>
          </div>
        `;
      }

      // 4. Génération de la liste
      renderList(result.data);
    }
  } catch (error) {
    console.error("Erreur d'initialisation:", error);
    if (listContainer) {
      listContainer.innerHTML = `<p style="text-align:center; padding:20px; color:white;">Erreur de chargement des horaires.</p>`;
    }
  }
}

function renderList(days) {
  const now = new Date();
  const todayNum = now.getDate();
  const currentMonth = now.getMonth() + 1;
  let html = "";

  days.forEach((day, index) => {
    const d = parseInt(day.date.gregorian.day, 10);
    const m = parseInt(day.date.gregorian.month.number, 10);

    const isToday = d === todayNum && m === currentMonth;

    // Nettoyage des horaires (format HH:MM)
    const imsak = day.timings.Imsak.split(" ")[0];
    const iftar = day.timings.Maghrib.split(" ")[0];

    const ramadanDay = index + 1;
    const realDate = `${d}-${m}`;

    html += `
      <div class="ramadan-card ${isToday ? "active" : ""}" ${
      isToday ? 'id="active-day"' : ""
    }>
        <div class="card-date">
          <span class="h-day">${ramadanDay}</span>
          <div class="g-day-info">
            <span class="g-day">Jour</span>
            <span class="g-date">${realDate}</span>
            ${isToday ? '<span class="active-badge">AUJOURD\'HUI</span>' : ""}
          </div>
        </div>

        <div class="card-times">
          <div class="time-item">
            <span class="time-label imsak-color">IMSAK</span>
            <span class="time-value imsak-color">${imsak}</span>
          </div>
          <div class="time-item">
            <span class="time-label iftar-color">IFTAR</span>
            <span class="time-value iftar-color">${iftar}</span>
          </div>
        </div>
      </div>
    `;
  });

  listContainer.innerHTML = html;

  // Scroll fluide vers le jour actuel
  setTimeout(() => {
    const activeElement = document.getElementById("active-day");
    if (activeElement) {
      activeElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, 500);
}

document.addEventListener("DOMContentLoaded", initRamadanApp);
