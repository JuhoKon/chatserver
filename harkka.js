var net = require("net");

var server = net.createServer();

server.on("close", function() {
  console.log("Server closed !");
});
// Set of all currently connected sockets
var connectedSockets = new Set();

// broadcast to all connected sockets except one
connectedSockets.broadcast = function(data, except) {
  for (let sock of this) {
    if (sock !== except) {
      //everyone else but the sender
      if (typeof except !== "undefined" && except.channel === sock.channel) {
        //>1 clients, channel is same
        sock.write(except.name + ": " + data);
      } else {
        //sock.write(data);
      }
    }
  }
};
connectedSockets.changeChannel = function(socket, channel) {
  for (let sock of this) {
    if (sock === socket) {
      sock.channel = channel;
      sock.write("You are now in channel: " + channel);
    }
  }
};
connectedSockets.message = function(from, to, data) {
  to.write("Message from " + from.name + ": " + data.split(to.name)[1]);
};
server.on("connection", function(socket) {
  socket.setEncoding("utf8");

  socket.on("data", function(data) {
    if (!connectedSockets.has(socket)) {
      socket.name = data;

      socket.write("Welcome to the server " + socket.name + "!\n");
      connectedSockets.add(socket);
      connectedSockets.changeChannel(socket, "all");
      connectedSockets.broadcast("Has joined channel.", socket);
    } else {
      if (data[0] === "/") {
        //COMMAND TIME
        console.log("COMMAND TIME");
        if (data.split(" ")[0] === "/pm") {
          connectedSockets.forEach(sock => {
            console.log(data.split(" ")[0]);
            if (
              data.split(" ")[0] === "/pm" &&
              data.split(" ")[1] === sock.name &&
              sock.name !== socket.name
            ) {
              connectedSockets.message(socket, sock, data);
            }
          });
        } else if (data.split(" ")[0] === "/Join") {
          console.log("Hello");
          console.log(data.split(" ")[1]);
          connectedSockets.changeChannel(socket, data.split(" ")[1]);
          connectedSockets.broadcast("Has joined chat.", socket);
        }
      } else {
        //NORMALLY BROADCAST DATA TO other SOCKETS
        connectedSockets.broadcast(data, socket);
      }
    }
  });
  socket.on("error", function(error) {
    console.log("Error : " + error);
  });

  socket.on("end", function(data) {
    connectedSockets.delete(socket);
    socket.destroy();
  });

  socket.on("close", function(error) {
    connectedSockets.delete(socket);
    socket.destroy();
  });

  setTimeout(function() {
    var isdestroyed = socket.destroyed;
    console.log("Socket destroyed:" + isdestroyed);
    socket.destroy();
  }, 1200000);
});

// emits when any error occurs -> calls closed event immediately after this.
server.on("error", function(error) {
  console.log("Error: " + error);
});

server.maxConnections = 10;

const port = 7070;
const host = "127.0.0.1";
// for dyanmic port allocation
server.listen(port, host, () => {
  console.log("Server is running on", host, port);
});
