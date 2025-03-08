const MC = require('../model/index')
exports.checkToken = async (req, res, next) => {
    try {
        var token = req.headers.authorization
        if (!token) throw new Error("Attach Token")
        var tokenData = await MC.findOne({ apiKey: token })
        if (!tokenData) throw new Error("Mismatch Token")
        next()
    } catch (error) {
        res.status(404).json({
            Status : "Fail",
            Message : error.message
        })
    }
}
