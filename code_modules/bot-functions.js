let moment = require("moment")
//initiating telegram bot api --> start.
//Bot Name: SHRO-tracker
//Bot Username: SHRO_tracker_bot
let telegram = require('node-telegram-bot-api');
let token = 'xxx'
let opt = {polling: false}
let bot = new telegram(token, opt)
//initiating telegram bot api --> end.

let {scheduleJob} = require('node-schedule');
let scheduledJobs = {};

let rootURL="https://shro-tracker.me"

module.exports = {
    createNewUnit: async(chatID)=>{
        await bot.sendMessage(chatID,
            "<b>Create a New Unit</b>\n"+
            "Set Unit Name: /SetName [Enter New Unit Name]",
            {parse_mode:"HTML"})
    },
    displayUnitInformation: async (chatID, unit)=>{
        let modetext = ""
        if(unit.getFyi()){
            modetext= "FYI"
        }
        else{
            modetext= "Accept/Reject"
        }
        await bot.sendMessage(chatID,
            "<b>Name: "+unit.getName()+"</b>\n"+
            "<b>Mode: </b> "+modetext+"\n"+
            "<b>Secret Hash Key: </b>"+unit.getHashKey()+"\n\n"+
            "<i> - Anyone can join your unit with the 'Secret Hash Key'.</i>\n"+
            "<i> - Please forward this message to members within your unit.</i>\n"+
            "<b> - To go outside, visit <a href='t.me/SHRO_tracker_bot'>t.me/SHRO_tracker_bot</a> and type: '/start'</b>",
            {parse_mode:"HTML"})
    },
    displayHelpInformation:async (chatID)=>{
        await bot.sendMessage(chatID,
            "<b>Available Commands</b> <i>(/help)</i>\n\n"+
            "<b>Display All Unit Members:\n</b>/GetAllMembers\n\n" +
            "<b>Change Unit Name:\n</b>/SetName <i>[Enter New Unit Name]</i>\n\n" +
            "<b>Change Unit Mode:\n</b>/ChangeMode\n\n" +
            "<b>Get Unit's Secret Hash:\n</b>/GetHash\n\n" +
            "<b>Get Report:\n</b>/Report <i>DDMMYY</i>\n\n" +
            //"<b>Randomly Track a Person's Location:\n</b>/RandomTrack\n\n" +
            "<b>Delete Unit:\n</b>/DeleteUnit\n",
            {parse_mode:'HTML'})
    },
    ChooseMode:async (chatId, unitName)=>{
        let opts = {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: 'FYI',
                            // we shall check for this value when we listen
                            // for "callback_query"
                            callback_data: 'FYI'
                        },
                        {
                            text: 'Accept/Reject',
                            // we shall check for this value when we listen
                            // for "callback_query"
                            callback_data: 'AcceptReject'
                        }
                    ]
                ]
            },
            parse_mode: 'HTML'
        }

        await bot.sendMessage(chatId,
            "<b>Create a New Unit</b>\n"+
            "<b>Chosen Name: </b>" + unitName + "\n\n" +
            "<i>Choose Mode</i>\n"+
            "1. FYI: Members of your unit will be able to leave the house without seeking explicit approval.\n"+
            "2. Accept/Reject: Members of your unit will need to seek explicit appoval from commanders, commanders will either reject or approve their request.",
            opts);
    },
    unitUpdatedText:async(chatId)=>{
        await bot.sendMessage(chatId,"<i>Unit Successfully Updated...</i>", {parse_mode:'HTML'})
    },
    unitCreatedText:async (chatId)=>{
        await bot.sendMessage(chatId,"<i>Unit Successfully Created...</i>", {parse_mode:'HTML'})
    },
    invalidInputText:async (chatId)=>{
        await bot.sendMessage(chatId, "Invalid Input")
    },
    noUnitDetectedText:async(chatId)=>{
        await bot.sendMessage(chatId,"<b>No Unit Detected</b>\nTo Begin Type: '/start'", {parse_mode:'HTML'})
    },
    deleteUnitConfirmation:async(chatId)=>{
        let opts = {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: 'Yes',
                            // we shall check for this value when we listen
                            // for "callback_query"
                            callback_data: 'ConfirmDelete'
                        },
                        {
                            text: 'No',
                            // we shall check for this value when we listen
                            // for "callback_query"
                            callback_data: 'RejectDelete'
                        }
                    ]
                ]
            },
            parse_mode: 'HTML'
        }
        await bot.sendMessage(chatId,
            "<b>Delete Unit Confirmation</b>\n"+
            "This operation is irreversible, all data from this unit will be deleted.\n\nAre you sure you want to continue?",
            opts);
    },
    getAllMemberList: async(chatId, unit)=>{
        let CAA = moment(new Date()).format("DD/MM/YYYY HH:mm")
        let text = "<b>All Members List \nCAA " +CAA+ "</b>\n";
        let allMembers = unit.getAllMembers();
        for(let i =0; i<allMembers.length; i++){
            text += "<b>"+(i+1).toString()+". </b>" + allMembers[i].getName() + "\n";
        }
        await bot.sendMessage(chatId, text, {parse_mode:'HTML'})
    },

    setOwnName: async(chatId, UnitName)=>{
       await bot.sendMessage(chatId,
           "<b>Set Your Display Name:\n</b>"+
           "<b>Unit Name: </b>" + UnitName + "\n"+
           "<b>Type: </b>/SetName [Enter Your Name]",
           {parse_mode:'HTML'})
    },
    joinUnit:async(chatId)=>{
      await bot.sendMessage(chatId,
          "<b>No Unit Associated, Join a Unit</b>\n"+
          "<b>Please Input: </b> '/JoinUnit <i>[Secret Hash Key]</i>'\n\n"+
          "<i>(Retrieve the secret hash key from your unit commanders)</i>",
          {parse_mode:'HTML'});
    },
    goOutside:async(chatId, member, unit)=>{
        let url = rootURL + "/request/outing/" + member.getTelegramID() + "/" + unit.getName() + "/" + member.getName()
        await bot.sendMessage(chatId,
            "<b>Unit: " + unit.getName() + "</b>\n" +
            "Hello " + member.getName() + "!\n"+
            "Click here to go <a href='"+url+"'>Outside</a>\n\n"+
            "<b>To change your name:</b>\n/SetName <i>[Enter Your Name]</i>\n\n"+
            "<b>To leave this unit:</b>\n/Leave",
            {parse_mode:'HTML'})
    },

    joinedUnitText: async(chatId, member)=>{
        await bot.sendMessage(chatId,
            "<b>Member: </b>" + member.getName() + ", has joined this unit.\n\n"+
            "<b>Display All Unit Members:\n</b>/GetAllMembers",
            {parse_mode:'HTML'})
    },
    leftUnitText: async(chatId, member)=>{
        await bot.sendMessage(chatId,
            "<b>Member: </b>" + member.getName() + ", has left this unit.\n\n"+
            "<b>Display All Unit Members:\n</b>/GetAllMembers",
            {parse_mode:'HTML'})
    },

    sendAcceptRejectText:async(startAddress, endAddress, Activity, startDate, endDate, tripID, telegramID, chatId, name)=>{
        let text = "<b>Approve/Decline Request</b>\n\n"
        let generalStructure = getGeneralLocationStructure(startAddress, endAddress, Activity, startDate, endDate, name);
        text += generalStructure + "\n";

        await bot.sendMessage(telegramID,
            text+"\n"+
            "<b>Please wait out for confirmation from your commanders before you leave the house</b>",
            {parse_mode:'HTML'})

        let acceptURL = rootURL + "/accept/outing/" + telegramID +"/"+ tripID
        let declineURL = rootURL + "/decline/outing/" + telegramID +"/"+ tripID
        text += "<b>To Accept: </b><a href='"+acceptURL+"'>Link</a>\n"
        text += "<b>To Decline: </b><a href='"+declineURL+"'>Link</a>\n"

        await bot.sendMessage(chatId,
            text,
            {parse_mode:'HTML'})
    },
    sendGoRequestApprovedText:async(startAddress, endAddress, Activity, startDate, endDate, tripID, telegramID, chatId, name)=>{
        let homeURL = rootURL + "/home/outing/" + telegramID +"/"+ tripID
        let trackUrl = rootURL + "/requestLocation/" + telegramID;
        let text = "<b>Request Approved</b>\n\n"
        let generalStructure = getGeneralLocationStructure(startAddress, endAddress, Activity, startDate, endDate, name);
        text += generalStructure;
        await bot.sendMessage(chatId,
            text + "\nI'll inform the group when he/she reaches home.\n\n",
            //+"<a href='"+trackUrl+"'>Track Location</a>",
            {parse_mode:'HTML'})

        await bot.sendMessage(telegramID,
            text +"\n"+
            "You may now Leave the house.\nPlease click on this link when you reach home: "+
            "<a href='"+homeURL+"'>Reached Home</a>",
            {parse_mode:'HTML'})

        scheduledJobs[tripID] = scheduleJob({
            month: parseInt(moment(endDate).format("M"))-1,
            date: parseInt(moment(endDate).format("D")),
            hour: parseInt(moment(endDate).format("HH")),
            minute:parseInt(moment(endDate).format("mm"))
            }, async function(){
            await bot.sendMessage(chatId,
                "<b>Trip Time Overrun</b>\n"+
                generalStructure + "\nPlease Follow Up.\n\n",
                //+"<a href='"+trackUrl+"'>Track Location</a>",
                {parse_mode:'HTML'})
            await bot.sendMessage(telegramID,
                "<b>Trip Time Overrun</b>\n"+
                generalStructure + "\nPlease click on this link when you reach home: "+
                "<a href='"+homeURL+"'>Reached Home</a>",
                {parse_mode:'HTML'})
        });
    },
    sendRejectText:async(startAddress, endAddress, Activity, startDate, endDate, tripID, telegramID, chatId, name, reason)=>{
        let text = "<b>Approve/Decline Request</b>\n\n"
        let generalStructure = getGeneralLocationStructure(startAddress, endAddress, Activity, startDate, endDate, name);
        text += generalStructure + "\n" + "<b>Request has been Denied.</b>\n";

        await bot.sendMessage(telegramID,
            text+"\n"+
            "<b>REASON</b>:\n" + reason,
            {parse_mode:'HTML'})

        await bot.sendMessage(chatId,
            text+"\n"+
            "<b>REASON</b>:\n" + reason,
            {parse_mode:'HTML'})
    },

    sendReachedHomeText:async(startAddress, endAddress, Activity, startDate, endDate, tripID, telegramID, chatId, name)=>{
        let text = "<b>Member Reached Home</b>\n\n"
        let generalStructure = getGeneralLocationStructure(startAddress, endAddress, Activity, startDate, endDate, name);
        text += generalStructure;
        text += "<b>Actual End: </b> " + moment(new Date()).format("DD/MM/YYYY HHmm")
        await bot.sendMessage(telegramID,
            text,
            {parse_mode:'HTML'})

        await bot.sendMessage(chatId,
            text,
            {parse_mode:'HTML'})

        scheduledJobs[tripID].cancel();
        delete scheduledJobs[tripID];
    },

    sendReport: async(allTrips, chatId, startDate, endDate)=>{
        let text = "<b>Report of Activities</b>\n"+
            "Range: " + moment(startDate).format("DD/MM/YYYY") + " - " + moment(endDate).format("DD/MM/YYYY") + "\n";
        let requested = "\n<b>-----Requested Trips:-----</b>\n"
        let onGoing = "\n<b>-----Ongoing Trips:-----</b>\n"
        let completed = "\n<b>-----Completed Trips:------</b>\n"
        for(let i=0; i<allTrips.length; i++){
            for(let j=0; j<allTrips[i].trips.length; j++){
                let tripData = allTrips[i].trips[j].getTripInformation();
                let fyiKey = true;
                //console.log(tripData)
                let generalStructure = getGeneralLocationStructure(tripData.startDest,
                    tripData.endDest,
                    tripData.activity,
                    tripData.startDate,
                    tripData.endDate,
                    allTrips[i].name)
                if(allTrips[0].fyi===false){
                    fyiKey = tripData.accepted;
                    if(tripData.accepted===null){
                        let acceptURL = rootURL + "/accept/outing/" + allTrips[i].telegramID +"/"+ tripData.tripID
                        let declineURL = rootURL + "/decline/outing/" + allTrips[i].telegramID +"/"+ tripData.tripID
                        requested += generalStructure +
                            "<b>To Accept: </b><a href='"+acceptURL+"'>Link</a>\n"+
                            "<b>To Decline: </b><a href='"+declineURL+"'>Link</a>\n"+
                            "-----\n"
                    }
                }
                if(tripData.ongoing && fyiKey===true && tripData.accepted!==false){
                    let trackUrl = rootURL + "/requestLocation/" + allTrips[i].telegramID;
                    onGoing += generalStructure +
                        //"<a href='"+trackUrl+"'>Track Location</a>\n+"
                        "-----\n"
                }
                else if(!tripData.ongoing && fyiKey===true && tripData.accepted!==false){
                    completed += generalStructure +
                        "<b>Actual End: </b> " +
                        moment(tripData.actualEndDate).format("DD/MM/YYYY HHmm") + "\n-----\n"
                }
            }
        }
        if(allTrips[0].fyi===false){
            text += requested;
        }
        text += onGoing;
        text += completed;
        await bot.sendMessage(chatId,
            text,
            {parse_mode:'HTML'})
    },
    requestLocation: async(chatId, telegramId, name)=>{
        await bot.sendMessage(
            chatId,
            "<b>...Tracking Location...</b>\n\n" +
            "<b>Name: </b> <i>"+name+"</i>\n\n" +
            "<b>...Tracking Location...</b>\n\n" +
            "I'll inform you once I find them"
            , {parse_mode:"HTML"}
        );
        await bot.sendMessage(
            telegramId,
            "<b>Time:</b>"+moment(new Date()).format("HHmm")+" " +
            "\nYour location is requested by the command team.\n" +
            "<b>You are required <i>BY ORDER</i> to submit your location within the next 10 minutes</b>" +
            "\n\n" +
            "<a href='"+rootURL+"/trackLocation/"+telegramId+"'>Submit Location Data</a>"
            , {parse_mode:"HTML"}
        );
    },
    submitLocation: async(chatId, telegramId, lat, long, accuracy, name)=>{
        await bot.sendMessage(
            chatId,
            "<b>...Location Detected...</b>" +
            "\n\n<b>Name: </b> <i>"+name+"</i>\n" +
            "<i><a href='https://www.google.com/search?q="+lat+"%2C"+long+"'>Location</a>\n" +
            "<i>Accurate to " + accuracy + "m</i>"+
            "</i>\n\n<b>...Location Detected...</b>"
            ,{parse_mode:"HTML"}
        );
        await bot.sendMessage(
            telegramId,
            "<b>Your location Has Been submitted</b>\n\n" +
            "<b>Name: </b> <i>"+name+"</i>\n" +
            "<i><a href='https://www.google.com/search?q="+lat+"%2C"+long+"'>Location</a></i>\n" +
            "<i>Accurate to " + accuracy + "m</i>\n"
            ,{parse_mode:"HTML"}
        );
    },
    TrackingFeatureDisabled: async(chatId)=>{
        await bot.sendMessage(chatId,
            "<i>-----Random Tracking Disabled-----</i>",
            {parse_mode:'HTML'})
    }
}

let getGeneralLocationStructure = (startAddress, endAddress, Activity, startDate, endDate, name)=>{
    let mapHomeUrl = "https://www.google.com/search?q=" + startAddress.address;
    let mapDestUrl = "https://www.google.com/search?q=" + endAddress.address;

    let text = "<b>Name: </b> "+name+"\n"+
    "<b>Home Address: </b>\n<a href='"+mapHomeUrl+"'>"+startAddress.name+"</a>\n" +
    "<b>Destination Address: </b>\n<a href='"+mapDestUrl+"'>"+endAddress.name+"</a>\n" +
    "<b>Activity: </b> " +Activity+ "\n" +
    "<b>Start: </b>"+moment(startDate).format("DD/MM/YYYY HHmm")+"\n" +
    "<b>Projected End: </b>"+moment(endDate).format("DD/MM/YYYY HHmm")+"\n"
    return text
}
