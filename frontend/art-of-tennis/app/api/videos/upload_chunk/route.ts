import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getBackendUrl } from "@/app/lib/backend";

export async function PUT(req: NextRequest) {
  const token = await getToken({ req });

  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const upload_id = searchParams.get('upload_id');
  const chunk_number = searchParams.get('chunk_number');

  if (!upload_id || !chunk_number) {
    return NextResponse.json({ message: 'Missing upload_id or chunk_number' }, { status: 400 });
  }

  try {
    const formData = await req.formData();
    const uploadChunkUrl = `${getBackendUrl()}/videos/upload/upload_chunk/?upload_id=${upload_id}&chunk_number=${chunk_number}`;

    const response = await fetch(uploadChunkUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token.accessToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload chunk');
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}