"use strict";
//console.log = function () {};
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/velociti');
const User = require('./models/userModel');
const Request = require('./models/requestModel');
const app = express();
app.use(express.static(__dirname + '/public'));
module.exports = app;
require("./config/myPassport");


let port = 5000;
app.server = app.listen(port, () => {
    // interpolating variable into string
    console.log(`-=-=-=-=-= VELOCITI -=-=-=-=-= 
Started on port: ${ port}`, Date.now());
});

let io = require("socket.io");
let socketServer = io(app.server);

let loggedInUsers = {};

User.find({}).limit(10).exec((err, users) => {
    users.forEach( el => loggedInUsers[el._id] = el);
});

let allRequests = {};

socketServer.use((socket, next) => {
    app.sessionMiddleware(socket.request, {}, next);
});


socketServer.on("connection", socket => {
    console.log("NEW SOCKET CONNECTION Adress: ", socket.handshake.address);
    let apiMe = "there";
    socket.emit('apiMe', apiMe);
    if (socket.request.session && socket.request.session.passport && socket.request.session.passport.user) {

        apiMe = socket.request.session.passport.user;
        socket.emit('apiMe', apiMe);
        console.log("UserId Logged In", apiMe);
        console.log(" ");

        socket.on("newRequest", (incoming)=>{
            console.log(incoming);
            console.log(" ");
            let newRequest = {};
            newRequest.firstName = incoming.firstName;
            newRequest.lastName = incoming.lastName;
            newRequest.what = incoming.what;
            newRequest.email = incoming.email;
            newRequest.cell = incoming.cell;
            newRequest.lat = incoming.lat;
            newRequest.lon = incoming.lon;
            newRequest.timeStamp = incoming.timeStamp;
            newRequest.pictureMd = incoming.pictureMd;

            allRequests[incoming.timeStamp] = newRequest;
            socketServer.emit('allRequests', allRequests);
        });
        socket.emit('allRequests', allRequests);

        socket.on('deleteRequest', (request) => {
            delete allRequests[request.timeStamp];
            socketServer.emit('allRequests', allRequests);
        });

        User.findById(apiMe,(error, userDoc)=> {
            console.log(userDoc);
            userDoc.password = null;
            loggedInUsers[apiMe] = userDoc;
            socket.emit('apiMe', userDoc);
            socketServer.emit('allUsers', loggedInUsers);
        });


        socket.on("myLocation", userLocation => {
            console.log("hey hey hey " ,userLocation);
            if (apiMe) {
                loggedInUsers[apiMe].lat = userLocation.lat;
                loggedInUsers[apiMe].lon = userLocation.lon;
                loggedInUsers[apiMe].timeStamp = userLocation.timeStamp;
            }
            socketServer.emit('allUsers', loggedInUsers);
        });
        socket.on('disconnect', () =>{
            console.log('user disconnected');
            delete loggedInUsers[apiMe];
            socketServer.emit('allUsers', loggedInUsers);
        });


    }
});