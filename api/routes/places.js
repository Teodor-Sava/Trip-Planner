const express = require('express');
const router = express.Router();

const PlaceController = require('../controllers/places');

// router.get('', PlaceController.getPlaces);
router.get('/:id', PlaceController.getPlace);


module.exports = router;