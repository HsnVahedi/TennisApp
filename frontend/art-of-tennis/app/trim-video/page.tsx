"use client";

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { useSession } from "next-auth/react";
import ProtectionProvider from "@/app/components/ProtectionProvider";
import PageLayout from "@/app/components/layouts/1";




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
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" className="ml-2 animate-spin">
    <path fill="currentColor" d="M12 22q-2.05 0-3.875-.788t-3.187-2.15t-2.15-3.187T2 12q0-2.075.788-3.887t2.15-3.175t3.187-2.15T12 2q.425 0 .713.288T13 3t-.288.713T12 4Q8.675 4 6.337 6.338T4 12t2.338 5.663T12 20t5.663-2.337T20 12q0-.425.288-.712T21 11t.713.288T22 12q0 2.05-.788 3.875t-2.15 3.188t-3.175 2.15T12 22"/>
  </svg>
);


const PDFIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="2em"
    height="2em"
    viewBox="0 0 24 24"
    className="text-green-500 mb-2"
  >
    <circle cx="12" cy="12" r="10" fill="currentColor" />
  </svg>
);

const Card = ({ title, description }) => (
  <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center h-full">
    <PDFIcon />
    <h3 className="text-xl font-semibold mb-2 text-gray-800">{title}</h3>
    <p className="text-sm text-gray-600">{description}</p>
  </div>
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

const VideoCards = ({videoRef, videoSrc}) => (
  <div className="w-full max-w-6xl mb-4">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
      <VideoCard videoRef={videoRef} videoSrc={videoSrc} />
      <VideoCard videoRef={videoRef} videoSrc={videoSrc} />
      <VideoCard videoRef={videoRef} videoSrc={videoSrc} />
      <VideoCard videoRef={videoRef} videoSrc={videoSrc} />
      <VideoCard videoRef={videoRef} videoSrc={videoSrc} />
    </div>
  </div>
);





const App = () => {
  const [isVideoSelected, setIsVideoSelected] = useState(false);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const { data: session } = useSession();

  const tools = [
    { title: "PDF to Word", description: "Convert PDF to editable Word documents" },
    { title: "PDF to Excel", description: "Extract data from PDF to Excel spreadsheets" },
    { title: "PDF to PowerPoint", description: "Transform PDFs into editable presentations" },
    { title: "PDF to JPG", description: "Convert PDF pages to JPG images" },
    { title: "Merge PDF", description: "Combine multiple PDFs into one file" },
    { title: "Split PDF", description: "Separate one PDF into multiple files" }
  ];

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
      // body: JSON.stringify({ filename }),
    });
    if (!response.ok) throw new Error('Failed to initiate upload');
    return response.json();
  };

  const uploadChunk = async (chunk, uploadId, chunkNumber) => {
    const formData = new FormData();
    formData.append('chunk', chunk);

    const response = await fetch(`/api/videos/upload_chunk/?upload_id=${uploadId}&chunk_number=${chunkNumber}`, {
      method: 'PUT',
      body: formData,
    });
    if (!response.ok) throw new Error('Chunk upload failed');
    return response.json();
  };

  const completeUpload = async (uploadId) => {
    const response = await fetch('/api/videos/complete_upload/', {
      method: 'POST',
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
        <label className="cursor-pointer w-full max-w-md">
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
        </label>
        {isVideoSelected && (
          <button 
            onClick={handleTrimClick}
            className={`
              bg-gradient-to-r from-purple-700 to-purple-900 
              text-white font-bold py-4 px-8 rounded-lg shadow-lg 
              flex items-center justify-center w-full max-w-md
              ${isUploading 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:from-purple-800 hover:to-purple-950 transition duration-300'
              }
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
          <Card key={index} title={tool.title} description={tool.description} />
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