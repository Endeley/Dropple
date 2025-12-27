export const WIREFRAME_CONTRACT_VERSION = '1.0.0';

export const WireframeInputSchema = {
    structure: 'object',
};

export const WireframeOutputSchema = {
    pages: 'object[]',
    components: 'object[]',
};

export const wireframeContract = WireframeOutputSchema;
