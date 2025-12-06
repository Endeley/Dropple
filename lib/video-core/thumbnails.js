"use client";

export async function generateVideoThumbnail(src, timeSeconds = 0.5) {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.src = src;
    video.preload = "auto";

    const cleanup = () => {
      video.removeEventListener("loadeddata", onLoaded);
      video.removeEventListener("seeked", onSeeked);
    };

    const capture = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
        cleanup();
        resolve(dataUrl);
      } catch (err) {
        cleanup();
        reject(err);
      }
    };

    const onSeeked = () => capture();
    const onLoaded = () => {
      video.currentTime = Math.min(timeSeconds, video.duration || timeSeconds);
    };

    video.addEventListener("loadeddata", onLoaded);
    video.addEventListener("seeked", onSeeked);
    video.load();
  });
}

export async function generateVideoThumbnails(src, count = 3) {
  const thumbs = [];
  for (let i = 0; i < count; i++) {
    const t = (i + 1) / (count + 1); // distribute across duration fraction
    try {
      const thumb = await generateVideoThumbnail(src, t);
      thumbs.push(thumb);
    } catch (err) {
      // continue on failure
    }
  }
  return thumbs;
}
