/**
 * Created by jaboko on 18.02.15.
 */
/// <reference path='./app.d.ts' />
/// <reference path='./controllers/auth.ts' />
var AppEntity = (function () {
    function AppEntity() {
        this.initDb();
        this.setRoutes();
    }
    AppEntity.prototype.initDb = function () {
        var dbModule = require('../config/db.js');
        var db = new dbModule.TingoDB();
        var mongoose = db.mongoose;
        this.mongoose = mongoose;
    };
    AppEntity.prototype.setRoutes = function () {
        var http = require("http"), express = require('express'), expressValidator = require('express-validator'), path = require("path"), logger = require('morgan'), cookieParser = require('cookie-parser'), bodyParser = require('body-parser'), session = require('express-session'), errorHandler = require('errorhandler'), multer = require('multer'), methodOverride = require('method-override'), User = require('./models/user');
        var app = express();
        app.set('port', process.env.PORT || 3000);
        app.use(logger('dev'));
        app.use(methodOverride());
        app.use(cookieParser());
        app.use(session({
            resave: true,
            saveUninitialized: true,
            secret: 'uwotm8'
        }));
        app.use(bodyParser.urlencoded({ extended: false }));
        app.use(bodyParser.json());
        app.use(multer());
        app.use(expressValidator({
            customValidators: {
                hasUsername: function (value) {
                    var notFound = true;
                    User.findOne({ username: value }, function (err, user) {
                        notFound = (notFound && user != null);
                    });
                    return notFound;
                }
            }
        }));
        app.use(express.static(path.join(__dirname, './../public')));
        var authController = require('./controllers/auth.js');
        var router = express.Router();
        authController.init(app, router);
        app.use('/api/', router);
        if ('development' == app.get('env')) {
            app.use(errorHandler());
        }
        this.app = app;
    };
    return AppEntity;
})();
exports = module.exports = new AppEntity();
//# sourceMappingURL=server.js.map