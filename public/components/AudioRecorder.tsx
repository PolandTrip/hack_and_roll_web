"use client";

import React, { useRef, useState, useEffect } from "react";
import FileUploadIcon from '@mui/icons-material/FileUpload';
import CircularProgress from "@mui/material/CircularProgress";
import TextDisplay from "./TextDisplay";
import { SetMeal } from "@mui/icons-material";

const AudioRecorder: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [msg, setMsg] = useState('')
  const [responseAudioURL, setResponseAudioURL] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [toasterState, setToasterState] = useState<"on" | "off" | "unknown">(
    "unknown"
  ); 

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
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
          console.log("Audio Blob created:", audioBlob);

          const audioURL = await uploadAudio(audioBlob);

          if (audioURL) {
            console.log("Audio processed successfully:", audioURL);
            setResponseAudioURL(audioURL);
          }

          // Clear recorded chunks
          audioChunksRef.current = [];
        } catch (error) {
          console.error("Error processing audio:", error);
        } finally {
          setIsProcessing(false);
        }
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const uploadAudio = async (audioBlob: Blob): Promise<string | null> => {
    console.log("Uploading audio file...");
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", audioBlob, "file.wav");

    try {
      const response = await fetch("http://localhost:8000/api/upload-audio", {
        method: "POST",
        body: formData,
      });
  
      console.log("Response status:", response.status);
  
      if (response.ok) {
        const jsonResponse = await response.json(); // Parse JSON response
        console.log("Response data received from backend:", jsonResponse);
  
        const audioBase64 = jsonResponse.audio_base64; // Extract Base64 string
        const message = jsonResponse.message; // Extract message
        const command = jsonResponse.command;
        setMsg(message);
        setToasterState(command);
        console.log("Message from backend:", message);
  
        // Decode Base64 to a Blob
        const binaryString = atob(audioBase64); // Decode Base64 to binary string
        const byteArray = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          byteArray[i] = binaryString.charCodeAt(i);
        }
        const audioBlob = new Blob([byteArray], { type: "audio/wav" });
  
        // Create an object URL for the Blob
        const audioURL = URL.createObjectURL(audioBlob);
  
        // Save the audio URL to state for playback
        return audioURL;
      } else {
        const errorText = await response.text();
        console.error("Error response from server:", errorText);
      }
    } catch (error) {
      console.error("Error uploading file or processing audio:", error);
    } finally {
      setIsUploading(false);
    }
  
    return null;
  };

  // Play video and audio automatically when the audio URL is set
  useEffect(() => {
    if (responseAudioURL && videoRef.current) {
      const audioElement = new Audio(responseAudioURL);

      audioElement.onplay = () => {
        console.log("Audio started playing. Playing video...");
        videoRef.current?.play();
      };

      audioElement.onended = () => {
        console.log("Audio ended. Pausing video...");
        videoRef.current?.pause();
      };

      audioElement.play().catch((error) => {
        console.error("Error playing audio:", error);
      });
    }
  }, [responseAudioURL]);

  return (
    <div
      style={{
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh", // Full viewport height
        padding: "20px", // Add padding for spacing
      }}
    >
      {/* Kaya Toast-Chan Title and Toaster State Button */}
      <div
        style={{
          display: "flex",
          alignItems: "center", // Align items vertically in the center
          justifyContent: "center",
          marginBottom: "20px", // Space below the title
        }}
      >
        <h1
          style={{
            fontSize: "2rem",
            color: "#333", // Neutral color
            fontWeight: "bold",
            margin: "0 16px 0 0", // Space between title and button
          }}
        >
          Kaya Toast-Chan
        </h1>
        <button
          style={{
            padding: "10px 20px",
            backgroundColor: toasterState === "on" ? "#28A745" : "#DC3545",
            color: "#FFF",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          {toasterState === "on" ? "Toaster is ON" : "Toaster is OFF"}
        </button>
      </div>
  
      {/* Video Avatar */}
      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <video
          ref={videoRef}
          src="/testing.mp4" // Place your MP4 file in the public directory
          controls={false}
          autoPlay={false}
          loop={true}
          muted // Ensure audio is separate from video
          style={{
            width: "600px", // Increase video width
            height: "auto", // Maintain aspect ratio
            borderRadius: "15px", // Keep rounded corners
          }}
        />
      </div>
  
      {/* Start/Stop Recording */}
      <div>
        {isRecording ? (
          <p style={{ color: "red", fontWeight: "bold" }}>Recording...</p>
        ) : (
          <button
            onClick={startRecording}
            style={{
              padding: "10px 20px",
              backgroundColor: "#007BFF",
              color: "#FFF",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            <FileUploadIcon style={{ marginRight: "5px" }} />
            Start Recording
          </button>
        )}
  
        {isRecording && (
          <button
            onClick={stopRecording}
            style={{
              padding: "10px 20px",
              marginLeft: "10px",
              backgroundColor: "#DC3545",
              color: "#FFF",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Stop Recording
          </button>
        )}
  
        {isUploading && (
          <div style={{ marginTop: "10px" }}>
            <CircularProgress />
            <p style={{ fontSize: "14px", color: "gray" }}>Uploading audio...</p>
          </div>
        )}
      </div>
  
      {/* Processing Message */}
      {isProcessing && (
        <p style={{ marginTop: "10px", fontSize: "16px", color: "gray" }}>
          Processing audio...
        </p>
      )}
  
      {msg !== "" && (
        <div style={{ marginTop: "20px" }}>
          <TextDisplay msg={msg} />
        </div>
      )}
    </div>
  );
  
  
};

export default AudioRecorder;
