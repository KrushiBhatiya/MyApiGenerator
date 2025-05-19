const MC = require('../model/index')
const PC = require('../model/projectData')
const AC = require('../model/authData')
exports.indexPage = function (req, res, next) {
    res.render('index');
}

exports.modelPage = function (req, res, next) {
    res.render('modelCreate');
}
exports.projectPage = function (req, res, next) {
    res.render('projectCreate');
}
exports.createModel = async(req, res) => {
    await MC.create(req.body)
    res.json({ status: 'success'});
}
exports.createProject = async(req, res) => {
    await PC.create(req.body)
    res.json({ status: 'success'});
}
exports.checkProjectName = async(req , res) => {
    const projectName = req.query.projectKey
    
    const exists = await PC.findOne({ "projectKey" : projectName });
    // console.log("==> ",exists);

    res.json({ exists: !!exists });
}
exports.projectCollection = async(req , res) => {
    const { projectKey } = req.query;
    const projectData = await MC.find({ projectKey : projectKey })
    // console.log("go ==> ",projectData);
    
    res.json({ collections: projectData });
}
exports.checkCollection = async(req , res) => {
    const { projectKey, modelName } = req.query;
    const exists = await MC.findOne({ "projectKey" : projectKey , "modelName": modelName });

    res.json({ exists: !!exists });
}
exports.checkAuthCollection = async(req , res) => {
    const { projectKey, authModelName } = req.query;
    const exists = await AC.findOne({ "projectKey" : projectKey , "authModelName": authModelName });

    res.json({ exists: !!exists });
}
exports.authApiGenerate = async(req , res) => {
    await AC.create(req.body)
    res.json({ status: 'success'});
}
