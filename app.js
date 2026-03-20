const els = {
  city: document.getElementById("city"),
  refresh: document.getElementById("refresh"),
  updated: document.getElementById("updated"),
  temp: document.getElementById("temp"),
  feels: document.getElementById("feels"),
  wind: document.getElementById("wind"),
  condition: document.getElementById("condition"),
};

const CITIES = [
  { id: "stockholm", name: "Stockholm", latitude: 59.3293, longitude: 18.0686, tz: "Europe/Stockholm" },
  { id: "goteborg", name: "Göteborg", latitude: 57.7089, longitude: 11.9746, tz: "Europe/Stockholm" },
  { id: "malmo", name: "Malmö", latitude: 55.6050, longitude: 13.0038, tz: "Europe/Stockholm" },
  { id: "uppsala", name: "Uppsala", latitude: 59.8586, longitude: 17.6389, tz: "Europe/Stockholm" },
  { id: "london", name: "London", latitude: 51.5072, longitude: -0.1276, tz: "Europe/London" },
  { id: "newyork", name: "New York", latitude: 40.7128, longitude: -74.0060, tz: "America/New_York" },
  { id: "tokyo", name: "Tokyo", latitude: 35.6762, longitude: 139.6503, tz: "Asia/Tokyo" },
];

function codeToText(code) {
  const map = {
    0: "Klart",
    1: "Mest klart",
    2: "Delvis molnigt",
    3: "Mulet",
    45: "Dimma",
    48: "Rimfrost-dimma",
    51: "Lätt duggregn",
    53: "Duggregn",
    55: "Kraftigt duggregn",
    61: "Lätt regn",
    63: "Regn",
    65: "Kraftigt regn",
    71: "Lätt snö",
    73: "Snö",
    75: "Kraftig snö",
    80: "Regnskurar",
    81: "Kraftiga regnskurar",
    82: "Mycket kraftiga regnskurar",
    95: "Åska",
  };
  return map[code] ?? `Okänt väder (kod ${code})`;
}

function setLoading(isLoading) {
  els.refresh.disabled = isLoading;
  els.refresh.textContent = isLoading ? "Uppdaterar…" : "Uppdatera";
}

function saveSelectedCity(id) {
  try { localStorage.setItem("city", id); } catch {}
}

function loadSelectedCity() {
  try { return localStorage.getItem("city"); } catch { return null; }
}

function formatUpdated(timeIso, tz) {
  // Open-Meteo returns ISO time; we display it as-is, plus timezone label for clarity.
  return `Senast uppdaterad: ${timeIso} (${tz})`;
}

function setError(message) {
  els.condition.textContent = message;
  els.updated.textContent = "Senast uppdaterad: —";
  els.temp.textContent = "—";
  els.feels.textContent = "—";
  els.wind.textContent = "—";
}

async function loadWeatherForCity(city) {
  setLoading(true);
  els.condition.textContent = "Hämtar väder…";
  els.updated.textContent = "Senast uppdaterad: —";

  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${city.latitude}&longitude=${city.longitude}` +
    `&current=temperature_2m,apparent_temperature,wind_speed_10m,weather_code` +
    `&timezone=${encodeURIComponent(city.tz)}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const cur = data.current;
    els.condition.textContent = codeToText(cur.weather_code);
    els.updated.textContent = formatUpdated(cur.time, city.tz);
    els.temp.textContent = String(cur.temperature_2m);
    els.feels.textContent = String(cur.apparent_temperature);
    els.wind.textContent = String(cur.wind_speed_10m);
  } catch (err) {
    setError(`Kunde inte hämta väder. (${err.message})`);
  } finally {
    setLoading(false);
  }
}

function init() {
  // Fill selector
  els.city.innerHTML = "";
  for (const c of CITIES) {
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = c.name;
    els.city.appendChild(opt);
  }

  const saved = loadSelectedCity();
  const initial = CITIES.find(c => c.id === saved) ? saved : "stockholm";
  els.city.value = initial;

  const currentCity = () => CITIES.find(c => c.id === els.city.value) ?? CITIES[0];

  els.city.addEventListener("change", () => {
    saveSelectedCity(els.city.value);
    loadWeatherForCity(currentCity());
  });

  els.refresh.addEventListener("click", () => loadWeatherForCity(currentCity()));

  loadWeatherForCity(currentCity());
}

init();
