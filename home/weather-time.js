
/* WEATHER AND TIME */

const weatherHourEl = document.querySelector('.weather-hour');
const weatherTempEl = document.querySelector('.weather-temp');
const weatherDescriptionEl = document.querySelector('.weather-description');
const scheduleDateEl = document.getElementById('scheduleDate');

const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

function updateClockAndDate() {
  const now = new Date();

  if (weatherHourEl) {
    const weatherDate = now
      .toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      })
      .replace(',', '');
    const weatherTime = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    weatherHourEl.textContent = `${weatherDate} · ${weatherTime}`;
  }

  if (scheduleDateEl) {
    scheduleDateEl.textContent = now.toLocaleDateString('en-US', dateOptions);
  }
}

function weatherCodeLabel(code) {
  if (code === 0) return 'Clear sky';
  if (code >= 1 && code <= 3) return 'Partly cloudy';
  if (code === 45 || code === 48) return 'Fog';
  if (code >= 51 && code <= 57) return 'Drizzle';
  if (code >= 61 && code <= 67) return 'Rain';
  if (code >= 71 && code <= 77) return 'Snow';
  if (code >= 80 && code <= 82) return 'Rain showers';
  if (code >= 95 && code <= 99) return 'Thunderstorm';
  return 'Weather';
}

async function loadWeather() {
  // Añade hourly o daily para pronóstico
  const url = 'https://api.open-meteo.com/v1/forecast?latitude=50.8514&longitude=5.6909&current_weather=true&hourly=precipitation_probability,precipitation&daily=precipitation_sum,precipitation_probability_max&timezone=auto';
  
  try {
    const res = await fetch(url);
    const data = await res.json();
    
    // Temperatura actual
    const temp = data.current_weather.temperature;
    const weatherCode = data.current_weather.weathercode;
    if (weatherTempEl) weatherTempEl.textContent = `${Math.round(temp)}°C`;
    
    // Probabilidad de lluvia hoy
    const rainProbToday = data.daily.precipitation_probability_max[0];
    const rainAmount = data.daily.precipitation_sum[0];
    
    let rainIcon = '☀️';
    if (rainProbToday > 70) {
      rainIcon = '🌧️';
    } else if (rainProbToday > 30) {
      rainIcon = '🌦️';
    }

    const condition = weatherCodeLabel(weatherCode);
    const rainText = `${Math.round(rainProbToday)}% rain · ${Number(rainAmount || 0).toFixed(1)} mm`;
    if (weatherDescriptionEl) {
      weatherDescriptionEl.textContent = `${rainIcon} ${condition} · ${rainText}`;
    }

    updateClockAndDate();
    
  } catch (error) {
    console.error('Weather error:', error);
  }
}

updateClockAndDate();
loadWeather();
setInterval(loadWeather, 600000);
setInterval(updateClockAndDate, 30000);


/* LOGS */

