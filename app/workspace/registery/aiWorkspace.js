// /workspace/index.js

import { GraphicWorkspace } from './registry/graphic.workspace';
import { UIUXWorkspace } from './registry/uiux.workspace';
import { VideoWorkspace } from './registry/video.workspace';
import { PodcastWorkspace } from './registry/podcast.workspace';

export const WorkspaceRegistry = {
    graphic: GraphicWorkspace,
    uiux: UIUXWorkspace,
    video: VideoWorkspace,
    podcast: PodcastWorkspace,
};
