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
    } else {
      const user = new User(socket, this, false)
      this.users.push(user)
      return user
    }
  }

  nextPhase() {
    switch (sessionPhases[this.phase]) {
      case "picking":
        if (
          this.users.every((user) => user.picks.length === this.maxPickCount)
        ) {
          this.phase++
        }
        break
      case "banning":
        if (this.users.every((user) => user.bans.length === this.maxBanCount)) {
          this.phase++
        }
        break
      case "holding":
        return "Vous avez verrouillé votre choix."
    }
  }

  update() {
    io.to(this.roomId).emit("updateBanRoom", {
      users: this.users.map((user) => ({
        picks: user.picks,
        bans: user.bans,
      })),
      phase: sessionPhases[this.phase],
      viewers: this.viewers.length,
    })
  }
}
