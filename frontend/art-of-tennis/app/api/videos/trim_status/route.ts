import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getBackendUrl } from "@/app/lib/backend";

export async function GET(req: NextRequest) {
  const timestamp = new Date().toISOString();
  console.log(`Trim status API route called at ${timestamp}`);

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
    const statusUrl = `${getBackendUrl()}/videos/upload/status/${upload_id}`;
    console.log(`Fetching status from backend at ${timestamp}:`, statusUrl);

    const response = await fetch(statusUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token.accessToken}`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.log(`Backend response not ok at ${timestamp}:`, response.status, response.statusText);
      throw new Error('Failed to fetch status from backend');
    }

    const data = await response.json();
    console.log(`Received status from backend at ${timestamp}:`, data.status);

    return NextResponse.json(data, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  } catch (error) {
    console.error(`Error in API route at ${timestamp}:`, error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// Disable caching for this route
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';