"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import PageLayout from "@/app/components/layouts/1";
import ProtectionProvider from "@/app/components/ProtectionProvider";
import { getClientSideBackendUrl } from "@/app/lib/backend";

const fetcher = (url: string) => fetch(url).then(res => res.json());

const VideoCard = ({ videoSrc, isLoading }: { videoSrc: string, isLoading: boolean }) => {
  return (
    <div className="w-full max-w-6xl mb-4 relative">
      <div className="relative w-full" style={{ paddingTop: '56.25%' }}> {/* 16:9 Aspect Ratio */}
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200 rounded-lg">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <video
            src={videoSrc}
            controls
            className="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg object-cover"
          />
        )}
      </div>
    </div>
  );
};

const App = () => {
  const params = useParams();
  const upload_id = params?.upload_id as string;

  const { data, error } = useSWR(
    upload_id ? `/api/videos/media_url?upload_id=${upload_id}` : null,
    fetcher,
    {
      refreshInterval: 2000, // Poll every 2 seconds
      revalidateOnFocus: false, // Don't revalidate on window focus
    }
  );

  const isLoading = !error && !data?.media_url;
  const mediaUrl = data?.media_url;

  if (!upload_id) {
    return (
      <PageLayout>
        <main className="flex flex-col items-center justify-center space-y-4">
          <h1 className="text-3xl font-bold mb-4">Error</h1>
          <p>Invalid upload ID. Please try uploading your video again.</p>
        </main>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <main className="flex flex-col items-center justify-center space-y-4">
        {error ? (
          <p className="text-red-500">Failed to load video. Please try again later.</p>
        ) : (
          <VideoCard 
            videoSrc={mediaUrl ? `${getClientSideBackendUrl()}${mediaUrl}` : ''}
            isLoading={isLoading}
          />
        )}
        {/* Add more UI elements for trimming functionality here */}
      </main>
    </PageLayout>
  );
};

export default () => {
  return (
    <ProtectionProvider>
      <App />
    </ProtectionProvider>
  );
};