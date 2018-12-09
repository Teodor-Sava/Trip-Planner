const mongoose = require('mongoose');
const request = require('request');
const fs = require('fs');
const path = require('path');
const appDir = path.dirname(require.main.filename);

const Place = require('../models/place');
const Country = require('../models/country.js');

exports.getPlaces = (req, res, next) => {
    // get places based on some conditions provided in the request
    // probably location and bring the most popular places from that area

}

// get a single place by Id
exports.getPlace = (req, res, next) => {
    console.log('entered');
    Place.findById(req.params.id)
        .exec()
        .then()
        .catch(err => {
            console.log(err);
        })
    // once we get a place we need to increase the popularity of the place if the user has

    // create a collection to store the users that accessed the article so that we can compare it

    // ( use a date time to make sure that the popularity will not change from the same user accessing it multiple times)

    // search for the popularity based on week

    // (the rest should include filter parameteres to determine the period in which we want it calculated)
}

exports.searchPlace = (req, res, next) => {
    // if there is no filter for country id, search results should return the ones that are the closes to the user
    console.log(req);

    //if there is no place close to the user search in the larger area.

    //also places needs to be returned based on the popularity
}

// need function that ensures to return the places closest to the user


function writeToFile(path, data) {
    if (fs.existsSync(path)) {
        try {
            fs.appendFileSync(path,
                data)
        } catch (err) {
            console.log(err);
        }
    } else {
        try {
            fs.writeFileSync(path,
                data)
        } catch (err) {

        }
    }
}