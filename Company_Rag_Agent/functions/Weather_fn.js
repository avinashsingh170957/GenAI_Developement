async function weather_fn(params) 
{
  //  console.log(`params`,params);
    
    const {city,country} = params;
    const weather_details = [
  {
    city: "Ahmedabad",
    country: "India",
    temperature: "38°C",
    weather: "Sunny",
    humidity: "32%"
  },
  {
    city: "Mumbai",
    country: "India",
    temperature: "34°C",
    weather: "Cloudy",
    humidity: "70%"
  },
  {
    city: "Delhi",
    country: "India",
    temperature: "40°C",
    weather: "Hot",
    humidity: "28%"
  },
  {
    city: "Bangalore",
    country: "India",
    temperature: "29°C",
    weather: "Rainy",
    humidity: "65%"
  },
  {
    city: "Chennai",
    country: "India",
    temperature: "36°C",
    weather: "Humid",
    humidity: "75%"
  },
  {
    city: "Kolkata",
    country: "India",
    temperature: "35°C",
    weather: "Thunderstorm",
    humidity: "80%"
  },
  {
    city: "Hyderabad",
    country: "India",
    temperature: "33°C",
    weather: "Sunny",
    humidity: "45%"
  },
  {
    city: "Pune",
    country: "India",
    temperature: "30°C",
    weather: "Windy",
    humidity: "50%"
  },
  {
    city: "Jaipur",
    country: "India",
    temperature: "39°C",
    weather: "Dry",
    humidity: "20%"
  },
  {
    city: "Surat",
    country: "India",
    temperature: "37°C",
    weather: "Sunny",
    humidity: "40%"
  },
  {
    city: "New York",
    country: "USA",
    temperature: "22°C",
    weather: "Cloudy",
    humidity: "55%"
  },
  {
    city: "Los Angeles",
    country: "USA",
    temperature: "27°C",
    weather: "Sunny",
    humidity: "35%"
  },
  {
    city: "Chicago",
    country: "USA",
    temperature: "20°C",
    weather: "Windy",
    humidity: "50%"
  },
  {
    city: "London",
    country: "UK",
    temperature: "18°C",
    weather: "Rainy",
    humidity: "72%"
  },
  {
    city: "Paris",
    country: "France",
    temperature: "21°C",
    weather: "Cloudy",
    humidity: "60%"
  },
  {
    city: "Berlin",
    country: "Germany",
    temperature: "19°C",
    weather: "Foggy",
    humidity: "66%"
  },
  {
    city: "Tokyo",
    country: "Japan",
    temperature: "26°C",
    weather: "Clear",
    humidity: "58%"
  },
  {
    city: "Beijing",
    country: "China",
    temperature: "31°C",
    weather: "Sunny",
    humidity: "42%"
  },
  {
    city: "Sydney",
    country: "Australia",
    temperature: "17°C",
    weather: "Cool",
    humidity: "48%"
  },
  {
    city: "Moscow",
    country: "Russia",
    temperature: "14°C",
    weather: "Snowy",
    humidity: "78%"
  },
  {
    city: "Dubai",
    country: "UAE",
    temperature: "42°C",
    weather: "Very Hot",
    humidity: "18%"
  },
  {
    city: "Toronto",
    country: "Canada",
    temperature: "16°C",
    weather: "Cold",
    humidity: "52%"
  },
  {
    city: "Rome",
    country: "Italy",
    temperature: "24°C",
    weather: "Sunny",
    humidity: "46%"
  },
  {
    city: "Madrid",
    country: "Spain",
    temperature: "28°C",
    weather: "Dry",
    humidity: "30%"
  },
  {
    city: "Bangkok",
    country: "Thailand",
    temperature: "33°C",
    weather: "Humid",
    humidity: "82%"
  },
  {
    city: "Singapore",
    country: "Singapore",
    temperature: "31°C",
    weather: "Rainy",
    humidity: "88%"
  },
  {
    city: "Cape Town",
    country: "South Africa",
    temperature: "20°C",
    weather: "Windy",
    humidity: "55%"
  },
  {
    city: "Nairobi",
    country: "Kenya",
    temperature: "23°C",
    weather: "Sunny",
    humidity: "44%"
  },
  {
    city: "Rio de Janeiro",
    country: "Brazil",
    temperature: "29°C",
    weather: "Clear",
    humidity: "68%"
  },
  {
    city: "Mexico City",
    country: "Mexico",
    temperature: "25°C",
    weather: "Cloudy",
    humidity: "53%"
  },
  {
    city: "Seoul",
    country: "South Korea",
    temperature: "24°C",
    weather: "Pleasant",
    humidity: "49%"
  },
  {
    city: "Istanbul",
    country: "Turkey",
    temperature: "26°C",
    weather: "Sunny",
    humidity: "47%"
  },
  {
    city: "Athens",
    country: "Greece",
    temperature: "30°C",
    weather: "Hot",
    humidity: "34%"
  },
  {
    city: "Lisbon",
    country: "Portugal",
    temperature: "23°C",
    weather: "Clear",
    humidity: "45%"
  },
  {
    city: "Oslo",
    country: "Norway",
    temperature: "12°C",
    weather: "Cold",
    humidity: "61%"
  },
  {
    city: "Stockholm",
    country: "Sweden",
    temperature: "13°C",
    weather: "Cloudy",
    humidity: "59%"
  },
  {
    city: "Helsinki",
    country: "Finland",
    temperature: "10°C",
    weather: "Snowy",
    humidity: "70%"
  },
  {
    city: "Cairo",
    country: "Egypt",
    temperature: "37°C",
    weather: "Dry",
    humidity: "16%"
  },
  {
    city: "Karachi",
    country: "Pakistan",
    temperature: "35°C",
    weather: "Sunny",
    humidity: "50%"
  },
  {
    city: "Dhaka",
    country: "Bangladesh",
    temperature: "34°C",
    weather: "Rainy",
    humidity: "85%"
  },
  {
    city: "Kathmandu",
    country: "Nepal",
    temperature: "22°C",
    weather: "Cool",
    humidity: "57%"
  },
  {
    city: "Colombo",
    country: "Sri Lanka",
    temperature: "30°C",
    weather: "Humid",
    humidity: "83%"
  },
  {
    city: "Jakarta",
    country: "Indonesia",
    temperature: "32°C",
    weather: "Thunderstorm",
    humidity: "87%"
  },
  {
    city: "Manila",
    country: "Philippines",
    temperature: "31°C",
    weather: "Rainy",
    humidity: "84%"
  },
  {
    city: "Hanoi",
    country: "Vietnam",
    temperature: "29°C",
    weather: "Cloudy",
    humidity: "79%"
  },
  {
    city: "Auckland",
    country: "New Zealand",
    temperature: "15°C",
    weather: "Windy",
    humidity: "58%"
  },
  {
    city: "Buenos Aires",
    country: "Argentina",
    temperature: "21°C",
    weather: "Clear",
    humidity: "52%"
  },
  {
    city: "Lagos",
    country: "Nigeria",
    temperature: "33°C",
    weather: "Hot",
    humidity: "74%"
  },
  {
    city: "Doha",
    country: "Qatar",
    temperature: "41°C",
    weather: "Sunny",
    humidity: "19%"
  },
  {
    city: "Kuala Lumpur",
    country: "Malaysia",
    temperature: "30°C",
    weather: "Rainy",
    humidity: "86%"
  }
];

const result = weather_details.filter(
  (x) => x.city === city || x.country === country
);

//console.log("Weather result",result);
return result;
}

export default weather_fn;