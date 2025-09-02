const { Server } = require("socket.io");
const socketHandlers = require("./socketHandlers");

const initSocketServer = (server) => {
  const io = new Server(server, {
    cors: {
      origin: [process.env.FRONTEND_URL, process.env.FRONTEND2_URL, "http://localhost:8080", "http://172.16.0.2:8080"],
      methods: ["GET", "POST"],
    },
  });

  socketHandlers(io);

  return io;
};

module.exports = initSocketServer;
