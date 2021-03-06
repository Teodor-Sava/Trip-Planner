const express = require('express');
const router = express.Router();

const MigrationController = require('../controllers/migrations');

router.get('/countries/:region', MigrationController.populateCountries);
router.get('/cities/:countryName', MigrationController.populateCities);
router.get('/places/:countryName', MigrationController.populatePlaces);

module.exports = router;