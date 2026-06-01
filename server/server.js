const express = require("express")
const cors = require("cors")
const http = require("http")
const { Server } = require("socket.io")
require("dotenv").config()

const genRandomColor = require("./utils/genRandomColor")
const getUserData = require("./utils/getUserData")

// Initialize express
const app = express()

// Http server
const server = http.createServer(app)

// Initialize Socket.io server
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", "http://localhost:5174"],
        methods: ["GET", "POST"]
    }
})

const roomData = {

}

// Handle connection events
io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`)

    socket.on("join-room", ({ boardId, userId, userEmail }) => {
        // space for authorization logic

        // Save user email and id in roomData
        const userColor = genRandomColor()
        if (!roomData[boardId]) {
            roomData[boardId] = [
                {
                    userId: userId,
                    userEmail: userEmail,
                    userColor: userColor
                }
            ]
        }
        else {
            roomData[boardId].push({
                userId: userId,
                userEmail: userEmail,
                userColor: userColor
            })
        }

        socket.join(boardId)
        socket.to(boardId).emit("user-connected", { userId, userEmail, userColor })
    })

    socket.on("whiteboard-update", ({ changes, boardId, userId }) => {
        const { userColor, userEmail } = getUserData(roomData, boardId, userId)
        socket.to(boardId).emit("whiteboard-update", { changes, userColor, userEmail })
        console.log(roomData)
    })

    // Logic to remove user from Room Data on disconnecting
    socket.on("user-disconnect", ({boardId, userId}) => {
        if (!roomData[boardId]) return
        
        roomData[boardId] = roomData[boardId].filter(user => user.userId != userId)
    })

    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`)
    })
})

const PORT = process.env.PORT || 3000

server.listen(PORT, () => { console.log(`server started at port: ${PORT}`) })