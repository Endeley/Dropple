export function templateToComponent(layer) {
  if (!layer) return "";
  switch (layer.type) {
    case "text":
      return `<p className="${layer.className || ""}">${layer.text || ""}</p>`;
    case "button":
      return `
        <button className="${layer.className || ""}">
          ${layer.text || ""}
        </button>
      `;
    case "image":
      return `
        <img src="${layer.src || ""}" alt="${layer.alt || ""}" className="${layer.className || ""}" />
      `;
    case "container":
      return `
        <div className="${layer.className || ""}">
          ${(layer.children || []).map(templateToComponent).join("\n")}
        </div>
      `;
    default:
      return "";
  }
}
