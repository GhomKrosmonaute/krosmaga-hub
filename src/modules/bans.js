import express from "express"
import * as uuid from "uuid"
import gods from "../data/gods.json"

export const router = express.Router()

router.get("/", (req, res) => {
  res.render("pages/bans-no-room")
})

router.get("/:roomId", (req, res) => {
  res.render("pages/bans-room", { roomId: req.params.roomId })
})

export const onConnection = (socket) => {
  let ctx = createContext()

  socket.on("joinBanRoom", ({ roomId, godPickCount, godBanCount }) => {
    ctx.roomId = roomId || uuid.v4()
    socket.join(ctx.roomId)
    ctx.godPickCount = Number(godPickCount) || 3
    ctx.godBanCount = Number(godBanCount) || 1
    ctx.room = socket.to(roomId)
    ctx.room.emit("updateBanRoom", ctx)
  })

  socket.on("pickGod", (god) => {
    if (!ctx.roomId)
      return socket.emit("pickGod", {
        error: "Erreur, veuillez recharger la page.",
      })

    if (ctx.gods.includes(god))
      return socket.emit("pickGod", { error: "Vous avez déjà choisi ce dieu." })

    if (!gods.includes(god))
      return socket.emit("pickGod", { error: "Ce dieu n'existe pas." })

    if (ctx.gods.length >= ctx.godPickCount)
      return socket.emit("pickGod", {
        error: "Vous avez déjà choisi le nombre maximum de dieux.",
      })

    ctx.gods.push(god)
    ctx.room.emit("updateBanRoom", ctx)
  })

  socket.on("banGod", (god) => {
    if (!ctx.roomId)
      return socket.emit("banGod", {
        error: "Erreur, veuillez recharger la page.",
      })

    if (ctx.bannedGods.includes(god))
      return socket.emit("banGod", { error: "Vous avez déjà banni ce dieu." })

    if (!gods.includes(god))
      return socket.emit("banGod", { error: "Ce dieu n'existe pas." })

    if (ctx.bannedGods.length >= ctx.godBanCount)
      return socket.emit("banGod", {
        error: "Vous avez déjà banni le nombre maximum de dieux.",
      })

    ctx.bannedGods.push(god)
    ctx.room.emit("updateBanRoom", ctx)
  })

  socket.on("disconnect", () => {
    ctx = createContext()
  })
}

function createContext() {
  return {
    godBanCount: 1,
    godPickCount: 3,
    roomId: null,
    room: null,
    gods: [],
    bannedGods: [],
  }
}
