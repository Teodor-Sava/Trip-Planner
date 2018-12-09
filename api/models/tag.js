const mongoose = require('mongoose');
const ObjectId = mongoose.SchemaType.ObjectId;

const tagSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
});

module.exports = mongoose.model('Tag', tagSchema)