export type TemplateCategory =
    | 'popular'
    | 'business'
    | 'enterprise'
    | 'ecommerce'
    | 'education'
    | 'marketing'
    | 'realestate'
    | 'food'
    | 'medical'
    | 'travel'
    | 'tech'
    | 'logistics'
    | 'campaigns';

export type TemplateComponentKey =
    | 'BusinessCard'
    | 'BusinessTemplate'
    | 'EcommerceTemplate'
    | 'EditableInstagramPost'
    | 'EducationTemplate'
    | 'EnterpriseTemplate'
    | 'FoodTemplate'
    | 'Flyer'
    | 'InstagramPost'
    | 'InstagramStory'
    | 'Invoice'
    | 'MedicalTemplate'
    | 'PresentationSlide'
    | 'RealEstateTemplate'
    | 'Resume'
    | 'SocialMediaTemplate'
    | 'TravelTemplate'
    | 'VisualTemplate';

export type TemplateMetaPreview = {
    componentKey: TemplateComponentKey;
    variant?: string;
};

import { TEMPLATE_ARTBOARDS } from './json';
import { HYBRID_TEMPLATES_BATCH_01 } from './json/hybridTemplatesBatch01';
import { attachThumbnailsAndFixedLabels } from './thumbnailGenerator.packs';

export type CssThumbnail = {
    type: 'css';
    style: Record<string, string>;
    overlayCss?: Record<string, string>;
    focalPoint?: { x: number; y: number };
    alt?: string;
};

export type ImageThumbnail = {
    type: 'image';
    src: string;
    alt?: string;
    focalPoint?: { x: number; y: number };
    lqip?: string;
    filters?: { blur?: number; brightness?: number; contrast?: number; saturate?: number };
    overlayCss?: Record<string, string>;
};

export type HybridThumbnail = {
    type: 'hybrid';
    cssStyle: Record<string, string>;
    image: {
        src: string;
        alt?: string;
        focalPoint?: { x: number; y: number };
        lqip?: string;
    };
    overlayCss?: Record<string, string>;
};

export type TemplateThumbnail = string | CssThumbnail | ImageThumbnail | HybridThumbnail;

export type TemplateMetaRecord = {
    slug: string;
    title: string;
    category: TemplateCategory;
    componentKey: TemplateComponentKey;
    componentProps?: Record<string, unknown>;
    defaultData?: Record<string, unknown>;
    tags?: string[];
    thumbnail?: TemplateThumbnail;
    thumbnailLabel?: string;
    previewComponentKey?: TemplateComponentKey;
    previewVariant?: string;
};

const BASE_TEMPLATE_META: TemplateMetaRecord[] = [
    {
        slug: 'business-card-modern',
        title: 'Business Card – Modern',
        category: 'business',
        componentKey: 'BusinessCard',
        componentProps: { variant: 'modern' },
        tags: ['card', 'identity'],
    },
    {
        slug: 'business-card-classic',
        title: 'Business Card – Classic',
        category: 'business',
        componentKey: 'BusinessCard',
        componentProps: { variant: 'classic' },
    },
    {
        slug: 'business-card-creative',
        title: 'Business Card – Creative',
        category: 'business',
        componentKey: 'BusinessCard',
        componentProps: { variant: 'creative' },
    },
    {
        slug: 'business-card-1',
        title: 'Business Card – Professional',
        category: 'business',
        componentKey: 'BusinessCard',
        componentProps: { variant: 'modern' },
        tags: ['business card', 'professional', 'networking'],
        defaultData: TEMPLATE_ARTBOARDS['business-card-1'],
    },
    {
        slug: 'business-card-modern-blue-1',
        title: 'Business Card – Modern Blue',
        category: 'business',
        componentKey: 'BusinessCard',
        componentProps: { variant: 'modern-blue' },
        tags: ['business card', 'corporate', 'identity'],
        defaultData: TEMPLATE_ARTBOARDS['business-card-modern-blue-1'],
        previewVariant: 'modern-blue',
    },
    {
        slug: 'business-proposal',
        title: 'Business Proposal',
        category: 'business',
        componentKey: 'BusinessTemplate',
        componentProps: { variant: 'proposal' },
        tags: ['document'],
    },
    {
        slug: 'business-proposal-gradient-1',
        title: 'Business Proposal – Gradient Header',
        category: 'business',
        componentKey: 'BusinessTemplate',
        componentProps: { variant: 'proposal-gradient' },
        tags: ['proposal', 'document', 'presentation'],
        defaultData: TEMPLATE_ARTBOARDS['business-proposal-gradient-1'],
        previewVariant: 'proposal-gradient',
    },
    {
        slug: 'business-letterhead',
        title: 'Letterhead',
        category: 'business',
        componentKey: 'BusinessTemplate',
        componentProps: { variant: 'letterhead' },
    },
    {
        slug: 'business-letterhead-gray-1',
        title: 'Letterhead – Minimal Gray',
        category: 'business',
        componentKey: 'BusinessTemplate',
        componentProps: { variant: 'letterhead-gray' },
        tags: ['letterhead', 'document', 'corporate'],
        defaultData: TEMPLATE_ARTBOARDS['business-letterhead-gray-1'],
        previewVariant: 'letterhead-gray',
    },
    {
        slug: 'business-quote',
        title: 'Price Quotation',
        category: 'business',
        componentKey: 'BusinessTemplate',
        componentProps: { variant: 'quote' },
    },
    {
        slug: 'business-receipt',
        title: 'Payment Receipt',
        category: 'business',
        componentKey: 'BusinessTemplate',
        componentProps: { variant: 'receipt' },
    },
    {
        slug: 'resume-professional',
        title: 'Resume – Professional',
        category: 'business',
        componentKey: 'Resume',
        componentProps: { variant: 'professional' },
        tags: ['resume'],
    },
    {
        slug: 'resume-creative',
        title: 'Resume – Creative',
        category: 'business',
        componentKey: 'Resume',
        componentProps: { variant: 'creative' },
    },
    {
        slug: 'resume-minimal',
        title: 'Resume – Minimal',
        category: 'business',
        componentKey: 'Resume',
        componentProps: { variant: 'minimal' },
    },
    {
        slug: 'invoice-standard',
        title: 'Invoice – Standard',
        category: 'business',
        componentKey: 'Invoice',
        componentProps: { variant: 'standard' },
    },
    {
        slug: 'invoice-modern',
        title: 'Invoice – Modern',
        category: 'business',
        componentKey: 'Invoice',
        componentProps: { variant: 'modern' },
    },
    {
        slug: 'invoice-gradient-1',
        title: 'Invoice – Gradient Header',
        category: 'business',
        componentKey: 'Invoice',
        componentProps: { variant: 'gradient-header' },
        tags: ['invoice', 'finance', 'document'],
        defaultData: TEMPLATE_ARTBOARDS['invoice-gradient-1'],
        previewVariant: 'gradient-header',
    },
    {
        slug: 'business-email-signature-blue-1',
        title: 'Email Signature – Professional Blue',
        category: 'business',
        componentKey: 'BusinessTemplate',
        componentProps: { variant: 'email-signature-blue' },
        tags: ['email', 'signature', 'corporate'],
        defaultData: TEMPLATE_ARTBOARDS['business-email-signature-blue-1'],
        previewVariant: 'email-signature-blue',
    },
    {
        slug: 'business-invoice-modern-1',
        title: 'Invoice – Modern Minimal',
        category: 'business',
        componentKey: 'Invoice',
        componentProps: { variant: 'modern' },
        tags: ['invoice', 'document', 'finance'],
        defaultData: TEMPLATE_ARTBOARDS['business-invoice-modern-1'],
        previewVariant: 'modern-minimal',
    },
    {
        slug: 'invoice-clean-blue-1',
        title: 'Invoice – Clean Blue',
        category: 'business',
        componentKey: 'Invoice',
        componentProps: { variant: 'clean-blue' },
        tags: ['invoice', 'simple', 'blue'],
        defaultData: TEMPLATE_ARTBOARDS['invoice-clean-blue-1'],
        previewVariant: 'clean-blue',
    },
    {
        slug: 'invoice-modern-teal-1',
        title: 'Invoice – Modern Teal',
        category: 'business',
        componentKey: 'Invoice',
        componentProps: { variant: 'modern-teal' },
        tags: ['invoice', 'modern', 'teal'],
        defaultData: TEMPLATE_ARTBOARDS['invoice-modern-teal-1'],
        previewVariant: 'modern-teal',
    },
    {
        slug: 'invoice-minimal-gray-1',
        title: 'Invoice – Simple Minimal Gray',
        category: 'business',
        componentKey: 'Invoice',
        componentProps: { variant: 'minimal-gray' },
        tags: ['invoice', 'minimal', 'gray'],
        defaultData: TEMPLATE_ARTBOARDS['invoice-minimal-gray-1'],
        previewVariant: 'minimal-gray',
    },
    {
        slug: 'invoice-gradient-creative-1',
        title: 'Invoice – Creative Gradient',
        category: 'business',
        componentKey: 'Invoice',
        componentProps: { variant: 'gradient-creative' },
        tags: ['invoice', 'creative', 'gradient'],
        defaultData: TEMPLATE_ARTBOARDS['invoice-gradient-creative-1'],
        previewVariant: 'gradient-creative',
    },
    {
        slug: 'invoice-simple',
        title: 'Invoice – Simple',
        category: 'business',
        componentKey: 'Invoice',
        componentProps: { variant: 'simple' },
    },
    {
        slug: 'flyer-event',
        title: 'Flyer – Event',
        category: 'business',
        componentKey: 'Flyer',
        componentProps: { variant: 'event' },
        tags: ['flyer', 'event'],
    },
    {
        slug: 'flyer-sale',
        title: 'Flyer – Sale',
        category: 'business',
        componentKey: 'Flyer',
        componentProps: { variant: 'sale' },
    },
    {
        slug: 'flyer-service',
        title: 'Flyer – Service',
        category: 'business',
        componentKey: 'Flyer',
        componentProps: { variant: 'service' },
    },
    {
        slug: 'flyer-modern-1',
        title: 'Flyer – Bold & Colorful',
        category: 'business',
        componentKey: 'Flyer',
        componentProps: { variant: 'event' },
        tags: ['flyer', 'marketing', 'colorful'],
        defaultData: TEMPLATE_ARTBOARDS['flyer-modern-1'],
    },
    {
        slug: 'marketing-flyer-sale-1',
        title: 'Marketing Flyer – Bold Sale',
        category: 'marketing',
        componentKey: 'Flyer',
        componentProps: { variant: 'bold-sale' },
        tags: ['flyer', 'sale', 'promotion'],
        defaultData: TEMPLATE_ARTBOARDS['marketing-flyer-sale-1'],
        previewVariant: 'bold-sale',
    },
    {
        slug: 'marketing-poster-event-1',
        title: 'Marketing Poster – Event Promo',
        category: 'marketing',
        componentKey: 'Flyer',
        componentProps: { variant: 'event-promo' },
        tags: ['poster', 'event', 'concert'],
        defaultData: TEMPLATE_ARTBOARDS['marketing-poster-event-1'],
        previewVariant: 'event-promo',
    },
    {
        slug: 'marketing-banner-launch-1',
        title: 'Marketing Banner – Product Launch',
        category: 'marketing',
        componentKey: 'Flyer',
        componentProps: { variant: 'product-launch' },
        tags: ['banner', 'product', 'launch'],
        defaultData: TEMPLATE_ARTBOARDS['marketing-banner-launch-1'],
        previewVariant: 'product-launch',
    },
    {
        slug: 'marketing-social-ad-tech-1',
        title: 'Marketing Social Ad – Tech Startup',
        category: 'marketing',
        componentKey: 'Flyer',
        componentProps: { variant: 'social-tech' },
        tags: ['social', 'tech', 'ad'],
        defaultData: TEMPLATE_ARTBOARDS['marketing-social-ad-tech-1'],
        previewVariant: 'social-tech',
    },
    {
        slug: 'marketing-brochure-corporate-1',
        title: 'Marketing Brochure – Corporate',
        category: 'marketing',
        componentKey: 'Flyer',
        componentProps: { variant: 'brochure-corporate' },
        tags: ['brochure', 'corporate', 'print'],
        defaultData: TEMPLATE_ARTBOARDS['marketing-brochure-corporate-1'],
        previewVariant: 'brochure-corporate',
    },
    {
        slug: 'ecommerce-product-card',
        title: 'Product Card',
        category: 'ecommerce',
        componentKey: 'EcommerceTemplate',
        componentProps: { variant: 'product-card' },
    },
    {
        slug: 'ecommerce-product-card-1',
        title: 'E-commerce Product Card – Modern Clean',
        category: 'ecommerce',
        componentKey: 'EcommerceTemplate',
        componentProps: { variant: 'product-card-clean' },
        tags: ['product', 'card', 'clean'],
        defaultData: TEMPLATE_ARTBOARDS['ecommerce-product-card-1'],
        previewVariant: 'product-card-clean',
    },
    {
        slug: 'ecommerce-product-showcase',
        title: 'Product Showcase',
        category: 'ecommerce',
        componentKey: 'EcommerceTemplate',
        componentProps: { variant: 'product-showcase' },
    },
    {
        slug: 'ecommerce-product-showcase-1',
        title: 'E-commerce Product Showcase – Lifestyle',
        category: 'ecommerce',
        componentKey: 'EcommerceTemplate',
        componentProps: { variant: 'product-showcase-lifestyle' },
        tags: ['product', 'showcase', 'lifestyle'],
        defaultData: TEMPLATE_ARTBOARDS['ecommerce-product-showcase-1'],
        previewVariant: 'product-showcase-lifestyle',
    },
    {
        slug: 'ecommerce-sale-banner',
        title: 'Sale Banner',
        category: 'ecommerce',
        componentKey: 'EcommerceTemplate',
        componentProps: { variant: 'sale-banner' },
    },
    {
        slug: 'ecommerce-sale-banner-1',
        title: 'E-commerce Sale Banner – Fashion',
        category: 'ecommerce',
        componentKey: 'EcommerceTemplate',
        componentProps: { variant: 'sale-banner-fashion' },
        tags: ['sale', 'banner', 'fashion'],
        defaultData: TEMPLATE_ARTBOARDS['ecommerce-sale-banner-1'],
        previewVariant: 'sale-banner-fashion',
    },
    {
        slug: 'ecommerce-email-receipt',
        title: 'Email Receipt',
        category: 'ecommerce',
        componentKey: 'EcommerceTemplate',
        componentProps: { variant: 'email-receipt' },
    },
    {
        slug: 'ecommerce-email-receipt-1',
        title: 'E-commerce Email Receipt – Minimal',
        category: 'ecommerce',
        componentKey: 'EcommerceTemplate',
        componentProps: { variant: 'email-receipt-minimal' },
        tags: ['email', 'receipt', 'minimal'],
        defaultData: TEMPLATE_ARTBOARDS['ecommerce-email-receipt-1'],
        previewVariant: 'email-receipt-minimal',
    },
    {
        slug: 'ecommerce-shipping-update',
        title: 'Shipping Update',
        category: 'ecommerce',
        componentKey: 'EcommerceTemplate',
        componentProps: { variant: 'shipping-update' },
    },
    {
        slug: 'ecommerce-pricing-table',
        title: 'Pricing Table',
        category: 'ecommerce',
        componentKey: 'EcommerceTemplate',
        componentProps: { variant: 'pricing-table' },
    },
    {
        slug: 'ecommerce-pricing-table-1',
        title: 'E-commerce Pricing Table – Gradient',
        category: 'ecommerce',
        componentKey: 'EcommerceTemplate',
        componentProps: { variant: 'pricing-table-gradient' },
        tags: ['pricing', 'table', 'gradient'],
        defaultData: TEMPLATE_ARTBOARDS['ecommerce-pricing-table-1'],
        previewVariant: 'pricing-table-gradient',
    },
    {
        slug: 'realestate-listing-modern-1',
        title: 'Real Estate Listing – Modern Home',
        category: 'realestate',
        componentKey: 'RealEstateTemplate',
        componentProps: { variant: 'listing-modern' },
        tags: ['listing', 'property', 'sale'],
        defaultData: TEMPLATE_ARTBOARDS['realestate-listing-modern-1'],
        previewVariant: 'listing-modern',
    },
    {
        slug: 'realestate-open-house-1',
        title: 'Real Estate Flyer – Open House',
        category: 'realestate',
        componentKey: 'RealEstateTemplate',
        componentProps: { variant: 'open-house' },
        tags: ['flyer', 'open house', 'event'],
        defaultData: TEMPLATE_ARTBOARDS['realestate-open-house-1'],
        previewVariant: 'open-house',
    },
    {
        slug: 'realestate-agent-card-1',
        title: 'Real Estate – Agent Business Card',
        category: 'realestate',
        componentKey: 'RealEstateTemplate',
        componentProps: { variant: 'agent-card' },
        tags: ['business card', 'agent', 'identity'],
        defaultData: TEMPLATE_ARTBOARDS['realestate-agent-card-1'],
        previewVariant: 'agent-card',
    },
    {
        slug: 'realestate-carousel-1',
        title: 'Real Estate – Property Carousel',
        category: 'realestate',
        componentKey: 'RealEstateTemplate',
        componentProps: { variant: 'property-carousel' },
        tags: ['carousel', 'listing', 'wide'],
        defaultData: TEMPLATE_ARTBOARDS['realestate-carousel-1'],
        previewVariant: 'property-carousel',
    },
    {
        slug: 'realestate-agent-banner-1',
        title: 'Real Estate – Agent Profile Banner',
        category: 'realestate',
        componentKey: 'RealEstateTemplate',
        componentProps: { variant: 'agent-banner' },
        tags: ['banner', 'linkedin', 'profile'],
        defaultData: TEMPLATE_ARTBOARDS['realestate-agent-banner-1'],
        previewVariant: 'agent-banner',
    },
    {
        slug: 'education-certificate-gold-1',
        title: 'Education Certificate – Classic Gold',
        category: 'education',
        componentKey: 'EducationTemplate',
        componentProps: { variant: 'certificate-gold' },
        tags: ['certificate', 'award', 'classic'],
        defaultData: TEMPLATE_ARTBOARDS['education-certificate-gold-1'],
        previewVariant: 'certificate-gold',
    },
    {
        slug: 'education-report-card-1',
        title: 'Education Report Card – Simple',
        category: 'education',
        componentKey: 'EducationTemplate',
        componentProps: { variant: 'report-card' },
        tags: ['report', 'card', 'school'],
        defaultData: TEMPLATE_ARTBOARDS['education-report-card-1'],
        previewVariant: 'report-card',
    },
    {
        slug: 'education-lesson-plan-1',
        title: 'Education Lesson Plan – Minimal Teal',
        category: 'education',
        componentKey: 'EducationTemplate',
        componentProps: { variant: 'lesson-plan' },
        tags: ['lesson', 'plan', 'teacher'],
        defaultData: TEMPLATE_ARTBOARDS['education-lesson-plan-1'],
        previewVariant: 'lesson-plan',
    },
    {
        slug: 'education-class-schedule-1',
        title: 'Education Class Schedule – Gradient',
        category: 'education',
        componentKey: 'EducationTemplate',
        componentProps: { variant: 'class-schedule' },
        tags: ['schedule', 'class', 'gradient'],
        defaultData: TEMPLATE_ARTBOARDS['education-class-schedule-1'],
        previewVariant: 'class-schedule',
    },
    {
        slug: 'education-study-guide-1',
        title: 'Education Study Guide – Blue Accent',
        category: 'education',
        componentKey: 'EducationTemplate',
        componentProps: { variant: 'study-guide' },
        tags: ['study', 'guide', 'notes'],
        defaultData: TEMPLATE_ARTBOARDS['education-study-guide-1'],
        previewVariant: 'study-guide',
    },
    {
        slug: 'food-restaurant-ad-1',
        title: 'Food Promo – Restaurant Ad',
        category: 'food',
        componentKey: 'FoodTemplate',
        componentProps: { variant: 'restaurant-ad' },
        tags: ['restaurant', 'promo', 'ad'],
        defaultData: TEMPLATE_ARTBOARDS['food-restaurant-ad-1'],
        previewVariant: 'restaurant-ad',
    },
    {
        slug: 'food-menu-minimal-1',
        title: 'Food Menu – Minimal Chalk',
        category: 'food',
        componentKey: 'FoodTemplate',
        componentProps: { variant: 'menu-minimal' },
        tags: ['menu', 'restaurant', 'list'],
        defaultData: TEMPLATE_ARTBOARDS['food-menu-minimal-1'],
        previewVariant: 'menu-minimal',
    },
    {
        slug: 'food-story-gradient-1',
        title: 'Food Story – Gradient Promo',
        category: 'food',
        componentKey: 'FoodTemplate',
        componentProps: { variant: 'story-gradient' },
        tags: ['story', 'promo', 'gradient'],
        defaultData: TEMPLATE_ARTBOARDS['food-story-gradient-1'],
        previewVariant: 'story-gradient',
    },
    {
        slug: 'food-delivery-promo-1',
        title: 'Food Ad – Delivery Promo',
        category: 'food',
        componentKey: 'FoodTemplate',
        componentProps: { variant: 'delivery-promo' },
        tags: ['delivery', 'banner', 'ad'],
        defaultData: TEMPLATE_ARTBOARDS['food-delivery-promo-1'],
        previewVariant: 'delivery-promo',
    },
    {
        slug: 'food-recipe-card-1',
        title: 'Food – Recipe Card',
        category: 'food',
        componentKey: 'FoodTemplate',
        componentProps: { variant: 'recipe-card' },
        tags: ['recipe', 'card', 'kitchen'],
        defaultData: TEMPLATE_ARTBOARDS['food-recipe-card-1'],
        previewVariant: 'recipe-card',
    },
    {
        slug: 'ecommerce-product-review',
        title: 'Product Review',
        category: 'ecommerce',
        componentKey: 'EcommerceTemplate',
        componentProps: { variant: 'product-review' },
    },
    {
        slug: 'enterprise-dashboard',
        title: 'Analytics Dashboard',
        category: 'enterprise',
        componentKey: 'EnterpriseTemplate',
        componentProps: { variant: 'dashboard' },
    },
    {
        slug: 'enterprise-analytics',
        title: 'Analytics Report',
        category: 'enterprise',
        componentKey: 'EnterpriseTemplate',
        componentProps: { variant: 'analytics' },
    },
    {
        slug: 'enterprise-dashboard-analytics-1',
        title: 'Enterprise Dashboard – Analytics Overview',
        category: 'enterprise',
        componentKey: 'EnterpriseTemplate',
        componentProps: { variant: 'analytics-overview' },
        tags: ['dashboard', 'analytics', 'data'],
        defaultData: TEMPLATE_ARTBOARDS['enterprise-dashboard-analytics-1'],
        previewVariant: 'analytics-overview',
    },
    {
        slug: 'enterprise-summary',
        title: 'Executive Summary',
        category: 'enterprise',
        componentKey: 'EnterpriseTemplate',
        componentProps: { variant: 'executive-summary' },
    },
    {
        slug: 'enterprise-kpi',
        title: 'KPI Dashboard',
        category: 'enterprise',
        componentKey: 'EnterpriseTemplate',
        componentProps: { variant: 'kpi-dashboard' },
    },
    {
        slug: 'enterprise-annual-report-1',
        title: 'Enterprise Report – Annual Summary',
        category: 'enterprise',
        componentKey: 'EnterpriseTemplate',
        componentProps: { variant: 'annual-report' },
        tags: ['report', 'summary', 'business'],
        defaultData: TEMPLATE_ARTBOARDS['enterprise-annual-report-1'],
        previewVariant: 'annual-report',
    },
    {
        slug: 'enterprise-swot',
        title: 'SWOT Analysis',
        category: 'enterprise',
        componentKey: 'EnterpriseTemplate',
        componentProps: { variant: 'swot' },
    },
    {
        slug: 'enterprise-roadmap',
        title: 'Product Roadmap',
        category: 'enterprise',
        componentKey: 'EnterpriseTemplate',
        componentProps: { variant: 'roadmap' },
    },
    {
        slug: 'enterprise-kpi-panel-1',
        title: 'Enterprise KPI – Metrics Panel',
        category: 'enterprise',
        componentKey: 'EnterpriseTemplate',
        componentProps: { variant: 'kpi-panel' },
        tags: ['kpi', 'metrics', 'dashboard'],
        defaultData: TEMPLATE_ARTBOARDS['enterprise-kpi-panel-1'],
        previewVariant: 'kpi-panel',
    },
    {
        slug: 'enterprise-roadmap-vision-1',
        title: 'Enterprise Roadmap – Product Vision',
        category: 'enterprise',
        componentKey: 'EnterpriseTemplate',
        componentProps: { variant: 'roadmap-vision' },
        tags: ['roadmap', 'product', 'strategy'],
        defaultData: TEMPLATE_ARTBOARDS['enterprise-roadmap-vision-1'],
        previewVariant: 'roadmap-vision',
    },
    {
        slug: 'enterprise-architecture-layout-1',
        title: 'Enterprise Architecture – Tech Layout',
        category: 'enterprise',
        componentKey: 'EnterpriseTemplate',
        componentProps: { variant: 'architecture-layout' },
        tags: ['architecture', 'technology', 'infrastructure'],
        defaultData: TEMPLATE_ARTBOARDS['enterprise-architecture-layout-1'],
        previewVariant: 'architecture-layout',
    },
    {
        slug: 'presentation-title',
        title: 'Slide – Title',
        category: 'enterprise',
        componentKey: 'PresentationSlide',
        componentProps: { variant: 'title' },
    },
    {
        slug: 'presentation-content',
        title: 'Slide – Content',
        category: 'enterprise',
        componentKey: 'PresentationSlide',
        componentProps: { variant: 'content' },
    },
    {
        slug: 'presentation-data',
        title: 'Slide – Data',
        category: 'enterprise',
        componentKey: 'PresentationSlide',
        componentProps: { variant: 'data' },
    },
    {
        slug: 'building-facade',
        title: 'Building Facade',
        category: 'enterprise',
        componentKey: 'VisualTemplate',
        componentProps: { variant: 'facade' },
        tags: ['architecture', 'design'],
        thumbnail: 'https://images.unsplash.com/photo-1649767146802-1d5baa586638?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=400',
    },
    {
        slug: 'structural-engineering',
        title: 'Structural Engineering',
        category: 'enterprise',
        componentKey: 'VisualTemplate',
        componentProps: { variant: 'engineering' },
        tags: ['architecture', 'infrastructure'],
        thumbnail: 'https://images.unsplash.com/photo-1759397573675-5e1c3e0ef41a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=400',
    },
    {
        slug: 'sustainable-design',
        title: 'Sustainable Design',
        category: 'enterprise',
        componentKey: 'VisualTemplate',
        componentProps: { variant: 'sustainable' },
        tags: ['architecture', 'sustainability'],
        thumbnail: 'https://images.unsplash.com/photo-1627141234469-24711efb373c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=400',
    },
    {
        slug: 'renovation-project',
        title: 'Renovation Project',
        category: 'enterprise',
        componentKey: 'VisualTemplate',
        componentProps: { variant: 'renovation' },
        tags: ['architecture', 'before-after'],
        thumbnail: 'https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=400',
    },
    {
        slug: 'presentation-slide-1',
        title: 'Presentation Slide – Modern',
        category: 'enterprise',
        componentKey: 'PresentationSlide',
        componentProps: { variant: 'content' },
        tags: ['presentation', 'business', 'modern'],
        defaultData: TEMPLATE_ARTBOARDS['presentation-slide-1'],
    },
    {
        slug: 'education-certificate',
        title: 'Certificate of Completion',
        category: 'education',
        componentKey: 'EducationTemplate',
        componentProps: { variant: 'certificate' },
    },
    {
        slug: 'education-award',
        title: 'Achievement Award',
        category: 'education',
        componentKey: 'EducationTemplate',
        componentProps: { variant: 'award' },
    },
    {
        slug: 'education-lesson-plan',
        title: 'Lesson Plan',
        category: 'education',
        componentKey: 'EducationTemplate',
        componentProps: { variant: 'lesson-plan' },
    },
    {
        slug: 'education-report-card',
        title: 'Progress Report',
        category: 'education',
        componentKey: 'EducationTemplate',
        componentProps: { variant: 'report-card' },
    },
    {
        slug: 'education-study-guide',
        title: 'Study Guide',
        category: 'education',
        componentKey: 'EducationTemplate',
        componentProps: { variant: 'study-guide' },
    },
    {
        slug: 'education-class-schedule',
        title: 'Class Schedule',
        category: 'education',
        componentKey: 'EducationTemplate',
        componentProps: { variant: 'class-schedule' },
    },
    {
        slug: 'editable-instagram-fitness',
        title: 'Editable Instagram – Fitness',
        category: 'popular',
        componentKey: 'EditableInstagramPost',
        componentProps: { variant: 'fitness' },
        tags: ['instagram', 'fitness'],
        thumbnail: 'https://images.unsplash.com/photo-1618688862225-ac941a9da58f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=400',
    },
    {
        slug: 'editable-instagram-food',
        title: 'Editable Instagram – Food',
        category: 'popular',
        componentKey: 'EditableInstagramPost',
        componentProps: { variant: 'food' },
        tags: ['instagram', 'food'],
    },
    {
        slug: 'instagram-post-fitness',
        title: 'Instagram Post – Fitness',
        category: 'popular',
        componentKey: 'InstagramPost',
        componentProps: { variant: 'fitness' },
    },
    {
        slug: 'instagram-post-food',
        title: 'Instagram Post – Food',
        category: 'popular',
        componentKey: 'InstagramPost',
        componentProps: { variant: 'food' },
    },
    {
        slug: 'social-instagram-food-1',
        title: 'Instagram Post – Food Promo',
        category: 'popular',
        componentKey: 'InstagramPost',
        componentProps: { variant: 'food-promo' },
        tags: ['instagram', 'food', 'promo'],
        defaultData: TEMPLATE_ARTBOARDS['social-instagram-food-1'],
    },
    {
        slug: 'social-instagram-post-1',
        title: 'Instagram Post – Minimalist',
        category: 'popular',
        componentKey: 'InstagramPost',
        componentProps: { variant: 'minimal' },
        tags: ['instagram', 'social media', 'minimalist'],
        defaultData: TEMPLATE_ARTBOARDS['social-instagram-post-1'],
    },
    {
        slug: 'social-instagram-carousel-1',
        title: 'Instagram Carousel – Product Teaser',
        category: 'popular',
        componentKey: 'InstagramPost',
        componentProps: { variant: 'product-carousel' },
        tags: ['instagram', 'carousel', 'product'],
        defaultData: TEMPLATE_ARTBOARDS['social-instagram-carousel-1'],
    },
    {
        slug: 'social-instagram-fitness-1',
        title: 'Instagram Post – Fitness Motivation',
        category: 'popular',
        componentKey: 'InstagramPost',
        componentProps: { variant: 'fitness-motivation' },
        tags: ['instagram', 'fitness', 'motivation'],
        defaultData: TEMPLATE_ARTBOARDS['social-instagram-fitness-1'],
    },
    {
        slug: 'instagram-story-promo',
        title: 'Instagram Story – Promo',
        category: 'popular',
        componentKey: 'InstagramStory',
        componentProps: { variant: 'promo' },
    },
    {
        slug: 'social-story-1',
        title: 'Instagram Story – Gradient',
        category: 'popular',
        componentKey: 'InstagramStory',
        componentProps: { variant: 'promo' },
        tags: ['instagram', 'story', 'gradient'],
        defaultData: TEMPLATE_ARTBOARDS['social-story-1'],
    },
    {
        slug: 'social-instagram-fashion-1',
        title: 'Instagram Story – Gradient Fashion',
        category: 'popular',
        componentKey: 'InstagramStory',
        componentProps: { variant: 'fashion-story' },
        tags: ['instagram', 'story', 'fashion'],
        defaultData: TEMPLATE_ARTBOARDS['social-instagram-fashion-1'],
    },
    {
        slug: 'social-youtube-thumbnail',
        title: 'YouTube Thumbnail',
        category: 'popular',
        componentKey: 'SocialMediaTemplate',
        componentProps: { variant: 'youtube-thumbnail' },
        tags: ['youtube'],
    },
    {
        slug: 'social-youtube-tech-1',
        title: 'YouTube Thumbnail – Tech Review',
        category: 'popular',
        componentKey: 'SocialMediaTemplate',
        componentProps: { variant: 'youtube-tech' },
        tags: ['youtube', 'tech', 'thumbnail'],
        defaultData: TEMPLATE_ARTBOARDS['social-youtube-tech-1'],
    },
    {
        slug: 'social-twitter-post',
        title: 'Twitter Post',
        category: 'popular',
        componentKey: 'SocialMediaTemplate',
        componentProps: { variant: 'twitter-post' },
        tags: ['twitter'],
    },
    {
        slug: 'social-twitter-quote-1',
        title: 'Twitter Post – Quote',
        category: 'popular',
        componentKey: 'SocialMediaTemplate',
        componentProps: { variant: 'twitter-quote' },
        tags: ['twitter', 'quote', 'motivational'],
        defaultData: TEMPLATE_ARTBOARDS['social-twitter-quote-1'],
    },
    {
        slug: 'social-linkedin-banner',
        title: 'LinkedIn Banner',
        category: 'popular',
        componentKey: 'SocialMediaTemplate',
        componentProps: { variant: 'linkedin-banner' },
        tags: ['linkedin'],
    },
    {
        slug: 'social-linkedin-growth-1',
        title: 'LinkedIn Banner – Business Growth',
        category: 'popular',
        componentKey: 'SocialMediaTemplate',
        componentProps: { variant: 'linkedin-growth' },
        tags: ['linkedin', 'business', 'growth'],
        defaultData: TEMPLATE_ARTBOARDS['social-linkedin-growth-1'],
    },
    {
        slug: 'social-tiktok-cover',
        title: 'TikTok Cover',
        category: 'popular',
        componentKey: 'SocialMediaTemplate',
        componentProps: { variant: 'tiktok-cover' },
        tags: ['tiktok'],
    },
    {
        slug: 'social-tiktok-music-1',
        title: 'TikTok Cover – Music Artist',
        category: 'popular',
        componentKey: 'SocialMediaTemplate',
        componentProps: { variant: 'tiktok-music' },
        tags: ['tiktok', 'music', 'cover'],
        defaultData: TEMPLATE_ARTBOARDS['social-tiktok-music-1'],
    },
    {
        slug: 'social-facebook-restaurant-1',
        title: 'Facebook Ad – Restaurant',
        category: 'popular',
        componentKey: 'SocialMediaTemplate',
        componentProps: { variant: 'facebook-restaurant' },
        tags: ['facebook', 'restaurant', 'ad'],
        defaultData: TEMPLATE_ARTBOARDS['social-facebook-restaurant-1'],
    },
    {
        slug: 'social-pinterest-home-1',
        title: 'Pinterest Graphic – Home Decor Tips',
        category: 'popular',
        componentKey: 'SocialMediaTemplate',
        componentProps: { variant: 'pinterest-home' },
        tags: ['pinterest', 'home', 'decor'],
        defaultData: TEMPLATE_ARTBOARDS['social-pinterest-home-1'],
    },
];

function normalizeThumbnail(thumbnail: any): TemplateThumbnail | undefined {
    if (!thumbnail) return undefined;
    if (typeof thumbnail === 'string') return thumbnail;
    const { type } = thumbnail as { type?: string };
    if (type === 'hybrid') {
        const image = thumbnail.image ?? {};
        return {
            type: 'hybrid',
            cssStyle: { ...(thumbnail.cssStyle ?? {}) },
            image: {
                src: image.src ?? '',
                alt: image.alt,
                focalPoint: image.focalPoint,
                lqip: image.lqip,
            },
            overlayCss: thumbnail.overlayCss ? { ...thumbnail.overlayCss } : undefined,
        };
    }
    if (type === 'image') {
        return {
            type: 'image',
            src: thumbnail.src ?? '',
            alt: thumbnail.alt,
            focalPoint: thumbnail.focalPoint,
            lqip: thumbnail.lqip,
            filters: thumbnail.filters,
            overlayCss: thumbnail.overlayCss,
        };
    }
    if (type === 'css') {
        return {
            type: 'css',
            style: { ...(thumbnail.style ?? {}) },
            overlayCss: thumbnail.overlayCss ? { ...thumbnail.overlayCss } : undefined,
            focalPoint: thumbnail.focalPoint,
            alt: thumbnail.alt,
        };
    }
    return undefined;
}

const HYBRID_TEMPLATE_META: TemplateMetaRecord[] = HYBRID_TEMPLATES_BATCH_01.map((template) => ({
    slug: template.slug,
    title: template.title,
    category: template.category as TemplateCategory,
    componentKey: 'VisualTemplate',
    tags: template.tags,
    thumbnail: normalizeThumbnail(template.thumbnail),
    thumbnailLabel: template.thumbnailLabel,
}));

BASE_TEMPLATE_META.push(...HYBRID_TEMPLATE_META);

export const TEMPLATE_META: TemplateMetaRecord[] = attachThumbnailsAndFixedLabels(BASE_TEMPLATE_META);
