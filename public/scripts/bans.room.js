var socket = io()

socket.emit("joinBanRoom", {
  roomId,
  maxPickCount,
  maxBanCount,
})
