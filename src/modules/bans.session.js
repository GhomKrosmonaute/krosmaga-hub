import User from "./bans.user.js"
import { io } from "../app.js"

export const sessionPhases = ["picking", "banning", "holding"]

export default class Session {
  static all = []

  constructor(roomId, godPickCount, godBanCount) {
    this.roomId = roomId
    this.users = []
    this.viewers = []
    this.maxBanCount = godBanCount
    this.maxPickCount = godPickCount
    this.phase = 0

    Session.all.push(this)
  }

  addUser(socket) {
    if (this.users.length >= 2) {
      const user = new User(socket, this, true)
      this.viewers.push(user)
      return user
    } else if (this.users.length >= 16) {
      throw new Error("La salle est pleine.")
    } else {
      const user = new User(socket, this, false)
      this.users.push(user)
      return user
    }
  }

  removeUser(socket) {
    const user = this.users.find((user) => user.socket === socket)
    const viewer = this.viewers.find((user) => user.socket === socket)

    if (user) {
      this.users.splice(this.users.indexOf(user), 1)

      this.update()

      if (this.users.length === 0) {
        this.destroy()
      }
    } else if (viewer) {
      this.viewers.splice(this.viewers.indexOf(viewer), 1)

      this.update()
    }
  }

  nextPhase() {
    switch (sessionPhases[this.phase]) {
      case "picking":
        if (
          this.users.every((user) => user.picks.length === this.maxPickCount)
        ) {
          this.phase++
        } else
          throw new Error(
            "Vous et votre adversaire devez avoir choisi tous vos dieux."
          )
        break
      case "banning":
        if (this.users.every((user) => user.bans.length === this.maxBanCount)) {
          this.phase++
        } else
          throw new Error(
            "Vous et votre adversaire devez avoir banni asez de dieux."
          )
        break
      case "holding":
        throw new Error("Vous avez verrouillé votre choix.")
    }

    this.users.forEach((user) => (user.requestNextPhase = false))
  }

  update() {
    io.to(this.roomId).emit("updateBanRoom", this.toJSON())
  }

  destroy() {
    Session.all.splice(Session.all.indexOf(this), 1)

    io.to(this.roomId).emit("destroyBanRoom")
    io.to(this.roomId).disconnectSockets(true)
  }

  toJSON() {
    return {
      users: this.users.map((user) => user.toJSON()),
      viewers: this.viewers.map((user) => user.toJSON()),
      phase: sessionPhases[this.phase],
    }
  }
}
