require('dotenv').config();        
const https = require('https');
const { URL } = require('url');
const config = require('./config');

const [,, city] = process.argv;
if (!city) {
  console.error('Usage: node index.js <CityName>');
  process.exit(1);
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { timeout: config.REQUEST_TIMEOUT }, (res) => {
      let data = '';
      res.setEncoding('utf8');
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (err) {
          reject(new Error('Invalid JSON: ' + err.message));
        }
      });
    });
    req.on('error', err => reject(err));
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timed out'));
    });
  });
}

async function getWeatherForCity(cityName) {
  try {
    const geoUrl = new URL(config.GEOCODING_URL);
    geoUrl.searchParams.set('name', cityName);
    geoUrl.searchParams.set('count', '1');   
    geoUrl.searchParams.set('language', 'en');
    const geoData = await fetchJson(geoUrl);
    if (!geoData.results || geoData.results.length === 0) {
      console.error(`Не найден город "${cityName}".`);
      process.exit(1);
    }
    const { latitude, longitude, name, country, timezone } = geoData.results[0];
    
    const fcUrl = new URL(config.FORECAST_URL);
    fcUrl.searchParams.set('latitude', latitude);
    fcUrl.searchParams.set('longitude', longitude);
    fcUrl.searchParams.set('current_weather', 'true');
    fcUrl.searchParams.set('timezone', config.TIMEZONE === 'auto' ? timezone : config.TIMEZONE);

    const fcData = await fetchJson(fcUrl);
    if (!fcData.current_weather) {
      console.error('Не удалось получить текущую погоду.');
      process.exit(1);
    }

    const w = fcData.current_weather;
    console.log(`Погода в ${name}, ${country}:`);
    console.log(`  Время:               ${w.time}`);
    console.log(`  Температура:         ${w.temperature}°C`);
    console.log(`  Скорость ветра:      ${w.windspeed} км/ч`);
    console.log(`  Направление ветра:   ${w.winddirection}°`);
    console.log(`  Облачность:          ${w.cloudcover ?? '—'}%`);
    console.log(`  Индекс УФ:           ${w.uv_index ?? '—'}`);
  } catch (err) {
    console.error('Ошибка:', err.message);
    process.exit(1);
  }
}

getWeatherForCity(city);
