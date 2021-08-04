let serialize = require("serialize-javascript");

module.exports = {
    //serializes a JSON object and turns it into string, then returns the string.
    serializeObj: (Obj)=>{
        let stringData;
        try{
            stringData = serialize(Obj);
        }
        catch(err){
            console.log("malformed JSON / Class Obj")
            return false;
        }
        return stringData;
    },
    //this function takes a string of an entire blockchain class. Turns it into JSON then back into the Chain and Block class.
    //Will Return False if the String is invalid.
    deserializeObj: (stringObj)=>{
        //turning string into JSON.
        let recreatedObj;
        try{
            recreatedObj = eval('(' + stringObj + ')');
            return recreatedObj;
        }
        catch(err){
            console.log("invalid JSON string detected")
            return false;
        }

    }
}