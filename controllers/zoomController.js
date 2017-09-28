var Promise = require('bluebird');
const moment = require('moment');
const config =require('../config');
const Webinars = require('../models/mongoose/webinars');
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

    static getWebinarsList (WEBINAR) {
        return new Promise((resolve, reject) => {
            Zoom.webinar.list(WEBINAR, (res) => res.error? reject(res.err) : resolve(res.webinars));
        })
    }
    static getWebinarsFromDB() {
        return Webinars.find();
    }
    static getWebinars() {
        return zoomController.getWebinarSpeaker().then(function (speakers) {
            let speakersWithWebinar = speakers.filter(speaker => speaker.enable_webinar);
            return Promise.map(speakersWithWebinar, (speaker => {
                console.log(speaker);
                const WEBINAR = {
                    host_id: speaker.id
                }
                return zoomController.getWebinarsList(WEBINAR).then(function (webinars) {
                    return Promise.map(webinars, (webinar => {
                        return new Promise((resolve, reject) => {
                            const WEBINARS = {
                                id: webinar.id,
                                host_id: speaker.id,
                            };
                            Zoom.webinar.listPanelists(WEBINARS, (res) => {
                                resolve({
                                    name: res.panelists,
                                    webinars: webinars,
                                })
                            })
                        });
                    })
)
                })
            }))
        }).then(webinars => {
            return Webinars.remove({}).then(()=>{
                return Promise.map(webinars, (webinar => {
                    return Webinars.create(webinar);
                }));
            })
        })
    }
                    // Zoom.webinar.list(WEBINAR, (res) => {
                    //     if (res.error) reject(erorr);
                    //     resolve ({ 
                    //         webinars: res.webinars.id,
                    //     })
                    // });
                    // const WEBINARS = {
                    //     host_id: speaker.id,
                    // }
                    // console.log(WEBINARS);
                    // Zoom.webinar.listPanelists(WEBINARS, (res) => {
                    //     if (res.error) reject(erorr);
                    //     resolve ({
                    //         name: speaker.first_name + " " + speaker.last_name, 
                    //         webinars: res.webinars.panelists.name,
                    //     })
                    // });
                
    
}

module.exports = zoomController;