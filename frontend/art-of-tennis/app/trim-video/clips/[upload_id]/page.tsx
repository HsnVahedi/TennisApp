"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import ProtectionProvider from '@/app/components/ProtectionProvider';
import PageLayout from "@/app/components/layouts/1";
import { Features } from "@/app/components/features";
import { Members } from "@/app/components/team";
import ContactUs from "@/app/components/contact-us";
import { getBackendUrl } from "@/app/lib/backend";
import Image from "next/image";


const Hero = () => {

  return (
    <div className="w-full max-w-6xl mb-4">
      <Image
        src="/trim-video.jpeg"
        alt="Fallback image"
        layout="responsive"
        width={16}
        height={9}
        className="w-full rounded-lg shadow-lg"
      />
    </div>
  );
};

interface Clip {
  id: number;
  clip_number: number;
  media_url: string;
}

const ClipCard = ({ clip, isVideoLoaded, onVideoLoad }: { clip: Clip; isVideoLoaded: boolean; onVideoLoad: () => void }) => {
  const clipUrl = process.env.NEXT_PUBLIC_IS_PROD ? clip.media_url : `${getBackendUrl()}${clip.media_url}`;

  const handleDownload = () => {
    window.open(clipUrl, '_blank');
  };

  return (
    <div className="border rounded-lg overflow-hidden shadow-md bg-white flex flex-col h-full">
      <div className="flex-shrink-0">
        {isVideoLoaded ? (
          <video
            src={clipUrl}
            className="w-full h-48 object-cover"
            controls
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
            <button 
              onClick={onVideoLoad}
              className="bg-purple-600 text-white font-bold py-2 px-4 rounded hover:bg-purple-700 transition duration-300"
            >
              Load Video
            </button>
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h2 className="text-xl font-semibold mb-2 text-purple-900">Clip {clip.clip_number + 1}</h2>
        <div className="flex-grow"></div>
        <button
          className="bg-green-500 text-white font-bold py-2 px-4 rounded hover:bg-green-600 transition duration-300 w-full mt-2"
          onClick={handleDownload}
        >
          Download
        </button>
      </div>
    </div>
  );
};

// const EmptyBox = () => (
//   <div className="border rounded-lg overflow-hidden shadow-md bg-transparent flex flex-col h-full">
//     <div className="flex-shrink-0">
//       <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
//         <span className="text-gray-400">No video</span>
//       </div>
//     </div>
//     <div className="p-4 flex-grow"></div>
//   </div>
// );



// const EmptyBox = () => (
//   <div className="border rounded-lg overflow-hidden shadow-md bg-transparent flex flex-col h-full">
//     <div className="flex-shrink-0">
//       <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
//         <span className="text-gray-400">No video</span>
//       </div>
//     </div>
//     <div className="p-4 flex flex-col flex-grow">
//       <h2 className="text-xl font-semibold mb-2 text-transparent">Empty Clip</h2>
//       <div className="flex-grow"></div>
//       <button
//         className="bg-gray-200 text-gray-400 font-bold py-2 px-4 rounded w-full mt-2 cursor-not-allowed"
//         disabled
//       >
//         Download
//       </button>
//     </div>
//   </div>
// );




const ClipsPage = () => {
  const [clips, setClips] = useState<Clip[]>([]);
  const [loadedVideos, setLoadedVideos] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const clipsPerPage = 6;
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

  const handleVideoLoad = (clipId: number) => {
    setLoadedVideos(prev => new Set(prev).add(clipId));
  };

  const content = (
    <div className="container mx-auto py-8">

      <div className="flex flex-col">
        {isLoading && <div className="text-center text-xl text-purple-900">Loading...</div>}
        {error && <div className="text-center text-xl text-red-600">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {currentClips.map((clip) => (
            <ClipCard 
              key={clip.id} 
              clip={clip} 
              isVideoLoaded={loadedVideos.has(clip.id)}
              onVideoLoad={() => handleVideoLoad(clip.id)}
            />
          ))}
          {/* {[...Array(Math.max(0, clipsPerPage - currentClips.length))].map((_, index) => (
            <EmptyBox key={`empty-${index}`} />
          ))} */}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center mt-4 mb-8">
            <button
              className="mx-2 px-4 py-2 bg-purple-600 text-white rounded disabled:opacity-50 hover:bg-purple-700 transition duration-300"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className="mx-4 py-2 text-purple-900">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="mx-2 px-4 py-2 bg-purple-600 text-white rounded disabled:opacity-50 hover:bg-purple-700 transition duration-300"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <ProtectionProvider>
      <PageLayout>
        <Hero />
        {content}
        <Features />
        <Members />
        <ContactUs />
      </PageLayout>
    </ProtectionProvider>
  );
};

export default ClipsPage;