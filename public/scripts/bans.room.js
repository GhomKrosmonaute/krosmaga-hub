var socket = io()

socket.emit("joinBanRoom", roomId)

socket.on("joinBanRoom", function (success) {
  if (success) {
    alert("yay")
  } else {
    alert("oops")
  }
})
