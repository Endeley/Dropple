// /app/workspace/index.js
// Declarative registry imports are centralized under workspaces/registry.
import { graphicWorkspace } from '@/workspaces/registry/graphicWorkspace';
import { uiuxWorkspace } from '@/workspaces/registry/uiuxWorkspace';
import { videoWorkspace } from '@/workspaces/registry/videoWorkspace';
import { podcastWorkspace } from '@/workspaces/registry/podcastWorkspace';

import { aiWorkspace } from '@/workspaces/registry/aiWorkspace';
import { animationWorkspace } from '@/workspaces/registry/animationWorkspace';
import { brandingWorkspace } from '@/workspaces/registry/brandingWorkspace';
import { devWorkspace } from '@/workspaces/registry/devWorkspace';
import { documentsWorkspace } from '@/workspaces/registry/documentsWorkspace';
import { educationWorkspace } from '@/workspaces/registry/educationWorkspace';
import { iconWorkspace } from '@/workspaces/registry/iconWorkspace';
import { materialWorkspace } from '@/workspaces/registry/materialWorkspace';

/**
 * WorkspaceRegistry
 * -----------------
 * Single source of truth for all Dropple workspaces.
 *
 * ❗ No logic
 * ❗ No UI
 * ❗ No stores
 * ❗ Declarative only
 */
export const WorkspaceRegistry = {
    graphic: graphicWorkspace,
    uiux: uiuxWorkspace,
    video: videoWorkspace,
    podcast: podcastWorkspace,

    ai: aiWorkspace,
    animation: animationWorkspace,
    branding: brandingWorkspace,
    dev: devWorkspace,
    documents: documentsWorkspace,
    education: educationWorkspace,
    icon: iconWorkspace,
    material: materialWorkspace,
};
