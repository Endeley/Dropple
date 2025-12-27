/**
 * Render normalized export tree into HTML + CSS
 * PURE FUNCTION — no store, no DOM, no side effects
 */

export function renderHTML(pages) {
    return pages.map(renderPage).join('\n\n');
}

/* =========================
   PAGE
========================= */

function renderPage(page) {
    const body = renderNode(page, 1);

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escape(page.name || 'Dropple Page')}</title>
<style>
${baseStyles()}
</style>
</head>
<body>
${body}
</body>
</html>`;
}

/* =========================
   NODE
========================= */

function renderNode(node, depth = 0) {
    const indent = '  '.repeat(depth);
    const styles = styleToString(node.style);
    const children = node.children?.length ? '\n' + node.children.map((c) => renderNode(c, depth + 1)).join('\n') + '\n' + indent : '';

    switch (node.type) {
        case 'text':
            return `${indent}<p style="${styles}">${escape(node.text || '')}</p>`;

        case 'image':
            return `${indent}<img src="${node.src || ''}" style="${styles}" />`;

        default:
            return `${indent}<div style="${styles}">
${children}</div>`;
    }
}

/* =========================
   STYLES
========================= */

function styleToString(style = {}) {
    return Object.entries(style)
        .map(([k, v]) => `${toKebab(k)}:${v}`)
        .join(';');
}

function toKebab(str) {
    return str.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
}

/* =========================
   BASE STYLES
========================= */

function baseStyles() {
    return `
* {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}

img {
  max-width: 100%;
  display: block;
}
`;
}

/* =========================
   UTILS
========================= */

function escape(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
