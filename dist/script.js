const API_KEY = "0a9627b95ac1044e51275bafdd2c910e";
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

document.addEventListener("DOMContentLoaded", () =>{
    const searchButton = document.getElementById('searchButton');
    const locationButton = document.getElementById('locationButton');
    const cityInput = document.getElementById('cityInput');
    const currentWeatherRightDiv = document.getElementById('currentWeather-right');
    const currentWeatherLeftDiv = document.getElementById('currentWeather-left');

    const forecastContainer = document.getElementById('forecastContainer');

    // Fetch current weather data for a city
    async function fetchWeather(city) {
        const url = `${BASE_URL}/weather?q=${city}&units=metric&appid=${API_KEY}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("City not found.");
        }
        return response.json();
    }

    // Fetch 5-day weather forecast for a city
    async function fetchForecast(city) {
        const url = `${BASE_URL}/forecast?q=${city}&units=metric&appid=${API_KEY}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("City not found.");
        }
        return response.json();
    }

    // Update current weather data
    function updateCurrentWeather(data) {
        const weatherDescription = data.weather[0].description;        
        const iconCode = data.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
        
        currentWeatherRightDiv.innerHTML = `
                <div class = "flex-col items-center mt-4">
                    <h2 class="text-2xl font-bold mb-1">${data.name}, ${data.sys.country}</h2>
                    <p class="text-lg mb-1">Temperature: <strong>${data.main.temp}°C</strong></p>
                    <p class="text-lg mb-1">Wind: <strong>${data.wind.speed} m/s</strong></p>
                    <p class="text-lg mb-1">Humidity: <strong>${data.main.humidity}%</strong></p>
                </div>                
            </div>
        `;

        currentWeatherLeftDiv.innerHTML=`
            <div class="mt-4 md:mt-0 flex flex-col items-center">
                <img src="${iconUrl}" alt="Weather Icon" class="w-30 h-30">
                <p class="text-lg capitalize mt-1">${weatherDescription}</p>
            </div>
        `;
    }

    // Update 5-day forecast data
    function updateForecast(data) {
        const forecastHTML = data.list
            .filter((_, index) => index % 8 === 0)
            .map(forecast => {
                const date = new Date(forecast.dt_txt).toLocaleDateString();
                const iconCode = forecast.weather[0].icon;
                const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

                return `
                    <li class="bg-gray-400 text-white rounded-lg p-7 text-center shadow">
                        <h3 class="text-lg font-bold">${date}</h3>
                        <img src="${iconUrl}" alt="Weather Icon" class="w-12 h-12 mx-auto my-2">
                        <p>Temp: ${forecast.main.temp}°C</p>
                        <p>Wind: ${forecast.wind.speed} M/S</p>
                        <p>Humidity: ${forecast.main.humidity}%</p>
                    </li>
                `;
            })
            .join('');
        forecastContainer.innerHTML = forecastHTML;
    }

    // Handle city search
    searchButton.addEventListener('click', async () => {
        const city = cityInput.value.trim();
        if (!city) return alert('Please enter a city name.');

        try {
            const weatherData = await fetchWeather(city);
            const forecastData = await fetchForecast(city);

            if (weatherData.cod === 200) {
                updateCurrentWeather(weatherData);
                updateForecast(forecastData);
            } else {
                alert('City not found!');
            }
        } catch (error) {
            console.error(error);
            alert('Error fetching weather data!');
        }
    });

    // Handle location-based search
    locationButton.addEventListener('click', () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser.");
            return;
        }
        navigator.geolocation.getCurrentPosition(async position => {
            const { latitude, longitude } = position.coords;
            const url = `${BASE_URL}/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`;
            const forecastUrl = `${BASE_URL}/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`
            try {
                const response = await fetch(url);
                const weatherData = await response.json();
                updateCurrentWeather(weatherData);
    
                const forecastResponse = await fetch(forecastUrl);
                const forecastData = await forecastResponse.json();
                updateForecast(forecastData);
            } catch (error) {
                alert("Error fetching weather data.");
            }
        });
    });
});