const express = require("express")
const cors = require("cors")
const http = require("http")
const { Server } = require("socket.io")
require("dotenv").config()
const supabaseAdmin = require("./config/supabaseClient")
const redis = require("./config/redisClient")

const genRandomColor = require("./utils/genRandomColor")
const getUserData = require("./utils/getUserData")

const { getUserRole } = require("./db/collaborators")

// Import routes
const boardRoute = require("./routes/boardRoutes")
const shareRoute = require("./routes/shareRoutes")

// Initialize express
const app = express()


// Http server
const server = http.createServer(app)

const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',')

// Initialize Socket.io server
const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"]
    }
})

const roomData = {

}

// Cors config
const corsConfig = {
    origin: allowedOrigins,
    credentials: true
}

app.use(cors(corsConfig))
app.use(express.json())

// ----- REST API ENDPOINTS -----

app.use("/api/board", boardRoute)
app.use("/api/share", shareRoute)



// SOCKET.IO middlewares
io.use(async (socket, next) => {
    try {
        const token = socket.handshake.auth.token
        const boardId = socket.handshake.auth.boardId

        const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)

        if (error || !user) throw new Error("User doesn't exist")

        socket.user = user

        const role = await getUserRole(boardId, socket.user.id)

        if (!role) return next(new Error("Not a collaborator for the board"))

        socket.user.role = role
        console.log(socket.user)
        next()
    }
    catch (err) {
        return next(new Error(err))
    }
})


// SOCKET.IO connection events
io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`)
    const user = socket.user

    socket.on("join-room", ({ boardId }) => {
        // space for authorization logic

        // Generate random color for the user
        const userColor = genRandomColor()
        // if (!roomData[boardId]) {
        //     roomData[boardId] = [
        //         {
        //             userId: user.id,
        //             userEmail: user.email,
        //             userColor: userColor
        //         }
        //     ]
        // }
        // else {
        //     roomData[boardId].push({
        //         userId: user.id,
        //         userEmail: user.email,
        //         userColor: userColor
        //     })
        // }
        
        // Storing user data in redis hashmap
        redis.hset(
            `room:${boardId}`,
            user.id,
            JSON.stringify({
                userEmail: user.email,
                userColor: userColor
            })
        )

        socket.join(boardId)
        socket.to(boardId).emit("user-connected", { userId: user.id, userEmail: user.email, userColor })
    })

    // Event for displaying notification for user leaving
    socket.on("user-disconnect", ({ boardId }) => {
        socket.to(boardId).emit("user-disconnect-notif", (user.email))
    })

    socket.on("whiteboard-update", async ({ changes, boardId }, callback) => {

        if (!(['editor', 'owner'].includes(user.role))) {
            return callback({
                ok: false,
                error: "Viewer can't edit board"
            })
        }

        const userColor = await getUserData(boardId, user.id)
        socket.to(boardId).emit("whiteboard-sync", { changes, userColor, userEmail: user.email })
    })

    // Logic to remove user from Room Data on disconnecting
    socket.on("user-disconnect", async ({ boardId }) => {
        // if (!roomData[boardId]) return
        
        // roomData[boardId] = roomData[boardId].filter(user => user.userId != user.id)
        await redis.hdel(`room:${boardId}`, user.id)
    })

    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`)
    })
})

const PORT = process.env.PORT || 3000

server.listen(PORT, () => { console.log(`server started at port: ${PORT}`) })