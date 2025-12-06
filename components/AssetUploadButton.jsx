"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { generateWaveformFromUrl } from "@/lib/audio-core/waveform";
import { generateVideoThumbnail, generateVideoThumbnails } from "@/lib/video-core/thumbnails";

export default function AssetUploadButton() {
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const uploadAsset = useMutation(api.assets.uploadAsset);

  const readVideoMeta = (url) =>
    new Promise((resolve) => {
      const video = document.createElement("video");
      video.src = url;
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        resolve({
          duration: video.duration * 1000,
          width: video.videoWidth,
          height: video.videoHeight,
        });
      };
      video.onerror = () => resolve({});
    });

  const readAudioDuration = (url) =>
    new Promise((resolve) => {
      const audio = document.createElement("audio");
      audio.src = url;
      audio.preload = "metadata";
      audio.onloadedmetadata = () => resolve(audio.duration * 1000);
      audio.onerror = () => resolve(undefined);
    });

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    let waveform;
    let thumbnail;
    let thumbnails;
    let duration;
    let width;
    let height;

    if (file.type.startsWith("audio")) {
      duration = await readAudioDuration(objectUrl);
      waveform = await generateWaveformFromUrl(objectUrl, 120).catch(() => undefined);
    }

    if (file.type.startsWith("video")) {
      const meta = await readVideoMeta(objectUrl);
      duration = meta.duration;
      width = meta.width;
      height = meta.height;
      const thumbs = await generateVideoThumbnails(objectUrl, 3).catch(() => []);
      thumbnail = thumbs[0] || (await generateVideoThumbnail(objectUrl).catch(() => undefined));
      thumbnails = thumbs?.length ? thumbs : thumbnail ? [thumbnail] : undefined;
    }

    const url = await generateUploadUrl();
    const result = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });
    const { storageId } = await result.json();

    await uploadAsset({
      name: file.name,
      type: file.type,
      storageId,
      size: file.size,
      width,
      height,
      duration,
      waveform,
      thumbnail,
      thumbnails,
    });
  }

  return (
    <label className="cursor-pointer px-3 py-1 bg-blue-600 text-white rounded inline-flex items-center gap-2 text-sm">
      Upload Asset
      <input type="file" className="hidden" onChange={handleUpload} />
    </label>
  );
}
