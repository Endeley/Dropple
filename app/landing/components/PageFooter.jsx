'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const PRIMARY_COLUMNS = [
    {
        title: 'Product',
        links: [
            { label: 'Background Remover', href: '/handler/sign-in' },
            { label: 'AI Studio', href: '/handler/sign-in' },
            { label: 'Graphic Templates', href: '/handler/sign-in' },
            { label: 'UI/UX Designer', href: '/handler/sign-in' },
            { label: 'Presentation Builder', href: '/handler/sign-in' },
            { label: 'Brand Kit & Mockups', href: '/handler/sign-in' },
        ],
    },
    {
        title: 'Solutions',
        links: [
            { label: 'For Designers', href: '/handler/sign-up' },
            { label: 'For Developers', href: '/handler/sign-up' },
            { label: 'For Businesses', href: '/handler/sign-up' },
            { label: 'For Teachers & Students', href: '/handler/sign-up' },
            { label: 'For Content Creators', href: '/handler/sign-up' },
        ],
    },
    {
        title: 'Resources',
        links: [
            { label: 'Docs', href: '/handler/sign-in' },
            { label: 'Tutorials & Guides', href: '/handler/sign-in' },
            { label: 'API Reference', href: '/handler/sign-in' },
            { label: 'Community Forum', href: '/handler/sign-in' },
            { label: 'Status Page', href: '/handler/sign-in' },
        ],
    },
    {
        title: 'Developers',
        links: [
            { label: 'Developer Mode', href: '/handler/sign-in' },
            { label: 'Dropple API', href: '/handler/sign-in' },
            { label: 'SDKs & Plugins', href: '/handler/sign-in' },
            { label: 'Code Export', href: '/handler/sign-in' },
            { label: 'Webhooks & Integrations', href: '/handler/sign-in' },
        ],
    },
    {
        title: 'Company',
        links: [
            { label: 'About Us', href: '/handler/sign-in' },
            { label: 'Careers', href: '/handler/sign-in' },
            { label: 'Press & Media', href: '/handler/sign-in' },
            { label: 'Partners', href: '/handler/sign-in' },
            { label: 'Roadmap', href: '/handler/sign-in' },
        ],
    },
];

const BRAND_SOCIALS = [
    { label: 'X', href: 'https://twitter.com' },
    { label: 'Instagram', href: 'https://instagram.com' },
    { label: 'LinkedIn', href: 'https://linkedin.com' },
    { label: 'YouTube', href: 'https://youtube.com' },
    { label: 'TikTok', href: 'https://tiktok.com' },
    { label: 'Discord', href: 'https://discord.gg' },
];

const BRAND_LINKS = [
    { label: 'Terms of Service', href: '/handler/sign-in' },
    { label: 'Privacy Policy', href: '/handler/sign-in' },
];

const FOOTER_NAV = [
    { label: 'About', href: '/handler/sign-in' },
    { label: 'Help', href: '/handler/sign-in' },
    { label: 'Privacy', href: '/handler/sign-in' },
    { label: 'Terms', href: '/handler/sign-in' },
];

export default function PageFooter() {
    const year = new Date().getFullYear();

    return (
        <footer className='bg-[var(--color-canvas)] pb-14 pt-24'>
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className='mx-auto w-full rounded-[2.75rem] border border-[rgba(148,163,184,0.25)] bg-[linear-gradient(135deg,_rgba(30,58,138,0.92),_rgba(139,92,246,0.85))] px-10 py-14 text-white shadow-[0_40px_120px_rgba(15,23,42,0.28)] backdrop-blur'
            >
                <div className='grid gap-y-12 gap-x-16 lg:grid-cols-6 xl:grid-cols-7'>
                    {PRIMARY_COLUMNS.map((column) => (
                        <div key={column.title} className='flex flex-col gap-3'>
                            <p className='text-sm font-semibold uppercase tracking-[0.18em] text-[rgba(255,255,255,0.7)]'>
                                {column.title}
                            </p>
                            <ul className='flex flex-col gap-2 text-sm text-[rgba(255,255,255,0.7)]'>
                                {column.links.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href}
                                            className='transition-colors hover:text-white'
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                    <div className='flex flex-col gap-5 lg:col-span-2'>
                        <div className='flex flex-col gap-2'>
                            <span className='inline-flex items-center gap-2 text-lg font-semibold'>
                                <span className='inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-base font-bold text-[var(--color-primary)]'>
                                    D
                                </span>
                                Dropple
                            </span>
                            <p className='text-sm text-[rgba(255,255,255,0.75)]'>
                                Create, design, and imagine anything — all in one intelligent workspace.
                            </p>
                        </div>
                        <div className='flex flex-wrap gap-2'>
                            {BRAND_SOCIALS.map((item) => (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className='inline-flex items-center justify-center rounded-full border border-[rgba(255,255,255,0.3)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[rgba(255,255,255,0.75)] transition-colors hover:border-white hover:text-white'
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                        <div className='flex flex-col gap-1 text-sm text-[rgba(255,255,255,0.75)]'>
                            {BRAND_LINKS.map((link) => (
                                <Link
                                    key={link.label}
                                    href={link.href}
                                    className='transition-colors hover:text-white'
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                <div className='mt-12 flex flex-col gap-4 border-t border-[rgba(255,255,255,0.18)] pt-6 text-xs text-[rgba(255,255,255,0.7)] sm:flex-row sm:items-center sm:justify-between'>
                    <div className='flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3'>
                        <span>© {year} Dropple. All rights reserved.</span>
                        <span className='hidden sm:inline'>•</span>
                        <span>Made with 💜 by the Dropple Team.</span>
                    </div>
                    <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6'>
                        <div className='flex flex-wrap items-center gap-4 text-[rgba(255,255,255,0.75)]'>
                            {FOOTER_NAV.map((item) => (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className='transition-colors hover:text-white'
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                        <Link
                            href='https://discord.gg'
                            className='inline-flex items-center justify-center rounded-full border border-[rgba(255,255,255,0.45)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white transition-transform hover:-translate-y-0.5 hover:border-white'
                        >
                            Join our community
                        </Link>
                    </div>
                </div>
            </motion.div>
        </footer>
    );
}
