const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const citySchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    coordinates: {
        lat: {
            type: Number,
            required: true
        },
        lng: {
            type: Number,
            required: true
        },
    },
    country: {
        type: ObjectId,
        ref: 'Country',
        required: true
    },
    population: {
        type: Number,
        set: population => Math.ceil(population),
        required: true
    }
})

module.exports = mongoose.model('City', citySchema);