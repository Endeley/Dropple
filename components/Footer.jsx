import Link from 'next/link';
import { footerSections, footerLegalLinks, footerLinks } from '../lib/constants/home.constants';
import BrandMark from './BrandMark.jsx';

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
                                        <Link href={link.href} className='transition-colors hover:text-slate-900 dark:hover:text-slate-100'>
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                    <div className='space-y-4 text-left'>
                        <BrandMark
                            size={40}
                            className='text-slate-900 dark:text-slate-100'
                            labelClassName='text-lg font-semibold'
                        />
                        <div className='space-y-2 text-sm text-slate-600 dark:text-slate-300'>
                            {footerLegalLinks.map((link) => (
                                <Link key={link.label} href={link.href} className='block transition-colors hover:text-slate-900 dark:hover:text-slate-100'>
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
                <div className='flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-4 text-center text-xs text-slate-400 sm:flex-row sm:text-left dark:border-slate-800 dark:text-slate-500'>
                    <span>&copy; {new Date().getFullYear()} Dropple. All rights reserved.</span>
                    <nav className='flex flex-wrap items-center justify-center gap-4'>
                        {footerLinks.map((link) => (
                            <Link key={link.label} href={link.href} className='transition-colors hover:text-slate-900 dark:hover:text-slate-100'>
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                </div>
            </div>
        </footer>
    );
}
