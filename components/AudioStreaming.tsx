"use client";
import React, { useEffect, useRef, useState } from "react";
import io, { Socket } from "socket.io-client";

import { Button } from "./ui/button";

const AudioStreaming = () => {
  const [isRecording, setIsRecording] = useState(false);
  const socket = useRef<Socket | null>(null);

  useEffect(() => {
    // Connect to the Socket.IO server
    socket.current = io("http://localhost:3001", {
      path: "/api/socketio",
      withCredentials: true,
      // transports: ["websocket", "polling"], // Ensure polling transport is included
    });

    socket.current.on("connect", () => {
      console.log("Connected to server");
    });

    socket.current.on("disconnect", () => {
      console.log("Disconnected from server");
    });

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, []);

  function handleStartRecording() {
    setIsRecording(true);
  }

  function handleStopRecording() {
    setIsRecording(false);
  }
  return (
    <div>
      <Button onClick={handleStartRecording}>Start Recording</Button>
      <Button onClick={handleStopRecording}>Stop Recording</Button>
    </div>
  );
};
export default AudioStreaming;
