"use client";

import Ruler from "./Ruler";
import TrackRow from "./TrackRow";
import Scrubber from "./Scrubber";

export default function TimelineContainer({ tracks = [] }) {
  return (
    <div className="relative w-full h-full bg-[#111] text-white overflow-hidden">
      <Ruler />
      <div className="flex flex-col">
        {tracks.map((track) => (
          <TrackRow key={track.id} track={track} />
        ))}
      </div>
      <Scrubber />
    </div>
  );
}
