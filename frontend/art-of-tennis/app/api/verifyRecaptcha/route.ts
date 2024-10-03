import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from "@/app/lib/backend";

export async function POST(req: NextRequest) {
  try {
    const { recaptchaToken, ...formData } = await req.json();

    if (!recaptchaToken) {
      return NextResponse.json({ success: false, message: 'reCAPTCHA token is required' }, { status: 400 });
    }

    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    const verifyUrl = 'https://www.google.com/recaptcha/api/siteverify';

    const reacaptchaResponse = await fetch(verifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secretKey}&response=${recaptchaToken}`,
    });

    if (!reacaptchaResponse.ok) {
      throw new Error('Failed to verify reCAPTCHA');
    }

    const recaptchaData = await reacaptchaResponse.json();

    if (recaptchaData.success) {
      // reCAPTCHA verification successful, process the form data
      // You can add your form processing logic here
      const response = await fetch(`${getBackendUrl()}/contactus/contactus-form/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

    const data = await response.json();
      console.log('Form data:', formData);

      return NextResponse.json({ success: true, message: 'Form submitted successfully' }, { status: 200 });
    } else {
      return NextResponse.json({ success: false, message: 'reCAPTCHA verification failed' }, { status: 400 });
    }
    
  } catch (error) {
    console.error('Error in reCAPTCHA verification:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}