'use client';
import React from 'react';
import Image from 'next/image';
import logo from '../public/assets/logo.png';
import { SidebarMenu } from '@/services/Options.jsx';
import { CirclePlus } from 'lucide-react';
import { UserButton } from '@stackframe/stack';
import { usePathname } from 'next/navigation';
const Sidebar = () => {
    const path = usePathname();
    return (
        <div className=' flex flex-col items-center shadow-2xl bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-white transition-colors min-h-screen w-40 '>
            <div className='flex flex-col items-center justify-center '>
                <Image src={logo} alt='alt' width={80} height={80} className='w-25 h-25 pb-0 transition-all duration-300 dark:color-white items-center  cursor-pointer' />
                <h1 className='font-bold mb-2'>Dropple</h1>
            </div>
            <div className='flex flex-col items-center gap-2 m-4 p-8 hover:bg-gray-200 dark:hover:bg-gray-800  hover:text-indigo-700 rounded-2xl hover:border-2 transition-colors cursor-pointer'>
                <CirclePlus className='w-12 h-12' />
                <h2>Create</h2>
            </div>
            {SidebarMenu.map((menu, index) => (
                <ul key={index}>
                    <li className={'flex flex-col items-center gap-2 m-2 p-4 hover:bg-gray-200 dark:hover:bg-gray-800  hover:text-indigo-700 rounded-2xl hover:border-2 transition-colors cursor-pointer text-xs' + (path === menu.path ? ' bg-gray-200 dark:bg-gray-800 text-indigo-700' : '')}>
                        <menu.icon />
                        <h2>{menu.name}</h2>
                    </li>
                </ul>
            ))}
            <div className='flex items-center justify-center m-8 mb-20'>
                <UserButton className=' bg-gray-800 rounded-2xl hover:border-2 transition-colors cursor-pointer ' />
            </div>
        </div>
    );
};

export default Sidebar;
