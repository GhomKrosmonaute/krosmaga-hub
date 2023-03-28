import express from "express"
import * as uuid from "uuid"

import Session from "./bans.session"

export const router = express.Router()

router.get("/", (req, res) => {
  res.render("pages/bans-no-room")
})

router.get("/:roomId", (req, res) => {
  res.render("pages/bans-room", {
    roomId: req.params.roomId,
    maxBanCount: Number(req.query.maxBanCount ?? 1),
    maxPickCount: Number(req.query.maxPickCount ?? 3),
  })
})

/**
 * @type {Session[]}
 */
const sessions = []

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

    // create user in session
    user = session.addUser(socket)

    // update info on other clients in room
    session.update()
  })

  socket.on("pickGod", ({ god }) => {
    user?.pick(god)
    session?.update()
  })

  socket.on("banGod", ({ god }) => {
    user?.ban(god)
    session?.update()
  })

  socket.on("disconnect", () => {
    // todo: remove user from session
    //  if session is empty, remove session
  })
}
