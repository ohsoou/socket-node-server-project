import express, {Express} from "express";
import {createServer} from "node:http";
import {Server} from "socket.io";
import redisServer from "./redis-server";
import {wsConfig} from "./config";
import {SocketData, SocketEventData} from "./types/socketIo";


const app:Express = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    transports: ["websocket"],
    path: "/socket.io"
});

(async() => {
    await redisServer.onConnect()
    await redisServer.initRedisViewer()
})();

const roomNamespace = io.of(/^\/room\/\d+$/)
// const roomNamespace = io.of('/room')

roomNamespace.on("connection", (socket) => {
    console.log("connected socketId:" + socket.id);
    socket.on("addViewer", async (data: SocketEventData) => {
        const socketData:SocketData = {
            socketId: socket.id,
            namespace: socket.nsp.name,
            clientId: data.userKey
        }

        socket.data = data
        socket.join(data.room);
        await redisServer.saveViewerData(socketData)

        // const count = await redisServer.getRealViewers(socketData)
        const allSockets = await socket.nsp.fetchSockets();
        const count = allSockets.length
        socket.nsp.emit("getCount", count);
    })

    socket.on("disconnect",async (reason) => {
        const socketData:SocketData = {
            socketId: socket.id,
            namespace: socket.nsp.name,
            clientId: socket.data.userKey
        }

        socket.leave(socket.data.room);
        console.log("disconnected socketId:" + socket.id);
        await redisServer.deleteViewerData(socketData)

        // const count = await redisServer.getRealViewers(socketData)
        const allSockets = await socket.nsp.fetchSockets();
        const count = allSockets.length
        socket.nsp.emit("getCount", count);
    })
})



httpServer.listen(wsConfig.port);
