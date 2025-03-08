const mongoose = require('mongoose')
const keySchema = new mongoose.Schema({
    projectKey : String,
    apiKey : String,
    modelName : String,
    modelField : Object
})
module.exports = mongoose.model('modelCreate',keySchema)