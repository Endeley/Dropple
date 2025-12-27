"use client";

export default function ClipItem({ clip, isActive = false }) {
  const isAudio = clip.type === "audio";
  const bars = isAudio && clip.waveform?.length ? clip.waveform : null;
  const thumbStyle =
    clip.type === "video" && clip.thumbnail
      ? {
          backgroundImage: `url(${clip.thumbnail})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }
      : null;
  const multiThumbs =
    clip.type === "video" && clip.thumbnails?.length ? clip.thumbnails : null;

  return (
    <div
      className={`absolute rounded text-[11px] text-white px-2 flex items-center truncate overflow-hidden ${
        isAudio ? "bg-blue-600/30 border border-blue-500" : "bg-purple-600/30 border border-purple-500"
      } ${isActive ? "ring-2 ring-white/70" : ""}`}
      style={{
        left: clip.start,
        width: clip.duration,
        top: "6px",
        height: "24px",
        ...thumbStyle,
      }}
    >
      {bars ? (
        <div className="flex items-end gap-[1px] w-full h-full">
          {bars.map((v, i) => {
            const value = Math.min(1, Math.max(0, v));
            return (
              <div
                key={i}
                className="bg-blue-300/70 flex-1"
                style={{
                  minWidth: Math.max(1, clip.duration / Math.max(bars.length * 2, 1)),
                  height: `${value * 100}%`,
                }}
              />
            );
          })}
        </div>
      ) : (
        <>
          {multiThumbs ? (
            <div className="absolute inset-0 flex">
              {multiThumbs.map((thumb, idx) => (
                <div
                  key={idx}
                  className="flex-1 bg-center bg-cover"
                  style={{ backgroundImage: `url(${thumb})` }}
                />
              ))}
            </div>
          ) : null}
          <span className="truncate drop-shadow-sm relative z-10">
            {clip.name || clip.type || "Clip"}
          </span>
        </>
      )}
    </div>
  );
}
