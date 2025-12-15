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
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=${units}&appid=${API_KEY}`
    );

    if (!res.ok) throw new Error("City not found");

    const data = await res.json();

    lastLat = data.coord.lat;
    lastLon = data.coord.lon;

    saveLocation(lastLat, lastLon);

    updateMap(lastLat, lastLon);
    renderWeather(data);
    fetchForecast(lastLat, lastLon);

    showMessage("");

  } catch (err) {
    console.error(err);
    showMessage(err.message, true);
    result.hidden = true;
    document.getElementById("forecast").hidden = true;
  }
}



// ------------------------------
// FETCH WEATHER BY COORDS
// ------------------------------
async function fetchWeatherByCoords(lat, lon) {
  showMessage("Loading...");
  lastLat = lat;
  lastLon = lon;

  saveLocation(lat, lon);

  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${API_KEY}`
    );

    if (!res.ok) throw new Error("Weather fetch failed");

    const data = await res.json();

    updateMap(lat, lon);
    renderWeather(data);
    fetchForecast(lat, lon);

    showMessage("");

  } catch (err) {
    console.error(err);
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
