export const templateComponentPresets = [
  {
    id: "heroStory",
    label: "Hero Story / Poster",
    description: "Full-bleed hero image with overlay text, badge, CTA, logo and subtle glass cards.",
    requiredNodes: [
      "hero image background",
      "gradient/overlay for contrast",
      "small badge/label",
      "headline",
      "subheadline",
      "primary CTA",
      "secondary CTA or icon chip",
      "logo or watermark",
    ],
    motion: [
      "staggered entrance for badge/headline/subheadline/CTA",
      "parallax/slow-pan on hero image",
      "hover scale on CTAs",
    ],
  },
  {
    id: "quoteCard",
    label: "Quote / Story Card",
    description: "Centered quote with author, background image/shape, accent stroke/icon.",
    requiredNodes: [
      "background image or gradient shape",
      "quote text",
      "author or handle",
      "accent icon or stroke",
      "CTA chip or link",
    ],
    motion: [
      "fade/slide in quote and author",
      "hover wiggle/scale on icon",
      "subtle loop/pulse on accent",
    ],
  },
  {
    id: "promoBanner",
    label: "Promo Banner",
    description: "Product/offer card with price, CTA, tag and supporting image.",
    requiredNodes: [
      "product or hero image",
      "headline",
      "supporting copy",
      "price or KPI chip",
      "primary CTA",
      "tag/badge",
    ],
    motion: [
      "slide/fade in text stack",
      "spring pop on badges",
      "gentle float/loop on image",
    ],
  },
  {
    id: "playlistCover",
    label: "Music/Playlist Cover",
    description: "Bold title, artist, cover art, gradient backdrop, and icon buttons.",
    requiredNodes: [
      "cover art image",
      "title",
      "artist/metadata",
      "play/cta buttons",
      "accent shapes or strokes",
    ],
    motion: [
      "bounce/spring on buttons",
      "slow rotate/scale on cover art",
      "hover glow on strokes",
    ],
  },
  {
    id: "materialCard",
    label: "Material UI Card",
    description: "Clean card with avatar/icon, title, description, actions, chip, divider.",
    requiredNodes: [
      "card surface with elevation",
      "avatar or icon",
      "title",
      "description",
      "primary/secondary actions",
      "supporting chip or badge",
    ],
    motion: [
      "hover lift + shadow",
      "tap compress",
      "enter fade/slide",
    ],
  },
  {
    id: "youtubeThumbnail",
    label: "YouTube Thumbnail",
    description: "Bold title, supporting kicker, creator badge, play icon, dramatic background.",
    requiredNodes: [
      "background image or gradient",
      "kicker/tag (e.g., NEW, TUTORIAL)",
      "main title with 2–3 lines",
      "creator/avatar badge",
      "play icon or watch label",
      "accent shapes/strokes",
    ],
    motion: [
      "pop on play icon",
      "staggered text entrance",
      "slow pan/zoom on background",
    ],
  },
  {
    id: "eventFlyer",
    label: "Event Flyer",
    description: "Hero photo, event title/date/location, CTA and sponsor strip.",
    requiredNodes: [
      "hero background image",
      "title",
      "date/time",
      "location line",
      "primary CTA",
      "sponsor/footer strip",
    ],
    motion: [
      "slide/fade for text stack",
      "hover lift on CTA",
      "ambient loop on background",
    ],
  },
  {
    id: "gradientQuote",
    label: "Gradient Quote",
    description: "High-contrast gradient panel with big quote, author, and accent icon.",
    requiredNodes: [
      "gradient or shape background",
      "quote text",
      "author/handle",
      "accent icon or stroke",
      "CTA chip (optional)",
    ],
    motion: [
      "fade/slide quote",
      "subtle pulse on accent",
      "hover wiggle on icon",
    ],
  },
  {
    id: "businessCard",
    label: "Business Card",
    description: "Clean card with name, title, contact, logo and accent band.",
    requiredNodes: [
      "background or split/band",
      "name",
      "title",
      "contact rows",
      "logo/mark",
      "accent band or chip",
    ],
    motion: [
      "hover lift + shadow",
      "enter slide/fade",
      "tiny parallax on logo",
    ],
  },
  {
    id: "podcastCover",
    label: "Podcast Cover",
    description: "Portrait/cover art with title, host, episode tag, waveform/icon.",
    requiredNodes: [
      "cover image",
      "podcast title",
      "host name",
      "episode tag or season badge",
      "play button or waveform icon",
      "accent shape/gradient",
    ],
    motion: [
      "bounce on play button",
      "slow float/scale on cover",
      "staggered text entry",
    ],
  },
];

export const templateComponentPresetMap = templateComponentPresets.reduce((acc, preset) => {
  acc[preset.id] = preset;
  return acc;
}, {});

export function buildComponentPrompt(presetId) {
  const preset = templateComponentPresetMap[presetId];
  if (!preset) return "";
  const req = preset.requiredNodes.join(", ");
  const motion = preset.motion.join("; ");
  return `Use the "${preset.label}" layout. Ensure these elements: ${req}. Add motion like: ${motion}. Position with sensible spacing and hierarchy.`;
}
