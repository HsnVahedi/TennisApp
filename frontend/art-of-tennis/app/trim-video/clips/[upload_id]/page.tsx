'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import ProtectionProvider from '@/app/components/ProtectionProvider';
import { getBackendUrl } from "@/app/lib/backend";

interface Clip {
  id: number;
  clip_number: number;
  media_url: string;
}

const ClipCard = ({ clip }: { clip: Clip }) => {
  const [videoLoaded, setVideoLoaded] = useState(false);

  console.log('1111111111111111111111111111111111111111')
  console.log(process.env.IS_PROD)
  console.log('1111111111111111111111111111111111111111')
  console.log()
  console.log('2222222222222222222222222222222222222222')
  console.log(clip.media_url)
  console.log('2222222222222222222222222222222222222222')
  console.log()

  const clipUrl = process.env.IS_PROD ? clip.media_url : `${getBackendUrl()}${clip.media_url}`

  console.log('3333333333333333333333333333333333333333')
  console.log(clipUrl)
  console.log('3333333333333333333333333333333333333333')

  const handleDownload = () => {
    window.open(clipUrl, '_blank');
  };

  return (
    <div className="border rounded-lg overflow-hidden shadow-md">
      {videoLoaded ? (
        <video
          src={clipUrl}
          className="w-full h-48 object-cover"
          controls
        />
      ) : (
        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
          <button 
            onClick={() => setVideoLoaded(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            Load Video
          </button>
        </div>
      )}
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-2">Clip {clip.clip_number + 1}</h2>
        <button
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
          onClick={handleDownload}
        >
          Download
        </button>
      </div>
    </div>
  );
};

const ClipsPage = () => {
  const [clips, setClips] = useState<Clip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const clipsPerPage = 5;
  const params = useParams();

  useEffect(() => {
    const fetchClips = async () => {
      try {
        const upload_id = params.upload_id;
        const res = await fetch(`/api/videos/clips?upload_id=${upload_id}`);
        if (!res.ok) {
          throw new Error('Failed to fetch clips');
        }
        const data: Clip[] = await res.json();
        setClips(data);
      } catch (err) {
        setError('Failed to load clips. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchClips();
  }, [params.upload_id]);

  const indexOfLastClip = currentPage * clipsPerPage;
  const indexOfFirstClip = indexOfLastClip - clipsPerPage;
  const currentClips = clips.slice(indexOfFirstClip, indexOfLastClip);

  const totalPages = Math.ceil(clips.length / clipsPerPage);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <ProtectionProvider>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Video Clips</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentClips.map((clip) => (
            <ClipCard key={clip.id} clip={clip} />
          ))}
        </div>

        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <button
              className="mx-2 px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className="mx-4 py-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="mx-2 px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </ProtectionProvider>
  );
};

export default ClipsPage;