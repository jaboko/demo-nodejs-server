/**
 * Created by jaboko on 18.02.15.
 */
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user.js');
var AuthController;
(function (AuthController) {
    function init(app, apiRouter) {
        // init passport
        app.use(passport.initialize());
        app.use(passport.session());
        passport.serializeUser(function (user, done) {
            console.log('serializing user: ', user);
            done(null, user._id);
        });
        passport.deserializeUser(function (id, done) {
            User.findById(id, function (err, user) {
                console.log('deserializing user: ', user);
                err ? done(err, null) : done(null, user);
            });
        });
        passport.use(new LocalStrategy({
            usernameField: 'username',
            passwordField: 'password'
        }, verifyHandler));
        // init routes
        apiRouter.route("/auth/login").all(validateLoginParams, loginHandler, profileHandler);
        apiRouter.route("/auth/logout").all(logoutHandler);
        apiRouter.route("/auth/create").all(validateCreateParams, createHandler, profileHandler);
        apiRouter.route("/auth/profile").all(isAuthHandler, profileHandler);
    }
    AuthController.init = init;
    function validateLoginParams(req, res, next) {
        req.checkBody('username').isAlphanumeric().len(4, 16);
        req.checkBody('password').notEmpty();
        var mappedErrors = req.validationErrors(true);
        if (mappedErrors) {
            res.jsonp(new ErrorBuilder().setMappedErrors(mappedErrors).build());
            return;
        }
        next();
    }
    function loginHandler(req, res, next) {
        console.log("loginHandler");
        passport.authenticate('local', function (err, user, info) {
            return err ? next(err) : user ? req.logIn(user, function (err) {
                return err ? next(err) : next();
            }) : res.jsonp(new ErrorBuilder().setMessage("User or password incorrect").buildTo({ status: 0 }));
        })(req, res, next);
    }
    function logoutHandler(req, res, next) {
        req.logout();
        res.jsonp({ status: 1 });
    }
    function validateCreateParams(req, res, next) {
        req.checkBody('username').isAlphanumeric().len(4, 16);
        req.checkBody('username', "Username is already taken")["hasUsername"]();
        req.checkBody('password').notEmpty();
        var mappedErrors = req.validationErrors(true);
        if (mappedErrors) {
            res.jsonp(new ErrorBuilder().setMappedErrors(mappedErrors).buildTo({ status: 0 }));
            return;
        }
        next();
        //User.findOne({username: req.body.username}, function (err, user) {
        //    if (user) {
        //        return res.jsonp(new ErrorBuilder().setMessage("Username is already taken").buildTo({status: 0}));
        //    }
        //    next();
        //});
    }
    function createHandler(req, res, next) {
        console.log(req.body);
        var user = new User({ username: req.body.username, password: req.body.password });
        user.save(function (err) {
            return err ? next(err) : req.logIn(user, function (err) {
                return err ? next(err) : next();
            });
        });
    }
    function profileHandler(req, res, next) {
        res.jsonp({ status: 1, profile: { username: req.user.username } });
    }
    function isAuthHandler(req, res, next) {
        req.isAuthenticated() ? next() : res.jsonp(new ErrorBuilder().setMessage("Not login").buildTo({ status: 0 }));
    }
    var verifyHandler;
    verifyHandler = function (username, password, callback) {
        User.findOne({ username: username }, function (err, user) {
            if (err) {
                return callback(err);
            }
            if (!user) {
                return callback(null, false);
            }
            user.verifyPassword(password, function (err, isMatch) {
                if (err) {
                    return callback(err);
                }
                if (!isMatch) {
                    return callback(null, false);
                }
                return callback(null, user);
            });
        });
    };
    function isAuthenticated() {
        passport.authenticate(['local'], { session: false });
    }
    AuthController.isAuthenticated = isAuthenticated;
    var ErrorBuilder = (function () {
        function ErrorBuilder() {
            this.error = {};
        }
        ErrorBuilder.prototype.setMessage = function (message) {
            this.error.message = message;
            return this;
        };
        ErrorBuilder.prototype.setMappedErrors = function (errors) {
            this.error.mappedErrors = errors;
            return this;
        };
        ErrorBuilder.prototype.build = function (json) {
            if (json === void 0) { json = true; }
            return (json) ? { error: this.error } : this.error;
        };
        ErrorBuilder.prototype.buildTo = function (object) {
            object["error"] = this.error;
            return object;
        };
        return ErrorBuilder;
    })();
    AuthController.ErrorBuilder = ErrorBuilder;
})(AuthController || (AuthController = {}));
exports = module.exports = AuthController;
//# sourceMappingURL=auth.js.map