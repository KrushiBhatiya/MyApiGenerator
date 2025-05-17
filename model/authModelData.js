const mongoose = require('mongoose')
const modelDataSchema = new mongoose.Schema({
    projectKey : String,
    modelName : String,
    modelFieldData : Object
})
module.exports = mongoose.model('authmodelData',modelDataSchema)