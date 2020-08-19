const express = require('express');
var router = express.Router()
const customResponse = require('../modules/customResponse')
const checkPermission = require("../middleware/checkPermission")
const requireJwtAuth = require("../middleware/auth")
const pool  = require('../modules/db')

const Redis = require('ioredis');
// const redis = new Redis();
const redis    = Redis.createClient({
  port      : 6379,               // replace with your port
  host      : 'EMS_redis_server'        // replace with your hostanme or IP address
})

//Device send ค่าต่างๆ 
//Post
//หมวด Device

//Send Device Data (O2Sat HR = "O2,HR" (DevTypeID = 2)  AND BP ="SYS,DIA"  DevTypeID = 3) )
router.post('/DevSend', [requireJwtAuth, checkPermission([5])], function (req, res) {
  /**
   * อยู่ใน body 
   * :DevTypeID,:DevID,:Data
   */
  try {
    let DevTy_ID = req.body.DevTypeID;
    let DevID = req.body.DevID;
    let Dat = req.body.Data;
    let dev_data = "";
    dev_data = dev_data.concat(DevTy_ID);
    dev_data = dev_data.concat("|");
    dev_data = dev_data.concat(DevID);
    dev_data = dev_data.concat("|");
    dev_data = dev_data.concat(Dat);

    let key_value = "dev_data_";
    key_value = key_value.concat(DevTy_ID);
    // send req to redis
    const result = redis.rpush(key_value, dev_data)
    return res.json(customResponse(true, 'Request sucessful', result))
  } catch (error) {
    return res.json(customResponse(false, 'Request failure error ' + error))
  }
});


//หมวด Device
//Post
//Send ECG Data each devtype id for ecah ECG lead )
router.post('/EKGSend',[requireJwtAuth, checkPermission([5])], function (req, res) {
  try {
    /**
     * Body request
     * :DevTypeID,:DevID,:Data
     */
    let EKG_L = req.body.DevTypeID;
    let DevID = req.body.DevID;
    let Dat = req.body.Data;
    let ekg_data = "";
    ekg_data = ekg_data.concat(EKG_L);
    ekg_data = ekg_data.concat("|");
    ekg_data = ekg_data.concat(DevID);
    ekg_data = ekg_data.concat("|");
    ekg_data = ekg_data.concat(Dat);

    let key_value = "ekg_data_";
    key_value = key_value.concat(EKG_L);
    // send req to redis
    const result = redis.rpush(key_value, ekg_data);
    return res.json(customResponse(true, 'Request sucessful', result))
  } catch (error) {
    return res.json(customResponse(false, 'Request failure error ' + error))
  }
})

//Center ใช้ดู GPS รถ
//GPSQuery
router.get('/EMSGPSQuery', [requireJwtAuth, checkPermission([5])], function (req, res) {
  try {
    var FinalRes = ''
    pool.query('select * from GPSTransaction where TrID in(select max(TrID) maxTr from GPSTransaction group by DevID) order by DevID', function (error, results) {
      if (error) {
        return res.json(customResponse(false, 'Request error ' + error))
      } else {
        for (id in results) {
          var DevID = results[id].DevID;
          var data = results[id].Data;
          var TimeStamp = results[id].TimeStamp;
          var TrID = results[id].TrID;
          var str = 'DevID:';
          var finalStr = str.concat(DevID, ',TimeStamp:', TimeStamp, ',Location:', data, ',TrID', TrID);
          FinalRes = FinalRes + finalStr + "/n";
        }

        return res.json(customResponse(true, 'Request successful', {
          'query': FinalRes
        }))

      }
    })
  } catch (err) {
    return res.json(customResponse(false, 'Request error ' + err))
  }

});

module.exports = router