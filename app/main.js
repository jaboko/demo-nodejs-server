/**
 * Created by jaboko on 18.02.15.
 */
/// <reference path='./app.d.ts' />
var debug = require('debug')('testserver-1:server');
var http = require('http');
debug('booting %s', "Test Server");
var server = require('./server');
var port = normalizePort(server.app.get('port'));
server.app.set('port', port);
/**
 * Create HTTP server.
 */
var server = http.createServer(server.app);
server.on('error', onError);
server.on('listening', onListening);
server.listen(port);
/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
    var port = parseInt(val, 10);
    if (isNaN(port)) {
        // named pipe
        return val;
    }
    if (port >= 0) {
        // port number
        return port;
    }
    return false;
}
/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }
    var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}
/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
    debug('Listening on ' + bind);
}
//# sourceMappingURL=main.js.map