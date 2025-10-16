import { TEMPLATE_META, type TemplateComponentKey, type TemplateMetaPreview, type TemplateMetaRecord } from './catalogData';

const META_BY_SLUG = new Map<string, TemplateMetaRecord>(TEMPLATE_META.map((meta) => [meta.slug, meta]));

function inferVariant(meta: TemplateMetaRecord): string | undefined {
    if (meta.previewVariant) {
        return meta.previewVariant;
    }

    const candidate = meta.componentProps?.variant;
    return typeof candidate === 'string' ? candidate : undefined;
}

function inferPreviewComponentKey(meta: TemplateMetaRecord): TemplateComponentKey {
    return meta.previewComponentKey ?? meta.componentKey;
}

export function getTemplateMetaBySlug(slug: string): TemplateMetaRecord | undefined {
    return META_BY_SLUG.get(slug);
}

export function getTemplateComponentKey(slug: string): TemplateComponentKey | undefined {
    return META_BY_SLUG.get(slug)?.componentKey;
}

export function getTemplatePreviewInfo(slug: string): TemplateMetaPreview | undefined {
    const meta = getTemplateMetaBySlug(slug);
    if (!meta) return undefined;

    return {
        componentKey: inferPreviewComponentKey(meta),
        variant: inferVariant(meta),
    };
}
