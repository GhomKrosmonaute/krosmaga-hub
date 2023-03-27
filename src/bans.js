import io from "./app/socketIO.js"
import uuid from "uuid"

/**
 * @type {Object & {
 *   [roomId: string]: import("socket.io").Socket[]
 * }}
 */
const banRooms = {}

io.on("connection", (socket) => {
  socket.on("createRoom", () => {
    const roomId = uuid.v4()

    banRooms[roomId] = [socket]

    socket.emit("createRoom", { roomId, success: true })
  })

  socket.on("joinBanRoom", (roomId) => {
    const room = banRooms[roomId]

    if (!room) {
      return socket.emit("joinBanRoom", {
        success: false,
        message: "Aucune session de bans ne possède cet identifiant.",
      })
    }

    if (banRooms[roomId].length > 1) {
      return socket.emit("joinBanRoom", {
        success: false,
        message: "Cette session de bans est déjà occupée par deux joueurs.",
      })
    }

    banRooms[roomId].push(socket)

    socket.session = roomId

    socket.join(roomId)

    socket.emit("opponentHasArrived", banRooms[roomId].length)
    socket.broadcast
      .to(roomId)
      .emit("opponentHasArrived", banRooms[roomId].length)

    socket.on("disconnect", () => {
      banRooms[socket.session] = banRooms[socket.session].filter(
        (s) => s !== socket
      )

      socket.broadcast
        .to(socket.session)
        .emit("opponentIsGone", banRooms[roomId].length)

      if (banRooms[socket.session].length === 0) delete banRooms[socket.session]
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
