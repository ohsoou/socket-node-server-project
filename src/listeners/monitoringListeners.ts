import {SocketData, SocketEventData} from "../types/socketIo";
import {SOCKET} from "../constants/socket";
import {Server, Socket} from "socket.io";
import redisServer from "../redis-server";

export default (io: Server, socket: Socket) => {
    const onViewerReceived = async (data: SocketEventData) => {
        socket.data = data
        socket.join(data.room);

        const count = await basicVersion.received(socket)
        // const count = await simpleVersion.received(socket)

        socket.nsp.emit(SOCKET.EVENT.GET_COUNT, count);
    }
    const onViewerLeaved = async () => {
        console.log("disconnected socketId:" + socket.id);
        socket.leave(socket.data.room);

        const count = await basicVersion.leaved(socket)
        // const count = await simpleVersion.leaved(socket)

        socket.nsp.emit(SOCKET.EVENT.GET_COUNT, count);
    }

    socket.on(SOCKET.EVENT.ADD_VIEWER, onViewerReceived)
    socket.on(SOCKET.DISCONNECT, onViewerLeaved)
}

// :: get viewer connected socket
const simpleVersion = {
    received: async (socket: Socket) => {
        const allSockets = await socket.nsp.fetchSockets();
        return allSockets.length
    },
    leaved: async (socket: Socket) => {
        const allSockets = await socket.nsp.fetchSockets();
        return allSockets.length
    }
}
// :: redis get real viewer
const basicVersion = {
    received: async (socket: Socket) => {
        const socketData:SocketData = {
            socketId: socket.id,
            namespace: `${socket.nsp.name.split(/(\/\w*)/)[1]}:${socket.data.room}`,
            clientId: socket.data.userKey
        }

        await redisServer.saveViewerData(socketData)
        return await redisServer.getRealViewers(socketData)
    },
    leaved: async (socket: Socket) => {
        const socketData:SocketData = {
            socketId: socket.id,
            namespace: `${socket.nsp.name.split(/(\/\w*)/)[1]}:${socket.data.room}`,
            clientId: socket.data.userKey
        }

        await redisServer.deleteViewerData(socketData)
        return await redisServer.getRealViewers(socketData)
    }
}


