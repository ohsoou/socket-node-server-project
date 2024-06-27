import express from "express";
import {createServer} from "node:http";
import {Server} from "socket.io";
import redisServer from "./redis-server";
import {CONFIG} from "./constants/config";
import monitoringListeners from "./listeners/monitoringListeners";
import cluster from "node:cluster";
import {cpus} from "node:os";
import {setupMaster, setupWorker} from "@socket.io/sticky";
import {setupPrimary} from "@socket.io/cluster-adapter";
import {createClient} from "redis";
import {createShardedAdapter} from "@socket.io/redis-adapter";

(async () => {
    const CPU_NUMBER = cpus().length
    await redisServer.onConnect()
    if (cluster.isPrimary) {
        console.log(`Master ${process.pid} is running`);
        await redisServer.initRedisViewer()

        const httpServer = createServer(express());

        setupMaster(httpServer, {
            loadBalancingMethod: "least-connection", // either "random", "round-robin" or "least-connection"
        });

        setupPrimary();

        httpServer.listen(CONFIG.WS.PORT);

        for (let i = 0; i < 5; i++) {
            cluster.fork();
        }

        cluster.on("exit", (worker) => {
            console.log(`Worker ${worker.process.pid} died`);
            cluster.fork();
        });
    } else {
        console.log(`Worker ${process.pid} started`);

        const pubClient = createClient({
            url: `redis://${CONFIG.REDIS.HOST}:${CONFIG.REDIS.PORT}/0`
        });
        const subClient = pubClient.duplicate();

        await Promise.all([
            pubClient.connect(),
            subClient.connect()
        ]);

        const httpServer = createServer(express());
        const io = new Server(httpServer, {
            transports: ["websocket"],
            path: "/socket.io",
            adapter: createShardedAdapter(pubClient, subClient)
        });

        // io.adapter(createAdapter());
        setupWorker(io);


        const roomNamespace = io.of(/^\/room\/\d+$/)
        roomNamespace.on("connection", (socket) => {
            console.log("connected socketId:" + socket.id);
            monitoringListeners(io, socket)
        });
    }
})();


