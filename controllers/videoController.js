const Promise = require('bluebird');
const fs = Promise.promisifyAll(require("fs"));
var sanitize = require("sanitize-filename");
class videoController {

    static getVideo(req, res){
        const path = `videos/${sanitize(req.params.videoName)}`;
        const stat = fs.statAsync(path).then((stat) =>{
            const fileSize = stat.size;
            const range = req.headers.range;
            if (range) {
                const parts = range.replace(/bytes=/, "").split("-");
                const start = parseInt(parts[0], 10);
                const end = parts[1]
                    ? parseInt(parts[1], 10)
                    : fileSize - 1;
                const chunksize = (end - start) + 1;
                const file = fs.createReadStream(path, { start, end });
                const head = {
                    'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                    'Accept-Ranges': 'bytes',
                    'Content-Length': chunksize,
                    'Content-Type': 'video/mp4',
                };
                res.writeHead(206, head);
                file.pipe(res);
            } else {
                const head = {
                    'Content-Length': fileSize,
                    'Content-Type': 'video/mp4',
                }
                res.writeHead(200, head)
                fs.createReadStream(path).pipe(res)
            }
        })
        
    }
}

module.exports = videoController;