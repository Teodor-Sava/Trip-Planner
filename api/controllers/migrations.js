const mongoose = require("mongoose");
const request = require("request");
const moment = require("moment");
const fs = require("fs");
const path = require("path");

const appDir = path.dirname(require.main.filename);

const config = require("../../config/config");
//models
const Place = require("../models/place");
const City = require("../models/city");
const Country = require("../models/country.js");
const Tag = require("../models/tag");

exports.populateCountries = (req, res, next) => {
  const countriesURL = `https://restcountries.eu/rest/v2/region/${
    req.params.region
  }`;
  request.get(
    countriesURL,
    {
      json: true
    },
    (err, response, body) => {
      if (body) {
        const path_to_error_file = `${appDir}/cron_reports/countries_report_${moment().format(
          "DD-MM-YYYY"
        )}.txt`;
        let successfulDataPosted = 0;
        body.forEach((countryAPI, indexCountry) => {
          // Country.findOneAndUpdate({
          //     name: countryAPI.name
          // }, {
          //     population: countryAPI.population,
          //     abbvr: countryAPI.alphaalpha2Code2
          // }, (country) => {
          //     console.log(country);
          // });
          const country = new Country({
            name: countryAPI.name,
            capital: countryAPI.capital,
            region: countryAPI.region,
            subregion: countryAPI.fdsafsa,
            languages: countryAPI.languages.map(language => language.name),
            abbvr: countryAPI.alpha2Code,
            population: countryAPI.population
          });
          country
            .save()
            .then(() => successfulDataPosted++)
            .catch(err =>
              writeToFile(
                path_to_error_file,
                `index: ${indexCountry}, name: ${countryAPI.name} , error : ${
                  err.message
                } \n`
              )
            );
        });
        res.status(200).json({
          uploaded: `${successfulDataPosted}/${body.length}`
        });
      }
    }
  );
};

exports.populateCities = (req, res, next) => {
  Country.findOne({
    name: req.params.countryName
  })
    .exec()
    .then(country => {
      if (country.abbvr) {
        //read the cities from the file based on the country code
        const input = fs.createReadStream(
          `${appDir}/resources/cities_list.txt`
        );
        const rl = require("readline").createInterface({
          input: input,
          terminal: false
        });
        const path_to_error_file = `${appDir}/cron_reports/cities_report_${moment().format(
          "DD-MM-YYYY"
        )}.txt`;

        let successfulSavedCities = 0;
        let cityMinPopulation;
        // if there were any presets in the query params get them else
        // set limit for city population so that we get the main ones from each country
        // add config for hardcoded values
        if (req.query.population_min) {
          cityMinPopulation = req.query.population_min;
        } else if (country.population < 5000000) {
          cityMinPopulation = 100000;
        } else if (
          country.population > 5000000 &&
          country.population < 20000000
        ) {
          cityMinPopulation = 250000;
        } else {
          cityMinPopulation = 500000;
        }

        let countryLinesFound = false;
        rl.on("line", line => {
          const cityData = line.split(",");
          //get cities based on country abbv
          //get the cities with a population based on the number of people in one country(smallers countries accept smaller cities)
          if (
            cityData[0] === country.abbvr.toLowerCase() &&
            parseInt(cityData[4], 10) >= cityMinPopulation
          ) {
            // add new city
            countryLinesFound = true;
            const city = new City({
              name: cityData[2],
              coordinates: {
                lat: cityData[5],
                lng: cityData[6]
              },
              country: country._id,
              population: cityData[4]
            });
            city
              .save()
              .then(() => successfulSavedCities++)
              .catch(err =>
                writeToFile(
                  path_to_error_file,
                  `country: ${country.name} name: ${city.name} error : ${
                    err.message
                  }`
                )
              );
            // if it goes in this else if close it means that we went out of the interval
          } else if (
            countryLinesFound === true &&
            cityData[0] !== country.abbvr.toLowerCase()
          ) {
            countryLinesFound = false;
            rl.close();
          }
        }).on("close", () => {
          input.destroy();
          res.status(200).json({
            migratedCities: successfulSavedCities
          });
        });
      } else {
        res.status(404).json({
          message: "N abbvreviation to country found"
        });
      }
    })
    .catch(err => {
      res.status(404).json({
        message: "No country found with that name"
      });
    });
};

exports.populatePlaces = (req, res, next) => {
  // get the lat and long of the city in a country
  const country = Country.findOne({
    name: req.params.countryName
  })
    .exec()
    .then(country => {
      City.find({
        country: country._id
      })
        .exec()
        .then(cities => {
          if (cities.length > 0) {
            let responseBody = [];
            cities.forEach(city => {
              const radius = 1500;
              const googlePlacesURL =
                "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=" +
                city.coordinates.lat +
                "," +
                city.coordinates.lng +
                "&radius=" +
                radius +
                "&type=restaurant" +
                "&key=" +
                config.google.API_KEY;
              // make google api call for place

              request.get(
                googlePlacesURL,
                {
                  json: true
                },
                (err, response, body) => {
                  if (body.status === "OK") {
                    const places = body.results;
                    const path_to_error_file = `${appDir}/cron_reports/places_report_${moment().format(
                      "DD-MM-YYYY"
                    )}.txt`;
                    // for each place get the tags first then save the place information with the related tags information
                    let numberOfPlacesMigrated = 0;
                    places.forEach(async placeAPI => {
                      let tags;
                      tags = await Promise.all(
                        placeAPI.types.map(async tagAPI => {
                          // save the tags in array to push them to the place
                          // search for tags in the db if not found save the tag
                          const tag = await Tag.findOne({
                            name: tagAPI
                          })
                            .exec()
                            .then(tagDB => {
                              return tagDB;
                            })
                            .then(tag => {
                              if (!tag) {
                                return tag.save();
                              }
                              return tag;
                            })
                            .then(tagToBePushed => tagToBePushed._id)
                            .catch(err => console.log(err));
                          return tag._id;
                        })
                      );

                      await Place.findOne({
                        name: placeAPI.name
                      })
                        .exec()
                        .then(place => {
                          if (!place) {
                            place = new Place({
                              name: placeAPI.name,
                              coordinates: {
                                lat: placeAPI.geometry.location.lat,
                                lng: placeAPI.geometry.location.lng
                              },
                              city: city._id,
                              rating: placeAPI.rating,
                              price_level: placeAPI.price_level,
                              tags: tags.length > 0 ? tags : []
                            });
                            place.save();
                            console.log(place);
                          }
                        })
                        .then(() => numberOfPlacesMigrated++)
                        .catch(err =>
                          writeToFile(
                            path_to_error_file,
                            `place: ${place.name} name: ${city.name} error : ${
                              err.message
                            }`
                          )
                        );
                    });

                    res.status(200).json({
                      message: `Number of places migrated ${numberOfPlacesMigrated}/${
                        places.length
                      }`
                    });
                  }
                }
              );
            });
          }
        })
        .catch(err => {
          res.status(404).json({
            message: "No city has been found for this country"
          });
        });
    })
    .catch(err =>
      res.status(404).json({
        message: "No country found with this name"
      })
    );
};

function writeToFile(path, data) {
  data = `**time : ${moment()}** ${data} \n`;
  if (fs.existsSync(path)) {
    try {
      fs.appendFileSync(path, data);
    } catch (err) {
      console.log(err);
    }
  } else {
    try {
      fs.writeFile(path, data, err => {
        console.log(err);
      });
    } catch (err) {}
  }
}
