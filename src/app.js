import express from "express"
import http from "http"
import path from "path"
import { Server } from "socket.io"

export const app = express()

export const server = http.createServer(app)

export const io = new Server(server)

app.use("/public", express.static(path.join(process.cwd(), "public")))

app.set("views", path.join(process.cwd(), "views"))
app.set("view engine", "ejs")

server.listen(3000, () => {
  console.log("listening on localhost:3000")
})
