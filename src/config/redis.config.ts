import { createClient } from "redis"

require("dotenv").config()

let redisClient = createClient({
    socket: {
        path: process.env.REDIS_SOCKET
    }
})
console.log(process.env)

redisClient.connect().catch(console.error).then((v) => {
    console.log(v)
})

redisClient.on('error', err => {
    console.log(JSON.stringify(redisClient, undefined, "\t")); console.log('Redis Client Error', err)});

export default redisClient