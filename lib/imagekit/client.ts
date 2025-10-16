import ImageKit from 'imagekitio-js';

const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY ?? process.env.IMAGEKIT_PUBLIC_KEY;
const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;

let client: ImageKit | null = null;

function getClient() {
    if (!client) {
        client = new ImageKit({
            publicKey: publicKey ?? '',
            urlEndpoint: urlEndpoint ?? '',
            authenticationEndpoint: '/api/imagekit-auth',
        });
    }
    return client;
}

export async function uploadImageFile(file: File, folder = 'dropple/user_uploads') {
    const sdk = getClient();
    const response = await sdk.upload({
        file,
        fileName: file.name,
        folder,
    });
    return { url: response.url, fileId: response.fileId };
}

export function buildTransformedUrl(src: string, transformation: string) {
    if (!src) return src;
    const separator = src.includes('?') ? '&' : '?';
    return `${src}${separator}tr=${transformation}`;
}
