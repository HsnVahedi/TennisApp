"use client";

import ProtectionProvider from "@/app/components/ProtectionProvider";
import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { useSession } from "next-auth/react";
import PageLayout from "@/app/components/layouts/1";
import Link from 'next/link';
import {
  IntelligenceIcon,
  TennisRacketIcon, TennisMachineIcon,
  DroneIcon, TennisPlayerIcon, VideoIcon
} from "@/app/components/features/icons";


const Card = ({ title, description, link, icon: IconComponent }) => (
  <Link href={link}>
    <div className="
      bg-white rounded-lg shadow-md p-6 flex flex-col items-center h-full 
      hover:shadow-xl hover:bg-gray-100 
      active:translate-y-1 active:shadow-inner 
      transition duration-300
    ">
      <IconComponent />
      <h3 className="text-xl font-semibold mb-2 text-gray-800">{title}</h3>
      <p className="text-md text-gray-600">{description}</p>
    </div>
  </Link>
);

const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em" viewBox="0 0 48 48" className="ml-2">
    <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M43.5 9v30m-5.74-26.96h5.74m-5.74 5.98h5.74M37.76 24h5.74m-5.74 5.98h5.74m-5.74 5.98h5.74M10.24 12.04h27.53v23.91H10.24zM4.5 39V9m5.74 30V9m27.52 30V9M10.24 35.96H4.5m5.74-5.98H4.5M10.24 24H4.5m5.74-5.98H4.5m5.74-5.98H4.5"/>
  </svg>
);

const TrimIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em" viewBox="0 0 56 56" className="ml-2">
    <path fill="currentColor" d="M25.025 27.438L13.29 16.653a11.8 11.8 0 0 1-3.82-8.797L9.488 6L28 24.47L46.513 6l.036 1.697a11.8 11.8 0 0 1-3.794 8.927L31.01 27.473l5.144 5.132a9.3 9.3 0 0 1 4.538-1.177c5.14 0 9.308 4.157 9.308 9.286S45.833 50 40.692 50c-5.14 0-9.307-4.157-9.307-9.286a9.23 9.23 0 0 1 1.927-5.659l-5.268-4.842l-5.308 4.904a9.23 9.23 0 0 1 1.88 5.597c0 5.129-4.168 9.286-9.308 9.286S6 45.843 6 40.714s4.167-9.286 9.308-9.286c1.648 0 3.195.427 4.538 1.177zM15.3 47a6 6 0 1 0 0-12a6 6 0 0 0 0 12m25.4 0a6 6 0 1 0 0-12a6 6 0 0 0 0 12M28 29a1.5 1.5 0 1 0 0-3a1.5 1.5 0 0 0 0 3"/>
  </svg>
);

const ProgressIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em" viewBox="0 0 24 24" className="ml-2 animate-spin">
    <path fill="currentColor" d="M12 22q-2.05 0-3.875-.788t-3.187-2.15t-2.15-3.187T2 12q0-2.075.788-3.887t2.15-3.175t3.187-2.15T12 2q.425 0 .713.288T13 3t-.288.713T12 4Q8.675 4 6.337 6.338T4 12t2.338 5.663T12 20t5.663-2.337T20 12q0-.425.288-.712T21 11t.713.288T22 12q0 2.05-.788 3.875t-2.15 3.188t-3.175 2.15T12 22"/>
  </svg>
);

const VideoCard = ({videoRef, videoSrc}) => {
  return (
    <div className="w-full max-w-6xl mb-4">
      <video
        ref={videoRef}
        src={videoSrc}
        controls
        className="w-full rounded-lg shadow-lg"
        style={{ aspectRatio: '16 / 9' }}
      />
    </div>
  );
};

const App = () => {
  const [isVideoSelected, setIsVideoSelected] = useState(false);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const { data: session } = useSession();

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('video/')) {
      setIsVideoSelected(true);
      const tempUrl = URL.createObjectURL(file);
      setVideoPreviewUrl(tempUrl);
      setTimeout(() => URL.revokeObjectURL(tempUrl), 1000);
    } else {
      alert('Please select a valid video file.');
    }
  };

  const initiateUpload = async (filename) => {
    const response = await fetch('/api/videos/initiate_upload/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify({ filename }),
    });
    if (!response.ok) throw new Error('Failed to initiate upload');
    return response.json();
  };

  const uploadChunk = async (chunk, uploadId, chunkNumber) => {
    const formData = new FormData();
    formData.append('chunk', chunk);

    const response = await fetch(`/api/videos/upload_chunk/?upload_id=${uploadId}&chunk_number=${chunkNumber}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
      },
      body: formData,
    });
    if (!response.ok) throw new Error('Chunk upload failed');
    return response.json();
  };

  const completeUpload = async (uploadId) => {
    const response = await fetch('/api/videos/complete_upload/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify({ upload_id: uploadId }),
    });
    if (!response.ok) throw new Error('Failed to complete upload');
    return response.json();
  };

  const handleTrimClick = async () => {
    if (!isVideoSelected || !fileInputRef.current.files[0]) {
      alert('Please select a video first.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const file = fileInputRef.current.files[0];
      const chunkSize = 5 * 1024 * 1024; // 5MB chunks
      const fileSize = file.size;
      const chunks = Math.ceil(fileSize / chunkSize);

      // Initiate upload
      const { upload_id } = await initiateUpload(file.name);

      // Upload chunks
      for (let i = 0; i < chunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, fileSize);
        const chunk = file.slice(start, end);

        await uploadChunk(chunk, upload_id, i);
        setUploadProgress(((i + 1) / chunks) * 100);
      }

      // Complete upload
      await completeUpload(upload_id);

      setIsUploading(false);
      alert('Video uploaded successfully!');
    } catch (error) {
      console.error('Error uploading video:', error);
      setIsUploading(false);
      alert('Failed to upload video. Please try again.');
    }
  };



  const tools = [
    {
      title: "Trim Video",
      description: "Do you record your Tennis play? Trim your tennis videos with ease.", link: "/trim-video",
      icon: VideoIcon
    },
    {
      title: "Ball Picker Drones",
      description: "Are you tired of picking up the balls? Let our new ball picker drones do the work for you!", link: "/trim-video",
      icon: DroneIcon
    },
    {
      title: "Tennis Ball Machines",
      description: "Do you want to practice with the newest ball machines? No need to buy a new one, just rent it!", link: "/trim-video",
      icon: TennisMachineIcon
    },
    {
      title: "Find Tennis Players",
      description: "Do you want to play right NOW? Find tennis players at your level and start playing now!", link: "/trim-video",
      icon: TennisPlayerIcon
    },
    {
      title: "Find your Racket",
      description: "Are you ready to change your racket? Don't buy it before testing 10 different ones! Test the latest racket models now!", link: "/trim-video",
      icon: TennisRacketIcon
    },
    {
      title: "Smart Tennis Club",
      description: "Let us show you how you can make your tennis courts smarter! Let's make your tennis club much more fun!", link: "/trim-video",
      icon: IntelligenceIcon
    }
  ];


  return (
    <PageLayout>
      <main className="flex flex-col items-center justify-center space-y-4">
        {isVideoSelected ? (
          <VideoCard videoSrc={videoPreviewUrl} videoRef={null} />
        ) : (
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
        )}
        {/* <label className="cursor-pointer w-full max-w-md">
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={handleFileSelect}
          />
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-4 px-8 rounded-lg shadow-lg hover:from-orange-600 hover:to-orange-700 transition duration-300 flex items-center justify-center w-full">
            <span className="flex-grow text-center">{isVideoSelected ? "Select another Video" : "Select your Video"}</span>
            <UploadIcon />
          </div>
        </label> */}

        {/* <label className="cursor-pointer w-full max-w-md">
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={handleFileSelect}
          />
          <div className="
            bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-4 px-8 rounded-lg shadow-lg
            hover:from-orange-600 hover:to-orange-700 hover:shadow-xl
            active:translate-y-1 active:shadow-inner
            transition duration-300 flex items-center justify-center w-full
          ">
            <span className="flex-grow text-center">
              {isVideoSelected ? "Select another Video" : "Select your Video"}
            </span>
            <UploadIcon />
          </div>
        </label> */}

        <label className="w-full max-w-md">
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={handleFileSelect}
            disabled={isUploading}
          />
          <div
            className={`
              bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-4 px-8 rounded-lg shadow-lg
              flex items-center justify-center w-full
              ${
                isUploading
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:from-orange-600 hover:to-orange-700 hover:shadow-xl active:translate-y-1 active:shadow-inner cursor-pointer'
              }
              transition duration-300
            `}
          >
            <span className="flex-grow text-center">
              {isVideoSelected ? 'Select another Video' : 'Select your Video'}
            </span>
            <UploadIcon />
          </div>
        </label>
        {isVideoSelected && (
          // <button 
          //   onClick={handleTrimClick}
          //   className={`
          //     bg-gradient-to-r from-purple-700 to-purple-900 
          //     text-white font-bold py-4 px-8 rounded-lg shadow-lg 
          //     flex items-center justify-center w-full max-w-md
          //     ${isUploading 
          //       ? 'opacity-50 cursor-not-allowed' 
          //       : 'hover:from-purple-800 hover:to-purple-950 transition duration-300'
          //     }
          //   `}
          //   disabled={isUploading}
          // >
          //   <span className="flex-grow text-center">
          //     {isUploading ? `Uploading: ${uploadProgress.toFixed(0)}%` : "Trim your Video"}
          //   </span>
          //   {isUploading ? <ProgressIcon /> : <TrimIcon />}
          // </button>
          <button 
            onClick={handleTrimClick}
            className={`
              bg-gradient-to-r from-purple-700 to-purple-900 
              text-white font-bold py-4 px-8 rounded-lg shadow-lg 
              flex items-center justify-center w-full max-w-md
              ${isUploading 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:from-purple-800 hover:to-purple-950 hover:shadow-xl active:translate-y-1 active:shadow-inner'
              }
              transition duration-300
            `}
            disabled={isUploading}
          >
            <span className="flex-grow text-center">
              {isUploading ? `Uploading: ${uploadProgress.toFixed(0)}%` : "Trim your Video"}
            </span>
            {isUploading ? <ProgressIcon /> : <TrimIcon />}
          </button>
        )}
      </main>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {tools.map((tool, index) => (
          <Card key={index} title={tool.title} description={tool.description} link={tool.link} icon={tool.icon} />
        ))}
      </div>
    </PageLayout>
  );
};

export default () => {
  return (
    <ProtectionProvider>
      <App />
    </ProtectionProvider>
  );
}