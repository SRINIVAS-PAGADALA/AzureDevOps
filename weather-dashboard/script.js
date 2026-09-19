// Sample weather data keeps this dashboard working without an external API.
const weatherData = {
  seattle: {
    city: "Seattle, WA",
    temperature: 58,
    condition: "Partly cloudy",
    humidity: 72,
    wind: 8,
    icon: "&#9925;",
    forecast: [
      ["Today", "Partly cloudy", 58, 48, "&#9925;"],
      ["Tue", "Light rain", 55, 46, "&#9730;"],
      ["Wed", "Cloudy", 57, 45, "&#9729;"],
      ["Thu", "Sunny", 62, 47, "&#9728;"],
      ["Fri", "Sunny", 65, 49, "&#9728;"]
    ]
  },
  austin: {
    city: "Austin, TX",
    temperature: 82,
    condition: "Sunny",
    humidity: 44,
    wind: 12,
    icon: "&#9728;",
    forecast: [
      ["Today", "Sunny", 82, 61, "&#9728;"],
      ["Tue", "Sunny", 84, 63, "&#9728;"],
      ["Wed", "Partly cloudy", 80, 60, "&#9925;"],
      ["Thu", "Sunny", 86, 64, "&#9728;"],
      ["Fri", "Clear", 88, 66, "&#9728;"]
    ]
  },
  chicago: {
    city: "Chicago, IL",
    temperature: 49,
    condition: "Windy",
    humidity: 61,
    wind: 19,
    icon: "&#127788;",
    forecast: [
      ["Today", "Windy", 49, 39, "&#127788;"],
      ["Tue", "Cloudy", 51, 40, "&#9729;"],
      ["Wed", "Light rain", 47, 38, "&#9730;"],
      ["Thu", "Cloudy", 54, 42, "&#9729;"],
      ["Fri", "Sunny", 59, 44, "&#9728;"]
    ]
  },
  denver: {
    city: "Denver, CO",
    temperature: 61,
    condition: "Clear skies",
    humidity: 31,
    wind: 7,
    icon: "&#9728;",
    forecast: [
      ["Today", "Clear skies", 61, 38, "&#9728;"],
      ["Tue", "Sunny", 64, 40, "&#9728;"],
      ["Wed", "Cloudy", 58, 36, "&#9729;"],
      ["Thu", "Sunny", 67, 42, "&#9728;"],
      ["Fri", "Sunny", 70, 45, "&#9728;"]
    ]
  },
  newyork: {
    city: "New York, NY",
    temperature: 67,
    condition: "Light rain",
    humidity: 68,
    wind: 10,
    icon: "&#9730;",
    forecast: [
      ["Today", "Light rain", 67, 55, "&#9730;"],
      ["Tue", "Cloudy", 69, 53, "&#9729;"],
      ["Wed", "Sunny", 72, 56, "&#9728;"],
      ["Thu", "Partly cloudy", 70, 54, "&#9925;"],
      ["Fri", "Sunny", 75, 57, "&#9728;"]
    ]
  }
};

const searchForm = document.querySelector("#search-form");
const citySearch = document.querySelector("#city-search");
const searchMessage = document.querySelector("#search-message");
const forecastList = document.querySelector("#forecast-list");

// Convert the user's input into the same format used by the data keys.
function getCityKey(cityName) {
  return cityName.trim().toLowerCase().replace(/[^a-z]/g, "");
}

// Put one city's data into the current weather area and forecast cards.
function displayWeather(cityKey) {
  const weather = weatherData[cityKey];

  document.querySelector("#current-weather-heading").textContent = weather.city;
  document.querySelector("#current-temperature").innerHTML = `${weather.temperature}&deg;`;
  document.querySelector("#weather-condition").textContent = weather.condition;
  document.querySelector("#humidity").textContent = `${weather.humidity}%`;
  document.querySelector("#wind-speed").textContent = `${weather.wind} mph`;
  document.querySelector("#weather-icon").innerHTML = weather.icon;

  forecastList.innerHTML = weather.forecast.map((day) => `
    <article class="forecast-card">
      <p class="forecast-day">${day[0]}</p>
      <div class="forecast-icon" aria-hidden="true">${day[4]}</div>
      <p class="forecast-condition">${day[1]}</p>
      <div class="forecast-temperatures">
        <span>${day[2]}&deg;</span>
        <span>${day[3]}&deg;</span>
      </div>
    </article>
  `).join("");
}

// Search only the local sample data and show a helpful message for unknown cities.
searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const cityKey = getCityKey(citySearch.value);

  if (weatherData[cityKey]) {
    displayWeather(cityKey);
    searchMessage.textContent = `Showing sample weather for ${weatherData[cityKey].city}.`;
    searchMessage.classList.remove("error");
  } else {
    searchMessage.textContent = "That city is not in the sample data. Try Seattle, Austin, Chicago, Denver, or New York.";
    searchMessage.classList.add("error");
  }
});

// Show Seattle when the page first opens.
displayWeather("seattle");
