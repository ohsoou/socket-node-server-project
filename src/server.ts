import express, {Express} from "express";
import {createServer} from "node:http";
import {Server} from "socket.io";
import redisServer from "./redis-server";
import {CONFIG} from "./constants/config";
import monitoringListeners from "./listeners/monitoringListeners";

(async () => {
    await redisServer.onConnect()
    await redisServer.initRedisViewer()

    const app: Express = express();
    const httpServer = createServer(app);
    const io = new Server(httpServer, {
        transports: ["websocket"],
        path: "/socket.io"
    });

    const roomNamespace = io.of(/^\/room\/\d+$/)
// const roomNamespace = io.of('/room')

    roomNamespace.on("connection", (socket) => {
        console.log("connected socketId:" + socket.id);
        monitoringListeners(io, socket)
    })

    httpServer.listen(CONFIG.WS.PORT);
})();

