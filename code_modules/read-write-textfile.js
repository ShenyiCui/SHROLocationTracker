let fs = require("fs").promises;
let serialization_functions = require("./serialize-deserialize")
let root = require("./root")

module.exports = {
    //serializes data then saves it to the file.
    serialize_save_to_file: async(Obj)=>{
        try {
            await fs.writeFile(root + '/files/storage.txt', serialization_functions.serializeObj(Obj)); // need to be in an async function
        } catch (error) {
            console.log(error)
            return false;
        }
        return true;
    },
    //this will take in string data from the file, deserialize it
    //Returns the ChainObj
    deserialize_from_file: async()=>{
        try {
            const data = await fs.readFile(root + '/files/storage.txt'); // need to be in an async function
            return serialization_functions.deserializeObj(data);
        } catch (error) {
            console.log(error)
            return false;
        }
    }
}