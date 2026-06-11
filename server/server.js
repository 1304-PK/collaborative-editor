const express = require("express")
const cors = require("cors")
const http = require("http")
const { Server } = require("socket.io")
require("dotenv").config()
const supabaseAdmin = require("./config/supabaseClient")

const genRandomColor = require("./utils/genRandomColor")
const getUserData = require("./utils/getUserData")

const { getUserRole } = require("./db/collaborators")

// Import routes
const boardRoute = require("./routes/boardRoutes")

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

// Cors config
const corsConfig = {
    origin: [
        "http://localhost:5173",
        "http://localhost:5174"
    ],
    credentials: true
}

app.use(cors(corsConfig))

// ----- REST API ENDPOINTS -----

app.use("/api/board", boardRoute)



// SOCKET.IO middlewares
// io.use(async (socket, next) => {
//     try {
//         const token = socket.handshake.auth.token
//         const boardId = socket.handshake.auth.boardId

//         const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)

//         if (error || !user) throw new Error("User doesn't exist")

//         socket.user = user
//         const role = getUserRole(boardId, socket.user.id)

//         socket.user.role = role

//         next()
//     }
//     catch(err){
//         return next(new Error(err))
//     }
// })


// SOCKET.IO connection events
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

    // Event for displaying notification for user leaving
    socket.on("user-disconnect", ({ boardId, userId }) => {
        const { userEmail } = getUserData(roomData, boardId, userId)
        socket.to(boardId).emit("user-disconnect-notif", (userEmail))
    })

    socket.on("whiteboard-update", ({ changes, boardId, userId }) => {
        const { userColor, userEmail } = getUserData(roomData, boardId, userId)
        socket.to(boardId).emit("whiteboard-update", { changes, userColor, userEmail })
        console.log(roomData)
    })

    // Logic to remove user from Room Data on disconnecting
    socket.on("user-disconnect", ({ boardId, userId }) => {
        if (!roomData[boardId]) return

        roomData[boardId] = roomData[boardId].filter(user => user.userId != userId)
    })

    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`)
    })
})

const PORT = process.env.PORT || 3000

server.listen(PORT, () => { console.log(`server started at port: ${PORT}`) })