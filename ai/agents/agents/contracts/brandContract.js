export const BRAND_CONTRACT_VERSION = '1.0.0';

export const BrandInputSchema = {
    prompt: 'string',
};

export const BrandOutputSchema = {
    palette: 'string[]',
    typography: {
        heading: 'string',
        body: 'string',
    },
    tone: 'string',
    logoStyle: 'string?',
};

export const brandContract = BrandOutputSchema;
