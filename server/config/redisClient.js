const { Redis } = require("ioredis")
require("dotenv").config()

let redisUrl = process.env.REDIS_URL

if (!redisUrl && process.env.UPSTASH_REDIS_REST_URL && process.env.REDIS_TOKEN) {
    const host = process.env.UPSTASH_REDIS_REST_URL.replace(/^https?:\/\//, '').replace(/\/$/, '')
    redisUrl = `rediss://default:${process.env.REDIS_TOKEN}@${host}:6379`
}

const redis = new Redis(redisUrl || "redis://localhost:6379", {
    tls: redisUrl?.startsWith("rediss://") ? { rejectUnauthorized: false } : undefined,
    maxRetriesPerRequest: null
})

redis.on("connect", () => {
    console.log("connected to redis")
})

redis.on("error", (error) => {
    console.log("Redis error: ", error)
})

module.exports = redis