import express from "express"
import * as uuid from "uuid"

import Session from "./bans.session.js"

export const router = express.Router()

router.get("/", (req, res) => {
  res.render("pages/bans-no-room")
})

router.get("/:roomId", (req, res) => {
  res.render("pages/bans-room", {
    roomId: req.params.roomId,
    maxBanCount: Number(req.query.maxBanCount ?? 1),
    maxPickCount: Number(req.query.maxPickCount ?? 3),
    username: req.query.username ?? uuid.v4(),
  })
})

export const onConnection = (socket) => {
  let user = null
  let session = null

  socket.on("joinBanRoom", (data) => {
    // define room name
    const roomId = data.roomId || uuid.v4()

    // join room
    socket.join(roomId)

    session =
      Session.all.find((session) => session.roomId === roomId) ??
      new Session(roomId, data.maxPickCount, data.maxBanCount)

    try {
      // create user in session
      user = session.addUser(socket, data.username)

      // update info on other clients in room
      session.update()
    } catch (error) {
      socket.emit("error", error.message)
    }
  })

  socket.on("pickGod", ({ god }) => {
    try {
      user?.pick(god)
      session?.update()
    } catch (error) {
      socket.emit("error", error.message)
    }
  })

  socket.on("banGod", ({ god }) => {
    try {
      user?.ban(god)
      session?.update()
    } catch (error) {
      socket.emit("error", error.message)
    }
  })

  socket.on("unbanGod", ({ god }) => {
    try {
      user?.unban(god)
      session?.update()
    } catch (error) {
      socket.emit("error", error.message)
    }
  })

  socket.on("unpickGod", ({ god }) => {
    try {
      user?.unpick(god)
      session?.update()
    } catch (error) {
      socket.emit("error", error.message)
    }
  })

  socket.on("requestNextPhase", () => {
    try {
      user?.nextPhase()
    } catch (error) {
      socket.emit("error", error.message)
    }
  })

  socket.on("disconnect", () => {
    session?.removeUser(socket)
  })
}
