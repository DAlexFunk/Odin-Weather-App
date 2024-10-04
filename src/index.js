import "./styles.css";
const { format, parseISO, parse } = require("date-fns");

const iconsInitial = require.context("./icons", false, /\.svg/);
const iconsArray = iconsInitial.keys().map(iconsInitial);
const icons = {};
for (let i = 0; i < iconsArray.length; i++) {
  let name = iconsInitial.keys()[i].replace("./", "");
  name = name.replace(".svg", "");
  icons[name] = iconsArray[i];
}

async function getWeatherData(location) {
  try {
    const data = await fetch(
      `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}?key=7UNG542XK8LP2FC7GLU6QP264&iconSet=icons2`
    );
    const JSONdata = await data.json();
    return JSONdata;
  } catch (error) {
    console.error(error);
  }
}

function formatDate(date, length) {
  return length === "long"
    ? format(parseISO(date), "EEEE, MMMM do, y")
    : format(parseISO(date), "E, MMM do");
}

function populateCurrentConditions(data) {
  const today = data.currentConditions;
  location.textContent = data.resolvedAddress;
  currentDate.textContent = formatDate(data.days[0].datetime, "long");
  currentTemp.textContent = Math.round(today.temp);
  feelsLikeTemp.textContent = Math.round(today.feelslike);
  precip.textContent = today.precipprob;
  currentHighTemp.textContent = Math.round(data.days[0].tempmax);
  currentLowTemp.textContent = Math.round(data.days[0].tempmin);
  uvIndex.textContent = today.uvindex;
  humidity.textContent = Math.round(today.humidity);
  description.textContent = data.description;
  conditionImg.src = icons[today.icon];
}

function populateWeeklyForecast(data) {
  const weekData = data.days.slice(1, 8);
  for (let i = 0; i < days.length; i++) {
    const children = days[i].getElementsByTagName("*");
    children.date.textContent = formatDate(weekData[i].datetime, "short");
    children.high.textContent = Math.round(weekData[i].tempmax);
    children.low.textContent = Math.round(weekData[i].tempmin);
    children[4].src = icons[weekData[i].icon];
  }
}

function populateHourlyData(dailyData) {
  const max = dailyData.tempmax;
  const min = dailyData.tempmin;
  const hourData = dailyData.hours;

  for (let i = 0; i < 24; i++) {
    const percent = ((hourData[i].temp - min) / (max - min)) * 100;
    markers[i].style["bottom"] = `${percent}%`;
    markers[i].textContent = `${Math.round(hourData[i].temp)}°`;
  }
}

function populatePage(data) {
  if (!data) {
    document.querySelector("dialog#error").showModal();
    return;
  }
  populateCurrentConditions(data);
  populateWeeklyForecast(data);
  populateHourlyData(data.days[0]);

  localStorage.setItem("data", JSON.stringify(data));
}

// Header
const searchButton = document.querySelector("button#submitButton");
const searchInput = document.querySelector("input#locationSearch");

// Current Conditions
const currentDate = document.querySelector("div#content p#date");
const location = document.querySelector("h3#location");
const currentTemp = document.querySelector("h2#temp span");
const feelsLikeTemp = document.querySelector("span#feelsLike");
const precip = document.querySelector("span#precip");
const currentHighTemp = document.querySelector("span#highTemp");
const uvIndex = document.querySelector("span#uvIndex");
const currentLowTemp = document.querySelector("span#lowTemp");
const humidity = document.querySelector("span#humidity");
const description = document.querySelector("p#description");
const conditionImg = document.querySelector("h2#temp img");

// Weekly Forecast
const days = document.querySelectorAll("div.day");

// Hourly Forecast
const markers = document.querySelectorAll("div.marker");

searchButton.addEventListener("click", () => {
  const searchTerm = searchInput.value;
  searchInput.value = "";
  getWeatherData(searchTerm).then(populatePage);
});

document
  .querySelector("dialog#error button")
  .addEventListener("click", () =>
    document.querySelector("dialog#error").close()
  );

addEventListener("load", () => {
  const data = localStorage.getItem("data");
  if (data) {
    populatePage(JSON.parse(localStorage.getItem("data")));
  }
});
