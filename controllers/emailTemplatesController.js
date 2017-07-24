const path = require('path');
const fs = require('fs')

class EmailTemplatesController {
    
    
    static getDirectories (src) {
        let srcpath = path.join(process.cwd(), src);
        return fs.readdirSync(srcpath)
        .filter(file => {
            return fs.lstatSync(path.join(srcpath, file)).isDirectory() && (file.indexOf('layout') == -1);
            // if(fs.lstatSync(path.join(srcpath, file)).isDirectory()) {
            //     file fs.readdirSync(path.join(srcpath, file));
            // } else {
            //     return false;
            // }
        })
    }

    static getAllTemplates(req) {
        return new Promise((resolve, reject)=>{
            resolve(EmailTemplatesController.getDirectories('emailtemplates'));
        }).then((tems)=>{
            return tems;
        })
    }


    static getTemplate(req) {
        return new Promise((resolve, reject)=>{
            let html = fs.readFileSync(path.join(process.cwd(), 'emailtemplates', req.params.id, 'html.ejs'), 'utf8');
            let text = fs.readFileSync(path.join(process.cwd(), 'emailtemplates', req.params.id, 'text.ejs'), 'utf8');
            let subject = fs.readFileSync(path.join(process.cwd(), 'emailtemplates', req.params.id, 'subject.ejs'), 'utf8');
            let scss = fs.readFileSync(path.join(process.cwd(), 'emailtemplates', req.params.id, 'style.scss'), 'utf8');


            resolve({html: html, text: text, subject: subject, scss: scss});
        });
    }
    

    static updateTemplate(req) {
        return new Promise((resolve, reject)=>{
            let html = fs.writeFileSync(path.join(process.cwd(), 'emailtemplates', req.params.id, 'html.ejs'), req.body.html, 'utf8');
            let text = fs.writeFileSync(path.join(process.cwd(), 'emailtemplates', req.params.id, 'text.ejs'), req.body.text, 'utf8');
            let subject = fs.writeFileSync(path.join(process.cwd(), 'emailtemplates', req.params.id, 'subject.ejs'), req.body.subject, 'utf8');
            let scss = fs.writeFileSync(path.join(process.cwd(), 'emailtemplates', req.params.id, 'style.scss'), req.body.scss, 'utf8');


            resolve({html: html, text: text, subject: subject, scss: scss});
        });
    }
}


module.exports = EmailTemplatesController;