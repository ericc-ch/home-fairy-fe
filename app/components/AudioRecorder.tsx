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
    <div className="flex flex-col items-center space-y-4 p-6 bg-gray-100 rounded-lg shadow-md">
      <button
        onClick={handleButtonClick}
        className={`px-4 py-2 rounded-full font-semibold text-white transition-colors ${
          isRecording
            ? "bg-red-500 hover:bg-red-600"
            : "bg-blue-500 hover:bg-blue-600"
        }`}
      >
        {isRecording ? "Stop Recording" : "Start Recording"}
      </button>
      <span className="flex items-center space-x-2">
        <span
          className={`w-3 h-3 rounded-full ${
            isRecording ? "bg-red-500 animate-pulse" : "bg-gray-300"
          }`}
        ></span>
        <span className="text-gray-700">
          {isRecording ? "Recording..." : "Not Recording"}
        </span>
      </span>
    </div>
  );
};
