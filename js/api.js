// ------------------------------
// CONFIG
// ------------------------------
const API_KEY = "445f6246164507d70fc200914b357314";
let units = "metric";

// Expose last location for reuse
let lastLat = null;
let lastLon = null;


// ------------------------------
// LEAFLET MAP SETUP
// ------------------------------
const map = L.map("map", {
  zoomControl: true,
  scrollWheelZoom: true,
  doubleClickZoom: true,
  touchZoom: true,
  dragging: true,
  tap: true
}).setView([20.5937, 78.9629], 5);

map.zoomControl.setPosition("topright");

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
}).addTo(map);

let marker = null;

function updateMap(lat, lon) {
  if (marker) map.removeLayer(marker);

  marker = L.marker([lat, lon]).addTo(map);
  map.flyTo([lat, lon], 10, { animate: true, duration: 1.5 });
}


// ------------------------------
// FETCH WEATHER BY CITY
// ------------------------------
async function fetchWeather(city) {
  showMessage("Loading...");

  try {
    const geoRes = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`
    );
    const geoData = await geoRes.json();

    if (!geoData.length) throw new Error("City not found");

    const { lat, lon, name, country } = geoData[0];

    fetchWeatherByCoords(lat, lon, name, country);

  } catch (err) {
    showMessage(err.message, true);
    result.hidden = true;
  }
}


// ------------------------------
// FETCH WEATHER BY COORDS
// ------------------------------
async function fetchWeatherByCoords(lat, lon, customName = null, customCountry = null) {
  showMessage("Loading...");
  lastLat = lat;
  lastLon = lon;

  saveLocation(lat, lon);

  try {
    const weatherRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${API_KEY}`
    );
    const weatherData = await weatherRes.json();

    let name = customName;
    let country = customCountry;

    if (!name) {
      const revRes = await fetch(
        `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`
      );
      const rev = await revRes.json();
      name = rev[0]?.name || "Unknown";
      country = rev[0]?.country || "";
    }

    updateMap(lat, lon);
    renderWeather({ ...weatherData, name, sys: { country } });
    fetchForecast(lat, lon);
    showMessage("");

  } catch {
    showMessage("Error fetching weather", true);
  }
}


// ------------------------------
// FORECAST
// ------------------------------
async function fetchForecast(lat, lon) {
  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${units}&appid=${API_KEY}`
  );
  const data = await res.json();
  renderForecast(data.list);
}

map.on("click", e => {
  fetchWeatherByCoords(e.latlng.lat, e.latlng.lng);
});
