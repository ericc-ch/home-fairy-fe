/* eslint-disable jsx-a11y/media-has-caption */
import { Camera } from "lucide-react";
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

const connectionDictionary = {
  [ReadyState.CONNECTING]: "Connecting",
  [ReadyState.OPEN]: "Open",
  [ReadyState.CLOSING]: "Closing",
  [ReadyState.CLOSED]: "Closed",
  [ReadyState.UNINSTANTIATED]: "Uninstantiated",
};

export default function Index() {
  const [takeScreenshot, setTakeScreenshot] = useState(false);
  const { readyState, lastJsonMessage } = useWebSocket<
    VoicelineResponse | TTSDoneResponse
  >(BACKEND_WS_BASE_URL + "/ws");
  const [audioQueue, setAudioQueue] = useState<string[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const connectionStatus = connectionDictionary[readyState];

  useEffect(() => {
    if (!lastJsonMessage) return;

    if ("voiceline" in lastJsonMessage) {
      const randomChance = Math.random();
      if (randomChance > 0.5) return;

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
      if (videoRef.current) {
        videoRef.current.play();
      }
    }
  }, [audioQueue]);

  const handleAudioEnded = () => {
    setAudioQueue((prevQueue) => prevQueue.slice(1));
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const handleAudioPause = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const handleAudioPlay = () => {
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  const handleRecordingComplete = (audio: Blob) => {
    return sendCommand({
      audio,
      takeScreenshot,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-200 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-indigo-700 mb-6">Fairy</h1>
          <div className="mb-6">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
              Status: {connectionStatus}
            </span>
          </div>
          <div className="mb-8">
            <video
              ref={videoRef}
              muted
              loop
              className="w-full rounded-lg shadow-md"
              src="/fairy-loop.mp4"
            />
          </div>
          <div className="mb-8">
            <audio
              controls
              ref={audioRef}
              onEnded={handleAudioEnded}
              onPause={handleAudioPause}
              onPlay={handleAudioPlay}
              className="w-full"
            />
          </div>
          <div className="flex items-center justify-between mb-8">
            <label
              htmlFor="takeScreenshot"
              className="flex items-center cursor-pointer"
            >
              <div className="relative">
                <input
                  id="takeScreenshot"
                  type="checkbox"
                  className="sr-only"
                  onChange={(e) => setTakeScreenshot(e.target.checked)}
                  checked={takeScreenshot}
                />
                <div className="w-10 h-6 bg-gray-300 rounded-full shadow-inner"></div>
                <div
                  className={`absolute w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    takeScreenshot ? "translate-x-5" : "translate-x-1"
                  } top-1`}
                ></div>
              </div>
              <div className="ml-3 text-gray-700 font-medium">
                Take Screenshot
              </div>
              <Camera className="ml-2 text-gray-500" size={20} />
            </label>
          </div>
          <div className="bg-gray-100 p-6 rounded-lg">
            <AudioRecorder onRecordingComplete={handleRecordingComplete} />
          </div>
        </div>
      </div>
    </div>
  );
}
