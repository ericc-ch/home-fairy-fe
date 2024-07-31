import { AudioRecorder } from "./components/AudioRecorder";

export default function Fairy() {
  return (
    <div className="font-sans p-4">
      <h1 className="text-3xl">Welcome to Remix (SPA Mode)</h1>

      <AudioRecorder />
    </div>
  );
}
