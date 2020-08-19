const express = require('express');
var router = express.Router()
const customResponse = require('../modules/customResponse')
const checkPermission = require("../middleware/checkPermission")
const requireJwtAuth = require("../middleware/auth")
const pool = require('../modules/db')
const moment = require('moment')
const checkRole = require("../modules/checkRole")

//Admin ใช้
//Authen
//mthod patch 

//Assign Car & Accpet Req
router.patch('/EMSAssign/:CarId', [requireJwtAuth, checkPermission([2])], function (req, res) {
  /**
   * Body request
   * ,:ReqID
   */
  try {
    let Car = req.params.CarId;
    let Req = req.body.ReqID;
    let now = moment();
    let AcptDte = now.format('YYYY-MM-DD:hh:mm:ss');

    pool.query("Update Request set St = 1, CarID = ? , AcceptDate = ?  where ReqID  = ?", [Car, AcptDte, Req], function (error, results, fields) {
      if (error) {
        return res.json(customResponse(false, 'Update failure ' + error))
      } else {
        pool.query("Update CarData  set  CarSt = 1 where ID  = ?", [Car], function (error, results, fields) {
          if (error) {
            return res.json(customResponse(false, 'Update car failure ' + error))
          } else {
            return res.json(customResponse(true, 'Update successful'))
          }
        });
      }
    });
  } catch (err) {
    return res.json(customResponse(false, 'Update error ' + err))
  }

});

//Patch method
//authen
//admin ใช้

// FinReq
router.patch('/EMSFinReq/:CarID', [requireJwtAuth, checkPermission([2])], function (req, res) {
  try {
    let Car = req.params.CarID;
    let now = moment();
    let AcptDte = now.format('YYYY-MM-DD:hh:mm:ss')

    pool.query("Update Request set St = 2, FinishDate = ?  where ReqID  in(select * from (SELECT r.ReqID FROM CarData c inner join Request r on c.id = r.CarID WHERE carst =1 and r.St = 1 and id = ?)tmp)", [AcptDte, Car], function (error, results, fields) {

      if (error) {
        return res.json(customResponse(false, 'Update error ' + error))
      } else {
        pool.query("Update CarData  set  CarSt = 0 where ID  = ?", [Car], function (error, results, fields) {
          if (error) {
            return res.json(customResponse(false, 'Update error ' + error))
          } else {
            return res.json(customResponse(true, 'Update successful'))
          }
        })

      }
    });
  } catch (err) {
    return res.json(customResponse(false, 'Update error ' + err))
  }
})


router.post('/EMSAddNewCar', [requireJwtAuth, checkPermission([2])], function (req, res) {
  try {
    let carID = req.body.ID
    let carName = req.body.NameCar
    let carStatus = req.body.CarStatus
    pool.query("Insert into CarData (ID,LP,CarSt)  values (?,?,?)", [carID, carName, carStatus], function (error) {
      if (error) {
        return res.json(customResponse(false, 'Add new car error ' + error))
      } else {
        return res.json(customResponse(true, 'Add name ' + carName + ' successful'))
      }
    })
  } catch (err) {
    return res.json(customResponse(false, 'Add new car error ' + err))
  }
})

router.patch('/EMSAssignCar/:CarID', [requireJwtAuth, checkPermission([2])], function (req, res) {
  try {
    let UserID = req.body.UserID
    let CarID = req.params.CarID
    pool.query("update CarData set UserAssign=? where ID = ?", [UserID, CarID], function (error) {
      if (error) {
        return res.json(customResponse(false, 'Assign user to car fail with ' + error))
      } else {
        return res.json(customResponse(true, 'Add user ' + UserID + ' to car ' + CarID + ' successful'))
      }
    })
  } catch (err) {
    return res.json(customResponse(false, 'Assign user to car fail with ' + err))
  }
})

router.delete('/EMSDeleteCar/:CarID', [requireJwtAuth, checkPermission([2])], function (req, res) {
  try {
    let CarID = req.params.CarID
    pool.query("delete from CarData where  ID = ?", [CarID], function (error) {
      if (error) {
        return res.json(customResponse(false, 'Delete car fail with ' + error))
      } else {
        return res.json(customResponse(true, 'Delete car ' + CarID + ' successful'))
      }
    })
  } catch (err) {
    return res.json(customResponse(false, 'Delete car fail with ' + err))
  }
})

router.patch('/EMSChangeRole/:UserID', [requireJwtAuth, checkPermission([2])], function (req, res) {
  try {
    let NewRole = req.body.NewRole
    let UserID = req.params.UserID
    if (!checkRole(NewRole)) {
      return res.json(customResponse(false, "Invalid role number"))
    }
    pool.query("update Users set role=? where id = ?", [NewRole, UserID], function (error) {
      if (error) {
        return res.json(customResponse(false, 'Error change role ' + error))
      } else {
        return res.json(customResponse(true, 'Change role ' + UserID + ' to user ' + NewRole + ' successful'))
      }
    })
  } catch (err) {
    return res.json(customResponse(false, 'Error change role ' + err))
  }
})

router.get('/EMSLastRequest/:HourVal', [requireJwtAuth, checkPermission([2])], function (req, res) {
  try {
    let HourVal = req.params.HourVal
    let dateNew = moment().subtract(HourVal, 'hours').format("YYYY-MM-DD HH:mm:ss")

    pool.query("select * from Request where ReqDate > ? and St = 2", [dateNew], function (error, results) {
      if (error) {
        return res.json(customResponse(false, 'Error get request ' + error))
      } else {
        return res.json(customResponse(true, 'Get last request successful', results))
      }
    })
  } catch (err) {
    return res.json(customResponse(false, 'Error get request ' + err))
  }
})

router.get('/EMSQueryEKGTransaction/:ReqID', [requireJwtAuth, checkPermission([2])], function (req, res) {
  try {
    let ReqID = req.params.ReqID
    pool.query("select ekg.* from Request as r,Device as d,EKGTransaction as ekg where r.ReqID = ? and d.CarID = r.CarID and ekg.DevID = d.DevID and (ekg.TimeStamp >= r.AcceptDate and ekg.TimeStamp <= r.FinishDate)", [ReqID], function (error, results) {
      if (error) {
        return res.json(customResponse(false, 'Error get EKG transaction' + error))
      } else {
        return res.json(customResponse(true, 'Get EKG transaction successful', results))
      }
    })
  } catch (err) {
    return res.json(customResponse(false, 'Error get EKG transaction ' + err))
  }

})
module.exports = router