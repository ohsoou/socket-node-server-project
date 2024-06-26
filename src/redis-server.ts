import {createClient} from "redis";
import {redisConfig} from "./config";
import {SocketData} from "./types/socketIo";

const redisClient = createClient({
    url: `redis://${redisConfig.host}:${redisConfig.port}/0`,
    legacyMode: false
})

const deleteAllMatchedKeys = (pattern: string) => {
    let cursor = 0
    const recursiveFn = async () => {
        const reply = await redisClient.scan(cursor, {
            MATCH: pattern,
            COUNT: 100,
        })
        cursor = reply.cursor;

        if(reply.keys.length > 0) {
            await redisClient.unlink(reply.keys);
        }

        if(cursor === 0) {
            return console.log('initRedisViewer complete');
        } else {
            return recursiveFn();
        }
    }
    recursiveFn()
}
const getRedisKey = (value: string) => `visitor:${value}`
const onConnect = () => redisClient.connect().then(() => console.log("Redis client connected"))
const getRealViewers = async (data: SocketData) => {
    const socketIdList = await redisClient.sMembers(getRedisKey(data.namespace))
    const clientIdList = await Promise.all(socketIdList.map((socketId) => redisClient.hGet(getRedisKey(socketId), 'clientId')))

    return new Set(clientIdList).size
}


const saveViewerData = async (data: SocketData) => {
    await Promise.all(Object.entries(data).map(([key, value]) => redisClient.hSet(getRedisKey(data.socketId), key, value)))
    await redisClient.sAdd(getRedisKey(data.namespace), data.socketId)
}

const deleteViewerData = async (data: SocketData) => {
    await redisClient.sRem(getRedisKey(data.namespace), data.socketId)
    await redisClient.unlink(getRedisKey(data.socketId))
}

const initRedisViewer = async () => {
    deleteAllMatchedKeys("visitor:*")
}

export default {
    onConnect,
    saveViewerData,
    deleteViewerData,
    initRedisViewer,
    getRealViewers
};

