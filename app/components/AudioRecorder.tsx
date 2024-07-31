import { useRef, useState } from "react";

interface Props {
  onRecordingComplete?: (blob: Blob) => void;
}

export const AudioRecorder = ({ onRecordingComplete }: Props) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        onRecordingComplete?.(event.data);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing media devices.", err);
    }
  };

  const handleStopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleButtonClick = () => {
    if (isRecording) {
      handleStopRecording();
    } else {
      handleStartRecording();
    }
  };

  return (
    <div>
      <button onClick={handleButtonClick}>
        {isRecording ? "Stop Recording" : "Start Recording"}
      </button>
      <span>{isRecording ? "🔴 Recording..." : "⚪ Not Recording"}</span>
    </div>
  );
};
