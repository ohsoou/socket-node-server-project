import {config} from "dotenv";

config();

export const CONFIG = {
    REDIS: {
        HOST: process.env.REDIS_HOST,
        PORT: process.env.REDIS_PORT,
    },
    WS: {
        URL: process.env.WS_URL,
        PORT: process.env.WS_PORT,
    }
}