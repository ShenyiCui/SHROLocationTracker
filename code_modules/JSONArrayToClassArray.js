let {Unit} = require("../code_modules/Classes/Unit");
let {Member} = require("../code_modules/Classes/Member");
let {Trip} = require("../code_modules/Classes/Trip");
module.exports={
    JSONArrayToClassArray:(JSONArray)=>{
        let newAllUnits = [];
        //looping through to create new units
        for(let i =0; i<JSONArray.length; i++){
            let newUnit = new Unit(JSONArray[i].name, JSONArray[i].fyi, JSONArray[i].telegramID, JSONArray[i].options)
            newUnit.hashKey = JSONArray[i].hashKey;

            let newMembersArray = [];
            //looping through to create new members from within the units
            for(let j=0; j<JSONArray[i].members.length; j++){
                let newMember = new Member(JSONArray[i].members[j].username, JSONArray[i].members[j].telegramID);
                let newTripsArray = [];
                //looping through to create new trips from within the members
                for(let k = 0; k<JSONArray[i].members[j].trips.length; k++){
                    let newTrip = new Trip(JSONArray[i].members[j].trips[k].startDate, JSONArray[i].members[j].trips[k].endDate, JSONArray[i].members[j].trips[k].startDest, JSONArray[i].members[j].trips[k].endDest, JSONArray[i].members[j].trips[k].activity, JSONArray[i].members[j].trips[k].accepted)
                    newTrip.ongoing = JSONArray[i].members[j].trips[k].ongoing;
                    newTrip.tripID = JSONArray[i].members[j].trips[k].tripID;
                    newTrip.actualEndDate = JSONArray[i].members[j].trips[k].actualEndDate;
                    //pushing all trips into a new trips array
                    newTripsArray.push(newTrip);
                }
                //saving all the trips
                newMember.trips = [...newTripsArray]
                //pushing all the members in a new members array
                newMembersArray.push(newMember)
            }
            //saving all the new members into the unit obj
            newUnit.members = [...newMembersArray]
            //pushing all the new units into the all unit array
            newAllUnits.push(newUnit)
        }
        //returning the result with all the units
        return newAllUnits;
    }
}