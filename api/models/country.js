const mongoose = require('mongoose');

const countrySchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String
    },
    capital: {
        type: String,
        required: true
    },
    languages: [{
        type: String
    }],
    region: {
        type: String,
        required: true
    },
    subregion: {
        type: String,
        required: true
    },
    abbvr: {
        type: String,
        required: true
    },
    population: {
        type: Number,
        required: true
    }
})

module.exports = mongoose.model('Country', countrySchema)