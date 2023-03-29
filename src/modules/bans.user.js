import gods from "../data/gods.json" assert { type: "json" }
import { sessionPhases } from "./bans.session.js"

export default class User {
  constructor(pseudo, socket, session, viewer) {
    this.requestNextPhase = false
    this.pseudo = pseudo
    this.socket = socket
    this.session = session
    this.viewer = viewer
    this.picks = []
    this.bans = []
  }

  get opponent() {
    return this.viewer
      ? null
      : this.session.users[Number(!this.session.users.indexOf(this))]
  }

  pick(god) {
    if (this.viewer)
      throw new Error(
        "Vous ne pouvez pas choisir de dieu en tant que spectateur."
      )

    if (this.picks.includes(god))
      throw new Error("Vous avez déjà choisi ce dieu.")

    if (!gods.includes(god)) throw new Error("Ce dieu n'existe pas.")

    if (this.picks.length >= this.session.maxPickCount)
      throw new Error("Vous avez déjà choisi le nombre maximum de dieux.")

    this.picks.push(god)
  }

  ban(god) {
    if (this.viewer)
      throw new Error(
        "Vous ne pouvez pas bannir de dieu en tant que spectateur."
      )

    if (this.bans.includes(god))
      throw new Error("Vous avez déjà banni ce dieu.")

    if (!gods.includes(god)) throw new Error("Ce dieu n'existe pas.")

    if (!this.opponent)
      throw new Error("Vous ne pouvez pas bannir de dieu pour le moment.")

    if (!this.opponent.picks.includes(god))
      throw new Error(
        "Vous ne pouvez pas bannir un dieu que votre adversaire n'a pas choisi."
      )

    if (this.bans.length >= this.session.maxBanCount)
      throw new Error("Vous avez déjà banni le nombre maximum de dieux.")

    this.bans.push(god)
  }

  unpick(god) {
    if (this.viewer)
      throw new Error(
        "Vous ne pouvez pas choisir de dieu en tant que spectateur."
      )

    if (!this.picks.includes(god))
      throw new Error("Vous n'avez pas choisi ce dieu.")

    if (!gods.includes(god)) throw new Error("Ce dieu n'existe pas.")

    this.picks.splice(this.picks.indexOf(god), 1)
  }

  unban(god) {
    if (this.viewer)
      throw new Error(
        "Vous ne pouvez pas bannir de dieu en tant que spectateur."
      )

    if (!this.bans.includes(god))
      throw new Error("Vous n'avez pas banni ce dieu.")

    if (!gods.includes(god)) throw new Error("Ce dieu n'existe pas.")

    this.bans.splice(this.bans.indexOf(god), 1)
  }

  nextPhase() {
    switch (sessionPhases[this.session.phase]) {
      case "picking":
        if (
          this.session.users.every(
            (user) => user.picks.length === this.session.maxPickCount
          )
        ) {
          this.requestNextPhase = true
        } else
          throw new Error(
            "Vous et votre adversaire devez avoir choisi tous vos dieux."
          )
        break
      case "banning":
        if (
          this.session.users.every(
            (user) => user.bans.length === this.session.maxBanCount
          )
        ) {
          this.requestNextPhase = true
        } else
          throw new Error(
            "Vous et votre adversaire devez avoir banni asez de dieux."
          )
        break
      case "holding":
        throw new Error("Vous avez verrouillé votre choix.")
    }

    if (this.opponent.requestNextPhase) {
      this.session.nextPhase()
    }
  }

  toJSON() {
    return {
      pseudo: this.pseudo,
      picks: this.picks,
      bans: this.bans,
    }
  }
}
