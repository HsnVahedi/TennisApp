import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getBackendUrl } from "@/app/lib/backend";

export async function GET(req: NextRequest) {
  const timestamp = new Date().toISOString();
  console.log(`Video clips API route called at ${timestamp}`);

  const token = await getToken({ req });

  if (!token) {
    console.log('No token found');
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // Get the upload_id from the query parameters
  const url = new URL(req.url);
  const upload_id = url.searchParams.get('upload_id');

  if (!upload_id) {
    console.log('Missing upload_id');
    return NextResponse.json({ message: 'Missing upload_id' }, { status: 400 });
  }

  try {
    const clipsUrl = `${getBackendUrl()}/videos/trim/clips/${upload_id}/`;
    console.log(`Fetching clips from backend at ${timestamp}:`, clipsUrl);

    const response = await fetch(clipsUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token.accessToken}`,
      },
    });

    if (!response.ok) {
      console.log(`Backend response not ok at ${timestamp}:`, response.status, response.statusText);
      throw new Error('Failed to fetch clips from backend');
    }

    const data = await response.json();
    console.log(`Received clips from backend at ${timestamp}:`, data.length, 'clips');

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error(`Error in API route at ${timestamp}:`, error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export const fetchCache = 'force-no-store';