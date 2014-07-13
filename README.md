location-based-communication-webapp
===================================

<ow to build>

$ mkdir -p nodejs/location-based-communication-webapp
$ cd nodejs/location-based-communication-webapp

$ sudo npm install n -g
$ sudo n stable
$ node -v
v0.10.29

$ npm config set registry http://registry.npmjs.org/
$ sudo npm install socket.io
$ sudo npm install mongodb
$ sudo npm install mongoose

$ mkdir -P data/mongo
$ mongod --dbpath /Users/owner1/Documents/data/mongo
$ node app.js
