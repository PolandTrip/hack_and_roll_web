"use client";

import Button from "@mui/material/Button";
import { saveAs } from "file-saver";
import React, { useRef, useState } from "react";

const AudioRecorder: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: "audio/mp4" });
        saveAs(audioBlob, "recording.mp4");
        audioChunks.current = []; // Clear recorded chunks
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  const stopRecording = async () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setMediaRecorder(null);
      setIsRecording(false);

      const audioBlob = new Blob(audioChunks.current, { type: "audio/mp4" });
      audioChunks.current = []; // Clear recorded chunks

      // Upload the file to the server
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.mp4");

      try {
        const response = await fetch("http://localhost:4000/upload-audio", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          console.log("File uploaded successfully.");
        } else {
          console.error("Error uploading file.");
        }
      } catch (err) {
        console.error("Error:", err);
      }
    }
  };

  return (
    <div>
      <Button
        variant="contained"
        color={isRecording ? "error" : "info"} // Red when recording, blue otherwise
        onClick={isRecording ? stopRecording : startRecording}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          textTransform: "none",
        }}
      >
        {isRecording ? "Stop Recording" : "Start Recording"}
      </Button>
    </div>
  );
};

export default AudioRecorder;
