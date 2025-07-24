'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toolSections } from '@/database/toolCategories';
import Image from 'next/image';
const tabs = Object.keys(toolSections);

export default function TopCards() {
    const [activeTab, setActiveTab] = useState(tabs[0]);
    const router = useRouter();
    const activeData = toolSections[activeTab];

    return (
        <div className='text-gray-900 dark:text-white transition-colors w-full'>
            <h1 className='mt-8 text-center text-2xl font-semibold'>Create Anything You Can Imagine</h1>

            {/* Toggle Tabs */}
            <div className='flex flex-wrap justify-center mt-6 gap-4'>
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 text-sm rounded-full border transition-colors capitalize
                            ${activeTab === tab ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-gray-200 dark:bg-gray-700 border-transparent'}`}>
                        {tab.replace(/[_-]/g, ' ')}
                    </button>
                ))}
            </div>

            {/* Cards Grid */}
            <div className='w-full flex flex-wrap items-center justify-center gap-6 mt-8'>
                {activeData.map((item, index) => (
                    <div key={index} onClick={() => router.push(item.path)} className='w-[280px] h-[180px] relative cursor-pointer overflow-hidden bg-white dark:bg-gray-800 rounded-xl shadow-2xl hover:scale-105 transition-transform p-4'>
                        {/* Badge */}
                        {item.badge && <span className='absolute top-2 right-2 bg-indigo-500 text-white text-xs px-2 py-1 rounded-full'>{item.badge}</span>}
                        {/* Icon Only */}
                        <div className='w-8 h-8 text-indigo-500 mb-4'>{item.icon}</div>

                        <h2 className='text-lg font-semibold'>{item.name}</h2>
                        <p className='text-sm text-gray-500 dark:text-gray-300'>{item.text}</p>
                    </div>
                ))}
            </div>

            {/* Animated Subtitle */}
            <motion.p className='text-center mt-12 text-sm text-gray-700 dark:text-gray-300 p-8 ' initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                Boost your social presence with stunning content tools
            </motion.p>
        </div>
    );
}
