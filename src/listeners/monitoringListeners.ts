import {SocketData, SocketEventData} from "../types/socketIo";
import {SOCKET} from "../constants/socket";
import {Server, Socket} from "socket.io";
import redisServer from "../redis-server";

export default (io: Server, socket: Socket) => {
    const onViewerReceived = async (data: SocketEventData) => {
        const socketData:SocketData = {
            socketId: socket.id,
            namespace: socket.nsp.name,
            clientId: data.userKey
        }

        socket.data = data
        socket.join(data.room);

        // :: redis get real viewer
        await redisServer.saveViewerData(socketData)
        const count = await redisServer.getRealViewers(socketData)

        // :: get viewer connected socket
        // const allSockets = await socket.nsp.fetchSockets();
        // const count = allSockets.length
        socket.nsp.emit(SOCKET.EVENT.GET_COUNT, count);
    }
    const onViewerLeaved = async () => {
        console.log("disconnected socketId:" + socket.id);

        const socketData:SocketData = {
            socketId: socket.id,
            namespace: socket.nsp.name,
            clientId: socket.data.userKey
        }
        socket.leave(socket.data.room);

        // :: redis get real viewer
        await redisServer.deleteViewerData(socketData)
        const count = await redisServer.getRealViewers(socketData)

        // :: get viewer connected socket
        // const allSockets = await socket.nsp.fetchSockets();
        // const count = allSockets.length
        socket.nsp.emit(SOCKET.EVENT.GET_COUNT, count);
    }

    socket.on(SOCKET.EVENT.ADD_VIEWER, onViewerReceived)
    socket.on(SOCKET.DISCONNECT, onViewerLeaved)
}



