// ------------------------------
// STORAGE HELPERS
// ------------------------------
function saveLocation(lat, lon) {
  localStorage.setItem("lastLat", lat);
  localStorage.setItem("lastLon", lon);
}

function saveUnits(unit) {
  localStorage.setItem("units", unit);
}

function restorePreferences(unitBtnsRef) {
  const savedUnits = localStorage.getItem("units");

  if (savedUnits) {
    units = savedUnits;
    unitBtnsRef.forEach(btn => {
      btn.classList.toggle("active", btn.dataset.unit === units);
    });
  }
}
