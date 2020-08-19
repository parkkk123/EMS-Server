const moment = require('moment')
var pool = require('../modules/db')
const customResponse = require('../modules/customResponse')

/**
 * Manage JWT and authentication options
 */

const passport = require("passport");

const extractJwt = require("passport-jwt").ExtractJwt;
const jwtStrategy = require("passport-jwt").Strategy;

const jwtOptions = {
    jwtFromRequest: extractJwt.fromAuthHeaderAsBearerToken("authorization"),
    secretOrKey: process.env.SECRET_JWT
}


const loginMiddleware = (payload, done) => {

    try {
        pool.query("select token from Users where username = ? limit 1", [payload.aud], function (error, results) {
            if (error) {
                done(error, false, {
                    message: 'Invalid token'
                })
            } else {

                let user_token = results[0].token;
                if (payload.token == user_token) {
                    let timeNow = moment();

                    if (payload.exp >= timeNow.valueOf()) {
                        done(null, payload)
                    } else {
                        done(null, false, {
                            message: 'Expired token'
                        })
                    }


                } else {
                    done(null, false, {
                        message: 'Invalid user'
                    })
                }


            }
        })
    } catch (err) {

        done(null, false, {
            message: 'Error : ' + err
        })
    }





}

/**
 *  User authen function
 */
const jwtAuth = new jwtStrategy(jwtOptions, loginMiddleware)

passport.use(jwtAuth);

/**
 * Error handler authen
 */
const requireJwtAuth = (req, res, next) => {
    passport.authenticate("jwt", {
        session: false
    }, (err, status, info) => {
        if (err || !status) {

            return res.json(customResponse(false, info.message))
        }
        //Add a role to check in next middleware
        req._check_role = status.role
        req._username = status.aud
        req._webtoken = status.token
        req._exp = status.exp
        return next()
    })(req, res, next)
}


module.exports = requireJwtAuth