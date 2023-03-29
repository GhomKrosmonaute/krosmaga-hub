document.getElementById("create-room-button").addEventListener("click", () => {
  const roomId =
    document.getElementById("room-id-input").value || String(Math.floor(Math.random() * 1000000))
  const maxPickCount = document.getElementById("max-pick-count-input").value || 3
  const maxBanCount = document.getElementById("max-ban-count-input").value || 1
  const username = document.getElementById("username-input").value || "Spectateur"

  window.location.href = `/bans/${roomId}?username=${username}&maxPickCount=${maxPickCount}&maxBanCount=${maxBanCount}`
})
