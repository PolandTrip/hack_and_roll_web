"use client";

import React, { useRef, useState } from "react";
import Button from "@mui/material/Button";

const AudioRecorder: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        console.log("Recording stopped, processing audio...");
        setIsProcessing(true);

        try {
          // Create a Blob from the recorded chunks
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
          console.log("Audio Blob created:", audioBlob);

          // Upload the audio file and play the response audio
          const audioURL = await uploadAndPlayAudio(audioBlob);

          if (audioURL) {
            console.log("Audio received and played successfully:", audioURL);
          }

          // Clear recorded chunks
          audioChunksRef.current = [];
        } catch (error) {
          console.error("Error during audio processing:", error);
        } finally {
          setIsProcessing(false);
        }
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const uploadAndPlayAudio = async (audioBlob: Blob): Promise<string | null> => {
    console.log("Uploading audio file...");

    const formData = new FormData();
    formData.append("file", audioBlob, "file.wav");

    try {
      const response = await fetch("http://localhost:8000/api/upload-audio", {
        method: "POST",
        body: formData,
      });

      console.log("Response status:", response.status);

      if (response.ok) {
        const audioData = await response.blob();
        console.log("Audio data received from backend:", audioData);

        // Create an object URL for the audio
        const audioURL = URL.createObjectURL(audioData);

        // Play the audio immediately
        const audioElement = new Audio(audioURL);
        audioElement.play().catch((error) => {
          console.error("Error playing audio:", error);
        });

        return audioURL;
      } else {
        const errorText = await response.text();
        console.error("Error response from server:", errorText);
      }
    } catch (error) {
      console.error("Error uploading file or playing audio:", error);
    }

    return null;
  };

  return (
    <div>
      <Button
        variant="contained"
        color={isRecording ? "error" : "info"}
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

      {isProcessing && (
        <p style={{ marginTop: "10px", fontSize: "16px", color: "gray" }}>
          Processing audio...
        </p>
      )}
    </div>
  );
};

export default AudioRecorder;
