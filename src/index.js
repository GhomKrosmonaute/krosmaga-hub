import { io, app } from "./app.js"

import * as bans from "./modules/bans.js"

app.use("/bans", bans.router)

io.on("connection", (socket) => {
  bans.onConnection(socket)
})
