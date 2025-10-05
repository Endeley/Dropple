// /lib/exportPptx.js (client-side)
import PptxGenJS from 'pptxgenjs';

export async function exportDesignToPptx(title, width, height, pages) {
    const pptx = new PptxGenJS();
    // Define a custom layout (convert px → inches at ~96dpi)
    pptx.defineLayout({ name: 'CUSTOM', width: width / 96, height: height / 96 });
    pptx.layout = 'CUSTOM';

    for (const page of pages) {
        const slide = pptx.addSlide();

        for (const obj of page.objects || []) {
            if (obj.type === 'rect') {
                slide.addShape(pptx.ShapeType.rect, {
                    x: (obj.left || 0) / 96,
                    y: (obj.top || 0) / 96,
                    w: (obj.width || 0) / 96,
                    h: (obj.height || 0) / 96,
                    fill: obj.fill || 'FFFFFF',
                    line: { color: 'FFFFFF', width: 0 },
                });
            } else if (obj.type === 'text') {
                slide.addText(obj.text || '', {
                    x: (obj.left || 0) / 96,
                    y: (obj.top || 0) / 96,
                    fontSize: obj.fontSize ? Math.round(obj.fontSize * 0.75) : 24, // px→pt approx
                    bold: !!(obj.fontWeight && Number(obj.fontWeight) >= 700),
                    color: obj.fill ? obj.fill.replace('#', '') : '111827',
                });
            }
            // You can add support for images, circles, etc. later
        }
    }

    await pptx.writeFile({ fileName: `${title || 'Presentation'}.pptx` });
}
