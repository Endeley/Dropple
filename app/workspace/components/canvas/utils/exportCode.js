const DEFAULT_LAYOUT_PADDING = { top: 64, right: 64, bottom: 64, left: 64 };
const DEFAULT_GRID_COLUMNS = 3;
const DEFAULT_GRID_AUTO_ROWS = 240;

const MAIN_ALIGN_MAP = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    'space-between': 'space-between',
    'space-around': 'space-around',
};

const CROSS_ALIGN_MAP = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    stretch: 'stretch',
};

const ALIGN_SELF_MAP = {
    auto: 'auto',
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    stretch: 'stretch',
};

const DEFAULT_FONT_FAMILY = "Inter, 'Segoe UI', Helvetica, Arial, sans-serif";

function normalizePadding(padding) {
    const base = { ...DEFAULT_LAYOUT_PADDING };
    if (!padding) return base;
    return {
        top: Number.isFinite(padding.top) ? padding.top : base.top,
        right: Number.isFinite(padding.right) ? padding.right : base.right,
        bottom: Number.isFinite(padding.bottom) ? padding.bottom : base.bottom,
        left: Number.isFinite(padding.left) ? padding.left : base.left,
    };
}

function formatPx(value) {
    if (!Number.isFinite(value)) return null;
    const rounded = Math.round(value * 1000) / 1000;
    return `${rounded}px`;
}

function escapeHtml(value) {
    if (typeof value !== 'string') return '';
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function indentLines(value, depth = 1) {
    if (!value) return '';
    const prefix = '  '.repeat(depth);
    return value
        .split('\n')
        .map((line) => (line ? prefix + line : line))
        .join('\n');
}

function mapJustify(value) {
    return MAIN_ALIGN_MAP[value] ?? 'flex-start';
}

function mapAlignItems(value) {
    return CROSS_ALIGN_MAP[value] ?? 'stretch';
}

function mapAlignSelf(value) {
    if (!value) return null;
    return ALIGN_SELF_MAP[value] ?? value;
}

function buildElementTree(elements, parentId = null) {
    if (!Array.isArray(elements)) return [];
    const filtered = elements
        .map((element, index) => ({ element, index }))
        .filter(({ element }) => (element.parentId ?? null) === parentId);

    filtered.sort((a, b) => {
        const orderA = Number.isFinite(a.element.layout?.order) ? a.element.layout.order : a.index;
        const orderB = Number.isFinite(b.element.layout?.order) ? b.element.layout.order : b.index;
        if (orderA === orderB) return a.index - b.index;
        return orderA - orderB;
    });

    return filtered.map(({ element }) => ({
        element,
        children: buildElementTree(elements, element.id),
    }));
}

function buildTransform(props = {}) {
    const parts = [];
    const rotation = Number.isFinite(props.rotation) ? props.rotation : 0;
    const skewX = Number.isFinite(props.skewX) ? props.skewX : 0;
    const skewY = Number.isFinite(props.skewY) ? props.skewY : 0;
    const scaleX = Number.isFinite(props.scaleX) ? props.scaleX : 1;
    const scaleY = Number.isFinite(props.scaleY) ? props.scaleY : 1;

    if (rotation) parts.push(`rotate(${rotation}deg)`);
    if (skewX || skewY) parts.push(`skew(${skewX}deg, ${skewY}deg)`);
    if (scaleX !== 1 || scaleY !== 1) parts.push(`scale(${scaleX}, ${scaleY})`);

    return parts.length ? parts.join(' ') : null;
}

function buildShadow(props = {}) {
    const shadows = [];
    if (props.shadowColor) {
        const offsetX = Number.isFinite(props.shadowOffsetX) ? props.shadowOffsetX : 0;
        const offsetY = Number.isFinite(props.shadowOffsetY) ? props.shadowOffsetY : 0;
        const blur = Number.isFinite(props.shadowBlur) ? props.shadowBlur : 0;
        const spread = Number.isFinite(props.shadowSpread) ? props.shadowSpread : 0;
        shadows.push(`${offsetX}px ${offsetY}px ${blur}px ${spread}px ${props.shadowColor}`);
    }
    if (props.glowColor) {
        const glowBlur = Number.isFinite(props.glowBlur) ? props.glowBlur : 24;
        shadows.push(`0 0 ${glowBlur}px ${props.glowColor}`);
    }
    return shadows.length ? shadows.join(', ') : null;
}

function buildFilter(props = {}) {
    const filters = [];
    if (Number.isFinite(props.blur) && props.blur > 0) filters.push(`blur(${props.blur}px)`);
    if (Number.isFinite(props.brightness) && props.brightness !== 100) filters.push(`brightness(${props.brightness / 100})`);
    if (Number.isFinite(props.contrast) && props.contrast !== 100) filters.push(`contrast(${props.contrast / 100})`);
    if (Number.isFinite(props.saturation) && props.saturation !== 100) filters.push(`saturate(${props.saturation / 100})`);
    if (Number.isFinite(props.hueRotate) && props.hueRotate !== 0) filters.push(`hue-rotate(${props.hueRotate}deg)`);
    return filters.length ? filters.join(' ') : null;
}

function buildBackground(props = {}, options = {}) {
    const declarations = [];
    const fillType = props.fillType ?? (props.imageUrl ? 'image' : 'solid');

    if (fillType === 'gradient') {
        const gradientType = props.gradientType ?? 'linear';
        const start = props.gradientStart ?? props.fill ?? '#8B5CF6';
        const end = props.gradientEnd ?? '#3B82F6';
        const angle = Number.isFinite(props.gradientAngle) ? props.gradientAngle : 45;
        let gradient;
        switch (gradientType) {
            case 'radial':
                gradient = `radial-gradient(circle, ${start} 0%, ${end} 100%)`;
                break;
            case 'conic':
                gradient = `conic-gradient(from ${angle}deg, ${start}, ${end})`;
                break;
            case 'linear':
            default:
                gradient = `linear-gradient(${angle}deg, ${start} 0%, ${end} 100%)`;
                break;
        }
        declarations.push(['background-image', gradient]);
        declarations.push(['background-repeat', 'no-repeat']);
        declarations.push(['background-size', 'cover']);
    } else if (fillType === 'image' && props.imageUrl) {
        declarations.push(['background-image', `url(${props.imageUrl})`]);
        declarations.push(['background-repeat', 'no-repeat']);
        declarations.push(['background-position', 'center']);
        declarations.push(['background-size', props.backgroundFit ?? 'cover']);
    } else if (fillType === 'pattern' && props.imageUrl) {
        const scale = Math.max(Number.isFinite(props.patternScale) ? props.patternScale : 1, 0.01);
        declarations.push(['background-image', `url(${props.imageUrl})`]);
        declarations.push(['background-repeat', props.patternRepeat ?? 'repeat']);
        declarations.push(['background-size', `${scale * 100}%`]);
        declarations.push([
            'background-position',
            `${Number.isFinite(props.patternOffsetX) ? props.patternOffsetX : 0}px ${Number.isFinite(props.patternOffsetY) ? props.patternOffsetY : 0}px`,
        ]);
    } else if (props.fill && options.applySolidFill !== false) {
        declarations.push(['background-color', props.fill]);
    }

    const blendMode = props.backgroundBlendMode ?? props.blendMode;
    if (blendMode && blendMode !== 'normal') {
        declarations.push(['mix-blend-mode', blendMode]);
    }

    return declarations;
}

function buildBorderRadius(props = {}) {
    if (props.cornerRadius && typeof props.cornerRadius === 'object') {
        const { topLeft = 0, topRight = 0, bottomRight = 0, bottomLeft = 0 } = props.cornerRadius;
        return `${topLeft}px ${topRight}px ${bottomRight}px ${bottomLeft}px`;
    }
    if (Number.isFinite(props.cornerRadius)) {
        return `${props.cornerRadius}px`;
    }
    return null;
}

function createFrameCss(frame, className) {
    const declarations = [
        ['position', 'relative'],
        ['box-sizing', 'border-box'],
        ['width', formatPx(frame.width) ?? 'auto'],
        ['height', formatPx(frame.height) ?? 'auto'],
        ['overflow', 'hidden'],
    ];

    const padding = normalizePadding(frame.layoutPadding);
    declarations.push([
        'padding',
        `${formatPx(padding.top)} ${formatPx(padding.right)} ${formatPx(padding.bottom)} ${formatPx(padding.left)}`,
    ]);

    const backgroundDeclarations = buildBackground(frame, { applySolidFill: true });
    declarations.push(...backgroundDeclarations);

    if (frame.layoutMode && frame.layoutMode !== 'absolute') {
        if (frame.layoutMode === 'grid') {
            const columns = Math.max(
                1,
                Number.isFinite(frame.layoutGridColumns) ? Math.floor(frame.layoutGridColumns) : DEFAULT_GRID_COLUMNS,
            );
            const columnGap = Number.isFinite(frame.layoutGap) ? frame.layoutGap : 0;
            const rowGap = Number.isFinite(frame.layoutRowGap) ? frame.layoutRowGap : columnGap;
            const autoRows = Number.isFinite(frame.layoutGridAutoRows) ? frame.layoutGridAutoRows : DEFAULT_GRID_AUTO_ROWS;
            const autoFitMode =
                frame.layoutGridAutoFit && frame.layoutGridAutoFit !== 'none' ? frame.layoutGridAutoFit : 'none';
            const minColumnWidth = Number.isFinite(frame.layoutGridMinColumnWidth)
                ? frame.layoutGridMinColumnWidth
                : DEFAULT_GRID_MIN_COLUMN_WIDTH;
            const minWidthPx = formatPx(minColumnWidth) ?? `${minColumnWidth}px`;
            const templateColumns =
                autoFitMode === 'none'
                    ? `repeat(${columns}, minmax(0, 1fr))`
                    : `repeat(${autoFitMode}, minmax(${minWidthPx}, 1fr))`;
            declarations.push(['display', 'grid']);
            declarations.push(['grid-template-columns', templateColumns]);
            declarations.push(['column-gap', formatPx(columnGap) ?? '0px']);
            declarations.push(['row-gap', formatPx(rowGap) ?? '0px']);
            declarations.push(['grid-auto-rows', formatPx(autoRows) ?? 'auto']);
            declarations.push(['justify-content', mapJustify(frame.layoutAlign)]);
            declarations.push(['align-content', mapAlignItems(frame.layoutCrossAlign)]);
        } else {
            declarations.push(['display', 'flex']);
            declarations.push(['flex-direction', frame.layoutMode === 'flex-row' ? 'row' : 'column']);
            if (Number.isFinite(frame.layoutGap) && frame.layoutGap > 0) {
                declarations.push(['gap', formatPx(frame.layoutGap)]);
            }
            declarations.push(['justify-content', mapJustify(frame.layoutAlign)]);
            declarations.push(['align-items', mapAlignItems(frame.layoutCrossAlign)]);
        }
    }

    const lines = declarations
        .filter(([, value]) => Boolean(value))
        .map(([property, value]) => `  ${property}: ${value === true ? 'initial' : value};`);

    return `.${className} {\n${lines.join('\n')}\n}`;
}

function createElementCss(element, parentContext, className) {
    const declarations = [['box-sizing', 'border-box']];
    const props = element.props ?? {};
    const parentLayoutMode = parentContext?.layoutMode ?? 'absolute';
    const layout = element.layout ?? {};

    if (parentLayoutMode === 'absolute') {
        declarations.push(['position', 'absolute']);
        declarations.push(['left', formatPx(props.x) ?? '0px']);
        declarations.push(['top', formatPx(props.y) ?? '0px']);
    } else {
        declarations.push(['position', 'relative']);
        if (parentLayoutMode === 'flex-row' || parentLayoutMode === 'flex-column') {
            const grow = Number.isFinite(layout.grow) ? layout.grow : 0;
            const shrink = Number.isFinite(layout.shrink) ? layout.shrink : 1;
            let basisValue = 'auto';
            if (Number.isFinite(layout.basis)) {
                basisValue = `${layout.basis}px`;
            } else if (parentLayoutMode === 'flex-row' && Number.isFinite(props.width)) {
                basisValue = `${props.width}px`;
            } else if (parentLayoutMode === 'flex-column' && Number.isFinite(props.height)) {
                basisValue = `${props.height}px`;
            }
            declarations.push(['flex', `${grow} ${shrink} ${basisValue}`]);

            const alignSelf = mapAlignSelf(layout.alignSelf);
            if (alignSelf) {
                declarations.push(['align-self', alignSelf]);
            }
        }
    }

    if (Number.isFinite(props.width)) {
        const shouldApplyWidth = parentLayoutMode === 'absolute' || parentLayoutMode === 'flex-column';
        if (shouldApplyWidth) declarations.push(['width', formatPx(props.width)]);
    }
    if (Number.isFinite(props.height)) {
        const shouldApplyHeight = parentLayoutMode === 'absolute' || parentLayoutMode === 'flex-row';
        if (shouldApplyHeight) declarations.push(['height', formatPx(props.height)]);
    }

    if (Number.isFinite(layout.minWidth)) declarations.push(['min-width', formatPx(layout.minWidth)]);
    if (Number.isFinite(layout.maxWidth)) declarations.push(['max-width', formatPx(layout.maxWidth)]);
    if (Number.isFinite(layout.minHeight)) declarations.push(['min-height', formatPx(layout.minHeight)]);
    if (Number.isFinite(layout.maxHeight)) declarations.push(['max-height', formatPx(layout.maxHeight)]);

    if (props.visible === false) declarations.push(['display', 'none']);

    const opacity = Number.isFinite(props.opacity) ? props.opacity : 1;
    if (opacity !== 1) declarations.push(['opacity', opacity]);

    const transformOrigin = props.transformOrigin ?? '50% 50%';
    if (transformOrigin) declarations.push(['transform-origin', transformOrigin]);

    const transform = buildTransform(props);
    if (transform) declarations.push(['transform', transform]);

    if (props.type === 'text') {
        // handled in text block creation
    }

    const borderRadius = buildBorderRadius(props);
    if (borderRadius) declarations.push(['border-radius', borderRadius]);

    if (props.stroke && Number.isFinite(props.strokeWidth) && props.strokeWidth > 0) {
        declarations.push(['border', `${props.strokeWidth}px solid ${props.stroke}`]);
    }

    const backgroundDeclarations = buildBackground(props, { applySolidFill: element.type !== 'text' });
    declarations.push(...backgroundDeclarations);

    if (element.type === 'image' && props.imageUrl) {
        declarations.push(['background-size', props.backgroundFit ?? 'cover']);
        declarations.push(['background-position', 'center']);
        declarations.push(['background-repeat', 'no-repeat']);
    }

    const boxShadow = buildShadow(props);
    if (boxShadow) declarations.push(['box-shadow', boxShadow]);

    const filter = buildFilter(props);
    if (filter) declarations.push(['filter', filter]);

    if (props.mixBlendMode && props.mixBlendMode !== 'normal') {
        declarations.push(['mix-blend-mode', props.mixBlendMode]);
    }

    if (element.type === 'text') {
        declarations.push(['color', props.fill ?? '#ECE9FE']);
        declarations.push(['font-size', formatPx(props.fontSize) ?? '16px']);
        declarations.push(['font-family', props.fontFamily ?? DEFAULT_FONT_FAMILY]);
        if (props.fontWeight) declarations.push(['font-weight', props.fontWeight]);
        if (props.fontStyle?.includes('italic')) declarations.push(['font-style', 'italic']);
        if (props.lineHeight) declarations.push(['line-height', props.lineHeight]);
        if (Number.isFinite(props.letterSpacing)) declarations.push(['letter-spacing', `${props.letterSpacing}px`]);
        if (props.textTransform) declarations.push(['text-transform', props.textTransform]);
        if (props.align) declarations.push(['text-align', props.align]);
        declarations.push(['white-space', 'pre-wrap']);

        if ((props.textFillType ?? 'solid') === 'gradient') {
            const start = props.textGradientStart ?? props.fill ?? '#8B5CF6';
            const end = props.textGradientEnd ?? '#3B82F6';
            const angle = Number.isFinite(props.textGradientAngle) ? props.textGradientAngle : 45;
            declarations.push(['background-image', `linear-gradient(${angle}deg, ${start} 0%, ${end} 100%)`]);
            declarations.push(['color', 'transparent']);
            declarations.push(['background-clip', 'text']);
            declarations.push(['-webkit-background-clip', 'text']);
            declarations.push(['-webkit-text-fill-color', 'transparent']);
        }

        if (props.textShadowColor) {
            const textShadowX = Number.isFinite(props.textShadowX) ? props.textShadowX : 0;
            const textShadowY = Number.isFinite(props.textShadowY) ? props.textShadowY : 0;
            const textShadowBlur = Number.isFinite(props.textShadowBlur) ? props.textShadowBlur : 0;
            declarations.push([
                'text-shadow',
                `${textShadowX}px ${textShadowY}px ${textShadowBlur}px ${props.textShadowColor}`,
            ]);
        }
    }

    if (element.type === 'group' && element.layoutMode && element.layoutMode !== 'absolute') {
        const padding = normalizePadding(element.layoutPadding);
        if (element.layoutMode === 'grid') {
            const colGap = Number.isFinite(element.layoutGap) ? element.layoutGap : 0;
            const rowGap = Number.isFinite(element.layoutRowGap) ? element.layoutRowGap : colGap;
            const columns = Math.max(
                1,
                Number.isFinite(element.layoutGridColumns) ? Math.floor(element.layoutGridColumns) : DEFAULT_GRID_COLUMNS,
            );
            const autoRows = Number.isFinite(element.layoutGridAutoRows) ? element.layoutGridAutoRows : DEFAULT_GRID_AUTO_ROWS;
            const autoFitMode =
                element.layoutGridAutoFit && element.layoutGridAutoFit !== 'none' ? element.layoutGridAutoFit : 'none';
            const minColumnWidth = Number.isFinite(element.layoutGridMinColumnWidth)
                ? element.layoutGridMinColumnWidth
                : DEFAULT_GRID_MIN_COLUMN_WIDTH;
            const minWidthPx = formatPx(minColumnWidth) ?? `${minColumnWidth}px`;
            const templateColumns =
                autoFitMode === 'none'
                    ? `repeat(${columns}, minmax(0, 1fr))`
                    : `repeat(${autoFitMode}, minmax(${minWidthPx}, 1fr))`;
            declarations.push(['display', 'grid']);
            declarations.push(['grid-template-columns', templateColumns]);
            declarations.push(['column-gap', formatPx(colGap) ?? '0px']);
            declarations.push(['row-gap', formatPx(rowGap) ?? '0px']);
            declarations.push(['grid-auto-rows', formatPx(autoRows) ?? 'auto']);
            declarations.push(['justify-content', mapJustify(element.layoutAlign)]);
            declarations.push(['align-content', mapAlignItems(element.layoutCrossAlign)]);
        } else {
            declarations.push(['display', 'flex']);
            declarations.push(['flex-direction', element.layoutMode === 'flex-row' ? 'row' : 'column']);
            if (Number.isFinite(element.layoutGap) && element.layoutGap > 0) {
                declarations.push(['gap', formatPx(element.layoutGap)]);
            }
            declarations.push(['justify-content', mapJustify(element.layoutAlign)]);
            declarations.push(['align-items', mapAlignItems(element.layoutCrossAlign)]);
        }
        declarations.push([
            'padding',
            `${formatPx(padding.top)} ${formatPx(padding.right)} ${formatPx(padding.bottom)} ${formatPx(padding.left)}`,
        ]);
    }

    if (parentLayoutMode === 'grid') {
        const columnSpan = Math.max(1, Number.isFinite(layout.gridColumnSpan) ? Math.floor(layout.gridColumnSpan) : 1);
        const rowSpan = Math.max(1, Number.isFinite(layout.gridRowSpan) ? Math.floor(layout.gridRowSpan) : 1);
        const columnStart =
            layout.gridColumnStart !== null && layout.gridColumnStart !== undefined
                ? Math.max(1, Math.floor(layout.gridColumnStart))
                : null;
        const rowStart =
            layout.gridRowStart !== null && layout.gridRowStart !== undefined
                ? Math.max(1, Math.floor(layout.gridRowStart))
                : null;

        if (columnStart) {
            declarations.push(['grid-column', `${columnStart} / span ${columnSpan}`]);
        } else {
            declarations.push(['grid-column', `span ${columnSpan}`]);
        }

        if (rowStart) {
            declarations.push(['grid-row', `${rowStart} / span ${rowSpan}`]);
        } else {
            declarations.push(['grid-row', `span ${rowSpan}`]);
        }

        const alignSelf = mapAlignSelf(layout.alignSelf);
        if (alignSelf) {
            declarations.push(['align-self', alignSelf]);
            if (alignSelf !== 'stretch') {
                declarations.push(['justify-self', alignSelf]);
            }
        }
    }

    const lines = declarations
        .filter(([, value]) => value !== null && value !== undefined)
        .map(([property, value]) => `  ${property}: ${value};`);

    return `.${className} {\n${lines.join('\n')}\n}`;
}

function serializeElementNode(node, parentContext, cssChunks) {
    const { element, children } = node;
    const className = `${element.type}-${element.id}`;
    const elementCss = createElementCss(element, parentContext, className);
    cssChunks.push(elementCss);

    let contentHtml = '';
    if (element.type === 'text') {
        const textContent = escapeHtml(element.props?.text ?? element.name ?? 'Text');
        contentHtml = `<p class="${className}">${textContent}</p>`;
        return contentHtml;
    }

    let childHtml = '';
    if (children.length > 0) {
        const nextContext = {
            layoutMode: element.layoutMode ?? 'absolute',
        };
        childHtml = children
            .map((child) => serializeElementNode(child, nextContext, cssChunks))
            .filter(Boolean)
            .join('\n');
    }

    const tag = 'div';
    const opening = `<${tag} class="${className}">`;
    const closing = `</${tag}>`;

    if (childHtml) {
        return `${opening}\n${indentLines(childHtml)}\n${closing}`;
    }

    return `${opening}${closing}`;
}

export function generateFrameExport(frame, options = {}) {
    if (!frame) return null;

    const frameClass = `frame-${frame.id}`;
    const cssChunks = [];

    const baseCss = [
        '.frame-export-root, .frame-export-root * {',
        '  box-sizing: border-box;',
        '  font-family: "Inter", "Segoe UI", Helvetica, Arial, sans-serif;',
        '}',
    ].join('\n');

    const frameCss = createFrameCss(frame, frameClass);
    cssChunks.push(baseCss, frameCss);

    const tree = buildElementTree(frame.elements ?? []);
    const childHtml = tree
        .map((node) => serializeElementNode(node, { layoutMode: frame.layoutMode ?? 'absolute' }, cssChunks))
        .filter(Boolean)
        .join('\n');

    const html =
        `<div class="frame-export-root ${frameClass}">` +
        (childHtml ? `\n${indentLines(childHtml)}\n` : '') +
        `</div>`;

    const css = cssChunks.join('\n\n');

    if (options.format === 'object') {
        return {
            frameId: frame.id,
            html,
            css,
        };
    }

    return {
        frameId: frame.id,
        html,
        css,
    };
}
