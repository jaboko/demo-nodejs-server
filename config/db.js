/// <reference path='../typings/node/node.d.ts' />
/// <reference path='../typings/mongoose/mongoose.d.ts' />
///<reference path='./../typings/mongoose/mongoose.d.ts' />
var dbconfig;
(function (dbconfig) {
    var TingoDB = (function () {
        function TingoDB() {
            this.tungus = require('tungus');
            this.mongoose = require('mongoose');
            this.mongoose.connect('tingodb://' + __dirname + '/../data', function (err) {
                if (err)
                    throw err;
            });
        }
        return TingoDB;
    })();
    dbconfig.TingoDB = TingoDB;
})(dbconfig || (dbconfig = {}));
//declare var module: any;
module.exports = dbconfig;
//# sourceMappingURL=db.js.map