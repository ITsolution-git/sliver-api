var Promise = require('bluebird');
const moment = require('moment');
const config =require('../config');
var Zoom = require("zoomus")({
    key: config.zoom.key,
    secret: config.zoom.secret 
});

class zoomController {

    static getWebinarSpeaker () {
        return new Promise((resolve, reject) => {
            Zoom.user.list((res) => res.error ? reject(res.err) : resolve(res.users));
        })
    }


    static getWebinars (){
        return zoomController.getWebinarSpeaker().then(function(speakers){
            let speakersWithWebinar = speakers.filter(speaker => speaker.enable_webinar);
            return Promise.map(speakersWithWebinar, (speaker => {
                    console.log(speaker);
                return new Promise((resolve, reject) => {
                    const WEBINAR = {
                        host_id: speaker.id
                    }
                    Zoom.webinar.list(WEBINAR, (res) => {
                        if (res.error) reject(erorr);
                        resolve ({
                            name: speaker.first_name + " " + speaker.last_name, 
                            webinars: res.webinars,
                        })
                    });
                    })
                })
            )
        })
    }
    
}

module.exports = zoomController;