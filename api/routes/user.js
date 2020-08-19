//https://ciphertrick.com/salt-hash-passwords-using-nodejs-crypto/
const express = require('express');
var router = express.Router()
const requireJwtAuth = require("../middleware/auth")
const moment = require('moment');
const pool = require('../modules/db')
const jwt = require('jwt-simple')

const sha512 = require('../modules/sha512')
const genRandomString = require('../modules/genRandomString')
const customResponse = require('../modules/customResponse')
const checkPermission = require("../middleware/checkPermission")
const checkRole = require("../modules/checkRole")

/**
 * 
 * @param {string} username 
 * @param {int} exp - expired time
 * @param {string} token - access through web
 * @param {int} role - access role 
 */
const generatePayloadJWT = function (username, expiredTime, tokenHashed, role_val) {
    return {
        aud: username,
        exp: expiredTime,
        token: tokenHashed,
        role: role_val
    }
}

router.post('/login', (req, res) => {
    try {
        pool.query("select * from Users where username = ? limit 1", [req.body.username], function (error, results) {

            if (error || results.length == 0) {
                return res.json(customResponse(false, 'User not found'))
            } else {

                let temp_password = results[0]["password"].split(',')

                let passwordHashed = sha512(req.body.password, temp_password[1].toString('hex'));

                if (temp_password[0] != passwordHashed) {
                    return res.json(customResponse(false, 'Password incorrect'))
                } else {

                    let dateExp = moment().add(8, 'hours')
                    const payload = generatePayloadJWT(req.body.username, dateExp.valueOf(), results[0].token, results[0].role)
                    const token_response = {
                        'username': req.body.username,
                        'role': results[0].role,
                        'token': jwt.encode(payload, process.env.SECRET_JWT)
                    }
                    return res.json(customResponse(true, "login succesful", token_response))
                }


            }
        });
    } catch (err) {
        return res.json(customResponse(false, "Error : " + err))
    }


});

router.post('/register', (req, res) => {
    try {
        if (!checkRole(req.body.role)) {
            return res.json(customResponse(false, "Invalid role number"))
        }
        pool.query("select * from Users where username = ? limit 1", req.body.username, function (error, results, fields) {
            if (error) {
                return res.json(customResponse(false, "Error : " + error))
            } else if (results.length == 0) {
                let salt = genRandomString(16)
                let passwordHashed = sha512(req.body.password, salt);
                let tokenHashed = sha512(req.body.password, req.body.username.toString('hex'));

                let dateExp = moment().add(process.env.JWT_EXP, 'hours');
                const payload = generatePayloadJWT(req.body.username, dateExp.valueOf(), tokenHashed, req.body.role)

                const token_response = {
                    'username': req.body.username,
                    'token': jwt.encode(payload, process.env.SECRET_JWT)
                }

                pool.query("insert into Users (username,password,token,role) values (?,?,?,?)", [req.body.username, passwordHashed + "," + salt, tokenHashed, req.body.role], function (error, results, fields) {
                    if (error) {
                        return res.json(customResponse(false, "Error insert user " + err))
                    } else {
                        return res.json(customResponse(true, "register succesful", token_response))
                    }
                });

            } else {
                return res.json(customResponse(false, 'Duplicate username', {
                    'username': req.body.username
                }))
            }
        });

    } catch (err) {
        return res.json(customResponse(false, "Error : " + err))
    }

});


router.get('/me', [requireJwtAuth], (req, res) => {
    return res.json(customResponse(true, "this is test api. If u can see this response, The api work currectly", {
        'test': "test"
    }))
});

router.get('/renew', [requireJwtAuth], (req, res) => {
    try {
        let dateExp = moment().add(8, 'hours');
        const payload = generatePayloadJWT(req._username, dateExp.valueOf(), req._webtoken, req.role)

        const token_response = {
            'username': req.body.username,
            'role': req.role,
            'token': jwt.encode(payload, process.env.SECRET_JWT)
        }
        return res.json(customResponse(true, "Renew token successful", token_response))
    } catch (err) {
        return res.json(customResponse(false, "Renew failure" + err))
    }
})

// Admin role only API
router.get('/lists', [requireJwtAuth, checkPermission([2])], (req, res) => {
    try {
        var output = []
        pool.query("select * from Users ", function (error, results) {

            for (const key in results) {
                var temp = {}
                temp['id'] = results[key]['id']
                temp['username'] = results[key]['username']
                temp['role'] = results[key]['role']

                output.push(temp)
            }
            return res.json(customResponse(true, "Get all users successful", {
                'all_users': output
            }))
        })
    } catch (err) {
        return res.json(customResponse(false, "Get all users fail" + err))
    }

})

router.delete('/delete/:userId', [requireJwtAuth, checkPermission([2])], (req, res) => {
    try {
        let userId = req.params.userId
        pool.query("delete from Users where id = ?", [userId], function (error, results) {

            return res.json(customResponse(true, "Delete user id " + String(userId) + " successful"))
        })
    } catch (err) {
        return res.json(customResponse(false, "Delete user id " + String(userId) + " failure " + err))
    }

})

router.patch('/changePassword/:userId', [requireJwtAuth, checkPermission([2])], (req, res) => {
    try {
        let userId = req.params.userId
        let oldPassword = String(req.body.oldPassword)
        let newPassword = String(req.body.newPassword)

        pool.query("select * from Users where id = ? limit 1", [userId], function (error, results) {
            if (error != null || results.length == 0) {
                return res.json(customResponse(false, "User not found " + error))
            } else {
                let arrayPasswordHashed = results[0].password.split(',')

                if (arrayPasswordHashed[0] != sha512(oldPassword, arrayPasswordHashed[1])) {
                    return res.json(customResponse(false, "Password incorrect "))
                }

                let salt = genRandomString(16)
                let passwordHashed = sha512(newPassword, salt)
                let tokenHashed = sha512(newPassword, results[0].username.toString('hex'))

                pool.query("update Users set password = ? , token = ? where id = ?", [passwordHashed + "," + salt, tokenHashed, userId], function (error) {
                    if (error) {
                        return res.json(customResponse(false, "Error update password " + error))
                    } else {
                        return res.json(customResponse(true, "Update password successful"))
                    }
                })
            }
        })

    } catch (err) {
        return res.json(customResponse(false, "Delete user id " + String(userId) + " failure " + err))
    }

})

module.exports = router