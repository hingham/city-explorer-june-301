'use strict';

// enviroment variables
require('dotenv').config();

// Application dependencies
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');

// Application set up
const app = express();
const PORT = process.env.PORT;
app.use( cors() );

// get location
app.get('/location', handleLocation);
app.get('/weather', handleWeather);
app.get('/events', handleEvents);

// route handlers
function handleLocation(req, res) {
  getLatLong(req.query.data)
  .then(location => res.send(location) )
  .catch(err => handleError(err, res) )
}

function handleWeather(req, res){
  getWeather(req.query)
  .then(data => res.send(data))
  .catch(error => handleError(error, res));
}

function handleEvents(req, res){
  getEvents(req.query)
  .then(data => res.send(data))
  .catch(error => handleError(error) )
}

// get data functions
function getLatLong(query){
  const URL = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.GEO_API_KEY}`
  return superagent.get(URL)
  .then(response =>{
    let location = new Location(query, response.body.results[0] );
    return location;
  })
  .catch(error => {
    console.error(error);
  })
}

function getWeather(query){
  const URL = `https://api.darksky.net/forecast/${process.env.DARK_SKY_API}/${query.data.latitude},${query.data.longitude}`
  return superagent.get(URL)
  .then(res => res.body.daily.data.map(day => new Weather(day) ) )
  .catch(error => handleError(error) );
}

function getEvents(query){
  let URL = `https://www.eventbriteapi.com/v3/events/search?location.address=${query}&location.within=1km`
  return superagent.get(URL)
  .set('Authorization', `Bearer ${process.env.EVENT_BRITE}`)
  .then(data => data.body.events.map(event => new Event(event)) )
  .catch(error => handleError(error));
}


// Constructor Functions
function Location(query, geoData){
  this.search_query = query;
  this.formatted_query = geoData.formatted_address;
  this.latitude = geoData.geometry.location.lat;
  this.longitude = geoData.geometry.location.lng;
}

function Weather(dayData){
  this.forecast = dayData.summary;
  this.time = new Date(dayData.time * 1000).toString().slice(0,15);
}

function Event(event){
  this.link = event.url,
  this.name= event.name.text,
  this.event_date = event.start.local,
  this.summary = event.summary
}

 function handleError(error, response){
   console.error(error);
   response.status(500).send('ERROR');
 }

 app.listen(PORT, () => console.log(`App is listening on ${PORT}`));
