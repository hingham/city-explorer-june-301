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



function handleLocation(req, res) {
  getLatLong(req.query.data)
  .then(location =>{
    res.send(location);
  })
  .catch(err =>{
    handleError(err, res);
  })
}

// run out superagent request
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

// Constructor Function for location
function Location(query, geoData){
  this.search_query = query;
  this.formatted_query = geoData.formatted_address;
  this.latitude = geoData.geometry.location.lat;
  this.longitude = geoData.geometry.location.lng;
}

 function handleError(error, response){
   console.error(error);
   response.status(500).send('ERROR');
 }

 app.listen(PORT, () => console.log(`App is listening on ${PORT}`));
