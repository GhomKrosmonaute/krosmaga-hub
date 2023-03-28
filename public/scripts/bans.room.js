var socket = io()

socket.emit("joinBanRoom", {
  roomId,
  maxPickCount,
  maxBanCount,
})

socket.on("updateBanRoom", (session) => {
  console.log(session)
})
