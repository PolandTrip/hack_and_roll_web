import { Typography } from "@mui/material";
import AudioRecorder from "../../public/components/AudioRecorder";

export default function Home() {
  return (
    <div className="grid grid-rows-[auto_1fr_auto] items-center justify-items-center min-h-screen p-8 gap-8 sm:p-12 font-[family-name:var(--font-geist-sans)]">

      {/* Audio Recorder */}
      <div
        style={{
          maxWidth: "600px", // Restrict the width of the content
          width: "100%",
          margin: "0 auto", // Center-align content horizontally
        }}
      >
        <AudioRecorder />
      </div>
    </div>
  );
}