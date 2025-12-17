/**
 * Normalize runtime nodes into an export-safe tree
 * NO canvas logic
 * NO zustand
 */

export function normalizeExportTree(nodes, rootIds) {
    return rootIds.map((id) => buildNode(nodes[id], nodes)).filter(Boolean);
}

function buildNode(node, nodes) {
    if (!node) return null;

    const isFlex = node.layout === 'flex';

    const children = (node.children || []).map((cid) => buildNode(nodes[cid], nodes)).filter(Boolean);

    return {
        id: node.id,
        type: node.type,
        name: node.name,

        layout: isFlex ? 'flex' : 'absolute',

        style: extractStyle(node),
        autoLayout: isFlex ? node.autoLayout : null,

        children,
    };
}

function extractStyle(node) {
    const style = {};

    // POSITIONING
    if (node.layout !== 'flex') {
        style.position = 'absolute';
        style.left = `${node.x ?? 0}px`;
        style.top = `${node.y ?? 0}px`;
        style.width = `${node.width}px`;
        style.height = `${node.height}px`;
    } else {
        style.display = 'flex';
        style.flexDirection = node.autoLayout.direction;
        style.gap = `${node.autoLayout.gap}px`;
        style.padding = `${node.autoLayout.padding}px`;
        style.justifyContent = mapJustify(node.autoLayout.justify);
        style.alignItems = mapAlign(node.autoLayout.align);
    }

    // SIZE MODES
    if (node.sizeX === 'fill') style.flex = node.flexGrow ?? 1;
    if (node.sizeX === 'fixed') style.width = `${node.width}px`;
    if (node.sizeY === 'fixed') style.height = `${node.height}px`;

    return style;
}

function mapJustify(value) {
    switch (value) {
        case 'start':
            return 'flex-start';
        case 'center':
            return 'center';
        case 'end':
            return 'flex-end';
        case 'space-between':
            return 'space-between';
        default:
            return 'flex-start';
    }
}

function mapAlign(value) {
    switch (value) {
        case 'start':
            return 'flex-start';
        case 'center':
            return 'center';
        case 'end':
            return 'flex-end';
        case 'stretch':
            return 'stretch';
        default:
            return 'flex-start';
    }
}
