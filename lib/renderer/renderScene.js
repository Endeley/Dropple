export async function renderScene(scene, workspace) {
  const frames = [];
  for (const anim of scene.frames || []) {
    const frameCount = Math.max(1, Math.floor((anim.duration || 1) * 30));
    for (let i = 0; i < frameCount; i++) {
      const progress = i / frameCount;
      frames.push(renderFrame(workspace, anim, progress));
    }
  }
  return frames;
}

function renderFrame(workspace, anim, progress) {
  // Placeholder render stub; integrate real canvas/frame capture as needed.
  return {
    workspace,
    anim,
    progress,
  };
}
