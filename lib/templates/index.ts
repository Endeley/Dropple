import { getThemeByCategory } from './getThemeByCategory';
import { getRandomTheme } from './getRandomTheme';

import { BUSINESS_ENTERPRISE_TEMPLATES } from './json/businessEnterpriseTemplates';
import { SOCIAL_TEMPLATES } from './json/socialTemplates';
import { MARKETING_INVOICES_TEMPLATES } from './json/marketingInvoicesTemplates';
import { ECOMMERCE_EDUCATION_TEMPLATES } from './json/ecommerceEducationTemplates';
import { ECOMMERCE_MARKETING_TEMPLATES } from './json/ecommerceMarketingTemplates';
import { REAL_ESTATE_FOOD_TEMPLATES } from './json/realEstateFoodTemplates';
import { MEDICAL_TRAVEL_TEMPLATES } from './json/medicalTravelTemplates';
import { MEDICAL_HEALTH_TEMPLATES } from './json/medicalHealthTemplates';
import { PHOTOGRAPHY_CAMPAIGNS_TECH_LOGISTICS_TEMPLATES } from './json/photographyCampaignsTechLogisticsTemplates';
import { FOOD_REALESTATE_FASHION_NATURE_TEMPLATES } from './json/foodRealEstateFashionNatureTemplates';
import { EDUCATION_RESUME_MARKETING_INVOICES_TEMPLATES } from './json/educationResumeMarketingInvoicesTemplates';
import { BRAND_IDENTITY_TEMPLATES } from './json/brandIdentityTemplates';
import { CONTENT_CREATOR_TEMPLATES } from './json/contentCreatorTemplates';
import { AI_MOCKUP_TEMPLATES } from './json/aiMockupTemplates';
import { CULTURAL_HERITAGE_TEMPLATES } from './json/culturalHeritageTemplates';
import { FOOD_CAMPAIGNS_TEMPLATES } from './json/foodCampaignsTemplates';
import { TECH_TRANSPORT_STARTUP_TEMPLATES } from './json/techTransportStartupTemplates';
import { ABSTRACT_GRADIENT_TEMPLATES } from './json/abstractGradientTemplates';
import { TRAVEL_REALESTATE_PHOTOGRAPHY_TEMPLATES } from './json/travelRealEstatePhotographyTemplates';
import { PRESENTATIONS_SOCIAL_POPULAR_TEMPLATES } from './json/presentationsSocialPopularTemplates';
import { SEASONAL_HOLIDAY_TEMPLATES } from './json/seasonalHolidayTemplates';
import { EVENTS_INVITATIONS_TEMPLATES } from './json/eventsInvitationsTemplates';
import { INFOGRAPHICS_DATA_TEMPLATES } from './json/infographicsDataTemplates';
import { HYBRID_TEMPLATES_BATCH_01 } from './json/hybridTemplatesBatch01';

type Template = Record<string, any>;

function attachTheme(template: Template): Template {
    const existing = template.thumbnail;
    if (existing && typeof existing === 'object') {
        if (existing.type === 'css') {
            return template;
        }
        if (existing.type === 'image' || existing.type === 'hybrid') {
            return template;
        }
    }

    const useRandom = Math.random() < 0.25;
    const themeStyle = useRandom ? getRandomTheme() : getThemeByCategory(template.category ?? '');

    if (!themeStyle) {
        return template;
    }

    return {
        ...template,
        thumbnail: {
            type: 'css',
            style: themeStyle,
        },
    };
}

const mergedTemplates: Template[] = [
    ...HYBRID_TEMPLATES_BATCH_01,
    ...BUSINESS_ENTERPRISE_TEMPLATES,
    ...SOCIAL_TEMPLATES,
    ...MARKETING_INVOICES_TEMPLATES,
    ...ECOMMERCE_EDUCATION_TEMPLATES,
    ...ECOMMERCE_MARKETING_TEMPLATES,
    ...REAL_ESTATE_FOOD_TEMPLATES,
    ...MEDICAL_TRAVEL_TEMPLATES,
    ...MEDICAL_HEALTH_TEMPLATES,
    ...PHOTOGRAPHY_CAMPAIGNS_TECH_LOGISTICS_TEMPLATES,
    ...FOOD_REALESTATE_FASHION_NATURE_TEMPLATES,
    ...EDUCATION_RESUME_MARKETING_INVOICES_TEMPLATES,
    ...BRAND_IDENTITY_TEMPLATES,
    ...CONTENT_CREATOR_TEMPLATES,
    ...AI_MOCKUP_TEMPLATES,
    ...CULTURAL_HERITAGE_TEMPLATES,
    ...FOOD_CAMPAIGNS_TEMPLATES,
    ...TECH_TRANSPORT_STARTUP_TEMPLATES,
    ...ABSTRACT_GRADIENT_TEMPLATES,
    ...TRAVEL_REALESTATE_PHOTOGRAPHY_TEMPLATES,
    ...PRESENTATIONS_SOCIAL_POPULAR_TEMPLATES,
    ...SEASONAL_HOLIDAY_TEMPLATES,
    ...EVENTS_INVITATIONS_TEMPLATES,
    ...INFOGRAPHICS_DATA_TEMPLATES,
];

export const DROPPLE_TEMPLATES: Template[] = mergedTemplates.map(attachTheme);
