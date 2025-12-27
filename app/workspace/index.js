// /app/workspace/index.js

import { graphicWorkspace } from './registry/graphicWorkspace';
import { uiuxWorkspace } from './registry/uiuxWorkspace';
import { videoWorkspace } from './registry/videoWorkspace';
import { podcastWorkspace } from './registry/podcastWorkspace';

import { aiWorkspace } from './registry/aiWorkspace';
import { animationWorkspace } from './registry/animationWorkspace';
import { brandingWorkspace } from './registry/brandingWorkspace';
import { devWorkspace } from './registry/devWorkspace';
import { documentsWorkspace } from './registry/documentsWorkspace';
import { educationWorkspace } from './registry/educationWorkspace';
import { iconWorkspace } from './registry/iconWorkspace';
import { materialWorkspace } from './registry/materialWorkspace';

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
