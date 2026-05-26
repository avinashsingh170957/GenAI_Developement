async function Marketinfo(params) {
    const market_details = [
  {
    city: "Ahmedabad",
    country: "India",
    gold_price_24k: "₹98,500 / 10g",
    silver_price: "₹1,120 / 10g",
    petrol_price: "₹95.20 / litre",
    diesel_price: "₹91.10 / litre"
  },
  {
    city: "Mumbai",
    country: "India",
    gold_price_24k: "₹99,200 / 10g",
    silver_price: "₹1,150 / 10g",
    petrol_price: "₹104.21 / litre",
    diesel_price: "₹92.15 / litre"
  },
  {
    city: "Delhi",
    country: "India",
    gold_price_24k: "₹98,900 / 10g",
    silver_price: "₹1,130 / 10g",
    petrol_price: "₹96.72 / litre",
    diesel_price: "₹89.62 / litre"
  },
  {
    city: "Chennai",
    country: "India",
    gold_price_24k: "₹99,400 / 10g",
    silver_price: "₹1,160 / 10g",
    petrol_price: "₹100.75 / litre",
    diesel_price: "₹92.34 / litre"
  },
  {
    city: "Bangalore",
    country: "India",
    gold_price_24k: "₹99,050 / 10g",
    silver_price: "₹1,140 / 10g",
    petrol_price: "₹101.94 / litre",
    diesel_price: "₹87.89 / litre"
  },
  {
    city: "Kolkata",
    country: "India",
    gold_price_24k: "₹99,100 / 10g",
    silver_price: "₹1,145 / 10g",
    petrol_price: "₹106.03 / litre",
    diesel_price: "₹92.76 / litre"
  },
  {
    city: "Hyderabad",
    country: "India",
    gold_price_24k: "₹98,750 / 10g",
    silver_price: "₹1,125 / 10g",
    petrol_price: "₹108.20 / litre",
    diesel_price: "₹96.40 / litre"
  },
  {
    city: "Pune",
    country: "India",
    gold_price_24k: "₹99,000 / 10g",
    silver_price: "₹1,135 / 10g",
    petrol_price: "₹104.04 / litre",
    diesel_price: "₹90.57 / litre"
  },
  {
    city: "Jaipur",
    country: "India",
    gold_price_24k: "₹98,650 / 10g",
    silver_price: "₹1,118 / 10g",
    petrol_price: "₹104.88 / litre",
    diesel_price: "₹90.36 / litre"
  },
  {
    city: "Surat",
    country: "India",
    gold_price_24k: "₹98,800 / 10g",
    silver_price: "₹1,122 / 10g",
    petrol_price: "₹95.00 / litre",
    diesel_price: "₹90.00 / litre"
  },
  {
    city: "Dubai",
    country: "UAE",
    gold_price_24k: "AED 410 / 10g",
    silver_price: "AED 4.8 / 10g",
    petrol_price: "AED 3.14 / litre",
    diesel_price: "AED 3.02 / litre"
  },
  {
    city: "New York",
    country: "USA",
    gold_price_24k: "$108 / 10g",
    silver_price: "$1.4 / 10g",
    petrol_price: "$1.20 / litre",
    diesel_price: "$1.10 / litre"
  },
  {
    city: "London",
    country: "UK",
    gold_price_24k: "£85 / 10g",
    silver_price: "£1.1 / 10g",
    petrol_price: "£1.55 / litre",
    diesel_price: "£1.62 / litre"
  },
  {
    city: "Tokyo",
    country: "Japan",
    gold_price_24k: "¥15,200 / 10g",
    silver_price: "¥190 / 10g",
    petrol_price: "¥172 / litre",
    diesel_price: "¥151 / litre"
  },
  {
    city: "Sydney",
    country: "Australia",
    gold_price_24k: "A$165 / 10g",
    silver_price: "A$2.2 / 10g",
    petrol_price: "A$2.10 / litre",
    diesel_price: "A$2.00 / litre"
  }
];

console.log(`Market info`, params);

const {city,country} = params;
const search = city || country;
console.log(`search`,search);

const result = market_details.filter(
  (x) =>
    x.city.toLowerCase() === search.toLowerCase() ||
    x.country.toLowerCase() === search.toLowerCase()
);
//console.log('market place', result);

return result
}

export default Marketinfo;