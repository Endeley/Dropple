import { Suspense } from 'react';
import Script from 'next/script';
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackClientApp } from "../stack/client";
import ConvexClientProvider from './ConvexClientProvider.jsx';
import './globals.css';

export const metadata = { title: 'Dropple', description: 'Design anything, fast.' };

export default function RootLayout({ children }) {
    return (
        <html lang='en' suppressHydrationWarning>
            <body>
                <Script id='theme-initializer' strategy='beforeInteractive'>
                    {`(() => {
                        const mq = window.matchMedia('(prefers-color-scheme: dark)');
                        const apply = () => document.documentElement.classList.toggle('dark', mq.matches);
                        apply();
                        mq.addEventListener('change', apply);
                    })();`}
                </Script>
                <StackProvider app={stackClientApp}>
                    <StackTheme>
                        <Suspense fallback={<div className='flex min-h-screen items-center justify-center text-sm text-slate-500'>Loading...</div>}>
                            <ConvexClientProvider>{children}</ConvexClientProvider>
                        </Suspense>
                    </StackTheme>
                </StackProvider>
            </body>
        </html>
    );
}
