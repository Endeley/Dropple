import { ComponentType } from 'react';

import { BusinessCard, BusinessTemplate, EcommerceTemplate, EditableInstagramPost, EducationTemplate, EnterpriseTemplate, Flyer, InstagramPost, InstagramStory, Invoice, PresentationSlide, Resume, SocialMediaTemplate, VisualTemplate } from '@/components/templates';

import { TEMPLATE_META, type TemplateCategory, type TemplateComponentKey } from './catalogData';

export interface TemplateEntry {
    slug: string;
    title: string;
    category: TemplateCategory;
    component: ComponentType<any>;
    props: Record<string, unknown>;
    tags?: string[];
    thumbnail?: string;
}

const PLACEHOLDER_THUMB = '/placeholder.png';

const COMPONENT_MAP: Record<TemplateComponentKey, ComponentType<any>> = {
    BusinessCard,
    BusinessTemplate,
    EcommerceTemplate,
    EditableInstagramPost,
    EducationTemplate,
    EnterpriseTemplate,
    Flyer,
    InstagramPost,
    InstagramStory,
    Invoice,
    PresentationSlide,
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
};

export const TEMPLATE_CATALOG: TemplateEntry[] = TEMPLATE_META.map((meta) => ({
    slug: meta.slug,
    title: meta.title,
    category: meta.category,
    component: COMPONENT_MAP[meta.componentKey],
    props: meta.componentProps ?? {},
    tags: meta.tags,
    thumbnail: meta.thumbnail ?? PLACEHOLDER_THUMB,
}));

export function getTemplateBySlug(slug: string): TemplateEntry | undefined {
    return TEMPLATE_CATALOG.find((item) => item.slug === slug);
}

export function getTemplatesByCategory(category: TemplateCategory): TemplateEntry[] {
    return TEMPLATE_CATALOG.filter((item) => item.category === category);
}

export const TEMPLATE_CATEGORIES: TemplateCategory[] = ['popular', 'business', 'enterprise', 'ecommerce', 'education'];
