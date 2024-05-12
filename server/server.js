const io = require("socket.io")(3000, {
  cors: {
    origin: ["http://localhost:8080", "https://admin.socket.io"],
  },
});

//Namespaces
const userIo = io.of("/user");

userIo.on("connection", (socket) => {
  console.log(
    "connected to user namespace with the username ",
    socket.username
  );
});

//use para usar middlewares
userIo.use((socket, next) => {
  const userToken = socket.handshake.auth.token;
  if (userToken) {
    socket.username = getUserNameFromToken(userToken);
    next();
  } else {
    next(new Error("Please send the token"));
  }
});

function getUserNameFromToken(token) {
  //aca podes llamar una db para obtener el user con el token
  return token;
}

function roomJoinMessage(room) {
  if(room){
    return "You connected to the room " + room + '.';
    
  }else{
    return "You connected to the general room.";
    
  }
}

io.on("connection", (socket) => {
  console.log(socket.id);
  socket.join("");

  socket.to("").emit("receive-message", {
    message: `A new user has joined with the id: ${socket.id}.`,
    id: socket.id,
    class: 'info'
  })
  socket.on("custom-event", (num, info) => {
    console.log(info);
    socket.to('')
  });

  socket.on("send-message", (data) => {
    console.log(`${data.id} dijo: "${data.message}"`);

      // usando to se asume que es un broadcast
      socket.to(data.room).emit("receive-message", {
        message: data.message,
        id: data.id,
        class: "message"
      });
  });


  socket.on("join-room", (room, cb) => {
    console.log(socket.id, "se unió a la sala: ", room);
    socket.rooms.forEach((element) => {
      if (element !== socket.id) {
        socket.to(element).emit("receive-message", {
          message: `The user ${socket.id} has left the chat.`,
          id: socket.id,
          class: 'info'
        })
        socket.leave(element);
      }
    });

    socket.to(room).emit("receive-message", {
      message: `The user ${socket.id} has joined the room.`,
      id: socket.id,
      class: 'info'
    })


    socket.join(room);


    console.log(socket.id, " ", socket.rooms);
    cb(roomJoinMessage(room));
  });
});
