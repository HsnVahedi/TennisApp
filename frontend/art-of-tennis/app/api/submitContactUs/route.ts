import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const jsonData = await req.json();
  const turnstileResponse = jsonData['cf-turnstile-response'];

  // Verify Turnstile token
  const verificationResponse = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: `${process.env.NEXT_PUBLIC_SECRET_KEY}`,
        response: turnstileResponse,
      }),
    }
  );

  const verificationResult = await verificationResponse.json();

  if (verificationResult.success) {
    // Turnstile verification successful
    // Process your form data here
    console.log(jsonData);
    return NextResponse.json({ message: 'Form submitted successfully' }, { status: 200 });
  } else {
    return NextResponse.json({ message: 'Turnstile verification failed' }, { status: 400 });
  }
}