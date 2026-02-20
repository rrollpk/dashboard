
/* WEATHER AND TIME */

today = new Date();
options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
document.querySelector('.weather-hour').textContent = today.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

scheduleDate.textContent = today.toLocaleDateString('en-US', options)

async function loadWeather() {
  // Añade hourly o daily para pronóstico
  const url = 'https://api.open-meteo.com/v1/forecast?latitude=50.8514&longitude=5.6909&current_weather=true&hourly=precipitation_probability,precipitation&daily=precipitation_sum,precipitation_probability_max&timezone=auto';
  
  try {
    const res = await fetch(url);
    const data = await res.json();
    
    // Temperatura actual
    const temp = data.current_weather.temperature;
    document.querySelector('.weather-temp').textContent = `${temp}°C`;
    
    // Probabilidad de lluvia hoy
    const rainProbToday = data.daily.precipitation_probability_max[0];
    const rainAmount = data.daily.precipitation_sum[0];
    
    let rainInfo = '';
    if (rainProbToday > 70) {
      rainInfo = `🌧️ ${rainProbToday}%`;
    } else if (rainProbToday > 30) {
      rainInfo = `🌦️ ${rainProbToday}%`;
    } else {
      rainInfo = `☀️ ${rainProbToday}%`;
    }
    
    document.querySelector('.weather-description').textContent = rainInfo;
    
  } catch (error) {
    console.error('Weather error:', error);
  }
}

loadWeather();
setInterval(loadWeather, 600000);


/* LOGS */

