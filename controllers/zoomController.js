var Promise = require('bluebird');
const moment = require('moment');
const config =require('../config');
var Zoom = require("zoomus")({
    key: config.zoom.key,
    secret: config.zoom.secret 
});

class zoomController {

    static getMeetings (){
        const MEETING = {
            host_id: config.zoom.host_id
        }
        return new Promise((resolve, reject) => {
            Zoom.meeting.list(MEETING, (res) => res.error ? reject(res.err) : resolve(res) );
        })
    }
    
}

module.exports = zoomController;