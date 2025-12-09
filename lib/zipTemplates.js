import JSZip from "jszip";

export async function zipTemplates(templates = []) {
  const zip = new JSZip();
  templates.forEach((tpl, idx) => {
    const name = tpl?.name ? tpl.name.replace(/\s+/g, "_").toLowerCase() : `template_${idx + 1}`;
    zip.file(`${name || "template"}.dropple.json`, JSON.stringify(tpl, null, 2));
  });
  const content = await zip.generateAsync({ type: "uint8array" });
  return content;
}
