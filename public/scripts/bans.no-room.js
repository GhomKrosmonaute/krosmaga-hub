function getRoomIdInput() {
  return document.getElementById("room-id-input")
}

function getMaxPickCountInput() {
  return document.getElementById("max-pick-count-input")
}

function getMaxBanCountInput() {
  return document.getElementById("max-ban-count-input")
}

function getCreateRoomButton() {
  return document.getElementById("create-room-button")
}

getCreateRoomButton().addEventListener("click", () => {
  const roomId =
    getRoomIdInput().value || String(Math.floor(Math.random() * 1000000))
  const maxPickCount = getMaxPickCountInput().value || 3
  const maxBanCount = getMaxBanCountInput().value || 1

  window.location.href = `/bans/${roomId}?maxPickCount=${maxPickCount}&maxBanCount=${maxBanCount}`
})
