import { getConvexProvidersConfig } from '@stackframe/stack';

const projectId = process.env.NEXT_PUBLIC_STACK_PROJECT_ID;

export default {
    providers: getConvexProvidersConfig(projectId ? { projectId } : {}),
};
