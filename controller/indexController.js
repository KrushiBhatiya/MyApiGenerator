const MC = require('../model/index')
const PC = require('../model/projectData')

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
exports.projectCollection = async(req , res) => {
    const { projectKey } = req.query;
    const projectData = await MC.find({ projectKey })
    // console.log("go ==> ",projectData);
    
    res.json({ collections: projectData });
}
