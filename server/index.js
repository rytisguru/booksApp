import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const httpServer = createServer(app);
const PORT = 4000;

const socketIO = new Server(httpServer, {
  cors: {
      origin: "http://localhost:3000"
  }
});

socketIO.on('connection', (socket) => {
  console.log(`⚡: ${socket.id} user just connected!`);

  socket.on('getImage', () => {
    socketIO.emit('setImage', { url: "OKAY" })
  });

  socket.on('disconnect', () => {
    console.log('🔥: A user disconnected');
  });
});

app.get('/api', (req, res) => {
  res.json({
    message: 'Hello world',
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});