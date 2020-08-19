const express = require('express');
var router = express.Router()
const customResponse = require('../modules/customResponse')
const checkPermission = require("../middleware/checkPermission")
const requireJwtAuth = require("../middleware/auth")
const pool = require('../modules/db')
const moment = require('moment');

//หมวด patient
//authen 

//Req Mobile
router.get('/EMSReqMobile/:ReqID', [requireJwtAuth, checkPermission([1])], function (req, res) {

  try {
    let reqid = req.params.ReqID;
    var FinalRes = {}
    pool.query('SELECT   ReqID,Request.St,MobID,Ploc,LP,Device.DevID,DeviceType.DevType,c.data,c.TimeStamp,Request.CarID FROM Request left outer JOIN  CarData on Request.CarID = CarData.ID left outer JOIN   Device on CarData.ID = Device.CarID left outer JOIN DeviceType on Device.DevTypeID = DeviceType.DevTypeID left outer JOIN (SELECT TrID,data,TimeStamp,a.DevID FROM GPSTransaction a inner JOIN (select DevID,max(TrID) maxTr from GPSTransaction group by DevID) b on a.DevID = b.DevID and a.TrID = b.maxTr) c on Device.DevID = c.DevID Where Request.ReqID = ? order by Request.ReqID', [reqid], function (error, results, fields) {
      if (error) {
        return res.json(customResponse(false, 'Request error ' + error))
      } else {
        for (id in results) {
          var reqid = results[id].ReqID;
          var st = results[id].St;
          var mobid = results[id].MobID;
          var ploc = results[id].Ploc;
          var lp = results[id].LP;
          var devid = results[id].DevID;
          var devtype = results[id].DevType;
          var loc = results[id].data;
          var TimeStamp = results[id].TimeStamp;
          var carid = results[id].CarID;
          var str = 'ReqID:';
          var finalStr = str.concat(reqid, '|ReqSt:', st, '|MobID:', mobid, '|PLocation:', ploc, '|LP:', lp, '|DevID:', devid, '|DevType:', devtype, '|Location:', loc, '|TimeStamps:', TimeStamp, '|CarID:', carid);
          FinalRes[id] = finalStr;
        }
        return res.json(customResponse(true, 'Request successful', FinalRes))

      }
    })
  } catch (err) {
    return res.json(customResponse(false, 'Request error ' + err))
  }

})

//patch method 
//หมวด patient 

//Cancel Req
router.patch('/EMSCancelReq/:ReqID', [requireJwtAuth, checkPermission([1])], function (req, res) {
  try {
    let Req = req.params.ReqID;
    let now = moment();
    let FinDte = now.format('YYYY-MM-DD:hh:mm:ss');

    pool.query("Update Request set St =3 ,FinishDate = ?  where ReqID  = ?", [FinDte, Req], function (error, results, fields) {
      if (error) {
        return res.json(customResponse(false, 'Request error ' + error))
      } else {
        return res.json(customResponse(true, 'Request successful'))

      }
    })
  } catch (err) {
    return res.json(customResponse(false, 'Request error ' + err))
  }

});

//Patch method
//patient ใช้

//Free Car
router.patch('/EMSFreeCar/:CarID', [requireJwtAuth, checkPermission([1])], function (req, res) {
  try {
    let carid = req.params.CarID
    pool.query("Update CarData set CarSt = 0 where ID  = ?", [carid], function (error, results, fields) {
      if (error) {
        return res.json(customResponse(false, 'Free car error ' + error))
      } else {
        return res.json(customResponse(true, 'Free car successful'))
      }
    })
  } catch (err) {
    return res.json(customResponse(false, 'Request error ' + err))
  }
})

module.exports = router