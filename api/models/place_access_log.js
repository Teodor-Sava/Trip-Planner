const mongoose = require('mongoose');
const ObjectId = mongoose.SchemaType.ObjectId;

const PlaceAccessLog = mongoose.Schema({
    place_id: {
        type: ObjectId,
        ref: 'Place'
    },
    user_id: {
        type: ObjectId,
        ref: 'User'
    },
    user_ip: {
        type: number,
        required: true,
        unique: true
    },
})