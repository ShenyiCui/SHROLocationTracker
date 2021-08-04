let moment = require("moment")
class Trip{
    constructor(startDate, endDate, startDest, endDest, activity, accepted = null) {
        this.startDate = startDate;
        this.endDate = endDate;
        this.startDest = startDest;
        this.actualEndDate = null;
        this.endDest = endDest;
        this.activity = activity;
        this.accepted = accepted;
        this.ongoing = true;
        this.tripID = this.getTripID();
    }
    getTripID(){
        return moment(this.startDate).format("DDMMYYYYHHmm")+":"+moment(this.endDate).format("DDMMYYYYHHmm")+":"+this.startDest.lat+":"+this.startDest.long+":"+this.endDest.lat+":"+this.endDest.long+":"+moment(new Date()).format("DDMMYYYYHHmmss");
    }
    getTripInformation(){
        return{
            actualEndDate: this.actualEndDate,
            startDate: this.startDate,
            endDate: this.endDate,
            startDest: this.startDest,
            endDest: this.endDest,
            activity: this.activity,
            accepted: this.accepted,
            ongoing: this.ongoing,
            tripID: this.tripID
        }
    }
    accept(){
        this.accepted = true;
    }
    reject(){
        this.accepted = false;
    }
    returnedHome(){
        this.ongoing = false;
        this.actualEndDate = new Date();
    }
}

module.exports.Trip = Trip;