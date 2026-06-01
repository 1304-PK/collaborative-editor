const getUserData = (roomData, boardId, userId) => {
    const user = roomData[boardId]?.find(user => user.userId === userId)
    return {userId: user?.userId, userEmail: user?.userEmail}
}

module.exports = getUserData