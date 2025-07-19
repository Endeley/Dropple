'use client';

import { useEffect, useState } from 'react';

export default function ThemeToggle() {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        // Load theme from localStorage
        const theme = localStorage.getItem('theme');
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            setIsDark(true);
        }
    }, []);

    const toggleTheme = () => {
        const html = document.documentElement;

        if (html.classList.contains('dark')) {
            html.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            setIsDark(false);
        } else {
            html.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            setIsDark(true);
        }
    };

    return (
        <button onClick={toggleTheme} className='px-4 py-2 rounded bg-gray-100 dark:bg-gray-800 text-black dark:text-white transition'>
            {isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
    );
}
