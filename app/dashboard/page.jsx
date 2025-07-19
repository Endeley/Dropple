'use client';
import React from 'react';
import { createCanvas } from '@/services/Options';
import Header from '@/components/Header.jsx';
import Sidebar from '@/components/Sidebar.jsx';
import Image from 'next/image';
import { Upload, BrainCircuit, Pen } from 'lucide-react';
import { canvasSizeOptions } from '@/services/Options'; //
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
const page = () => {
    return (
        <div className='flex bg-gray-50 dark:bg-gray-800 min-h-screen  text-amber500'>
            <Sidebar />
            <div className=' flex flex-col w-full'>
                <Header />
                <h1 className='m-8 text-center text-gray-900  dark:text-gray-400 transition-colors text-2xl'>Create Anything you can Imagine</h1>
                <div className='flex flex-col items-center justify-center w-full p-4'>
                    <div className='flex flex-wrap justify-center gap-4 max-w-[1600px]'>
                        {createCanvas.map((option, index) => (
                            <div key={index} className='  grid grid-cols-3  items-center space-x-3 p-8 text-gray-900  dark:text-white  shadow-2xl hover:scale-105 transition-all  cursor-pointer'>
                                <option.icon className='w-6 h-6 text-indigo-400' /> {/* ✅ call it as JSX */}
                                <div className='w-30 '>
                                    <h2 className='text-base font-semibold'>{option.name}</h2>
                                    <p className='text-sm text-gray-400'>{option.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <motion.h1 className='mt-12 text-center text-gray-900 dark:text-white transition-colors text-xsm' initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                        Boost Your Present on Social Media platforms By Creating, post's Stories and Banners{' '}
                    </motion.h1>
                    <p className=' text-center text-gray-900 dark:text-white transition-colors text-xsm'>for</p>
                    <div className=' w-full p-2 flex justify-center mt-8 '>
                        {canvasSizeOptions.map((option, index) => (
                            <div key={index} className=' w-40 flex flex-col items-center justify-center rounded-2xl hover:scale-105 '>
                                <Image src={option.icon} alt={option.name} width={40} height={40} className=' w-[40px] h-[40px]   overflow-hidden rounded-full object-cover shadow-2xl ' />
                                <p className='text-center text-xs text-gray-900 dark:text-white mt-2'>{option.name}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default page;
