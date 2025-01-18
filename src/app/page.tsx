import { Typography } from "@mui/material";
import AudioRecorder from "../../public/components/AudioRecorder";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <Typography
        variant="body1"
        sx={{ fontSize: "2.0rem", lineHeight: "1.8" }}
      >
        Welcome to the talking toaster!
      </Typography>
      <AudioRecorder />
    </div>
  );
}
