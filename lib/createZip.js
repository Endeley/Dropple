import JSZip from "jszip";

export async function createZip(files = {}) {
  const zip = new JSZip();

  Object.entries(files).forEach(([path, content]) => {
    zip.file(path, content);
  });

  return await zip.generateAsync({ type: "nodebuffer" });
}
