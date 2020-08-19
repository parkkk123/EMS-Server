const customResponse = require('../modules/customResponse')

/**
 * middleware function check your permission role
 * @param {array} setOfPermissions 
 */
const checkPermission = function (setOfPermissions) {
    return (req, res, next) => {
        if (setOfPermissions.includes(req._check_role)) {
            next()
        } else {
            res.json(customResponse(false, "Access Denied, please check your permission right"))
        }

    }
}
module.exports = checkPermission