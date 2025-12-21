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
