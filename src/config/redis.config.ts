import { createClient } from "redis"

let redisClient = createClient({
    socket: {
        path: process.env.REDIS_SOCKET
    }
})
console.log(process.env.REDIS_URL)

redisClient.connect().catch(console.error).then((v) => {
    console.log(v)
})

redisClient.on('error', err => {
    console.log(JSON.stringify(redisClient, undefined, "\t")); console.log('Redis Client Error', err)});

export default redisClient