module.exports = {
    groupAssociatedWUnit:(allUnits, telegramID)=>{
       for(let i=0; i<allUnits.length; i++){
           if(allUnits[i].getTelegramID()===telegramID){
               return allUnits[i]
           }
       }
       return false;
    },
    getUnitIndexFromChatId:(allUnits, telegramID)=>{
        for(let i=0; i<allUnits.length; i++){
            if(allUnits[i].getTelegramID()===telegramID){
                return i;
            }
        }
        return false;
    },
    getUnitIndexFromHash:(allUnits, hashKey)=>{
        for(let i=0; i<allUnits.length; i++){
            if(allUnits[i].getHashKey()===hashKey){
                return i;
            }
        }
        return false;
    },
    searchForUnitHash: (allUnits, hashKey) =>{
        for(let i =0; i<allUnits.length; i++){
            if(allUnits[i].getHashKey() === hashKey){
                return allUnits[i];
            }
        }
        return false;
    },
    searchForUnitTelegramID:(allUnits, telegramID)=>{
        for(let i =0; i<allUnits.length; i++){
            for(let j=0; j<allUnits[i].getAllMembers().length; j++){
                if(allUnits[i].getAllMembers()[j].getTelegramID()===telegramID){
                    return allUnits[i];
                }
            }
        }
        return false;
    },
    getIndexFromTelegramId:(allUnits, telegramID)=>{
        for(let i =0; i<allUnits.length; i++){
            for(let j=0; j<allUnits[i].getAllMembers().length; j++){
                if(allUnits[i].getAllMembers()[j].getTelegramID()===telegramID){
                    return i;
                }
            }
        }
        return false;
    },
    deleteUnit: (allUnits, hashKey)=>{
        for(let i=0; i<allUnits.length; i++){
            if(allUnits[i].getHashKey() === hashKey){
                allUnits.splice(i,1);
                return allUnits;
            }
        }
        return false;
    },
}