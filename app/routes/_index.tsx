/* eslint-disable jsx-a11y/media-has-caption */
import { useEffect, useRef, useState } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { AudioRecorder } from "~/components/AudioRecorder";
import { BACKEND_BASE_URL, BACKEND_WS_BASE_URL } from "~/lib/env";
import { sendCommand } from "~/services/fairy";

interface VoicelineResponse {
  voiceline: string;
}

interface TTSDoneResponse {
  output: string;
}

export default function Index() {
  const [takeScreenshot, setTakeScreenshot] = useState(false);
  const { readyState, lastJsonMessage } = useWebSocket<
    VoicelineResponse | TTSDoneResponse
  >(BACKEND_WS_BASE_URL + "/ws");
  const [audioQueue, setAudioQueue] = useState<string[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);

  const connectionStatus = {
    [ReadyState.CONNECTING]: "Connecting",
    [ReadyState.OPEN]: "Open",
    [ReadyState.CLOSING]: "Closing",
    [ReadyState.CLOSED]: "Closed",
    [ReadyState.UNINSTANTIATED]: "Uninstantiated",
  }[readyState];

  useEffect(() => {
    if (!lastJsonMessage) return;

    if ("voiceline" in lastJsonMessage) {
      const randomChance = Math.random();
      if (randomChance > 0.2) return;

      setAudioQueue((prevQueue) => [
        ...prevQueue,
        BACKEND_BASE_URL + lastJsonMessage.voiceline,
      ]);
    } else if ("output" in lastJsonMessage) {
      setAudioQueue((prevQueue) => [
        ...prevQueue,
        BACKEND_BASE_URL + lastJsonMessage.output,
      ]);
    }
  }, [lastJsonMessage]);

  useEffect(() => {
    if (audioQueue.length > 0 && audioRef.current && audioRef.current.paused) {
      audioRef.current.src = audioQueue[0];
      audioRef.current.play();
    }
  }, [audioQueue]);

  const handleAudioEnded = () => {
    setAudioQueue((prevQueue) => prevQueue.slice(1));
  };

  const handleRecordingComplete = (audio: Blob) => {
    return sendCommand({
      audio,
      takeScreenshot,
    });
  };

  return (
    <div>
      <h1>{connectionStatus}</h1>
      <label htmlFor="takeScreenshot">Take Screenshot?</label>
      <input
        id="takeScreenshot"
        type="checkbox"
        onChange={(e) => setTakeScreenshot(e.target.checked)}
        checked={takeScreenshot}
      />
      <AudioRecorder onRecordingComplete={handleRecordingComplete} />
      <audio controls ref={audioRef} onEnded={handleAudioEnded} />
    </div>
  );
}
