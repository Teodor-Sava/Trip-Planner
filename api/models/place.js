const mongoose = require("mongoose");
const ObjectId = mongoose.SchemaType.ObjectId;

const placeSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        index: true
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
    city: {
        type: 'ObjectId',
        ref: 'City'
    },
    tags: [{
        type: 'ObjectId',
        ref: 'Tag'
    }]
});

module.exports = mongoose.model("Place", placeSchema);