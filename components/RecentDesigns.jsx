'use client';

import React, { useState } from 'react';
import { recentCanvas } from '@/services/Options';
import Image from 'next/image';
import { Button } from './ui/button';
import { Pen } from 'lucide-react';
const RecentDesigns = () => {
    const [designList, setDesignList] = useState([]);
    return (
        <div className='text-gray-900 dark:text-gray-200 transition-colors'>
            <h1 className='text-center mt-12 text-2xl font-semibold'>Recent Designs</h1>

            <div className='flex justify-center px-4 py-8'>
                {designList.length === 0 ? (
                    <div className='max-w-xl w-full flex flex-col items-center text-center'>
                        <Image src='/images/rc5.png' alt='No designs yet' width={400} height={200} className='object-cover rounded-2xl w-full max-w-md mb-6 transition-transform hover:scale-105' />
                        <h2 className='font-bold text-2xl text-gray-800 dark:text-gray-200 mb-4 '>You don't have any recent design yet.</h2>
                        <Button className='font-bold text-lg bg-indigo-700 hover:bg-indigo-500 hover:scale-105 transition px-6 py-2 flex gap-2 items-center'>
                            <Pen />+ Create
                        </Button>
                    </div>
                ) : (
                    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-8'>
                        {recentCanvas.map((recent, index) => (
                            <div key={index} className='w-[300px] h-[240px] overflow-hidden rounded-xl shadow-2xl transition-transform hover:scale-105 bg-white dark:bg-gray-800'>
                                <h1 className='font-bold mb-1 text-center'>{recent.name}</h1>
                                <Image src={recent.image} alt={recent.name} width={300} height={200} className='w-full h-full object-cover rounded-2xl' />
                                <p className='mt-2 text-gray-700 dark:text-gray-300 text-sm text-center'>{recent.text}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecentDesigns;
