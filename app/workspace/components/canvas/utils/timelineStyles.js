export function getVideoTimelineStyle(asset) {
    switch (asset.type) {
        case 'audio':
            return {
                icon: '🎵',
                style: {
                    backgroundImage:
                        'repeating-linear-gradient(135deg, rgba(96,165,250,0.35) 0, rgba(96,165,250,0.35) 6px, rgba(59,130,246,0.2) 6px, rgba(59,130,246,0.2) 12px)',
                },
            };
        case 'overlay':
            return {
                icon: '✨',
                style: {
                    backgroundImage:
                        'repeating-linear-gradient(90deg, rgba(236,233,254,0.15) 0, rgba(236,233,254,0.15) 4px, transparent 4px, transparent 8px)',
                    border: '1px dashed rgba(236,233,254,0.35)',
                },
            };
        case 'segment':
            return {
                icon: '🎬',
                style: {
                    backgroundImage: 'linear-gradient(135deg, rgba(168,85,247,0.55) 0%, rgba(14,165,233,0.55) 100%)',
                },
            };
        case 'clip':
        default:
            return {
                icon: '🎬',
                style: {
                    backgroundImage: 'linear-gradient(135deg, rgba(59,130,246,0.55) 0%, rgba(139,92,246,0.55) 100%)',
                },
            };
    }
}

export function getAnimationTimelineStyle(asset) {
    return getVideoTimelineStyle(asset);
}

export function getPodcastTimelineStyle(asset) {
    if (asset.type === 'segment') {
        return {
            icon: '🎙️',
            style: {
                backgroundImage: 'linear-gradient(135deg, rgba(16,185,129,0.45) 0%, rgba(52,211,153,0.55) 100%)',
            },
        };
    }
    if (asset.type === 'overlay') {
        return {
            icon: '🎶',
            style: {
                backgroundImage:
                    'repeating-linear-gradient(90deg, rgba(74,222,128,0.3) 0, rgba(74,222,128,0.3) 4px, transparent 4px, transparent 8px)',
                border: '1px dashed rgba(134,239,172,0.4)',
            },
        };
    }
    return {
        icon: '🎤',
        style: {
            backgroundImage:
                'repeating-linear-gradient(135deg, rgba(52,211,153,0.4) 0, rgba(52,211,153,0.4) 8px, rgba(22,163,74,0.25) 8px, rgba(22,163,74,0.25) 16px)',
        },
    };
}
