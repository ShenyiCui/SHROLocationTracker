var express = require('express');
var router = express.Router();
let readWrite_file = require("../code_modules/read-write-textfile")
let global_functions = require("../code_modules/global-functions")
let {JSONArrayToClassArray} = require("../code_modules/JSONArrayToClassArray")
let bot_functions = require("../code_modules/bot-functions")
let {Trip} = require("../code_modules/Classes/Trip");
let moment = require("moment")

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/request/outing/:telegramID/:unitName/:name', function(req, res, next) {
  res.render('goOutsideRequestForm', {name: req.params.name, telegramID: req.params.telegramID, unitName: req.params.unitName})
});

router.get('/accept/outing/:telegramID/:tripID', async function(req, res, next) {
  //getting telegram id
  let telegramID = parseInt(req.params.telegramID)
  //getting trip id
  let tripID = req.params.tripID

  //allUnits
  let allUnits = JSONArrayToClassArray(await readWrite_file.deserialize_from_file());
  //unit index
  let unitIndex = global_functions.getIndexFromTelegramId(allUnits, telegramID);
  let memberIndex;
  //if the unit exists
  if(unitIndex!==false){
    //get member
    memberIndex = allUnits[unitIndex].getMemberByID(telegramID);
    //member exists
    if(memberIndex!==false){
      memberIndex = memberIndex.index
      //getting trip
      let tripInfo = allUnits[unitIndex].getAllMembers()[memberIndex].searchTrip(tripID);
      //trip exists
      if(tripInfo){
        //accepting request
        //already accepted/declined before
        if(allUnits[unitIndex].getAllMembers()[memberIndex].getAllTrips()[tripInfo.index].accepted!==null){
          res.redirect("/actionComplete")
          return;
        }
        allUnits[unitIndex].getAllMembers()[memberIndex].getAllTrips()[tripInfo.index].accept();
        //saving acceptance
        await readWrite_file.serialize_save_to_file(allUnits);
        //go outside
        let tripData = tripInfo.data.getTripInformation();
        await bot_functions.sendGoRequestApprovedText(tripData.startDest,
            tripData.endDest,
            tripData.activity,
            tripData.startDate,
            tripData.endDate,
            tripData.tripID,
            allUnits[unitIndex].getAllMembers()[memberIndex].getTelegramID(),
            allUnits[unitIndex].getTelegramID(),
            allUnits[unitIndex].getAllMembers()[memberIndex].getName())
        res.redirect("/acknowledged")
        return;
      }
      res.redirect("/unitMemberError")
      return;
    }
    res.redirect("/unitMemberError")
    return;
  }
  res.redirect("/unitMemberError")
  return;
});

router.get('/home/outing/:telegramID/:tripID', async function(req, res, next) {
  //getting telegram id
  let telegramID = parseInt(req.params.telegramID)
  //getting trip id
  let tripID = req.params.tripID

  //allUnits
  let allUnits = JSONArrayToClassArray(await readWrite_file.deserialize_from_file());
  //unit index
  let unitIndex = global_functions.getIndexFromTelegramId(allUnits, telegramID);
  let memberIndex;
  //if the unit exists
  if(unitIndex!==false){
    //get member
    memberIndex = allUnits[unitIndex].getMemberByID(telegramID);
    //member exists
    if(memberIndex!==false){
      memberIndex = memberIndex.index
      //getting trip
      let tripInfo = allUnits[unitIndex].getAllMembers()[memberIndex].searchTrip(tripID);
      //trip exists
      if(tripInfo){
        //accepting request
        //already accepted/declined before
        if(allUnits[unitIndex].getAllMembers()[memberIndex].getAllTrips()[tripInfo.index].ongoing===false){
          res.redirect("/actionComplete")
          return;
        }
        allUnits[unitIndex].getAllMembers()[memberIndex].getAllTrips()[tripInfo.index].returnedHome();
        //saving acceptance
        await readWrite_file.serialize_save_to_file(allUnits);
        //go outside
        let tripData = tripInfo.data.getTripInformation();
        await bot_functions.sendReachedHomeText(tripData.startDest,
            tripData.endDest,
            tripData.activity,
            tripData.startDate,
            tripData.endDate,
            tripData.tripID,
            allUnits[unitIndex].getAllMembers()[memberIndex].getTelegramID(),
            allUnits[unitIndex].getTelegramID(),
            allUnits[unitIndex].getAllMembers()[memberIndex].getName())
        res.redirect("/acknowledged")
        return;
      }
      res.redirect("/unitMemberError")
      return;
    }
    res.redirect("/unitMemberError")
    return;
  }
  res.redirect("/unitMemberError")
  return;
});

router.get('/decline/outing/:telegramID/:tripID', async function(req, res, next){
  res.render('declineReason', {telegramID: req.params.telegramID, tripID: req.params.tripID})
});

router.get('/acknowledged', function (req, res, next){
  res.render('acknowledgementPage')
});

router.get('/unitMemberError', function (req, res, next){
  res.render('unitOrMember404')
});

router.get('/actionComplete', function (req, res, next){
  res.render('duplicateActionCompleted')
});

router.get('/trackLocation/:telegramID', function(req,res,next){
  res.render('searchMemberLocation', {telegramID: req.params.telegramID})
});

router.get('/requestLocation/:telegramID', async function(req, res, next){
  //telegramID is the personal ID of the user they're tracking
  let telegramID = parseInt(req.params.telegramID);
  let allUnits = JSONArrayToClassArray(await readWrite_file.deserialize_from_file());
  let unit = global_functions.searchForUnitTelegramID(allUnits, telegramID)
  if(unit){
    let memberInfo = unit.getMemberByID(telegramID)
    if(memberInfo){
      await bot_functions.requestLocation(unit.getTelegramID(), telegramID, memberInfo.data.getName())
      res.redirect("/acknowledged");
      return;
    }
    res.redirect("/unitMemberError");
    return;
  }
  res.redirect("/unitMemberError");
  return;
});

router.post("/request/outing/submit", async function(req, res, next){
  //getting all variables from the post function
  //getting all units
  let allUnits = JSONArrayToClassArray(await readWrite_file.deserialize_from_file());
  //telegram id
  let telegramID = parseInt(req.body.telegramID);
  //creating start address object
  let startAddress = {
    name: req.body.startAddressName,
    address: req.body.startAddressGoogle,
    lat: req.body.startAddressLat,
    long: req.body.startAddressLong
  }
  //creating end address object
  let endAddress = {
    name: req.body.endAddressName,
    address: req.body.endAddressGoogle,
    lat: req.body.endAddressLat,
    long: req.body.endAddressLong
  }
  //activity
  let activity = req.body.outsideActivity
  //creating date objects
  let startDateTimeString = req.body.startDate + " " + req.body.startTime
  let endDateTimeString = req.body.endDate + " " + req.body.endTime
  let startDateTime = moment(startDateTimeString, "DDMMYYYY HHmm").toDate();
  let endDateTime = moment(endDateTimeString, "DDMMYYYY HHmm").toDate();

  //console.log(telegramID)
  //ensuring that the unit and member still exists
  let unitIndex = global_functions.getIndexFromTelegramId(allUnits, telegramID);
  //console.log("Unit Index: " + unitIndex)
  //unit exists
  if(unitIndex!==false){
    let memberIndex = allUnits[unitIndex].getMemberByID(telegramID);
    //console.log("Member Index: " + unitIndex)
    //member exists within unit
    if(memberIndex!==false){
      memberIndex = memberIndex.index
      //creating and adding the new trip
      await createAndAddTrip(unitIndex, memberIndex, startDateTime, endDateTime, startAddress, endAddress, activity)
      res.redirect("/acknowledged")
      return;
    }
    //member not found
    res.redirect("/unitMemberError")
    return;
  }
  //unit not found
  res.redirect("/unitMemberError")
  return;
});

router.post('/decline/outing', async function(req, res, next) {
  //getting telegram id
  let telegramID = parseInt(req.body.telegramID)
  //getting trip id
  let tripID = req.body.tripID
  //getting reason
  let reason = req.body.reason

  //allUnits
  let allUnits = JSONArrayToClassArray(await readWrite_file.deserialize_from_file());
  //unit index
  let unitIndex = global_functions.getIndexFromTelegramId(allUnits, telegramID);
  let memberIndex;
  //if the unit exists
  if(unitIndex!==false){
    //get member
    memberIndex = allUnits[unitIndex].getMemberByID(telegramID);
    //member exists
    if(memberIndex!==false){
      memberIndex = memberIndex.index
      //getting trip
      let tripInfo = allUnits[unitIndex].getAllMembers()[memberIndex].searchTrip(tripID);
      //trip exists
      if(tripInfo){
        //accepting request
        //already accepted/declined before
        if(allUnits[unitIndex].getAllMembers()[memberIndex].getAllTrips()[tripInfo.index].accepted!==null){
          res.redirect("/actionComplete")
          return;
        }
        allUnits[unitIndex].getAllMembers()[memberIndex].getAllTrips()[tripInfo.index].reject();
        //saving acceptance
        await readWrite_file.serialize_save_to_file(allUnits);
        //go outside
        let tripData = tripInfo.data.getTripInformation();
        //sending rejection message
        await bot_functions.sendRejectText(tripData.startDest,
            tripData.endDest,
            tripData.activity,
            tripData.startDate,
            tripData.endDate,
            tripData.tripID,
            allUnits[unitIndex].getAllMembers()[memberIndex].getTelegramID(),
            allUnits[unitIndex].getTelegramID(),
            allUnits[unitIndex].getAllMembers()[memberIndex].getName(),
            reason)
        res.redirect("/acknowledged")
        return;
      }
      res.redirect("/unitMemberError")
      return;
    }
    res.redirect("/unitMemberError")
    return;
  }
  res.redirect("/unitMemberError")
  return;
});

router.post('/trackLocation', async function(req,res,next){
  //telegramID is the personal ID of the user they're tracking
  let telegramID = parseInt(req.body.telegramID);
  let lat = req.body.lat
  let long = req.body.long
  let accuracy = req.body.accuracy
  let allUnits = JSONArrayToClassArray(await readWrite_file.deserialize_from_file());

  let unit = global_functions.searchForUnitTelegramID(allUnits, telegramID);
  if(unit!==false){
    let memberInfo = unit.getMemberByID(telegramID)
    await bot_functions.submitLocation(unit.getTelegramID(),telegramID,lat,long,accuracy,memberInfo.data.getName());
    res.redirect('/acknowledged')
    return;
  }
  res.redirect('/unitMemberError')
  return;
});

let createAndAddTrip = async (unitIndex, memberIndex, startDate, endDate, startDest, endDest, activity)=>{
  let allUnits = JSONArrayToClassArray(await readWrite_file.deserialize_from_file());
  let newTrip = new Trip(startDate, endDate, startDest, endDest, activity)
  allUnits[unitIndex].getAllMembers()[memberIndex].addTrip(newTrip)
  await readWrite_file.serialize_save_to_file(allUnits);

  let fyi = allUnits[unitIndex].getFyi()
  if(fyi){
    let tripData = newTrip.getTripInformation();
    await bot_functions.sendGoRequestApprovedText(tripData.startDest,
        tripData.endDest,
        tripData.activity,
        tripData.startDate,
        tripData.endDate,
        tripData.tripID,
        allUnits[unitIndex].getAllMembers()[memberIndex].getTelegramID(),
        allUnits[unitIndex].getTelegramID(),
        allUnits[unitIndex].getAllMembers()[memberIndex].getName())
  }
  else{
    await bot_functions.sendAcceptRejectText(startDest, endDest, activity, startDate, endDate, newTrip.tripID, allUnits[unitIndex].getAllMembers()[memberIndex].getTelegramID(), allUnits[unitIndex].getTelegramID(), allUnits[unitIndex].getAllMembers()[memberIndex].getName())
  }
}

module.exports = router;
