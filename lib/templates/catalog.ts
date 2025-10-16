import { ComponentType } from 'react';

import { BusinessCard, BusinessTemplate, EcommerceTemplate, EditableInstagramPost, EducationTemplate, EnterpriseTemplate, Flyer, FoodTemplate, InstagramPost, InstagramStory, Invoice, PresentationSlide, RealEstateTemplate, Resume, SocialMediaTemplate, VisualTemplate } from '@/components/templates';

import { TEMPLATE_META, type TemplateCategory, type TemplateComponentKey, type TemplateThumbnail } from './catalogData';
import { getTemplatePreviewInfo } from './preview';

export interface TemplateEntry {
    slug: string;
    title: string;
    category: TemplateCategory;
    component: ComponentType<any>;
    componentKey: TemplateComponentKey;
    props: Record<string, unknown>;
    tags?: string[];
    thumbnail?: TemplateThumbnail;
    thumbnailLabel?: string;
    previewComponentKey: TemplateComponentKey;
    previewVariant?: string;
}

const COMPONENT_MAP: Record<TemplateComponentKey, ComponentType<any>> = {
    BusinessCard,
    BusinessTemplate,
    EcommerceTemplate,
    EditableInstagramPost,
    EducationTemplate,
    EnterpriseTemplate,
    Flyer,
    FoodTemplate,
    InstagramPost,
    InstagramStory,
    Invoice,
    PresentationSlide,
    RealEstateTemplate,
    Resume,
    SocialMediaTemplate,
    VisualTemplate,
};

export const CATEGORY_METADATA: Record<TemplateCategory, { label: string }> = {
    popular: { label: 'Popular' },
    business: { label: 'Business' },
    enterprise: { label: 'Enterprise' },
    ecommerce: { label: 'E-commerce' },
    education: { label: 'Education' },
    marketing: { label: 'Marketing' },
    realestate: { label: 'Real Estate' },
    food: { label: 'Food & Dining' },
    medical: { label: 'Medical' },
    travel: { label: 'Travel' },
    tech: { label: 'Tech' },
    logistics: { label: 'Logistics' },
    campaigns: { label: 'Campaigns' },
};

export const TEMPLATE_CATALOG: TemplateEntry[] = TEMPLATE_META.map((meta) => {
    const previewInfo = getTemplatePreviewInfo(meta.slug);

    return {
        slug: meta.slug,
        title: meta.title,
        category: meta.category,
        component: COMPONENT_MAP[meta.componentKey],
        componentKey: meta.componentKey,
        props: meta.componentProps ?? {},
        tags: meta.tags,
        thumbnail: meta.thumbnail,
        thumbnailLabel: meta.thumbnailLabel,
        previewComponentKey: previewInfo?.componentKey ?? meta.componentKey,
        previewVariant: previewInfo?.variant,
    };
});

export function getTemplateBySlug(slug: string): TemplateEntry | undefined {
    return TEMPLATE_CATALOG.find((item) => item.slug === slug);
}

export function getTemplatesByCategory(category: TemplateCategory): TemplateEntry[] {
    return TEMPLATE_CATALOG.filter((item) => item.category === category);
}

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
    'popular',
    'business',
    'enterprise',
    'ecommerce',
    'education',
    'marketing',
    'realestate',
    'food',
    'medical',
    'travel',
    'tech',
    'logistics',
    'campaigns',
];
