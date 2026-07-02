const getUserData = (roomData, boardId, userId) => {
    const user = roomData[boardId]?.find(user => user.userId === userId)
    return {userColor: user?.userColor}
}

module.exports = getUserData