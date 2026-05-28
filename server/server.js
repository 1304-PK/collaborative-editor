const express = require("express")
const cors = require("cors")
const http = require("http")
const {Server} = require("socket.io")
require("dotenv").config()

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

// Handle connection events
io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`)

    socket.on("join-room", ({boardId, userId}) => {
        // space for authorization logic

        socket.join(boardId)
        socket.to(boardId).emit("user-connected", userId)
    })

    socket.on("whiteboard-update", ({changes, boardId}) => {
        socket.to(boardId).emit("whiteboard-update", changes)
    })
    socket.on("disconnect", () => {console.log(`User disconnected: ${socket.id}`)})
})

const PORT = process.env.PORT || 3000

server.listen(PORT, () => {console.log(`server started at port: ${PORT}`)})