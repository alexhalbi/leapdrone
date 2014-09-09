@echo off
echo Starting Server...
start node.exe server.js
ping -n 5 127.0.0.1  | find "Reply" > nul
echo Starting Browser...
start http://127.0.0.1:3000
echo Ready to fly!