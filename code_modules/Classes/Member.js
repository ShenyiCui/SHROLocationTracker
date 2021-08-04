class Member{
    constructor(username, telegramID) {
        this.username = username;
        this.telegramID = telegramID;
        this.trips = [];
    }
    getName(){
        return this.username;
    }
    getTelegramID(){
        return this.telegramID;
    }
    getAllTrips(){
        return this.trips;
    }
    getTripFromRange(startDate, endDate){
        let result = [];
        for(let i = 0; i<this.trips.length; i++){
            if(this.trips[i].getTripInformation().startDate>=startDate && this.trips[i].getTripInformation().startDate<endDate){
                result.push(this.trips[i]);
            }
        }
        return result;
    }
    searchTrip(tripID){
        for(let i = 0; i<this.trips.length; i++){
            if(this.trips[i].tripID === tripID){
                return({
                    data: this.trips[i],
                    index: i
                })
            }
        }
        return false;
    }
    addTrip(trip){
        this.trips.push(trip)
    }
}

module.exports.Member = Member;