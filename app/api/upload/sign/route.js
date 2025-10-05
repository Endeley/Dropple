import ImageKit from 'imagekit-javascript';

const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

export async function GET() {
    const auth = imagekit.getAuthenticationParameters();
    return Response.json(auth);
}
