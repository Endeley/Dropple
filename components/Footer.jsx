import Image from 'next/image';
import { footerSections, footerLegalLinks, footerLinks } from '../lib/constants/home.constants';

export default function Footer() {
    return (
        <footer
            id='resources'
            className='rounded-[32px] border border-white/70 bg-white/80 px-6 py-8 text-sm text-slate-500 shadow-sm shadow-slate-200/50 transition dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-400 dark:shadow-slate-950/40'>
            <div className='flex w-full flex-col gap-8'>
                <div className='grid gap-8 sm:grid-cols-2 lg:grid-cols-5'>
                    {footerSections.map((section) => (
                        <div key={section.title} className='space-y-3 text-left'>
                            <h3 className='text-base font-semibold text-slate-900 dark:text-slate-100'>{section.title}</h3>
                            <ul className='space-y-2 text-sm text-slate-600 dark:text-slate-300'>
                                {section.links.map((link) => (
                                    <li key={link.label}>
                                        <a href={link.href} className='transition-colors hover:text-slate-900 dark:hover:text-slate-100'>
                                            {link.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                    <div className='space-y-4 text-left'>
                        <div className='flex items-center gap-3 text-slate-900 dark:text-slate-100'>
                            <Image src='/logo.svg' alt='Dropple logo' width={40} height={40} />
                            <span className='text-lg font-semibold'>Dropple</span>
                        </div>
                        <div className='space-y-2 text-sm text-slate-600 dark:text-slate-300'>
                            {footerLegalLinks.map((link) => (
                                <a key={link.label} href={link.href} className='block transition-colors hover:text-slate-900 dark:hover:text-slate-100'>
                                    {link.label}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
                <div className='flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-4 text-center text-xs text-slate-400 sm:flex-row sm:text-left dark:border-slate-800 dark:text-slate-500'>
                    <span>&copy; {new Date().getFullYear()} Dropple. All rights reserved.</span>
                    <nav className='flex flex-wrap items-center justify-center gap-4'>
                        {footerLinks.map((link) => (
                            <a key={link.label} href={link.href} className='transition-colors hover:text-slate-900 dark:hover:text-slate-100'>
                                {link.label}
                            </a>
                        ))}
                    </nav>
                </div>
            </div>
        </footer>
    );
}
