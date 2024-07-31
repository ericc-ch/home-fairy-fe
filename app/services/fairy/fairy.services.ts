import { ofetch } from "ofetch";
import { BACKEND_BASE_URL } from "~/lib/env";

const fairy = ofetch.create({
  baseURL: BACKEND_BASE_URL,
});

type SendCommandOptions = {
  audio: Blob;
  takeScreenshot?: boolean;
};

type SendCommandResponse = {
  message: string;
  voiceline: string;
};

export const sendCommand = (options: SendCommandOptions) => {
  const formData = new FormData();

  formData.append("audio", options.audio);
  formData.append("takeScreenshot", String(options.takeScreenshot ?? false));

  return fairy<SendCommandResponse>("/command", {
    method: "POST",
    body: formData,
  });
};
