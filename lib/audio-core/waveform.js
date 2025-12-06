export async function generateWaveformFromUrl(url, samples = 120) {
  if (typeof window === "undefined") return [];
  const ctx = new AudioContext();
  const res = await fetch(url);
  const arrayBuffer = await res.arrayBuffer();
  const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
  const channelData = audioBuffer.getChannelData(0);
  const blockSize = Math.max(1, Math.floor(channelData.length / samples));
  const peaks = [];
  for (let i = 0; i < samples; i++) {
    const start = i * blockSize;
    const end = Math.min(start + blockSize, channelData.length);
    let sum = 0;
    for (let j = start; j < end; j++) {
      sum += Math.abs(channelData[j]);
    }
    peaks.push(sum / Math.max(1, end - start));
  }
  return peaks;
}
