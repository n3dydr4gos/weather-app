const iconMap = {
  0: '☀️',   1: '🌤️',   2: '⛅',   3: '☁️',
  45: '🌫️',  48: '🌫️',  51: '🌦️',  53: '🌦️',
  55: '🌧️',  56: '🌧️',  57: '🌧️',  61: '🌧️',
  63: '🌧️',  65: '🌧️',  66: '🌨️',  67: '🌨️',
  71: '🌨️',  73: '🌨️',  75: '❄️',   77: '❄️',
  80: '🌧️',  81: '🌧️',  82: '🌧️',  85: '❄️',
  86: '❄️',  95: '⛈️',  96: '⛈️',  99: '⛈️',
};

function getWeatherIcon(code) {
  return iconMap[code] || '❓';
}

async function fetchWeatherData() {
  const url = 'https://api.open-meteo.com/v1/forecast?latitude=45.0705&longitude=7.6868&hourly=temperature_2m,weathercode&timezone=Europe/Rome';

  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch weather data: ' + res.status);
  const data = await res.json();
  return data.hourly;
}

function showCurrentTemperature(temp) {
  const tempEl = document.getElementById('currentTemp');
  if (tempEl) tempEl.textContent = `${temp.toFixed(1)}°C`;
}

function showWeatherIcon(code) {
  const iconEl = document.getElementById('weatherIcon');
  if (iconEl) iconEl.textContent = getWeatherIcon(code);
}

function drawHourlyChart(times, temps) {
  // Prendi solo le prossime 24 ore
  const labels = times.slice(0, 24).map(t => t.slice(11, 16)); // estrae solo "HH:MM"
  const dataTemps = temps.slice(0, 24);

  const ctx = document.getElementById('tempChart').getContext('2d');

  // Se il grafico esiste già, distruggilo (per ricrearlo)
  if(window.tempChartInstance) {
    window.tempChartInstance.destroy();
  }

  window.tempChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Temperature (°C)',
        data: dataTemps,
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.3,
        pointRadius: 3,
      }]
    },
    options: {
      scales: {
        x: {
          title: { display: true, text: 'Time (hours)' }
        },
        y: {
          title: { display: true, text: 'Temperature (°C)' }
        }
      },
      responsive: true,
      maintainAspectRatio: false,
    }
  });
}

async function main() {
  try {
    const hourly = await fetchWeatherData();

    // Ora corrente stringa
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const currentTimeStr = `${year}-${month}-${day}T${hour}:00`;

    // Trova indice ora corrente
    const idx = hourly.time.indexOf(currentTimeStr);
    if (idx === -1) throw new Error('Current hour data not found');

    // Temperatura e codice meteo ora corrente
    const currentTemp = hourly.temperature_2m[idx];
    const currentWeatherCode = hourly.weathercode[idx];

    showCurrentTemperature(currentTemp);
    showWeatherIcon(currentWeatherCode);

    // Prepara dati per il grafico dalle prossime 24 ore (da ora in avanti)
    const next24Times = hourly.time.slice(idx, idx + 24);
    const next24Temps = hourly.temperature_2m.slice(idx, idx + 24);

    drawHourlyChart(next24Times, next24Temps);

  } catch (e) {
    console.error(e);
    alert('Error fetching weather data.');
  }
}

window.onload = main;
