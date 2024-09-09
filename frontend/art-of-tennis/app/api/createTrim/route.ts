// frontend/art-of-tennis/app/api/batchImageUpload/[batchNumber]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getBackendUrl } from "@/app/lib/backend";


// This function handles the POST request for the batch image upload
export async function POST(req: NextRequest, { params }) {
  // Get the token from the incoming request
  const token = await getToken({ req });

  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const batchUploadUrl = `${getBackendUrl()}/create-trim/`;

    // Make the request to your backend API with the token
    const response = await fetch(batchUploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.accessToken}`, // Use the access token from NextAuth
      },
    });

    if (!response.ok) {
      throw new Error('Failed to upload batch');
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

