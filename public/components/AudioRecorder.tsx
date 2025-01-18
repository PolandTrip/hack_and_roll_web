"use client";

import React, { useRef, useState } from "react";
import Button from "@mui/material/Button";
import { saveAs } from "file-saver";

const AudioRecorder: React.FC = () => {
  // State variables
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null); // Ref for MediaRecorder
  const audioChunksRef = useRef<Blob[]>([]); // Ref to store audio chunks

  // Start recording audio
  const startRecording = async () => {
    try {
      // Request access to microphone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Initialize MediaRecorder
      const mediaRecorder = new MediaRecorder(stream);

      // Capture audio data
      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      // Handle stopping the recorder
      mediaRecorder.onstop = async () => {
        setIsProcessing(true); // Show processing indicator

        // Create a Blob from the audio chunks
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });

        // Save the file locally
        saveAs(audioBlob, "recording.wav");

        // Upload the file
        await uploadAudio(audioBlob);

        // Clear the audio chunks
        audioChunksRef.current = [];
        setIsProcessing(false); // Hide processing indicator
      };

      // Start recording
      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder; // Store reference
      setIsRecording(true); // Update recording state
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  // Stop recording audio
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false); // Update recording state
    }
  };

  // Upload the audio file to the backend
  const uploadAudio = async (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append("file", audioBlob, "file.wav");

    try {
      const response = await fetch("http://localhost:8000/api/upload-audio", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        console.log("File uploaded successfully.");
      } else {
        console.error("Error uploading file:", await response.text());
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  return (
    <div>
      {/* Record/Stop button */}
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

      {/* Loading Indicator */}
      {isProcessing && (
        <p style={{ marginTop: "10px", fontSize: "16px", color: "gray" }}>
          Processing audio...
        </p>
      )}
    </div>
  );
};

export default AudioRecorder;
