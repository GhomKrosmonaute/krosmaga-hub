import gods from "../data/gods.json" assert { type: "json" }

export default class User {
  constructor(socket, session, viewer) {
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
      return "Vous ne pouvez pas choisir de dieu en tant que spectateur."

    if (this.picks.includes(god)) return "Vous avez déjà choisi ce dieu."

    if (!gods.includes(god)) return "Ce dieu n'existe pas."

    if (this.picks.length >= this.session.maxPickCount)
      return "Vous avez déjà choisi le nombre maximum de dieux."

    this.picks.push(god)
  }

  ban(god) {
    if (this.viewer)
      return "Vous ne pouvez pas bannir de dieu en tant que spectateur."

    if (this.bans.includes(god)) return "Vous avez déjà banni ce dieu."

    if (!gods.includes(god)) return "Ce dieu n'existe pas."

    if (!this.opponent)
      return "Vous ne pouvez pas bannir de dieu pour le moment."

    if (!this.opponent.picks.includes(god))
      return "Vous ne pouvez pas bannir un dieu que votre adversaire n'a pas choisi."

    if (this.bans.length >= this.session.maxBanCount)
      return "Vous avez déjà banni le nombre maximum de dieux."

    this.bans.push(god)
  }
}
