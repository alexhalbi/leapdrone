(function() {
  var express, path, drone, server, app, faye, client, lastPng, pngStream, pngIgnore, leap, controller, browserify;

  express = require("express");
  path = require("path");
  faye = require('faye');
  drone = require("ar-drone").createClient();
  leap    = require('leapjs');
  browserify = require('browserify')
  pngStream = drone.getPngStream();
  app = express();
  app.configure(function() {
          app.set('port', process.env.PORT || 3001); // process.env.PORT adjusts PORT to accept environmental parameter (ie deploying to Heroku)
          app.use(app.router);  // optimizes performance when put before static, but isn't necessary as express will implicity add.  Putting before static prevents accidentally-named static files from overwriting routes
    app.use(express.static(__dirname + '/public'));  // serves static files from disk
    app.use("/node_modules", express.static(path.join(__dirname, 'node_modules'))); // adds in jQuery
    return app.use("/bower_components", express.static(path.join(__dirname, 'bower_components'))); // adds in jQuery
  });

  server = require('http').createServer(app);
  
  var bayeux = new faye.NodeAdapter({  // central messaging server for clients to communicate with one another; Can also add 'engine' property, which controls backend of the server (ie faye-redis) and 'ping' property, which is how often, in seconds, to send keep-alive ping messages over WebSocket and EventSource connections. Used if Faye server will be accessed through a proxy that kills idle connections.
    mount: '/faye', // path on the host at which the Faye service is available (ie http://localhost:3001/faye).
    timeout: 50  // maximum time to hold connection open before returning response. Given in seconds and must be smaller than timeout on frontend webserver. 
  }); 

  bayeux.attach(server); // attached to server; will handle all requests to paths matching the mount path and delegate all other requests to handlers.

  client = new faye.Client("http://localhost:" + (app.get("port")) + "/faye", {}); // sets up new client at environmental port that accesses the server at the /faye mount 

  client.subscribe("/drone/move", function(d) { // move includes any directional actions
    console.log(d)
    return drone[d.action](d.speed);
  });

  client.subscribe("/drone/drone", function(d) { // drone commands include takeoff and landing
    console.log(d)
      return drone[d.action]();
  });

  server.listen(app.get('port'), function() {
          return console.log("Express server listening on port" + app.get("port"));
  })
  
  pngStream.on("data", function(pngBuffer) {  // requires ffmpeg to be installed, which can be done with HomeBrew
    lastPng = pngBuffer;
    if (pngIgnore === true) { // reduces interference with controls
      return;
    }
    client.publish("/drone/image", "/image/" + (Math.random())); // publishes each image to a randomly generated number
    pngIgnore = true
    return setTimeout ((function() { // png will only stream every 80ms, which allows plenty of time for control actions to be sent
      return pngIgnore = false
    }), 80);
  });

  app.get("/image/:id", function(req, res) {
    res.writeHead(200, {
      "Content-Type": "image/png"
    });
    return res.end(lastPng);
  });

}).call(this);
