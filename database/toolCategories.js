// data/toolCategories.js
import { FaInstagram, FaFacebookF, FaYoutube, FaTwitter } from 'react-icons/fa';

import {
    Droplet,
    Image,
    Eraser,
    BadgeCent,
    Type,
    Sparkles,
    Palette,
    Sticker,
    Minimize,
    FileText,
    Calendar,
    LayoutDashboard,
    CreditCard,
    Scissors,
    Merge,
    Film,
    VolumeX,
    FileCode2,
    Filter,
    Subtitles,
    Video,
    Brush,
    Text,
    Mic,
    Mail,
    MonitorSmartphone,
    QrCode,
    Contact,
    Camera,
    Package,
    Monitor,
} from 'lucide-react';

export const toolSections = {
    tools: [
        {
            name: 'Background Remover',
            text: 'Remove background from photos',
            icon: <Droplet />,
            path: '/tools/bg-removal',
            badge: 'Pro',
            image: '/images/bgremoval.png',
        },
        {
            name: 'Image Editor',
            text: 'Crop, resize & enhance images',
            icon: <Image />,
            path: '/tools/editor',
            badge: 'New',
        },
        {
            name: 'Object Eraser',
            text: 'Erase unwanted objects',
            icon: <Eraser />,
            path: '/tools/object-eraser',
        },
        {
            name: 'Text Tool',
            text: 'Add stylish text to designs',
            icon: <Type />,
            path: '/tools/text-tool',
        },
        {
            name: 'Image Enhancer',
            text: 'Upscale & auto-fix photos',
            icon: <Sparkles />,
            path: '/tools/enhancer',
        },
        {
            name: 'Color Changer',
            text: 'Change color of backgrounds or clothes',
            icon: <Palette />,
            path: '/tools/color-changer',
        },
        {
            name: 'Sticker Maker',
            text: 'Design custom stickers or cutouts',
            icon: <Sticker />,
            path: '/tools/sticker-maker',
        },
        {
            name: 'Photo Compressor',
            text: 'Compress images for web',
            icon: <Minimize />,
            path: '/tools/compressor',
        },
    ],

    templates: [
        {
            name: 'Instagram Story',
            text: 'Ready-made IG story layouts',
            icon: <FaInstagram />,
            path: '/templates/instagram-story',
        },
        {
            name: 'Facebook Banner',
            text: 'Social media headers',
            icon: <FaFacebookF />,
            path: '/templates/facebook-banner',
        },
        {
            name: 'YouTube Thumbnail',
            text: 'Eye-catching YouTube covers',
            icon: <FaYoutube />,
            path: '/templates/youtube-thumbnail',
        },
        {
            name: 'Twitter Post',
            text: 'Design Twitter visuals fast',
            icon: <FaTwitter />,
            path: '/templates/twitter-post',
        },
        {
            name: 'Flyers & Posters',
            text: 'Promotional flyer templates',
            icon: <Image />,
            path: '/templates/posters',
        },
        {
            name: 'Event Invites',
            text: 'Stylish event invitation templates',
            icon: <Calendar />,
            path: '/templates/event-invites',
        },
        {
            name: 'Portfolio Layouts',
            text: 'Showcase your work beautifully',
            icon: <LayoutDashboard />,
            path: '/templates/portfolio',
        },
        {
            name: 'Business Cards',
            text: 'Design cards for professionals',
            icon: <CreditCard />,
            path: '/templates/business-cards',
        },
    ],

    videos: [
        {
            name: 'Video Trimmer',
            text: 'Trim and cut clips',
            icon: <Scissors />,
            path: '/videos/trimmer',
        },
        {
            name: 'Merge Clips',
            text: 'Combine multiple videos',
            icon: <Merge />,
            path: '/videos/merge',
        },
        {
            name: 'GIF Maker',
            text: 'Convert video to looping GIFs',
            icon: <Film />,
            path: '/videos/gif-maker',
            badge: 'Beta',
        },
        {
            name: 'Audio Remover',
            text: 'Mute or replace background audio',
            icon: <VolumeX />,

            path: '/videos/audio-remover',
        },
        {
            name: 'Video to Text',
            text: 'Transcribe spoken words to captions',
            icon: <FileCode2 />,

            path: '/videos/video-to-text',
        },
        {
            name: 'Video Filters',
            text: 'Apply effects to videos',
            icon: <Filter />,

            path: '/videos/filters',
        },
        {
            name: 'Auto Subtitles',
            text: 'Auto-generate subtitles for any clip',
            icon: <Subtitles />,
            path: '/videos/subtitles',
        },
        {
            name: 'Reel Editor',
            text: 'Cut & design reels for IG & TikTok',
            icon: <Video />,
            path: '/videos/reel-editor',
        },
    ],

    'Branding Tools': [
        {
            name: 'Logo Maker',
            text: 'Design professional logos',
            icon: <BadgeCent />,
            path: '/branding/logo-maker',
            badge: 'Pro',
        },
        {
            name: 'Brand Kit',
            text: 'Save colors, fonts, and logo presets',
            icon: <Brush />,
            path: '/branding/brand-kit',
        },
        {
            name: 'Business Card Designer',
            text: 'Design printable cards',
            icon: <CreditCard />,
            path: '/branding/business-card',
        },
    ],

    'AI Tools': [
        {
            name: 'AI Text Generator',
            text: 'Write social captions, ads & scripts',
            icon: <Text />,
            path: '/ai/text-generator',
        },
        {
            name: 'AI Art Creator',
            text: 'Generate images from prompts',
            icon: <Brush />,
            path: '/ai/art',
            badge: 'Beta',
        },
        {
            name: 'Voice Cloner',
            text: 'Mimic your voice for audio',
            icon: <Mic />,
            path: '/ai/voice-cloner',
        },
    ],

    'Marketing Tools': [
        {
            name: 'Email Header Designer',
            text: 'Create bold email graphics',
            icon: <Mail />,
            path: '/marketing/email-header',
        },
        {
            name: 'Ad Banner Generator',
            text: 'Banner ads for Google, Facebook, etc.',
            icon: <MonitorSmartphone />,
            path: '/marketing/ad-banner',
        },
        {
            name: 'QR Code Generator',
            text: 'Make scannable codes w/ logo',
            icon: <QrCode />,
            path: '/marketing/qr',
        },
    ],

    'Print & Docs': [
        {
            name: 'Poster Creator',
            text: 'Design high-res posters',
            icon: <Image />, // ✅ Good
            path: '/print/poster',
        },
        {
            name: 'Invoice Designer',
            text: 'Branded invoices for clients',
            icon: <Image />, // ✅ Safe fallback
            path: '/print/invoice',
        },
        {
            name: 'Resume Builder',
            text: 'Modern CVs and resumes',
            icon: <Contact />,
            path: '/print/resume',
        },
    ],

    'E-commerce Tools': [
        {
            name: 'Product Photo Editor',
            text: 'Remove BGs, enhance lighting',
            icon: <Camera />,
            path: '/ecommerce/photo-editor',
        },
        {
            name: 'Label & Packaging',
            text: 'Design labels, mockups',
            icon: <Package />,
            path: '/ecommerce/packaging',
        },
        {
            name: 'Mockup Generator',
            text: 'Preview product in real scenes',
            icon: <Monitor />,
            path: '/ecommerce/mockup-generator',
        },
    ],
};
