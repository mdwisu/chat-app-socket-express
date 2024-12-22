const express = require("express");
const { Server } = require("socket.io");
const {
  login,
  protectedRoute,
  getMe,
} = require("./controllers/authController");
const { authenticate } = require("./middlewares/authMiddleware");
const http = require("http");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const connectDB = require("./config/db");
const Chat = require("./models/chat");

require("dotenv").config(); // Memuat variabel .env

// Hubungkan ke MongoDB
connectDB();

const app = express();
app.use(express.json());
app.use(cors()); // Middleware CORS untuk Express

// Route login
app.post("/login", login);

app.get("/me", authenticate, getMe);

// Route yang dilindungi
app.get("/protected", authenticate, protectedRoute);

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
  transports: ["websocket"], // Izinkan semua origin (untuk pengembangan)
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  // Middleware autentikasi untuk Socket.IO
  socket.on("authenticate", (token) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded; // Simpan data user yang sudah di-decode
      console.log(`User authenticated: ${socket.user.email}`);
    } catch (err) {
      console.error("Authentication failed", err.message);
      socket.disconnect(); // Putuskan koneksi jika autentikasi gagal
    }
  });

  socket.on("join_room", ({ userId1, userId2 }) => {
    if (!userId1 || !userId2) {
      console.error("Invalid user IDs:", { userId1, userId2 });
      return;
    }
    const room = `room_${Math.min(userId1, userId2)}_${Math.max(
      userId1,
      userId2
    )}`;
    socket.join(room);
    console.log(`${socket.user.email} joined room: ${room}`);

    // Mengambil riwayat chat
    Chat.find({ room })
      .then((chats) => {
        socket.emit("previous_chats", chats);
      })
      .catch((err) => console.error("Error fetching chats:", err.message));
  });
  // Mengirim pesan
  socket.on("send_message", ({ recipientId, message }) => {
    const room = `room_${Math.min(socket.user.id, recipientId)}_${Math.max(
      socket.user.id,
      recipientId
    )}`;
    const chatData = {
      senderId: socket.user.id,
      recipientId,
      message,
      room,
      timestamp: new Date(),
    };

    // Simpan pesan ke database
    Chat.create(chatData)
      .then(() => {
        // Broadcast pesan ke room
        io.to(room).emit("receive_message", chatData);
      })
      .catch((err) => console.error("Error saving message:", err.message));
  });
});

// Jalankan server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
