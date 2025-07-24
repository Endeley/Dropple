'use client';
import React from 'react';
import Header from '@/components/Header.jsx';
import Sidebar from '@/components/Sidebar.jsx';
import TopCards from '@/components/TopCards';
import RecentDesigns from '@/components/RecentDesigns';
const page = () => {
    return (
        <div className='flex bg-gray-50 dark:bg-gray-800 min-h-screen text-amber500'>
            <Sidebar />
            <div className=' flex flex-col w-full'>
                <Header />
                <TopCards />
                <RecentDesigns />
            </div>
        </div>
    );
};

export default page;
