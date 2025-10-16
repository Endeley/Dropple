// Text variant definitions for a UI designer tool
export const TEXT_VARIANTS = {
    h1: { label: 'Heading 1', size: 48, weight: 700, lineHeight: 1.15 },
    h2: { label: 'Heading 2', size: 40, weight: 700, lineHeight: 1.18 },
    h3: { label: 'Heading 3', size: 32, weight: 600, lineHeight: 1.2 },
    h4: { label: 'Heading 4', size: 28, weight: 600, lineHeight: 1.25 },
    h5: { label: 'Heading 5', size: 24, weight: 600, lineHeight: 1.3 },
    h6: { label: 'Heading 6', size: 20, weight: 600, lineHeight: 1.35 },
    subtitle: { label: 'Subtitle', size: 18, weight: 500, lineHeight: 1.35 },
    body: { label: 'Paragraph', size: 16, weight: 400, lineHeight: 1.45 },
    small: { label: 'Small', size: 13, weight: 400, lineHeight: 1.4 },
};

export const TEXT_VARIANT_OPTIONS = Object.entries(TEXT_VARIANTS).map(([key, spec]) => ({
    value: key,
    label: spec.label,
}));

export function resolveTextVariant(key) {
    return TEXT_VARIANTS[key] ?? TEXT_VARIANTS.body;
}
