const {Redis} = require("ioredis")
require("dotenv").config()

const redisUrl = process.env.REDIS_URL
const redis = new Redis(redisUrl || "http://localhost:6379")

redis.on("connect", () => {
    console.log("connected to redis")
})

redis.on("error", (error) => {
    console.log("Redis error: ", error)
})

module.exports = redis