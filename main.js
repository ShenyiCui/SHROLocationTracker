//moment used to measure time
let moment = require('moment')

let {Unit} = require("./code_modules/Classes/Unit");
let {Member} = require("./code_modules/Classes/Member");

let readWrite_file = require("./code_modules/read-write-textfile")
let global_functions = require("./code_modules/global-functions")
let global_variables = require("./code_modules/global-variables")
let {JSONArrayToClassArray} = require("./code_modules/JSONArrayToClassArray")

//initiating telegram bot api --> start.
//Bot Name: SHRO-tracker
//Bot Username: SHRO_tracker_bot
let telegram = require('node-telegram-bot-api');
let token = 'xxx'
let opt = {polling: true}
let bot = new telegram(token, opt)
let bot_functions = require("./code_modules/bot-functions")
//initiating telegram bot api --> end.

let getRandomInt = (max) => {
    let min = 0;
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}


module.exports = {
    run: async ()=>{
        console.log("Bot Brain Activated...")
        bot.onText(/\/start/,async (msg, match) => {
            const chatId = msg.chat.id;
            const fromId = msg.from.id;
            let allUnits = JSONArrayToClassArray(await readWrite_file.deserialize_from_file());
            if (msg.chat.type === "private") { //if the message is sent via Private Message
                let unit = global_functions.searchForUnitTelegramID(allUnits, fromId);
                if(unit){
                    await bot_functions.goOutside(chatId, unit.getMemberByID(fromId).data, unit);
                }
                else{
                    await bot_functions.joinUnit(chatId);
                }

            } else if (msg.chat.type === "supergroup" || msg.chat.type === "group") {
                if(global_functions.groupAssociatedWUnit(allUnits, chatId)){
                    let unit = global_functions.groupAssociatedWUnit(allUnits, chatId)
                    await bot_functions.displayUnitInformation(chatId, unit);
                }
                else{
                   await bot_functions.createNewUnit(chatId)
                }
            }
        });

        bot.onText(/\/SetName (.+)/, async (msg, match)=>{
            const chatId = msg.chat.id;
            const fromId = msg.from.id;
            let echo = match[1]; // the captured "echo"
            let allUnits = JSONArrayToClassArray(await readWrite_file.deserialize_from_file());

            if (msg.chat.type === "private") { //if the message is sent via Private Message
                //they're creating a new member
                if(global_variables.joinUnitHashKey.hasOwnProperty(fromId)){
                    //Creating New Member Class
                    let newMember = new Member(echo, fromId);
                    //the Index of the Unit
                    let unitIndex = global_functions.getUnitIndexFromHash(allUnits, global_variables.joinUnitHashKey[fromId])
                    //adding the member to the unit
                    allUnits[unitIndex].addMember(newMember);
                    //the index of the member
                    let memberIndex = allUnits[unitIndex].getMemberByID(fromId).index;
                    //saving the changes to the database
                    await readWrite_file.serialize_save_to_file(allUnits);
                    //deleting the key from the JSON
                    delete global_variables.joinUnitHashKey[fromId];
                    //display the go outside message
                    await bot_functions.goOutside(chatId, allUnits[unitIndex].getAllMembers()[memberIndex], allUnits[unitIndex])
                    await bot_functions.joinedUnitText(allUnits[unitIndex].getTelegramID(), allUnits[unitIndex].getAllMembers()[memberIndex]);
                }
                else{
                    //seeing if you exist in any of the units
                    let unit = global_functions.searchForUnitTelegramID(allUnits, fromId);
                    if(unit){
                        //getting the unit index
                        let unitIndex = global_functions.getIndexFromTelegramId(allUnits, fromId);
                        //getting the member index
                        let memberIndex = allUnits[unitIndex].getMemberByID(fromId).index;
                        //Changing your name inside the array
                        allUnits[unitIndex].getAllMembers()[memberIndex].username = echo;
                        //saving the changes
                        await readWrite_file.serialize_save_to_file(allUnits);
                        //displaying the go outside message
                        await bot_functions.goOutside(chatId, allUnits[unitIndex].getAllMembers()[memberIndex], allUnits[unitIndex])
                    }
                    //you don't exist in any of the units, please join one.
                    else{await bot_functions.noUnitDetectedText(chatId)}
                }
            }
            else if (msg.chat.type === "supergroup" || msg.chat.type === "group") {
                if(global_functions.groupAssociatedWUnit(allUnits, chatId)){
                    //updating the current name
                    //finding the current index
                    let index = global_functions.getUnitIndexFromChatId(allUnits, chatId)
                    allUnits[index].name = echo;
                    //saving the new information
                    await readWrite_file.serialize_save_to_file(allUnits);
                    await bot_functions.unitUpdatedText(chatId);
                    await bot_functions.displayUnitInformation(chatId, allUnits[index]);
                }
                else{
                    //creating a new name for a new unit
                    global_variables.createNewUnitName[chatId] = echo;
                    await bot_functions.ChooseMode(chatId, echo)
                }
            }
        });

        bot.onText(/\/JoinUnit (.+)/, async (msg, match)=>{
            const chatId = msg.chat.id;
            const fromId = msg.from.id;
            let echo = match[1]; // the captured "echo"
            let allUnits = JSONArrayToClassArray(await readWrite_file.deserialize_from_file());
            if (msg.chat.type === "private") { //if the message is sent via Private Message
                //seeing if the unit with this hash value exists
                let unit = global_functions.searchForUnitHash(allUnits, echo.trim());
                //it does exist
                if(unit){
                    //if you're a new member joining
                    if(!global_functions.searchForUnitTelegramID(allUnits, fromId)){
                        global_variables.joinUnitHashKey[fromId] = echo.trim();
                        await bot_functions.setOwnName(chatId, unit.getName());
                    }
                    //if you're not a new member you cannot leave the unit you must use the /Leave function.
                    else{
                        unit = global_functions.searchForUnitTelegramID(allUnits, fromId);
                        await bot_functions.goOutside(chatId, unit.getMemberByID(fromId).data, unit);
                    }
                }
                //it doesnt exist
                else{
                   await bot_functions.invalidInputText(chatId)
                }
            }
        });

        bot.onText(/\/ChangeMode/,async (msg, match) => {
            const chatId = msg.chat.id;
            const fromId = msg.from.id;
            let allUnits = JSONArrayToClassArray(await readWrite_file.deserialize_from_file());
            if (msg.chat.type === "private") { //if the message is sent via Private Message

            }
            else if (msg.chat.type === "supergroup" || msg.chat.type === "group") {
                let unit = global_functions.groupAssociatedWUnit(allUnits, chatId);
                if(unit){
                    await bot_functions.ChooseMode(chatId, unit.getName())
                }
                else{await bot_functions.noUnitDetectedText(chatId)}
            }
        });

        bot.onText(/\/DeleteUnit/,async (msg, match) => {
            const chatId = msg.chat.id;
            const fromId = msg.from.id;
            let allUnits = JSONArrayToClassArray(await readWrite_file.deserialize_from_file());
            if (msg.chat.type === "private") { //if the message is sent via Private Message

            }
            else if (msg.chat.type === "supergroup" || msg.chat.type === "group") {
                let unit = global_functions.groupAssociatedWUnit(allUnits, chatId);
                if(unit){
                    await bot_functions.deleteUnitConfirmation(chatId);
                }
                else{await bot_functions.noUnitDetectedText(chatId)}
            }
        });

        bot.onText(/\/GetHash/,async (msg, match) => {
            const chatId = msg.chat.id;
            const fromId = msg.from.id;
            let allUnits = JSONArrayToClassArray(await readWrite_file.deserialize_from_file());
            if (msg.chat.type === "private") { //if the message is sent via Private Message

            }
            else if (msg.chat.type === "supergroup" || msg.chat.type === "group") {
                let unit = global_functions.groupAssociatedWUnit(allUnits, chatId);
                if(unit){
                    await bot.sendMessage(chatId, unit.getHashKey());
                }
                else{await bot_functions.noUnitDetectedText(chatId)}
            }
        });

        bot.onText(/\/GetAllMembers/,async (msg, match) =>{
            const chatId = msg.chat.id;
            const fromId = msg.from.id;
            let allUnits = JSONArrayToClassArray(await readWrite_file.deserialize_from_file());
            if (msg.chat.type === "private") { //if the message is sent via Private Message

            }
            else if (msg.chat.type === "supergroup" || msg.chat.type === "group") {
                let unit = global_functions.groupAssociatedWUnit(allUnits, chatId)
                if(unit){
                    await bot_functions.getAllMemberList(chatId, unit)
                }
                else{await bot_functions.noUnitDetectedText(chatId)}
            }
        });

        bot.onText(/\/help/,async (msg, match) => {
            const chatId = msg.chat.id;
            const fromId = msg.from.id;
            let allUnits = JSONArrayToClassArray(await readWrite_file.deserialize_from_file());
            if (msg.chat.type === "private") { //if the message is sent via Private Message

            }
            else if (msg.chat.type === "supergroup" || msg.chat.type === "group") {
                let unit = global_functions.groupAssociatedWUnit(allUnits, chatId);
                if(unit){
                    await bot_functions.displayHelpInformation(chatId);
                }
                else{await bot_functions.noUnitDetectedText(chatId)}
            }
        });

        bot.onText(/\/Leave/,async (msg, match) =>{
            const chatId = msg.chat.id;
            const fromId = msg.from.id;
            let allUnits = JSONArrayToClassArray(await readWrite_file.deserialize_from_file());
            if (msg.chat.type === "private") { //if the message is sent via Private Message
                let unitIndex = global_functions.getIndexFromTelegramId(allUnits, fromId);
                if(unitIndex!==false){
                    let member = allUnits[unitIndex].getMemberByID(fromId).data
                    let res = allUnits[unitIndex].deleteMember(fromId);
                    await readWrite_file.serialize_save_to_file(allUnits);
                    if(res){
                        await bot.sendMessage(chatId,
                            "You've Successfully Left: " + allUnits[unitIndex].getName() + "\n" +
                            "<b>All Your Personal Data Has Been Deleted</b>",
                            {parse_mode:'HTML'})
                        await bot_functions.leftUnitText(allUnits[unitIndex].getTelegramID(), member);
                    }
                }
                else{await bot_functions.noUnitDetectedText(chatId)}
            }
        });

        bot.onText(/\/Report (.+)/,async (msg, match) =>{
            const chatId = msg.chat.id;
            const fromId = msg.from.id;
            let echo = match[1]; // the captured "echo"
            let allUnits = JSONArrayToClassArray(await readWrite_file.deserialize_from_file());
            if (msg.chat.type === "supergroup" || msg.chat.type === "group"){
                let reqDate = moment(echo + " 0000", "DDMMYY HHmm")
                if(reqDate.isValid()){
                    let startDate = reqDate.toDate();
                    let endDate = reqDate.add(1 ,"day").toDate();
                    let unitIndex = global_functions.getUnitIndexFromChatId(allUnits,chatId);
                    if(unitIndex!==false){
                        let allTrips = [];
                        for(let i=0; i<allUnits[unitIndex].getAllMembers().length; i++){
                            let tempTrips = allUnits[unitIndex].getAllMembers()[i].getTripFromRange(startDate, endDate);
                            let tempObj = {
                                name:allUnits[unitIndex].getAllMembers()[i].getName(),
                                telegramID:allUnits[unitIndex].getAllMembers()[i].getTelegramID(),
                                fyi: allUnits[unitIndex].fyi,
                                trips: tempTrips
                            }
                            allTrips = [...allTrips, tempObj];
                        }
                        //console.log(allTrips)
                        await bot_functions.sendReport(allTrips, chatId, startDate, endDate);
                        return;
                    }
                    await bot_functions.noUnitDetectedText(chatId)
                    return;
                }
                await bot_functions.invalidInputText(chatId)
                return;
            }
        });

        bot.onText(/\/RandomTrack/,async (msg, match) =>{
            const chatId = msg.chat.id;
            const fromId = msg.from.id;
            let allUnits = JSONArrayToClassArray(await readWrite_file.deserialize_from_file());
            if (msg.chat.type === "supergroup" || msg.chat.type === "group"){
                await bot_functions.TrackingFeatureDisabled(chatId);
                //-----Random Tracking Disabled-----
                /*let unit = global_functions.groupAssociatedWUnit(allUnits, chatId)
                if(unit){
                    let randomMember = getRandomInt(unit.getAllMembers().length);
                    await bot_functions.requestLocation(chatId, unit.getAllMembers()[randomMember].getTelegramID(), unit.getAllMembers()[randomMember].getName());
                    return;
                }
                await bot_functions.noUnitDetectedText(chatId)
                return;
                 */
            }
        });

        bot.on('callback_query', async function onCallbackQuery(callbackQuery) {
            const action = callbackQuery.data;
            const msg = callbackQuery.message;
            const chatId = msg.chat.id;
            const fromId = msg.from.id;
            let allUnits = JSONArrayToClassArray(await readWrite_file.deserialize_from_file());
            const opts = {
                chat_id: msg.chat.id,
                message_id: msg.message_id,
            };
            if (action === 'FYI' || action === 'AcceptReject') {
                let index = 0;
                let newUnit;
                //if they're creating a new unit
                if(global_variables.createNewUnitName.hasOwnProperty(chatId.toString())){
                    //this is a temp varible that can be removed in the future
                    //it's purpose is to allow users the option to control whether or not tracking location and whether they require
                    //users to say that they're home.
                    //currently it's defaulting both settings to false
                    //users should be able to go in enable options in a settings feature. /Settings
                    options = {
                        tracking: false,
                        reachHome: false,
                    }
                    //mode FYI
                    if(action === 'FYI'){
                        newUnit = new Unit(global_variables.createNewUnitName[chatId.toString()], true, chatId, options)
                    }
                    //mode Accept/Reject
                    else if(action==='AcceptReject'){
                        newUnit = new Unit(global_variables.createNewUnitName[chatId.toString()], false, chatId, options)
                    }
                    //Pushing the new unit into the array
                    allUnits.push(newUnit);
                    //saving the unit into the storage.txt
                    await readWrite_file.serialize_save_to_file(allUnits);
                    delete global_variables.createNewUnitName[chatId.toString()];
                    await bot_functions.unitCreatedText(chatId);
                    await bot.sendMessage(chatId, "<b>I'll Inform This Group When People Leave the House!</b>", {parse_mode:'HTML'})
                    //getting the index to display the unit.
                    index = allUnits.length-1
                    await bot_functions.displayHelpInformation(chatId);
                }
                //if they're simply updating the unit
                else{
                    //changing the mode of the Unit
                    let newFyi = false;
                    if(action === 'FYI'){newFyi = true}
                    //getting the index of the unit from the chatid
                    index = global_functions.getUnitIndexFromChatId(allUnits, chatId);
                    if(index===false){
                        await bot_functions.noUnitDetectedText(chatId);
                        return;
                    }
                    //changing the mode
                    allUnits[index].fyi = newFyi;
                    //saving the new mode
                    await readWrite_file.serialize_save_to_file(allUnits);
                    await bot_functions.unitUpdatedText(chatId);
                }
                //displaying the new information
                await bot_functions.displayUnitInformation(chatId, allUnits[index])
            }
            else if (action === 'ConfirmDelete' || action === 'RejectDelete'){
                if(action==='ConfirmDelete'){
                    let unit = global_functions.groupAssociatedWUnit(allUnits, chatId);
                    if(unit){
                        allUnits = global_functions.deleteUnit(allUnits, unit.getHashKey());
                        await readWrite_file.serialize_save_to_file(allUnits);
                        await bot.sendMessage(chatId, "Operation Complete. Unit Deleted.")
                    }
                    else{await bot_functions.noUnitDetectedText(chatId);}
                    return;
                }
                await bot.sendMessage(chatId, "Operation Cancelled.")
            }
        });
    },
}