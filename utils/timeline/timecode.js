export const formatTimecode = (ms = 0) => {
  const clamped = Math.max(0, Math.round(ms));
  const totalSeconds = clamped / 1000;
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");
  const millis = Math.floor(clamped % 1000)
    .toString()
    .padStart(3, "0");
  return `${minutes}:${seconds}.${millis}`;
};

export const parseTimecode = (timecode = "") => {
  const parts = timecode.split(":");
  if (parts.length < 2) return 0;
  const [mins, rest] = parts;
  const [secs, msRaw] = rest.split(".");
  const minutes = parseInt(mins, 10) || 0;
  const seconds = parseInt(secs, 10) || 0;
  const millis = parseInt(msRaw || "0", 10) || 0;
  return minutes * 60 * 1000 + seconds * 1000 + millis;
};
