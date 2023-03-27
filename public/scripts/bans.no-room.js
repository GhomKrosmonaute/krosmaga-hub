var socket = io()
var newRoomButton = document.getElementById("new-room-button")

var toggleNewRoomButton = () => {
  newRoomButton = document.getElementById("new-room-button")
  newRoomButton.classList.toggle("enabled")

  if (newRoomButton.classList.contains("enabled")) {
    newRoomButton.addEventListener("click", createRoom)
  } else {
    newRoomButton.removeEventListener("click", createRoom)
  }
}

const createRoom = () => {
  toggleNewRoomButton()

  socket.emit("createRoom")

  socket.on("createRoom", ({ roomId, success }) => {
    if (success) {
      window.location.href = `/bans/${roomId}`
    } else {
      alert("oops")

      setTimeout(() => {
        newRoomButton.addEventListener("click", createRoom)
      }, 5000)
    }
  })
}

setTimeout(() => {
  toggleNewRoomButton()
}, 5000)
