const mongoose = require('mongoose')
const modelDataSchema = new mongoose.Schema({
    apiKey : String,
    modelFieldData : Object
})
module.exports = mongoose.model('modelData',modelDataSchema)