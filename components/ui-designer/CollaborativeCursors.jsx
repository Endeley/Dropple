'use client';

import Image from 'next/image';

export default function CollaborativeCursors({ presences }) {
    return presences
        .filter((presence) => presence.cursor && presence.active)
        .map((presence) => (
            <div
                key={presence._id}
                className="pointer-events-none absolute z-50 transition-transform"
                style={{ transform: `translate(${presence.cursor.x}px, ${presence.cursor.y}px)` }}
            >
                <div className="relative flex flex-col items-center">
                    <div className="h-4 w-4 rounded-full border-2 border-white bg-indigo-500 shadow-md" />
                    <div className="mt-1 whitespace-nowrap rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                        {presence.userName}
                    </div>
                    {presence.userAvatar ? (
                        <Image
                            src={presence.userAvatar}
                            width={18}
                            height={18}
                            alt={presence.userName}
                            className="absolute -top-6 left-2 rounded-full border border-white"
                        />
                    ) : null}
                </div>
            </div>
        ));
}
