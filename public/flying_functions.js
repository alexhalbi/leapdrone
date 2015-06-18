var faye;
faye = new Faye.Client("/faye", { timeout: 60 }); // may need to adjust. If server doesn't send back any data for the given period of time, the client will assume the server has gone away and will attempt to reconnect. Timeout is given in seconds and should be larger than timeout on server side to give the server ample time to respond.
  var disableEmerg = function() {
    speed = 0.5; // should be more dynamic, but will move at half speed for now
    return faye.publish("/drone/move", { // sends a message to /drone/ with details of the action and speed
      action: 'disableEmergency',
      speed: speed
    });
	land();
  }
  faye.subscribe("/drone/navdata", function(data) {
    ["batteryPercentage", "clockwiseDegrees", "altitudeMeters", "frontBackDegrees", "leftRightDegrees", "xVelocity", "yVelocity", "zVelocity"].forEach(function(type) {
      return $("#" + type).html(Math.round(data.demo[type], 4));
    });
  });