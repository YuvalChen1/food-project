import { NextResponse } from 'next/server';
import twilio from 'twilio';

let client: any = null;

// Only initialize Twilio if all environment variables are present
if (process.env.TWILIO_ACCOUNT_SID && 
    process.env.TWILIO_AUTH_TOKEN && 
    process.env.TWILIO_PHONE_NUMBER) {
    client = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
    );
}

export async function POST(request: Request) {
    try {
        const { phoneNumber, message } = await request.json();

        // Check if Twilio is properly configured
        if (!client) {
            console.warn('Twilio is not configured. SMS will not be sent.');
            return NextResponse.json({ 
                success: false, 
                message: 'SMS service is not configured' 
            });
        }

        const result = await client.messages.create({
            body: message,
            to: phoneNumber,
            from: process.env.TWILIO_PHONE_NUMBER
        });

        return NextResponse.json({ success: true, result });
    } catch (error) {
        console.error('Error sending SMS:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Failed to send SMS' 
        }, { status: 500 });
    }
} 