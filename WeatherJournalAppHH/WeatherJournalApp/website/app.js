

// Getting the current date
function getCurrentDate() {
  return new Date().toLocaleDateString();
}

// Constant for the weather API base URL
const weatherAPI = "https://api.openweathermap.org/data/2.5/weather?zip=";
const apiKey = "&appid=9f63f6b3a985892c512174f7619e1afc&units=imperial";
const serverAddress = "http://127.0.0.1:4000";

// Error display element
const errorDisplay = document.getElementById("errorDisplay");
if (!errorDisplay) {
  console.error("Error display element not found.");
}

// Function to load weather data based on the zip code
const loadWeather = (zipCode) => {
  return new Promise((resolve, reject) => {
    const apiUrl = `${weatherAPI}${zipCode}${apiKey}`;
    fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        if (data.cod !== 200) {
          showErrorMessage(data.message);
          reject(data.message);
        } else {
          resolve(data);
        }
      })
      .catch(err => {
        showErrorMessage("Error connecting to the API");
        reject(err);
      });
  });
};

// Function to display error messages
function showErrorMessage(message) {
  errorDisplay.innerText = message;
  errorDisplay.style.visibility = 'visible';
  clearTimeout(errorDisplay.timeout); // Clear any previous timeouts
  errorDisplay.timeout = setTimeout(() => errorDisplay.style.visibility = 'hidden', 2000);
}

// Function to process the weather data
function processWeatherData(weatherData) {
  const temperature = weatherData.main.temp;
  const city = weatherData.name;
  const description = weatherData.weather[0].description;
  
  return { temperature: Math.round(temperature), city, description };
}

// Function to prepare data for sending to the server
function prepareDataToSend(weatherInfo, userFeelings) {
  return {
    date: getCurrentDate(),
    city: weatherInfo.city,
    temperature: weatherInfo.temperature,
    description: weatherInfo.description,
    feelings: userFeelings
  };
}

// Function to send data to the server
function sendToServer(data) {
  return fetch(`${serverAddress}/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })
  .then(response => response.json())
  .catch(err => {
    console.error("Error sending data to the server: ", err);
    showErrorMessage("Failed to send data to the server");
  });
}

// Function to update the UI with saved data
function updateUI() {
  fetch(`${serverAddress}/all`)
    .then(response => response.json())
    .then(savedData => {
      if (!savedData || !savedData.date) {
        showErrorMessage("No data available");
        return;
      }
      document.getElementById("date").innerText = savedData.date;
      document.getElementById("city").innerText = savedData.city;
      document.getElementById("temperature").innerText = `${savedData.temperature}°F`;
      document.getElementById("description").innerText = savedData.description;
      document.getElementById("feelings").innerText = savedData.feelings;
    })
    .catch(err => {
      console.error("Error updating UI: ", err);
      showErrorMessage("Error updating the UI");
    });
}

// Event listener for the button click
document.getElementById("generateWeatherData").addEventListener("click", function () {
  const zipCode = document.getElementById("zipCodeInput").value;
  const feelings = document.getElementById("feelingsInput").value;

  if (!zipCode || !feelings) {
    showErrorMessage("Please enter both the ZIP code and your feelings");
    return;
  }

  loadWeather(zipCode)
    .then(weatherData => {
      const weatherInfo = processWeatherData(weatherData);
      const dataToSend = prepareDataToSend(weatherInfo, feelings);
      sendToServer(dataToSend)
        .then(() => updateUI());
    })
    .catch(err => {
      console.error("Error loading weather data: ", err);
      showErrorMessage("Error loading weather data");
    });
});
