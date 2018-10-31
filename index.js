

/*
 * Primary file for the API
 *
 */

// Dependency
var config = require('./config.js');
var hello = require('./hello-world.json');
var http = require('http');
var https = require('https');

var locale = require('locale');
var supported = new locale.Locales(Object.keys(hello));

var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var fs = require('fs');

// The server should respond to request with stirng
var httpServer = http.createServer(function(req, res) {
  unifiedServer(req, res); 
}); 

// Instantiate the HTTP Server
httpServer.listen(config.httpPort, function() {
  console.log('The HTTP server is listening on: ' + config.httpPort );
  console.log('Mode: ' + config.envName);
});

var keyPem = './https/key.pem';
var certPem = './https/cert.pem';

if (fs.existsSync(keyPem) && fs.existsSync(certPem)) {
  // Instantiate the HTTPS Server
  var httpsServerOptions = {
    'key': fs.readFileSync('./https/key.pem'),
    'cert': fs.readFileSync('./https/cert.pem')
  };

  var httpsServer = https.createServer(httpsServerOptions, function(req, res){
    unifiedServer(req, res); 
  }); 

  httpsServer.listen(config.httpsPort, function() {
    console.log('The HTTPS server is listening on: ' + config.httpsPort );
    console.log('Mode: ' + config.envName);
  });
}


// all the server logic for both http and https servers
var unifiedServer = function(req, res) {
  // get url and parse it
  var parsedUrl = url.parse(req.url, true);
  var locales = new locale.Locales(req.headers["accept-language"]);

  // get path
  var path = parsedUrl.pathname;
  var trimmedPath = path.replace(/^\/+|\/+$/g,'');

  // Get the query string as object
  var queryStringObj = parsedUrl.query;
  
  // get the http method
  var method = req.method.toLowerCase();

  // get the headers as object
  var headers = req.headers;
  var language = new locale.Locales(req.headers['accept-language']);

  // Get the payload if any
  var decoder = new StringDecoder('utf-8');
  var buffer = '';

  req.on('data', function(data) {
    buffer += decoder.write(data);
  });

  req.on('end', function() {

    buffer += decoder.end();

    // send response
    // Chose which handler to use
    var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ?
			router[trimmedPath] : handlers.notFound;

    // Construct data object to send handler
    var data = {
      "greeting":"Hello World!",
      "translated": hello[locales.best(supported)],
      "language": locales.best(supported)
    };

    // route request to the handler in router
    chosenHandler(data, function(statusCode, payload) {

      // Use the status code called by the handler or default code
      statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
      
      // Use the payload call back by the handler o
      payload = typeof(payload) == 'object' ? payload : {};

      // convert to string
      var payloadString = JSON.stringify(payload);

      // return response
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(statusCode);
      res.end(payloadString);
      // log request path
      console.log('Request Path: ' + trimmedPath);
      console.log('Method: ' + method);
      console.log('Headers: ', headers);
      console.log('IP Address: ', req.connection.remoteAddress);
      console.log('Query String: ', queryStringObj);
      console.log('Langauge: ', locales.best(supported));
      console.log('Response Data',payload);
    });
  });
};

// define handlers
var handlers = {};

// Ping handler
handlers.ping = function(data, callback) {
  // Callback a http status code and a payload object
  callback(200);
  console.log('Ping Response: ', data);
};
handlers.hello = function(data, callback) {
  // Callback a http status code and a payload object
  callback(200, data);
  console.log('Ping Response: ', data);
};

// Not found handler
handlers.notFound = function(data, callback) {
  callback(404);
};

// Define a request router
var router = {
  'ping' : handlers.ping,
  'hello' : handlers.hello
};


