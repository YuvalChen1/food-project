import { NextResponse } from 'next/server';
import twilio from 'twilio';

// Initialize Twilio client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Helper function to format Israeli phone numbers
const formatIsraeliPhoneNumber = (phone: string) => {
  // Remove any non-digit characters
  const cleanNumber = phone.replace(/\D/g, '');
  
  // Remove leading 0 if exists and add +972
  if (cleanNumber.startsWith('0')) {
    return '+972' + cleanNumber.substring(1);
  }
  
  // If number doesn't start with 0, just add +972
  return '+972' + cleanNumber;
};

export async function POST(request: Request) {
  try {
    const { phoneNumber, message } = await request.json();

    // Debug logging
    console.log('Received request:', {
      originalPhone: phoneNumber,
      message: message,
      twilioCredentials: {
        accountSid: process.env.TWILIO_ACCOUNT_SID ? 'Set' : 'Not set',
        authToken: process.env.TWILIO_AUTH_TOKEN ? 'Set' : 'Not set',
        fromNumber: process.env.TWILIO_PHONE_NUMBER
      }
    });

    // Validate inputs
    if (!phoneNumber || !message) {
      return NextResponse.json(
        { error: 'Phone number and message are required' },
        { status: 400 }
      );
    }

    // Format the phone number
    const formattedPhoneNumber = formatIsraeliPhoneNumber(phoneNumber);
    console.log('Formatted phone number:', formattedPhoneNumber);

    // Send SMS using Twilio
    const result = await client.messages.create({
      body: message,
      to: formattedPhoneNumber,
      from: process.env.TWILIO_PHONE_NUMBER,
    });

    console.log('Twilio response:', result);
    return NextResponse.json({ success: true, messageId: result.sid });
  } catch (error: any) {
    console.error('Detailed SMS error:', {
      code: error.code,
      message: error.message,
      status: error.status,
      moreInfo: error.moreInfo
    });

    return NextResponse.json(
      { 
        error: 'Failed to send SMS',
        details: error.message,
        code: error.code 
      },
      { status: 500 }
    );
  }
} 