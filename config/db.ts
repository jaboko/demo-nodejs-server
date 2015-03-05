/// <reference path='../typings/node/node.d.ts' />
/// <reference path='../typings/mongoose/mongoose.d.ts' />

///<reference path='./../typings/mongoose/mongoose.d.ts' />

module dbconfig {

    export class TingoDB {
        tungus = require('tungus');
        public mongoose = require('mongoose');

        constructor() {
            this.mongoose.connect('tingodb://' + __dirname + '/../data', function (err) {
                if (err) throw err;
            });
        }
    }
}

//declare var module: any;
module.exports = dbconfig;
