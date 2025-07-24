import { LayoutDashboard, LayoutPanelTop, Component, Diamond, Brain, Camera, Aperture, Settings, Hexagon, Video, WalletMinimal, Droplet, Image, Proportions, Share2, Play } from 'lucide-react';
export const SidebarMenu = [
    {
        name: 'Dashboard',
        path: '/dashboard',
        icon: LayoutDashboard,
    },
    {
        name: 'Templates',
        path: '/templates',
        icon: LayoutPanelTop,
    },
    {
        name: 'Bg Removal',
        path: '/bg-removal',
        icon: Aperture,
    },
    {
        name: 'Logo Maker',
        path: '/logo-maker',
        icon: Hexagon,
    },
    {
        name: 'My Designs',
        path: '/designs',
        icon: Component,
    },
    {
        name: 'Projects',
        path: '/projects',
        icon: Diamond,
    },
    {
        name: 'Ai-Tools',
        path: '/ai-tools',
        icon: Brain,
    },
    {
        name: 'Photo Tools',
        path: '/photo-tools',
        icon: Camera,
    },
    {
        name: 'Video Tools',
        path: '/video-tools',
        icon: Video,
    },
    {
        name: 'Settings',
        path: '/settings',
        icon: Settings,
    },
    {
        name: 'Billing',
        path: '/billing',
        icon: WalletMinimal,
    },
];

export const createCanvas = [
    {
        name: 'BG Removal',
        icon: Droplet,
        text: 'Remove Background',
    },
    {
        name: 'Image Editing',
        icon: Image,
        text: 'Enhance and Edit Images',
    },
    {
        name: 'AI Tools',
        icon: Brain,
        text: 'Text to Image or speech Generation',
    },
    {
        name: 'Presentations',
        icon: Proportions,
        text: 'For Power Point or Google Slides',
    },
    {
        name: 'Social Media',
        icon: Share2,
        text: 'Thumbnail, Post, Story, Banner Creation',
    },
    {
        name: 'Video Tools',
        icon: Play,
        text: 'Cropping, Merging, and Editing Videos',
    },
];

export const canvasSizeOptions = [
    {
        name: 'Instagram Story',
        size: { width: 40, height: 40 },
        icon: '/images/instagram1.jpeg',
    },
    {
        name: 'Instagram Post',
        size: { width: 40, height: 40 },
        icon: '/images/instagram1.jpg',
    },
    {
        name: 'Facebook Post',
        size: { width: 40, height: 40 },
        icon: '/images/facebookpost.png',
    },
    {
        name: 'Facebook Banner',
        size: { width: 40, height: 40 },
        icon: '/images/facebookpost.png',
    },
    {
        name: 'YouTube Banner',
        size: { width: 40, height: 40 },
        icon: '/images/youtubebanner.jpg',
    },
    {
        name: 'YouTube Post',
        size: { width: 40, height: 40 },
        icon: '/images/youtubepost.jpeg',
    },
    {
        name: 'TikTok Post',
        size: { width: 40, height: 40 },
        icon: '/images/tiktok.png',
    },
    {
        name: 'TikTok Story',
        size: { width: 40, height: 40 },
        icon: '/images/tiktok.png',
    },
];

export const recentCanvas = [
    {
        name: 'E-commerce',
        image: '/images/p22.png',
        text: 'E-commerce',
    },
    {
        name: 'Bg Removal',
        image: '/images/bgremoval.png',
        text: 'remove image backgrounds',
    },
    {
        name: 'Instagram Post',
        image: '/images/rc1.png',
        text: 'Create Instagram Story',
    },
    {
        name: 'Image Editing',
        image: '/images/imgediting.png',
        text: 'edit any image',
    },
    {
        name: 'Ai Image Generate',
        image: '/images/p18.png',
        text: 'Ai Generated Image',
    },
    {
        name: 'Presentation',
        image: '/images/rc7.png',
        text: 'Create Presentations',
    },
];
