(function () {

  var controller, flying, speed, leap, faye, timeout, speedAdjuster, stopped;

  faye = new Faye.Client("/faye", {
    timeout: 60 // may need to adjust. If server doesn't send back any data for the given period of time, the client will assume the server has gone away and will attempt to reconnect. Timeout is given in seconds and should be larger than timeout on server side to give the server ample time to respond.
  });

  flying = false; // used to prevent action while drone is dormant
  timeout = 400;  // used for each server publish
  speedAdjuster = 2.5; // higher number decreases action speed.  DO NOT set to less than 1
  rotateSpeed = 0.5;

  var mainRoutine = function (frame) { // Runs on every frame
    handPos(frame); // all other actions
  }

  var takeoff = function () {
	$(".land").attr({visibility: 'hidden'})
	$(".flying").attr({visibility: ''})
	resetView();
  	flying = true; // enables actions to be published
  	return faye.publish("/drone/drone", {
      action: 'takeoff'
    });
   }
   
  var resetView = function () {
	$(".left").attr({id: ''})
	$(".right").attr({id: ''})
	$(".counterClockwise").attr({id: ''})
    $(".clockwise").attr({id: ''})
	$(".back").attr({id: ''})
	$(".front").attr({id: ''})
	$(".down").attr({id: ''})
	$(".up").attr({id: ''})
  }

  var land = function () {
	resetView();
	$(".land").attr({visibility: ''})
	$(".flying").attr({visibility: 'hidden'})
  	flying = false;	// prevents faye from publishing actions when drone has landed
  	return faye.publish("/drone/drone", {
      action: 'land'
    });
  }

  var handPos = function (frame) {
    var hands = frame.hands // leap detects all hands in field of vision
    if (hands.length === 0 && flying) {
      land();
    } else if (hands.length > 0){
      var handOne = hands[0]; // first hand.  Can add second hand
	  
	  //takeoff() when min 4 Fingers detected, land() when less than 4
	  if (handOne.fingers.length>3 && !flying) {
		takeoff();
	  } else if (handOne.fingers.length<4 && flying) {
		land();
	  }
	  
      var pos = handOne.palmPosition;  // tracks palm of first hand
       
	  var yaw;
	  yaw = handOne.yaw(); //deadzone 35°
	  
      var xPos = pos[0]; // position of hand on x axis
      var yPos = pos[1]; // position of hand on y axis
      var zPos = pos[2]; // position of hand on z axis

      var adjX = xPos / 250; // -1.5 to 1.5
      var adjXspeed = Math.abs(adjX)/ speedAdjuster; // left/right speed
      var adjY = (yPos - 60) / 500; // 0 to .8
      var adjYspeed = Math.abs(.4-adjY) // up/down speed 
      var adjZ = zPos / 250; // -2 to 2
      var adjZspeed = Math.abs(adjZ) / speedAdjuster; // front/back speed
	 
	  if (yaw < -0.2 && flying) {   //rotate conterclockwise
		speed = Math.abs(rotateSpeed * yaw);
		counterClockwise();
	  } else if (yaw > 0.2 && flying) {
		speed = Math.abs(rotateSpeed * yaw);
		clockwise();
	  } else {	//yaw or fly (Never both!!)
		  if (adjX < 0 && flying) { // flying set in takeoff() and land() to prevent actions while drone landed
			stopped = false;
			resetView();
			$(".left").attr({id: 'highlight'})
			setTimeout(function (){
			  return faye.publish("/drone/move", {
				  action: 'left',
				  speed: adjXspeed
					})
			}, timeout);
		  } else if (adjX > 0 && flying) {
			stopped = false;
			resetView();
			$(".right").attr({id: 'highlight'})
			setTimeout(function (){
			  return faye.publish("/drone/move", {
				action: 'right',
				speed: adjXspeed
				  })
			}, timeout);
		  }

		  if (adjY > 0.4 && flying) {
			stopped = false;
			resetView();
			$(".up").attr({id: 'highlight'})
			setTimeout(function (){
			  return faye.publish("/drone/move", {
				action: 'up',
				speed: adjYspeed
			  })
			}, timeout/2);
		  } else if (adjY < 0.4 && flying) {
			stopped = false;
			resetView();
			$(".down").attr({id: 'highlight'})
			setTimeout(function (){
			  return faye.publish("/drone/move", {
				action: 'down',
				speed: adjYspeed
				  })
			}, timeout/2);
		  }

		  if (adjZ < 0 && flying) {
			stopped = false;
			resetView();
			$(".front").attr({id: 'highlight'})
			setTimeout(function (){
			  return faye.publish("/drone/move", {
				action: 'front',
				speed: adjZspeed
				  })
			}, timeout/3);
		  } else if (adjZ > 0 && flying) {
			stopped = false;
			resetView();
			$(".back").attr({id: 'highlight'})
			setTimeout(function (){
			  return faye.publish("/drone/move", {
				action: 'back',
				speed: adjZspeed
				  })
			}, timeout/3);
		  }
	  }
    }
  }

  var counterClockwise = function () {
	resetView();
    $(".counterClockwise").attr({id: 'highlight'})
    faye.publish("/drone/move", {
      action: 'counterClockwise',
      speed: speed
    })
    setTimeout(function (){
      return faye.publish("/drone/drone", {
        action: 'stop'
      })
    }, timeout);
   };

  var clockwise = function () {
	resetView();
    $(".clockwise").attr({id: 'highlight'})
    faye.publish("/drone/move", {
      action: 'clockwise',
      speed: speed
    })
    setTimeout(function (){
      return faye.publish("/drone/drone", {
        action: 'stop'
      })
    }, timeout);
  }

  controller = new Leap.Controller({enableGestures: true});
  controller.connect();
  controller.on('frame', function (data) {
    mainRoutine(data)
  });

}).call(this);