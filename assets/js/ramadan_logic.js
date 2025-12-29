/**
 * RAMADAN APP - LOGIC
 * Support: GPS + AlAdhan API + Premium Wide UI
 */

const listContainer = document.getElementById("monthly-events-list");

async function initRamadanApp() {
  try {
    // 1. Détection de la position réelle (GPS)
    const coords = await new Promise((res) => {
      navigator.geolocation.getCurrentPosition(
        (p) => res({ lat: p.coords.latitude, lon: p.coords.longitude }),
        () => res({ lat: 48.8566, lon: 2.3522 }), // Fallback Paris
        { timeout: 5000 }
      );
    });

    // 2. Récupération des données du mois actuel
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    const response = await fetch(
      `https://api.aladhan.com/v1/calendar/${year}/${month}?latitude=${coords.lat}&longitude=${coords.lon}&method=3`
    );
    const result = await response.json();

    if (result.code === 200 && result.data) {
      const firstDay = result.data[0];
      const city = firstDay.meta.timezone.split("/").pop().replace("_", " ");
      const hYear = firstDay.date.hijri.year;

      // 3. Mise à jour du Dashboard (Organisation optimisée des titres)
      const infoBox = document.querySelector(".info-highlight-box");
      if (infoBox) {
        infoBox.innerHTML = `
          <div class="info-item">
            <span><i class="fas fa-calendar-alt"></i> Calendrier</span>
            <b id="hijri-ramadan-year">${hYear}H</b>
          </div>
          <div class="info-item">
            <span><i class="fas fa-map-marker-alt"></i> Localisation</span>
            <b id="location-display">${city}</b>
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

  // Scroll fluide vers aujourd'hui
  setTimeout(() => {
    const activeElement = document.getElementById("active-day");
    if (activeElement) {
      activeElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, 500);
}

document.addEventListener("DOMContentLoaded", initRamadanApp);
