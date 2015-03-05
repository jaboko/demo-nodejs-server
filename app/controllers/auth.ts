/**
 * Created by jaboko on 18.02.15.
 */

/// <reference path='../app.d.ts' />

import passportLocal = require('passport-local');
import express = require("express");
import passport = require('passport');

var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user.js');

module AuthController {

    export function init(app:express.Application, apiRouter:express.Router):void {

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
                err
                    ? done(err, null)
                    : done(null, user);
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

    function validateLoginParams(req:express.Request, res:express.Response, next:Function) {

        req.checkBody('username').isAlphanumeric().len(4, 16);
        req.checkBody('password').notEmpty();

        var mappedErrors = req.validationErrors(true);
        if (mappedErrors) {
            res.jsonp(new ErrorBuilder().setMappedErrors(mappedErrors).build());
            return;
        }

        next();
    }

    function loginHandler(req:express.Request, res:express.Response, next:Function) {

        console.log("loginHandler");

        passport.authenticate('local',
            function (err, user, info) {

                return err
                    ? next(err)
                    : user
                    ? req.logIn(user, function (err) {
                    return err
                        ? next(err)
                        : next()
                })
                    : res.jsonp(new ErrorBuilder().
                        setMessage("User or password incorrect").
                        buildTo({status: 0})
                );
            }
        )(req, res, next);
    }

    function logoutHandler(req:express.Request, res:express.Response, next:Function) {
        req.logout();
        res.jsonp({status: 1});
    }

    function validateCreateParams(req:express.Request, res:express.Response, next:Function) {

        req.checkBody('username').isAlphanumeric().len(4, 16);
        req.checkBody('username', "Username is already taken")["hasUsername"]();
        req.checkBody('password').notEmpty();

        var mappedErrors = req.validationErrors(true);
        if (mappedErrors) {
            res.jsonp(new ErrorBuilder().setMappedErrors(mappedErrors).buildTo({status: 0}));
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

    function createHandler(req:express.Request, res:express.Response, next:Function) {
        console.log(req.body);
        var user = new User({username: req.body.username, password: req.body.password});
        user.save(function (err) {
            return err
                ? next(err)
                : req.logIn(user, function (err) {
                return err
                    ? next(err)
                    : next();
            });
        });
    }

    function profileHandler(req:express.Request, res:express.Response, next:Function) {
        res.jsonp({status:1, profile: {username: req.user.username}});
    }

    function isAuthHandler(req:express.Request, res:express.Response, next:Function) {
        req.isAuthenticated()
            ? next()
            : res.jsonp(new ErrorBuilder().setMessage("Not login").buildTo({status: 0}));
    }

    var verifyHandler:passportLocal.VerifyFunction;
    verifyHandler = function (username:string, password:string, callback):void {
        User.findOne({username: username}, function (err, user) {

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

    export function isAuthenticated() {
        passport.authenticate(['local'], {session: false})
    }

    export class ErrorBuilder {

        error:any = {};

        constructor() {
        }

        public setMessage(message:String):ErrorBuilder {
            this.error.message = message;
            return this;
        }

        public setMappedErrors(errors:any):ErrorBuilder {
            this.error.mappedErrors = errors;
            return this;
        }

        public build(json:boolean = true):any {
            return (json) ? {error: this.error} : this.error;
        }

        public buildTo(object:any):any {
            object["error"] = this.error
            return object;
        }
    }
}

exports = module.exports = AuthController;