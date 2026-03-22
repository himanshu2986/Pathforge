import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  try {
    // Validate that Cloudinary credentials are configured
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      return NextResponse.json(
        { message: 'Cloudinary credentials are not configured on the server.' },
        { status: 500 }
      );
    }

    const { image, folder = 'pathforge' } = await req.json();

    if (!image) {
      return NextResponse.json({ message: 'No image data provided' }, { status: 400 });
    }

    // Upload to Cloudinary — auto-resize/compress to keep things fast
    const uploadResponse = await cloudinary.uploader.upload(image, {
      folder: folder,
      resource_type: 'auto',
      transformation: [{ width: 400, height: 400, crop: 'fill', quality: 'auto' }],
    });

    return NextResponse.json({
      url: uploadResponse.secure_url,
      publicId: uploadResponse.public_id,
    });
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    // Surface the real error message so the toast is actually helpful
    const message =
      error?.message ||
      error?.error?.message ||
      'Upload failed. Check your Cloudinary credentials.';
    return NextResponse.json({ message }, { status: 500 });
  }
}
