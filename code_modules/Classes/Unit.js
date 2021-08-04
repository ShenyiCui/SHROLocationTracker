//SHA256 allows for the hashing of string.
const SHA256 = require('crypto-js/sha256');

//returns a random integer between min and max
//PARAM1:INT: min integer (inclusive)
//PARAM2:INT: max integer (exclusive)
//Copied From: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
let getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

class Unit {
    //Constructor to create a Unit
    //PARAM1:STRING: name, is the name of the unit
    //PARAM2:BOOLEAN: fyi, is the informing type. Whether you want to approve/reject request or whether its just a FYI that you're heading out
    constructor(name, fyi, telegramID, options = {}) {
        this.members = [];
        this.name = name;
        //creating a unique Hash Key
        this.fyi = fyi;
        this.hashKey = SHA256(name + getRandomInt(1,1000000000).toString()).toString();
        this.telegramID = telegramID;
        this.options = options;
    }
    getAllMembers(){
        return this.members;
    }
    getMemberByID(telegramID){
        for(let i=0; i<this.members.length; i++){
            if(this.members[i].getTelegramID() === telegramID){
                return {
                    data: this.members[i],
                    index: i
                }
            }
        }
        return false;
    }
    addMember(member){
        this.members.push(member);
    }
    deleteMember(telegramID){
        for(let i=0; i<this.members.length; i++){
            if(this.members[i].getTelegramID() === telegramID){
                this.members.splice(i, 1)
                return true;
            }
        }
        return false;
    }
    getName(){
        return this.name;
    }
    getHashKey(){
        return this.hashKey;
    }
    getFyi(){
        return this.fyi
    }
    getTelegramID(){
        return this.telegramID;
    }
}

module.exports.Unit = Unit;