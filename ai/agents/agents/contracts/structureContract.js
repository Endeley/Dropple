export const STRUCTURE_CONTRACT_VERSION = '1.0.0';

export const StructureInputSchema = {
    prompt: 'string',
};

export const StructureOutputSchema = {
    sitemap: 'object',
    pages: 'object[]',
    flows: 'object[]',
};

export const structureContract = StructureOutputSchema;
