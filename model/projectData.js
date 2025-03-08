const mongoose = require('mongoose')
const projectkeySchema = new mongoose.Schema({
    projectKey : String,
    projectName : String,
})
module.exports = mongoose.model('projectCreate',projectkeySchema)