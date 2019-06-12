'use strict';

// Wire up environment variables
require('dotenv').config();

// Application dependencies`
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');

// Application set up
const PORT = process.env.PORT; //PORT = 3000
const app = express();
app.use(cors());

// refactor this to be in handleLocation and getLocation
app.get('/location', (req, res) =>{
  const URL = `https://maps.googleapis.com/maps/api/geocode/json?address=${req.query.data}&key=${process.env.GEO_API_KEY}`;
  superagent.get(URL)
  .then(results =>{
    let location = new Location(req.query.data, results.body)
    res.send(location);
  }).catch(err => handleError(err));
})

// app.get('/location', (request, response) =>{
//   getLatLong(request.query.data)
//   .then(res => response.send(res) )
//   .catch(err => handleError(err) )
// });

app.get('/weather', handleWeatherRequest);
app.get('/events', handleEvents);

// Return a Promise
function getLatLong ( query ) {
  const URL = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.GEO_API_KEY}`;
  return superagent.get(URL)
  .then(res => new Location(query, res.body))
}

function Location(query, rawData) {
  this.search_query = query;
  this.formatted_query = rawData.results[0].formatted_address;
  this.latitude = rawData.results[0].geometry.location.lat;
  this.longitude = rawData.results[0].geometry.location.lng;
}

function handleEvents(request, response) {
  getEvents(request.query)
  .then(res => response.send(res))
  .catch(error => handleError(error));
}

function getEvents(query){
  let URL = `https://www.eventbriteapi.com/v3/events/search?location.address=${'bellingham'}&location.within=1km`
  return superagent.get(URL)
  .set('Authorization', `Bearer ${process.env.EVENT_BRITE}`)
  .then(res => res.body.events.map(event => new Event(event)))
  .catch(error => handleError(error));
}

function Event( event ) {
  this.link = event.url,
  this.name = event.name.text,
  this.event_date = event.start.local,
  this.summary = event.summary
}

function handleWeatherRequest(request, response) {
  // const URL = `https://api.darksky.net/forecast/${process.env.DARK_SKY_API}/${request.query.data.latitude},${request.query.data.longitude}`
  // superagent.get(URL)
  // .then(res =>{
  //   let weatherArr = res.body.daily.data.map(day => new Weather(day));
  //   response.send(weatherArr)
  // })
  // .catch(error =>{
  //   handleError(error, response);  
  // })
  
  // TRY IT WITH ASYNC 
  // try {
  //   let res = await superagent.get(URL);
  //   let weatherArr = res.body.daily.data.map(day => new Weather(day));
  //   response.send(weatherArr)

  // } catch (error) {
  //   handleError(error, response);
  // }

  //REWRITE WITH BY CALLING A FUNCTION
  getWeather(request.query)
  .then(data => response.send(data))
  .catch(error => handleError(error))
}

function getWeather(query){
  const URL = `https://api.darksky.net/forecast/${process.env.DARK_SKY_API}/${query.data.latitude},${query.data.longitude}`
  return superagent.get(URL)
  .then(res =>res.body.daily.data.map(day => new Weather(day)) )
  .catch(error => handleError(error));
}

function Weather(dayData) {
  this.forecast = dayData.summary;                    
  this.time = new Date(dayData.time * 1000).toString().slice(0,15);
}

function handleError(error, response) {
  console.error(error);
  response.status(500).send('Ruh roh');
}
app.listen(PORT, () => console.log('Listening on PORT', PORT));




