const mongoose = require('mongoose')
const authSchema = new mongoose.Schema({
    projectKey : String,
    authModelName : String,
    authModelFieldData : Object
})
module.exports = mongoose.model('authModel',authSchema)