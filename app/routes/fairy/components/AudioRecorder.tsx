import { useEffect, useRef, useState } from "react";

export const AudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioEl = useRef<HTMLAudioElement>(null);

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        console.log(event);

        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/ogg",
        });
        const audioURL = URL.createObjectURL(audioBlob);
        setAudioURL(audioURL);
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

  useEffect(() => {
    console.log(audioEl);

    if (audioEl.current) {
      // try {
      //   audioEl.current.load();
      // } catch (err) {
      //   console.error(err);
      //   return
      // }
      // audioEl.current.currentTime = 0;
      audioEl.current.play();
    }
  }, [audioURL]);

  return (
    <div>
      <button onClick={handleButtonClick}>
        {isRecording ? "Stop Recording" : "Start Recording"}
      </button>
      <span>{isRecording ? "🔴 Recording..." : "⚪ Not Recording"}</span>
      {audioURL && (
        <div>
          <h2>Playback</h2>
          <audio ref={audioEl} controls src={audioURL}></audio>
        </div>
      )}
    </div>
  );
};
