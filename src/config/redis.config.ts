import { createClient } from "redis"

let redisClient = createClient({
    url: process.env.REDIS_URL
})
redisClient.connect().catch(console.error)

redisClient.on('error', err => console.log('Redis Client Error', err));

export default redisClient