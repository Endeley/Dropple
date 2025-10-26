export const MODE_CONFIG = {
    design: {
        label: 'Design',
        description: 'Graphics, layouts, posters, UI elements.',
        tools: [
            {
                id: 'pointer',
                name: 'Pointer / Move',
                description: 'Select and drag any element.',
            },
            {
                id: 'frame',
                name: 'Frame Tool',
                description: 'Create new page or artboard frames.',
            },
            {
                id: 'shape',
                name: 'Shapes',
                description: 'Draw rectangles, ellipses, and polygons.',
            },
            {
                id: 'text',
                name: 'Text Tool',
                description: 'Insert headings, paragraphs, or body text.',
            },
            {
                id: 'image',
                name: 'Image Tool',
                description: 'Import images or drag from assets.',
            },
            {
                id: 'ai-generator',
                name: 'AI Generator',
                description: 'Generate images or layouts from prompts.',
            },
            {
                id: 'layers',
                name: 'Layers Panel',
                description: 'Manage hierarchy, lock, hide, or group.',
            },
            {
                id: 'comment',
                name: 'Comment Tool',
                description: 'Add feedback and collaborate in context.',
            },
        ],
        inspectorSections: [
            {
                id: 'transform',
                title: 'Transform',
                items: ['Position', 'Size', 'Rotation', 'Alignment'],
            },
            {
                id: 'style',
                title: 'Style',
                items: ['Fill', 'Stroke', 'Shadow', 'Blur'],
            },
            {
                id: 'typography',
                title: 'Typography',
                items: ['Font family', 'Weight', 'Spacing', 'Alignment'],
            },
            {
                id: 'export',
                title: 'Export',
                items: ['PNG', 'SVG', 'PDF', 'React component'],
            },
        ],
        bottomActions: ['Zoom', 'Grid', 'Snapping', 'Undo', 'Redo', 'AI Suggestions'],
    },
    video: {
        label: 'Video',
        description: 'Timeline animation and keyframes.',
        tools: [
            { id: 'select', name: 'Select / Trim', description: 'Move or trim clips on the timeline.' },
            { id: 'clip', name: 'Clip Import', description: 'Add video, image, or audio clips.' },
            { id: 'overlay', name: 'Text Overlay', description: 'Add animated captions and titles.' },
            { id: 'shape', name: 'Motion Graphics', description: 'Add shapes or stickers with animation.' },
            { id: 'timeline', name: 'Timeline Scrubber', description: 'Navigate and scrub through time.' },
            { id: 'ai-scene', name: 'AI Scene Generator', description: 'Create scenes from text prompts.' },
        ],
        inspectorSections: [
            { id: 'clip-props', title: 'Clip Properties', items: ['Duration', 'Playback speed', 'Opacity'] },
            { id: 'transitions', title: 'Transitions', items: ['Type', 'Duration', 'Easing'] },
            { id: 'audio', title: 'Audio Track', items: ['Gain', 'Filters', 'Mix'] },
            { id: 'export', title: 'Export', items: ['Resolution', 'FPS', 'Format'] },
        ],
        bottomActions: ['Timeline tracks', 'Keyframes', 'Play / Pause', 'Render Preview'],
    },
    podcast: {
        label: 'Podcast',
        description: 'Idea → script → AI voice → episode.',
        tools: [
            { id: 'prompt', name: 'Idea Prompt', description: 'Generate structure from a concept.' },
            { id: 'script', name: 'Script Editor', description: 'Write or edit the narration.' },
            { id: 'voices', name: 'Voice Selector', description: 'Assign AI or recorded voices.' },
            { id: 'sound', name: 'Sound FX / Music', description: 'Add ambience and background tracks.' },
            { id: 'segment', name: 'Segment Frame', description: 'Add new sections like intro or outro.' },
            { id: 'record', name: 'Record / Upload', description: 'Capture or import real voice audio.' },
        ],
        inspectorSections: [
            { id: 'segment-info', title: 'Segment Info', items: ['Label', 'Duration', 'Start time'] },
            { id: 'voice-settings', title: 'Voice Settings', items: ['Voice ID', 'Pitch', 'Tempo', 'Tone'] },
            { id: 'background', title: 'Background Music', items: ['Track', 'Volume', 'Fade in/out'] },
            { id: 'export', title: 'Export', items: ['MP3', 'WAV', 'Video Podcast'] },
        ],
        bottomActions: ['Waveform timeline', 'Play / Pause', 'Split clip', 'AI Enhance Voice', 'Export'],
    },
    docs: {
        label: 'Docs',
        description: 'Text documents, books, resumes, slides.',
        tools: [
            { id: 'text', name: 'Text Box', description: 'Add paragraphs, titles, and lists.' },
            { id: 'image', name: 'Image Insert', description: 'Place inline images with captions.' },
            { id: 'table', name: 'Table / Chart', description: 'Add structured data visualizations.' },
            { id: 'page', name: 'Page Tool', description: 'Add or remove pages and sections.' },
            { id: 'ai-writer', name: 'AI Writer', description: 'Generate content for any topic.' },
            { id: 'template', name: 'Template Picker', description: 'Apply document or slide themes.' },
        ],
        inspectorSections: [
            { id: 'typography', title: 'Typography', items: ['Font', 'Size', 'Alignment', 'Spacing'] },
            { id: 'layout', title: 'Layout', items: ['Margins', 'Columns', 'Page size'] },
            { id: 'pagination', title: 'Pagination', items: ['Page numbers', 'Headers', 'Footers'] },
            { id: 'export', title: 'Export', items: ['PDF', 'EPUB', 'Slides'] },
        ],
        bottomActions: ['Page navigator', 'Word count', 'Grammar suggestions'],
    },
    dev: {
        label: 'Dev',
        description: 'Convert designs into production-ready code.',
        tools: [
            { id: 'code-view', name: 'Code View Toggle', description: 'Switch between design and code.' },
            { id: 'component', name: 'Component Inspector', description: 'Inspect element props and structure.' },
            { id: 'snippet', name: 'Snippet Tool', description: 'Copy partial code snippets in desired format.' },
            { id: 'api', name: 'API Connector', description: 'Bind components to live data.' },
            { id: 'export', name: 'Export Manager', description: 'Download or sync generated code.' },
        ],
        inspectorSections: [
            { id: 'props', title: 'Props', items: ['Prop types', 'Defaults', 'Validation'] },
            { id: 'theme', title: 'Theme', items: ['Theme token', 'Variant', 'State'] },
            { id: 'responsive', title: 'Responsive', items: ['Breakpoint styles', 'Layout modes'] },
            { id: 'export', title: 'Export Targets', items: ['React', 'HTML', 'Vue', 'Tailwind'] },
        ],
        bottomActions: ['Live preview', 'Run in sandbox', 'Push to GitHub', 'Console log'],
    },
    classroom: {
        label: 'Classroom',
        description: 'Teacher and student collaboration.',
        tools: [
            { id: 'assignment', name: 'Assignment Manager', description: 'Create and assign projects.' },
            { id: 'students', name: 'Student List', description: 'Manage participants and roles.' },
            { id: 'grading', name: 'Grade Tool', description: 'Evaluate submissions with rubrics.' },
            { id: 'ai-tutor', name: 'AI Tutor', description: 'Generate explanations and feedback.' },
            { id: 'discussion', name: 'Discussion', description: 'Open threaded discussions and Q&A.' },
        ],
        inspectorSections: [
            { id: 'assignment-details', title: 'Assignment Details', items: ['Due date', 'Rubric', 'Resources'] },
            { id: 'progress', title: 'Progress Tracking', items: ['Submission status', 'AI feedback'] },
            { id: 'permissions', title: 'Permissions', items: ['View', 'Comment', 'Edit rights'] },
        ],
        bottomActions: ['Start class', 'Record session', 'Enable live sync'],
    },
    brand: {
        label: 'Brand',
        description: 'Brand kits and marketing content.',
        tools: [
            { id: 'logo', name: 'Logo Generator', description: 'Create logo variations with AI.' },
            { id: 'palette', name: 'Palette Builder', description: 'Generate complementary color sets.' },
            { id: 'fonts', name: 'Font Pairing', description: 'Suggest type combinations for tone.' },
            { id: 'templates', name: 'Social Templates', description: 'Generate platform-specific posts.' },
            { id: 'analytics', name: 'Analytics Widget', description: 'Track campaign performance.' },
        ],
        inspectorSections: [
            { id: 'brand-assets', title: 'Brand Assets', items: ['Logos', 'Colors', 'Typography'] },
            { id: 'export', title: 'Export Kit', items: ['ZIP bundle', 'JSON', 'Brand book PDF'] },
            { id: 'license', title: 'License Info', items: ['Usage rights', 'Expiry', 'Distribution'] },
        ],
        bottomActions: ['Publish campaign', 'Share link', 'Schedule post'],
    },
};

export const MODE_LIST = ['design', 'video', 'podcast', 'docs', 'dev', 'classroom', 'brand'];
