const weatherEl = document.getElementById("weather");
const refreshBtn = document.getElementById("refresh");

// Stockholm coordinates
const lat = 59.3293;
const lon = 18.0686;

function codeToText(code) {
  // Minimal mapping (enough for demo). We can expand later.
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
    95: "Åska"
  };
  return map[code] ?? `Okänt väder (kod ${code})`;
}

async function loadWeather() {
  weatherEl.textContent = "Hämtar väder…";

  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,apparent_temperature,wind_speed_10m,weather_code` +
    `&timezone=Europe%2FStockholm`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const cur = data.current;
    const temp = cur.temperature_2m;
    const feels = cur.apparent_temperature;
    const wind = cur.wind_speed_10m;
    const code = cur.weather_code;
    const time = cur.time;

    weatherEl.innerHTML = `
      <div><strong>${codeToText(code)}</strong></div>
      <div>Temperatur: <strong>${temp}°C</strong> (känns som ${feels}°C)</div>
      <div>Vind: ${wind} m/s</div>
      <div class="small">Senast uppdaterad: ${time}</div>
    `;
  } catch (err) {
    weatherEl.textContent = `Kunde inte hämta väder. (${err.message})`;
  }
}

refreshBtn.addEventListener("click", loadWeather);
loadWeather();
