import { NextResponse } from 'next/server';
import ImageKit from 'imagekit';

let imagekit: ImageKit | null = null;
function getImageKit() {
    if (imagekit) return imagekit;

    const { IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT } = process.env;
    if (!IMAGEKIT_PUBLIC_KEY || !IMAGEKIT_PRIVATE_KEY || !NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT) {
        throw new Error('ImageKit environment variables not configured.');
    }

    imagekit = new ImageKit({
        publicKey: IMAGEKIT_PUBLIC_KEY,
        privateKey: IMAGEKIT_PRIVATE_KEY,
        urlEndpoint: NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT,
    });

    return imagekit;
}

export async function GET() {
    try {
        const authParams = getImageKit().getAuthenticationParameters();
        return NextResponse.json(authParams);
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'ImageKit configuration error.' },
            { status: 500 },
        );
    }
}
