"use strict";

require("dotenv").config();

//Application Dependencies
const express = require("express");
const cors = require("cors");

//Application SetUp
const PORT = process.env.PORT;
const app = express();
app.use(cors());

app.get("/location", (req, res) => {
  try {
    console.log(req);
    const locationData = searchToLatLong(req.query.data);
    const location = new Location(req.query.data, locationData.results[0]);
    res.send(location);
  } catch (error) {
    console.error(error);
    res.status(500).send("Status 500. Somthing went wrong");
  }
});

app.get("/weather", (req, res) => {
  try {
    const weatherData = getWeatherData(req.query.data);
    res.send(weatherData);
  } catch (error) {
    res.status(500).send("Status 500. Something went wrong");
  }
});



function getWeatherData(query) {
  const weather = require("./data/darksky.json");
  const weatherArr = [];

  weather.daily.data.forEach(day => {
    let weather = new Weather(day);
    weatherArr.push(weather);
  });

  return weatherArr;
}

function Weather(day) {
    (this.forecast = day.summary), (this.time = new Date(day.time));
  }

function searchToLatLong(query) {
  const geoData = require("./data/geo.json");
  return geoData;
}

function Location(query, data) {
  this.search_query = query;
  this.formatted_query = data.formatted_address;
  this.latitude = data.geometry.location.lat;
  this.longitude = data.geometry.location.lng;
}

app.listen(PORT, () => console.log(`app is up and listening on ${PORT}`));
