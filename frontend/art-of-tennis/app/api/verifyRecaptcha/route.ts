import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from "@/app/lib/backend";

export async function POST(req: NextRequest) {
  try {
    const { recaptchaToken } = await req.json();

    if (!recaptchaToken) {
      return NextResponse.json({ message: 'reCAPTCHA token is required' }, { status: 400 });
    }

    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    const verifyUrl = 'https://www.google.com/recaptcha/api/siteverify';

    const response = await fetch(verifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secretKey}&response=${recaptchaToken}`,
    });

    if (!response.ok) {
      throw new Error('Failed to verify reCAPTCHA');
    }

    const data = await response.json();

    if (data.success) {
      return NextResponse.json({ success: true }, { status: 200 });
    } else {
      return NextResponse.json({ success: false, message: 'reCAPTCHA verification failed' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in reCAPTCHA verification:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}