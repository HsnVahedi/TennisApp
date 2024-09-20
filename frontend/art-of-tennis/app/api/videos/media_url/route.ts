import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getBackendUrl } from "@/app/lib/backend";

export async function GET(req: NextRequest) {
  // Get the token from the incoming request
  const token = await getToken({ req });

  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // Get the upload_id from the query parameters
  const url = new URL(req.url);
  const upload_id = url.searchParams.get('upload_id');

  if (!upload_id) {
    return NextResponse.json({ message: 'Missing upload_id' }, { status: 400 });
  }

  try {
    const mediaUrlEndpoint = `${getBackendUrl()}/videos/upload/media-url/${upload_id}`;

    // Make the request to your backend API with the token
    const response = await fetch(mediaUrlEndpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token.accessToken}`, // Use the access token from NextAuth
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch media URL');
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}