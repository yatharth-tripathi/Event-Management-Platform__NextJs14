import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { meetingNumber, role } = body;

        // Get the SDK key and secret from environment variables
        const sdkKey = process.env.NEXT_PUBLIC_ZOOM_SDK_KEY;
        const sdkSecret = process.env.ZOOM_SDK_SECRET;

        if (!sdkKey || !sdkSecret) {
            return NextResponse.json(
                { error: 'Zoom credentials not configured' },
                { status: 500 }
            );
        }

        // Generate a timestamp
        const timestamp = new Date().getTime() - 30000;

        // Generate the signature
        const msg = Buffer.from(sdkKey + meetingNumber + timestamp + role).toString('base64');
        const hash = crypto.createHmac('sha256', sdkSecret).update(msg).digest('base64');
        const signature = Buffer.from(`${sdkKey}.${meetingNumber}.${timestamp}.${role}.${hash}`).toString('base64');

        return NextResponse.json({ signature });
    } catch (error) {
        console.error('Error generating Zoom signature:', error);
        return NextResponse.json(
            { error: 'Failed to generate signature' },
            { status: 500 }
        );
    }
}