// ------------------------------
// DOM ELEMENTS
// ------------------------------
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const result = document.getElementById("result");
const message = document.getElementById("message");

const weatherIcon = document.getElementById("weatherIcon");
const tempEl = document.getElementById("temp");
const descEl = document.getElementById("desc");
const locationName = document.getElementById("locationName");
const feelsLike = document.getElementById("feelsLike");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");

const geoBtn = document.getElementById("geoBtn");
const unitBtns = document.querySelectorAll(".unit");

// ------------------------------
// LIVE DATE + TIME UPDATE
// ------------------------------
function updateDateTime() {
  const dt = new Date();

  const options = {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  };

  document.getElementById("dateTime").textContent =
    dt.toLocaleString("en-US", options);
}

// Update every second
setInterval(updateDateTime, 1000);
updateDateTime();


// ------------------------------
// MESSAGE HANDLER
// ------------------------------
function showMessage(msg, error = false) {
  message.style.color = error ? "#ff8b8b" : "#9aa7bf";
  message.textContent = msg;
}


// ------------------------------
// RENDER WEATHER
// ------------------------------
function renderWeather(data) {
  const w = data.weather[0];

  weatherIcon.src = `https://openweathermap.org/img/wn/${w.icon}@2x.png`;
  weatherIcon.alt = w.description;

  descEl.textContent = w.description;
  tempEl.textContent = `${Math.round(data.main.temp)}°`;
  feelsLike.textContent = `${Math.round(data.main.feels_like)}°`;
  humidity.textContent = data.main.humidity;

  // ✅ FIXED LOCATION DISPLAY
  locationName.textContent = `${data.name}${data.sys?.country ? ", " + data.sys.country : ""}`;

  wind.textContent = `${(data.wind.speed * 3.6).toFixed(1)} km/h`;

  result.hidden = false;
}



// ------------------------------
// FORECAST RENDER
// ------------------------------
function renderForecast(list) {
  const forecastEl = document.getElementById("forecast");
  const grid = document.getElementById("forecastGrid");
  grid.innerHTML = "";

  const daysMap = new Map();
  const today = new Date().toISOString().split("T")[0];

  for (const item of list) {
    const date = item.dt_txt.split(" ")[0];
    if (date === today) continue;
    if (!daysMap.has(date)) daysMap.set(date, item);
    if (daysMap.size === 6) break;
  }

  [...daysMap.values()].forEach(item => {
    const day = new Date(item.dt_txt)
      .toLocaleDateString("en-US", { weekday: "short" });

    grid.innerHTML += `
      <div class="forecast-card">
        <div class="day">${day}</div>
        <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png">
        <div class="temp">${Math.round(item.main.temp)}°</div>
      </div>
    `;
  });

  forecastEl.hidden = false;
}


// ------------------------------
// EVENTS
// ------------------------------

// ----------------------------------------------------
// SEARCH BUTTON
// ----------------------------------------------------
searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (!city) return showMessage("Enter a city name", true);
  fetchWeather(city);
  cityInput.value = "";
});

cityInput.addEventListener("keydown", e => {
  if (e.key === "Enter") searchBtn.click();
});

// ----------------------------------------------------
// GEOLOCATION
// ----------------------------------------------------
geoBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return showMessage("Geolocation not supported", true);
  }

  showMessage("Getting your location...");

  navigator.geolocation.getCurrentPosition(
    pos => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;

      // ✅ update map immediately
      updateMap(lat, lon);

      // ✅ fetch weather
      fetchWeatherByCoords(lat, lon);
    },
    err => {
      console.error(err);
      showMessage("Location access denied", true);
    },
    {
      enableHighAccuracy: true,
      timeout: 10000
    }
  );
});


// ----------------------------------------------------
// UNIT TOGGLE (°C ↔ °F) — FULLY WORKING NOW
// ----------------------------------------------------
unitBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    unitBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    units = btn.dataset.unit;
    saveUnits(units);
    if (lastLat && lastLon) fetchWeatherByCoords(lastLat, lastLon);
  });
});


// ------------------------------
// INIT
// ------------------------------
document.addEventListener("DOMContentLoaded", () => {
  restorePreferences(unitBtns);

  // ❌ Always hide weather UI on refresh
  result.hidden = true;
  document.getElementById("forecast").hidden = true;
  showMessage("");

  // ✅ Only move map to current location
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      pos => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        // ✅ map only (NO weather fetch)
        updateMap(lat, lon);
      },
      () => {
        // fallback: keep default map view
      }
    );
  }
});



