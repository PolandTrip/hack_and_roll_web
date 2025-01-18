"use client";
import { AppBar, Box, Button, CircularProgress, TextField, Toolbar, Typography } from "@mui/material";
import React, { useState } from "react";

const AudioTranscriber: React.FC = () => {
  const [transcript, setTranscript] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const file = event.target.files[0];
      setIsLoading(true);

      // Simulate API call
      setTimeout(() => {
        setTranscript("Transcribed text will appear here.");
        setIsLoading(false);
      }, 2000);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Audio Transcriber
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ mt: 4 }}>
        <Button variant="contained" component="label">
          Upload Audio
          <input type="file" hidden accept="audio/*" onChange={handleFileUpload} />
        </Button>
        {isLoading && <CircularProgress sx={{ ml: 2 }} />}
      </Box>

      <Box sx={{ mt: 4 }}>
        <TextField
          label="Transcription"
          multiline
          rows={10}
          value={transcript}
          fullWidth
          InputProps={{
            readOnly: true,
          }}
        />
      </Box>
    </Box>
  );
};

export default AudioTranscriber;
