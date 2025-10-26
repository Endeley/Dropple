import { getConvexProvidersConfig } from '@stackframe/stack';

const projectId = process.env.NEXT_PUBLIC_STACK_PROJECT_ID;

const providers = projectId ? getConvexProvidersConfig({ projectId }) : [];

const authConfig = {
    providers,
};

export default authConfig;
