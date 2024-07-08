"use client";
import React, { useEffect, useRef, useState } from "react";
import io, { Socket } from "socket.io-client";

import { Button } from "./ui/button";

const AudioStreaming = () => {
  const [isRecording, setIsRecording] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const localStreamRef = useRef<MediaStream>(null);
  const mediaRecorderRef = useRef<MediaRecorder>(null);

  useEffect(() => {
    // Connect to the Socket.IO server
    socketRef.current = io("http://localhost:5000", {
      withCredentials: true,
    });

    if (isRecording) {
      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        localStreamRef.current = stream;
        mediaRecorderRef.current = new MediaRecorder(stream);

        mediaRecorderRef.current.ondataavailable = (event) => {
          if (socketRef.current && event.data.size > 0) {
            socketRef.current.emit("audio", event.data);
          }
        };
        mediaRecorderRef.current.start(5000); // Send data every 500ms
      });
    } else {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        localStreamRef.current?.getTracks().forEach((track) => {
          track.stop();
        });
      }
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isRecording]);

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on("text", (text: string) => {
        console.log("Received text:", text);
        // Handle the received text (e.g., display it in the UI)
      });
    }
  }, []);

  function handleStartRecording() {
    setIsRecording(true);
  }

  function handleStopRecording() {
    setIsRecording(false);
  }

  return (
    <div>
      <Button onClick={handleStartRecording} disabled={isRecording}>
        Start Recording
      </Button>
      <Button onClick={handleStopRecording} disabled={!isRecording}>
        Stop Recording
      </Button>
    </div>
  );
};
export default AudioStreaming;
