Description
=======================

Control an AR Drone 2.0 using a Leap Motion / keyboard and display video & control visualization in browser.
This Version is compatible with Windows and has a run.bat which executes everything which is needed for an easier use.

The Code is a fork from a project of Daniel @liebeskind 

How to Fly
=======================

1. Run the run.bat
2. Hold hand above Leap Motion controller (with closed fingers)
3. To takeoff, open your hand above the controller
4. Move hand right to move drone right, up to move drone up and forward to move drone forward
5. To rotate, rotate your Hand in the same direction the drone should rotate
6. To land, simply put your fingers together and take the hand away

Stack
=======================

Node.js for server
Express for web app deployment
Faye for publishing and subscribing between leap, server and drone
Leap.js for converting leap motions into javascript
jQuery for browser displays and accessing keypresses for optional keyboard controls

Learn More
=======================

http://wp.me/p2BKrb-4k - Read my blog post about why I did this and what I hope for the future

YouTube Video of Drone in Flight
=======================

http://youtu.be/hfq2SisPvCU

Thanks
=======================

Thank to Daniel @liebeskind for the main source code which I have improved.
Thanks to @phillipalexander for introducing me to Faye, @felixge for AR-Drone and @bkw for Dronestream
