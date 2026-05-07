async function getWeather({ city }) {
  return {
    city,
    temperature: "32°C",
    condition: "Sunny",
    humidity: "45%",
    windSpeed: "12 km/h"
  };
}

export default getWeather;