const AM = require('../model/authData')

exports.authPage = function (req, res, next) {
    res.render('authCreate');
}

exports.authModel = async(req , res) => {
    await AM.create(req.body)
        res.json({ status: 'success'});
}