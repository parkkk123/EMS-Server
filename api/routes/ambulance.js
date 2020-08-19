const express = require('express');
var router = express.Router()
const customResponse = require('../modules/customResponse')
const checkPermission = require("../middleware/checkPermission")
const requireJwtAuth = require("../middleware/auth")
const pool = require('../modules/db')


router.get('/getCarID', [requireJwtAuth, checkPermission([3])], function (req, res) {
  try {
    pool.query('Select id from Users where username = ? limit 1', [req._username], function (error, result) {
      if (error) {
        return res.json(customResponse(false, 'Get car id fail' + error))
      } else {
        pool.query('Select ID from CarData where UserAssign = ? limit 1', [result[0]['id']], function (error, result) {
          if (error) {
            return res.json(customResponse(false, 'Get car id fail' + error))
          } else {
            return res.json(customResponse(true, 'Get car id successful',{'id' : result[0]['ID']}))
          }
        })
      }
    })
  } catch (err) {
    return res.json(customResponse(false, 'Get car id fail  ' + err))
  }

});

module.exports = router