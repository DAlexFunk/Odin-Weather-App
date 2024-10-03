import "./styles.css";

const iconsInitial = require.context("./icons", false, /\.svg/);
const iconsArray = iconsInitial.keys().map(iconsInitial);
const icons = {};
for (let i = 0; i < iconsArray.length; i++) {
  let name = iconsInitial.keys()[i].replace("./", "");
  name = name.replace(".svg", "");
  icons[name] = iconsArray[i];
}

async function getWeatherData(location) {
  const data = await fetch(
    `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}?key=7UNG542XK8LP2FC7GLU6QP264&iconSet=icons2`
  );
  const JSONdata = await data.json();
  return JSONdata;
}

const title = document.querySelector("h1");
const search = document.querySelector("input");
const searchButton = document.querySelector("button");

searchButton.addEventListener("click", () => {
  const searchTerm = search.value;
  search.value = "";
  getWeatherData(searchTerm).then((data) => {
    title.textContent = data.description;
    document.querySelector("img").src = icons[data.currentConditions.icon];
  });
});
