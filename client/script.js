import { io } from "socket.io-client";

const joinRoomButton = document.getElementById("room-button");
const messageInput = document.getElementById("message-input");
const roomInput = document.getElementById("room-input");
const form = document.getElementById("form");
const roomName = document.getElementById("room-name");
const generalBtn = document.getElementById("general-room-btn");

const socket = io("http://localhost:3000");
const userSocket = io("http://localhost:3000/user", {
  auth: { token: "test" },
});

userSocket.on("connect_error", (error) => {
  displayMessage(error);
});

socket.on("connect", () => {
  displayMessage(`You connected with id: ${socket.id}`, "info");
});

socket.on("receive-message", (data) => {
  console.log(data.message);
  displayMessage(data.message, data.class);
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const message = messageInput.value;
  const room = roomInput.value;

  if (message === "") return;

  displayMessage(message, "user");
  socket.emit("send-message", { message, id: socket.id, room });

  messageInput.value = "";
});

generalBtn.addEventListener("click", () => {

  socket.emit("join-room", "", (message) => {
    displayMessage(message, "room");
  });


  generalBtn.classList.add("hidden");
  roomInput.value = ""
  roomName.innerHTML = "General"
  

});

joinRoomButton.addEventListener("click", () => {
  const room = roomInput.value;
  socket.emit("join-room", room, (message) => {
    displayMessage(message, "room");
  });

  roomInput.value
    ? generalBtn.classList.remove("hidden")
    : generalBtn.classList.add("hidden");

  roomName.innerHTML = room;
});

function displayMessage(message, style) {
  console.log(message);

  const div = document.createElement("div");

  if (style) {
    div.classList.add(style);
  }

  div.textContent = message;

  document.getElementById("message-container").append(div);
}

let count = 0;

document.addEventListener("keydown", (e) => {
  if (e.target.matches("input")) return;

  if (e.key === "c") socket.connect();
  if (e.key === "d") socket.disconnect();
});
