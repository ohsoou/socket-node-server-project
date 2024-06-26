export interface SocketEventData {
    eventName: string,
    room: string,
    userKey: string
}

export interface SocketData {
    socketId: string;
    namespace: string;
    clientId: string;
}