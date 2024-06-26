"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var node_http_1 = require("node:http");
var socket_io_1 = require("socket.io");
var express = require("express");
var app = express();
var httpServer = (0, node_http_1.createServer)(app);
var io = new socket_io_1.Server(httpServer, {});
io.on("connection", function (socket) {
    console.log("Connected to the server");
});
httpServer.listen(3030);
