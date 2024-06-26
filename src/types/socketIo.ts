export interface ServerToClientEvents {
    noArg: () => void;
    basicEmit: (a: number, b: string, c: Buffer) => void;
    withAck: (d: string, callback: (e: number) => void) => void;
}

export interface ClientToServerEvents {
    hello: () => void;
}

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