export interface SocketEventData {
    room: string,
    userKey: string
}

export interface SocketData {
    socketId: string;
    namespace: string;
    clientId: string;
}