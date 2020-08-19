const express = require('express');
const router = express.Router()
const customResponse = require('../modules/customResponse')
const checkPermission = require("../middleware/checkPermission")
const requireJwtAuth = require("../middleware/auth")
const pool = require('../modules/db')


//Authen
//หมวด others ใช้ทั้ง admin และ ambulance และ doctor
//Req List
router.get('/EMSReq', [requireJwtAuth, checkPermission([2, 3, 4])], function (req, res) {
  try {
    var FinalRes = {}
    pool.query('SELECT   ReqID,ReqDate,AcceptDate,MobID,Request.St,Ploc,LP,Device.DevID,DeviceType.DevType,c.data,c.TimeStamp FROM Request left outer JOIN  CarData on Request.CarID = CarData.ID left outer JOIN   Device on CarData.ID = Device.CarID left outer JOIN DeviceType on Device.DevTypeID = DeviceType.DevTypeID left outer JOIN (SELECT TrID,data,TimeStamp,a.DevID FROM GPSTransaction a inner JOIN (select DevID,max(TrID) maxTr from GPSTransaction group by DevID) b on a.DevID = b.DevID and a.TrID = b.maxTr) c on Device.DevID = c.DevID Where Request.St not in (2,3) order by Request.ReqID', function (error, results, fields) {

      if (error) {
        return res.json(customResponse(false, 'Request failure error ' + error))
      } else {
        for (id in results) {
          var Req_ID = results[id].ReqID;
          var ReqDte = results[id].ReqDate;
          var Acpt = results[id].AcceptDate;
          var MobID = results[id].MobID;
          var St = results[id].St;
          var Ploc = results[id].Ploc;
          var LP = results[id].LP;
          var DevID = results[id].DevID;
          var DevType = results[id].DevType;
          var data = results[id].data;
          var TimeStamp = results[id].TimeStamp;

          var str = 'ReqID:';
          var finalStr = str.concat(Req_ID, '|ReqSt:', St, '|Request Date:', ReqDte, '|AceeptDate:', Acpt, '|MobID:', MobID, '|PLocation:', Ploc, '|LP:', LP, '|DevID:', DevID, '|DevType:', DevType, '|Location:', data, '|TimeStamp:', TimeStamp);
          FinalRes[id] = finalStr;
        }
        return res.json(customResponse(true, 'Request sucessful', FinalRes))
      }
    });
  } catch (err) {
    return res.json(customResponse(false, 'Request failure error ' + err))
  }
});



//others ใช้ทั้ง admin และ ambulance
//Authen

//Car List
router.get('/EMSCar/:CarSt', [requireJwtAuth, checkPermission([2, 3])], function (req, res) {

  try {
    let carst = req.params.CarSt
    var FinalRes = {}
    pool.query('select * from CarData inner join Device on CarData.id = Device.CarID inner join (SELECT TrID,data,TimeStamp,a.DevID FROM GPSTransaction a inner JOIN (select DevID,max(TrID) maxTr from GPSTransaction group by DevID) b on a.DevID = b.DevID and a.TrID = b.maxTr) tmp  on Device.DevID = tmp.DevID left outer JOIN (select Request.ReqID,Request.MobID,Request.Ploc,Request.St,Request.CarID from Request where Request.St not in (2,3) )R on CarData.ID = R.CarID where CarData.CarSt = ? and CarData.ID <> 4', [carst], function (error, results, fields) {
      if (error) {
        return res.json(customResponse(false, 'Request failure error ' + error))
      } else {
        for (id in results) {
          var carid = results[id].ID;
          var lp = results[id].LP;
          var st = results[id].CarSt;
          var devid = results[id].DevID;
          var loc = results[id].data;
          var reqid = results[id].ReqID;
          var TimeStamp = results[id].TimeStamp;

          var str = 'Car_Id:';
          var finalStr = str.concat(carid, '|LP:', lp, '|Status:', st, '|DeviceID:', devid, '|Location:', loc, '|TimeStamp:', TimeStamp, '|ReqID:', reqid);
          FinalRes[id] = finalStr;
        }
        return res.json(customResponse(true, 'Request sucessful', FinalRes))

      }
    })
  } catch (err) {
    return res.json(customResponse(false, 'Request failure error ' + err))
  }

});


//มาจากเครื่อง ECG พวกกราฟ ECG หัวใจ
//ECGQuery
//get , authen
//หมวด other ใช้ทั้ง admin และ  doctor
router.get('/ECGQuery/:ReqID', [requireJwtAuth, checkPermission([2, 4])], function (req, res) {

  try {
    let reqid = req.params.ReqID;
    var FinalRes = {}
    pool.query('select* from `EKGTransaction`where TrID in( SELECT max(TrID) as TrID FROM `EKGTransaction` group by DevTypeID) and DevID in (SELECT DevID FROM `Request` inner join CarData on Request.CarID = CarData.ID INNER JOIN Device on CarData.ID =Device.CarID where  Request.St = 1 and Request.ReqID = ?) order by DevTypeID', [reqid], function (error, results, fields) {
      if (error) {
        return res.json(customResponse(false, 'Request failure error ' + error))
      } else {
        for (id in results) {
          var TrID = results[id].TrID;
          var DevTypeID = results[id].DevTypeID;
          var DevID = results[id].DevID;
          var TimeStamp = results[id].TimeStamp;
          var Data = results[id].Data;

          var str = 'TrID:';
          var finalStr = str.concat(TrID, '|DevTypeID:', DevTypeID, '|DevID:', DevID, '|TimeStamp:', TimeStamp, '|Data:', Data);
          FinalRes[id] = finalStr;
        }
        return res.json(customResponse(true, 'Request sucessful', FinalRes))

      }
    });
  } catch (err) {
    return res.json(customResponse(false, 'Request failure error ' + err))
  }

});

//ดูค่า digital value พวกชีพจร มาจากเครื่อง ECG 
//get authen
//หมวด Others ใช้ทั้ง admin กับ doctor
router.get('/O2HRBPQuery/:ReqID', [requireJwtAuth, checkPermission([2, 4])], function (req, res) {
  let reqid = req.params.ReqID
  var FinalRes = {}

  try {
    pool.query('select Request.ReqID,Request.St,Request.CarID,Device.DevID,tb1.trid,tb1.devtypeid,tb1.Data as O2Data,tb1.TimeStamp as O2TS,tb2.trid,tb2.devtypeid,tb2.Data as BPData,tb2.TimeStamp as BPTS from (select * from DevTransaction where trid in (select max(trid) as TrID from DevTransaction where DevTypeID = 2))tb1 RIGHT join (select * from DevTransaction where trid in (select max(trid) as TrID from DevTransaction where DevTypeID = 3))tb2 on tb1.devid = tb2.devid INNER JOIN Device ON Device.DevID = tb1.devid inner join CarData on CarData.ID= Device.CarID inner join Request ON Request.CarID = CarData.ID where Request.St = 1 and Request.ReqID = ?', [reqid], function (error, results, fields) {
      if (error) {
        return res.json(customResponse(false, 'Request failure error ' + error))
      } else {
        for (id in results) {
          var ReqID = results[id].ReqID;
          var RST = results[id].St;
          var CarID = results[id].CarID;
          var O2Data = results[id].O2Data;
          var O2TS = results[id].O2TS;
          var BPData = results[id].BPData;
          var BPTS = results[id].BPTS;


          var str = 'ReqID:';
          var finalStr = str.concat(ReqID, '|ReqSt:', RST, '|CarID:', CarID, '|O2Data:', O2Data, '|O2TimeStamp:', O2TS, '|BPData:', BPData, '|BPTimeStamp:', BPTS);
          FinalRes[id] = finalStr;
        }
        return res.json(customResponse(true, 'Request sucessful', FinalRes))
      }
    });
  } catch (err) {
    return res.json(customResponse(false, 'Request failure error ' + err))

  }
})

//post method

//Mobile Request
router.post('/EMSMobileReq/:UID', [requireJwtAuth, checkPermission([1,2])], function (req, res) {
  /**
   * Body request
   * PLOC
   */
  try {
    let U_ID = req.params.UID
    let PLoc = req.body.PLOC

    pool.query("INSERT INTO Request (MobID, St,Ploc) VALUES (?,0,?)", [U_ID, PLoc], function (error, results, fields) {
      if (error) {
        return res.json(customResponse(false, 'Request error ' + error))
      } else {
        pool.query('select * from Request where MobID = ? and  Ploc  = ? order by ReqID desc limit 1', [U_ID, PLoc], function (error, results, fields) {
          if (error) {
            return res.json(customResponse(false, 'Request error ' + error))
          } else {
            var Req_ID = results[0].ReqID;
            var str = 'ReqID:';
            var finalStr = str.concat(Req_ID);
            return res.json(customResponse(true, 'Request successful', {
              'request_id': finalStr
            }))
          }
        })
      }

    })
  } catch (err) {
    return res.json(customResponse(false, 'Request error ' + err))
  }
})


router.patch('/EMSMobileUpdateReq/:ReqID', [requireJwtAuth, checkPermission([1,2])], function (req, res) {
  /**
   * Body request
   * ReqDetails
   */
  try {
    let ReqID = req.params.ReqID
    let ReqDetails = req.body.ReqDetails
    pool.query("update Request set ReqDetails = ? where ReqID = ?", [ReqDetails, ReqID], function (error) {
      if (error) {
        return res.json(customResponse(false, 'Request error ' + error))
      } else {
        return res.json(customResponse(true, 'Update request details successful'))
      }
    })


  }catch (err) {
    return res.json(customResponse(false, 'Request error ' + err))
  }

})
module.exports = router