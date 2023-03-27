import express from "express"

const app = express()

app.use("public", express.static("public"))

app.listen(3000, () => {
  console.log("listening on localhost:3000")
})

export default app
