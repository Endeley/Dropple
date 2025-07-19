import React from 'react';
import Image from 'next/image';
// Adjust the path as necessary

const Header = () => {
    return (
        <header className=' bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-30 p-4 flex items-center justify-between'>
            <h1 className='font-bold'>Idea Hub</h1>
        </header>
    );
};

export default Header;
