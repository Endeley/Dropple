'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { UserButton } from '@stackframe/stack';

const Page = () => {
    return (
        <div className='flex flex-col items-center justify-center h-screen bg-gray-50'>
            <h1 className='text-5xl font-bold font-sans text-gray-900'>Dropple</h1>

            <Button className='m-4 font-bold text-lg px-6 py-3' variant='default'>
                Get Started
            </Button>

            <UserButton className='m-8' />

            <p className='text-gray-600 text-center mt-2'>Welcome to Dropple! Your journey begins here.</p>
            <p className='text-gray-600 text-center'>Explore our tools and design smarter, faster.</p>
        </div>
    );
};

export default Page;
