//API Key
import config from "./config.js";
const apiKey = config.apiKey;

const searchForm = document.querySelector("#search-form");
const cityInput = document.querySelector("#city-input");
const weatherInfoContainer = document.querySelector("#weather-info-container");

//loadContentOnLocalStorage
document.addEventListener("DOMContentLoaded", () => {
  const lastCity = localStorage.getItem("lastSearch");
  if (lastCity) {
    getWeather(lastCity);
  }
});

//Weather forecast
async function getForecast(city) {
  const forecastApiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric&lang=th`;

  try {
    const response = await fetch(forecastApiUrl);
    if (!response.ok) {
      throw new Error("ไม่สามารถดึงข้อมูลพยากรณ์ได้");
    }
    const forecastData = await response.json();

    processAndDisplayForecast(forecastData);
  } catch (error) {
    console.error("เกิดข้อผิดพลาดกับ Forecast:", error);
  }
}

//processAndDisplayForecast
function processAndDisplayForecast(forecastData) {
  const dailyForecasts = forecastData.list.filter((item) =>
    item.dt_txt.includes("12:00:00")
  );

  const forecastContainer = document.querySelector("#forecast-container");
  forecastContainer.innerHTML = "";

  dailyForecasts.forEach((day) => {
    const { main, weather, dt_txt } = day;

    const date = new Date(dt_txt);
    const dayOfWeek = date.toLocaleDateString("th-TH", { weekday: "short" });

    const forecastCardHtml = `
            <div class="forecast-card">
                <p>${dayOfWeek}</p>
                <img src="https://openweathermap.org/img/wn/${
                  weather[0].icon
                }.png" alt="${weather[0].description}">
                <p class="temp">${main.temp.toFixed(0)}°C</p>
            </div>
        `;

    forecastContainer.innerHTML += forecastCardHtml;
  });
}

//Event Submit
searchForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const cityName = cityInput.value.trim();

  if (cityName) {
    getWeather(cityName);
  } else {
    alert("กรุณาป้อนชื่อเมือง");
  }
});

async function getWeather(city) {
  weatherInfoContainer.innerHTML = `<p>กำลังโหลดข้อมูล...</p>`;
  const forecastContainer = document.querySelector("#forecast-container");
  if (forecastContainer) {
    forecastContainer.innerHTML = "";
  }

  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=th`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric&lang=th`;

  try {
    const [currentWeatherResponse, forecastResponse] = await Promise.all([
      fetch(apiUrl),
      fetch(forecastUrl),
    ]);

    if (!currentWeatherResponse.ok) throw new Error("ไม่พบข้อมูลเมืองนี้");
    if (!forecastResponse.ok) throw new Error("ไม่สามารถดึงข้อมูลพยากรณ์ได้");

    const currentWeatherData = await currentWeatherResponse.json();
    const forecastData = await forecastResponse.json();

    displayWeather(currentWeatherData);
    processAndDisplayForecast(forecastData);
  } catch (error) {
    weatherInfoContainer.innerHTML = `<p class="error">${error.message}</p>`;
  }
}

//Weater display
function displayWeather(data) {
  const { name, main, weather } = data;
  const { temp, humidity } = main;
  const { description, icon } = weather[0];

  localStorage.setItem("lastSearch", name);

  const targetElment = document.body;

  targetElment.className = ""; //Remove body class
  targetElment.classList.add("default-styles");

  const timeOfday = icon.endsWith("d") ? "day" : "night";
  let weatherCondition = "cloudy";

  if (icon.includes("01")) {
    weatherCondition = "clear";
  } else if (
    icon.includes("09") ||
    icon.includes("10") ||
    icon.includes("11")
  ) {
    weatherCondition = "rain";
  }

  const themeClass = `theme-${timeOfday}-${weatherCondition}`;
  targetElment.classList.add(themeClass);

  const weatherHtml = `
        <h2 class="text-2xl font-bold">${name}</h2>
        <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}">
        <p class="temp">${temp.toFixed(1)}°C</p>
        <p>${description}</p>
        <p>ความชื้น: ${humidity}%</p>
    `;
  weatherInfoContainer.innerHTML = weatherHtml;
}
