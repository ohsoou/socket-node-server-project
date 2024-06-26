import {config} from "dotenv";

config();

export const redisConfig = {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
}

export const wsConfig = {
    url: process.env.WS_URL,
    port: process.env.WS_PORT,
}