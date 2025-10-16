'use client';

import Image from 'next/image';

export default function OnlineUsers({ presences }) {
    return (
        <div className="flex -space-x-2">
            {presences.map((presence) => (
                <div key={presence._id} className="relative">
                    <Image
                        src={presence.userAvatar || '/avatar.png'}
                        alt={presence.userName}
                        width={28}
                        height={28}
                        className="rounded-full border border-white shadow-sm"
                    />
                    <div
                        className={`absolute bottom-0 right-0 h-2 w-2 rounded-full ${
                            presence.active ? 'bg-green-500' : 'bg-gray-400'
                        } border border-white`}
                    />
                </div>
            ))}
        </div>
    );
}
