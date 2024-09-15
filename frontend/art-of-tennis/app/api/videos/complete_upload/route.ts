import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getBackendUrl } from "@/app/lib/backend";

export async function POST(req: NextRequest) {
  const token = await getToken({ req });

  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const completeUploadUrl = `${getBackendUrl()}/videos/upload/complete_upload/`;

    const response = await fetch(completeUploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error('Failed to complete upload');
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}