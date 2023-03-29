var socket = io()

socket.emit("joinBanRoom", {
  roomId,
  maxPickCount,
  maxBanCount,
  username,
})

socket.on("updateBanRoom", (session) => {
  console.log(session)
})
