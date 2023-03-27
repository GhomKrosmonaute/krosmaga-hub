import express from "express"
import { Server } from "socket.io"

const app = express()
const io = new Server()

app.use(express.static("public"))

const sessions = {}

io.on("connection", (socket) => {
  const sessionsInfo = {}
  for (const name in sessions) sessionsInfo[name] = sessions[name].length

  socket.emit("connection", sessionsInfo)

  socket.on("boardResponse", (board) => {
    sessions[socket.session][sessions[socket.session].length - 1].emit(
      "boardUpdate",
      board
    )
  })

  socket.on("login", (session) => {
    socket.session = session
    if (!sessions[session]) {
      sessions[session] = [socket]
    } else {
      sessions[session].push(socket)
    }

    const length = sessions[session].length
    if (length > 1) {
      sessions[session][0].emit("boardRequest")
    } else {
      socket.emit("init")
    }

    socket.emit("player", sessions[session].length < 3)

    socket.join(session)

    socket.emit("userCountUpdate", sessions[session].length)
    socket.broadcast
      .to(session)
      .emit("userCountUpdate", sessions[session].length)

    socket.on("disconnect", () => {
      sessions[socket.session] = sessions[socket.session].filter(
        (s) => s !== socket
      )
      socket.broadcast
        .to(socket.session)
        .emit("userCountUpdate", sessions[session].length)
      if (sessions[socket.session].length === 0) delete sessions[socket.session]
    })

    socket.on("moveTo", (id, pos, dLog) => {
      socket.emit("moveTo", id, pos, dLog)
      socket.broadcast.to(socket.session).emit("moveTo", id, pos, dLog)
    })

    socket.on("reset", () => {
      socket.emit("reset")
      socket.broadcast.to(socket.session).emit("reset")
    })

    socket.on("ajuste", (id) => {
      socket.emit("ajuste", id)
      socket.broadcast.to(socket.session).emit("ajuste", id)
    })

    socket.on("eat", (eaterId, id) => {
      socket.emit("eat", eaterId, id)
      socket.broadcast.to(socket.session).emit("eat", eaterId, id)
    })

    socket.on("message", (text, color) => {
      socket.emit("message", text, color)
      socket.broadcast.to(socket.session).emit("message", text, color)
    })
  })
})

app.listen(3000, () => {
  console.log("listening on localhost:3000")
})
