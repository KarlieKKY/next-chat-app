const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
import OpenAI from "openai";

require("dotenv").config();
const WHISPER_API_URL = process.env.WHISPER_API_URL;

const app = express();

const client = new OpenAI();

const corsOptions = {
  origin: "http://localhost:3000",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
  credentials: true,
};

app.use(cors(corsOptions));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("audio", async (audioBlob) => {
    try {
      const buffer = Buffer.from(audioBlob);
      // Call Whisper API
      const response = await fetch(WHISPER_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "audio/wav", // Set appropriate content type
        },
        body: buffer,
      });

      if (!response.ok) {
        throw new Error("Failed to fetch transcription");
      }

      const data = await response.json();
      const transcription = data.transcription; // Adjust according to Whisper API response format

      // Send transcription back to client
      socket.emit("text", transcription);
    } catch (error) {
      console.error("Error processing audio:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
