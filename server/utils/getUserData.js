const redis = require("../config/redisClient")

const getUserData = async (boardId, userId) => {
    // const user = roomData[boardId]?.find(user => user.userId === userId)
    // return {userColor: user?.userColor}
    const result = await redis.hget(`room:${boardId}`, userId)
    const {userColor} = JSON.parse(result)
    return userColor
}

module.exports = getUserData