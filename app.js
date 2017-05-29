let express = require('express');
let http = require('http');
let path = require('path');
let bodyParser = require('body-parser');
let expressValidator = require('express-validator');
let swaggerJSDoc = require('swagger-jsdoc');
const router = express.Router();

const fs = require('fs');
const join = require('path').join;
const models = join(__dirname, 'models/mongoose');
const port = process.env.PORT || 8000;

let app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(expressValidator({
    customValidators: {
        isArray: function (value) {
            return Array.isArray(value);
        }
    }
}));

// swagger definition
let swaggerDefinition = {
    info: {
        title: 'SLAP API',
        version: '1.0.0',
        description: 'SLAP CENTER API',
    },
    host: 'http://34.210.128.241:8000/',
    basePath: '/',
};

// options for the swagger docs
let options = {
    // import swaggerDefinitions
    swaggerDefinition: swaggerDefinition,
    // path to the API docs
    apis: ['./controllers/*.js'],
};

// initialize swagger-jsdoc
let swaggerSpec = swaggerJSDoc(options);

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version, X-File-Name, Authorization');
    res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Credentials', true);
    next();
});

// Bootstrap models
fs.readdirSync(models)
    .filter((file) => ~file.search(/^[^\.].*\.js$/))
    .forEach((file) => {
        // console.log(join(models, file));
        require(join(models, file));
    });

require('./router/index')(app);

// Swagger json file
app.use('/swagger.json', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

http.createServer(app).listen(port, () => {
    console.log('Runing server on port: ' + port);
});

app.use((req, res, next) => {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use((err, req, res, next) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.end();
    // res.render('error');
});

//Exporting the app for testing porpouses
module.exports = app;
