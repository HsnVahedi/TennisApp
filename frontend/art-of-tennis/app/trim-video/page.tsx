"use client";


import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
import ProtectionProvider from "@/app/components/ProtectionProvider";
import PageLayout from "@/app/components/layouts/1";
import { Members } from "@/app/components/team";
import { Features } from "@/app/components/features";
import ContactUs from "@/app/components/contact-us";

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

const VideoCard = ({ videoRef, videoSrc }) => {
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


const Dialog = ({ open, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        {children}
      </div>
    </div>
  );
};

const DialogContent = ({ children }) => <div className="w-full">{children}</div>;

const DialogHeader = ({ children }) => <div className="mb-6">{children}</div>;

const DialogTitle = ({ children }) => <h2 className="text-2xl font-bold text-purple-900">{children}</h2>;

const Progress = ({ value, className }) => (
  <div className={`w-full bg-gray-200 rounded-full h-4 ${className}`}>
    <div
      className="bg-gradient-to-r from-green-400 to-yellow-400 h-4 rounded-full transition-all duration-300 ease-in-out"
      style={{ width: `${value}%` }}
    ></div>
  </div>
);


const ProcessingIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="3em" height="3em" viewBox="0 0 24 24" className="animate-spin">
    <path fill="currentColor" d="M12 2a10 10 0 0 1 10 10a10 10 0 0 1-10 10a10 10 0 0 1-10-10a10 10 0 0 1 10-10m0 2a8 8 0 0 0-8 8a8 8 0 0 0 8 8a8 8 0 0 0 8-8a8 8 0 0 0-8-8m0 1c3.86 0 7 3.14 7 7h-2a5 5 0 0 0-5-5v-2z"/>
  </svg>
);


const App = () => {
  const [isVideoSelected, setIsVideoSelected] = useState(false);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showDialog, setShowDialog] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [uploadId, setUploadId] = useState(null);
  const [videoStatus, setVideoStatus] = useState('');
  const fileInputRef = useRef(null);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    let intervalId = null;

    const startFetchingStatus = async () => {
      if (uploadComplete && uploadId) {
        console.log(`Starting to fetch video status for upload ID: ${uploadId}`);
        await fetchVideoStatus(); // Fetch immediately
        intervalId = setInterval(fetchVideoStatus, 5000);
      }
    };

    startFetchingStatus();

    return () => {
      if (intervalId) {
        console.log('Clearing interval');
        clearInterval(intervalId);
      }
    };
  }, [uploadComplete, uploadId]);


  const fetchVideoStatus = async () => {
    if (!session?.accessToken) {
      console.log('No access token available');
      return;
    }

    const requestId = Math.random().toString(36).substring(7);
    try {
      console.log(`Fetching video status for upload ID: ${uploadId}, Request ID: ${requestId}`);
      const response = await fetch(`/api/videos/trim_status?upload_id=${uploadId}&request_id=${requestId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch video status');
      }

      const data = await response.json();
      console.log(`Video status for upload ID ${uploadId}, Request ID: ${requestId}:`, data.status);
      setVideoStatus(data.status);

      if (data.status === 'COMPLETED') {
        console.log(`Video processing completed for upload ID: ${uploadId}, Request ID: ${requestId}`);
      }
    } catch (error) {
      console.error(`Error fetching video status for upload ID ${uploadId}, Request ID: ${requestId}:`, error);
    }
  };

  
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

    const response = await fetch(
      `/api/videos/upload_chunk/?upload_id=${uploadId}&chunk_number=${chunkNumber}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
        },
        body: formData,
      }
    );
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
    setShowDialog(true);

    try {
      const file = fileInputRef.current.files[0];
      const chunkSize = 5 * 1024 * 1024; // 5MB chunks
      const fileSize = file.size;
      const chunks = Math.ceil(fileSize / chunkSize);

      // Initiate upload
      const { upload_id } = await initiateUpload(file.name);
      setUploadId(upload_id);

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

      setUploadComplete(true);
      setVideoStatus('UPLOADING');
      console.log('Upload completed, uploadId:', upload_id);
    } catch (error) {
      console.error('Error uploading video:', error);
      setIsUploading(false);
      setShowDialog(false);
      alert('Failed to upload video. Please try again.');
    }
  }; 

  return (
    <PageLayout>
      <main className="flex flex-col items-center justify-center space-y-4">
        <input
          ref={fileInputRef}
          id="video-input"
          type="file"
          accept="video/*"
          className="hidden"
          onChange={handleFileSelect}
          disabled={isUploading}
        />

        {isVideoSelected ? (
          <VideoCard videoSrc={videoPreviewUrl} videoRef={null} />
        ) : (
          <label
            htmlFor="video-input"
            className={`
              w-full max-w-6xl mb-4 cursor-pointer
              ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl active:translate-y-1 active:shadow-inner'}
              transition duration-300
            `}
          >
            <Image
              src="/movie.jpeg"
              alt="Fallback image"
              layout="responsive"
              width={16}
              height={9}
              className="w-full rounded-lg shadow-lg"
            />
          </label>
        )}

        <label htmlFor="video-input" className="w-full max-w-md">
          <div
            className={`
              bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-4 px-8 rounded-lg shadow-lg
              flex items-center justify-center w-full
              ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:from-orange-600 hover:to-orange-700 hover:shadow-xl active:translate-y-1 active:shadow-inner cursor-pointer'}
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
          <button
            onClick={handleTrimClick}
            className={`
              bg-gradient-to-r from-purple-700 to-purple-900 
              text-white font-bold py-4 px-8 rounded-lg shadow-lg 
              flex items-center justify-center w-full max-w-md
              ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:from-purple-800 hover:to-purple-950 hover:shadow-xl active:translate-y-1 active:shadow-inner'}
              transition duration-300
            `}
            disabled={isUploading}
          >
            <span className="flex-grow text-center">Trim your Video</span>
            <TrimIcon />
          </button>
        )}

        <Dialog open={showDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {!uploadComplete ? "Uploading Video" : 
                 videoStatus === 'COMPLETED' ? "Processing Complete!" : 
                 "Processing Video"}
              </DialogTitle>
            </DialogHeader>
            <div className="py-6">
              {!uploadComplete ? (
                <>
                  <p className="text-center mb-4 text-lg text-purple-900">Uploading ... {uploadProgress.toFixed(0)}%</p>
                  <Progress value={uploadProgress} className="w-full mb-4" />
                  <div className="flex justify-center">
                    <UploadIcon />
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <p className="text-xl text-purple-900 font-semibold mb-4">
                    {videoStatus === 'UPLOADING' && "Finalizing upload..."}
                    {videoStatus === 'DETECTING' && "Detecting objects in video..."}
                    {videoStatus === 'TRIMMING' && "Trimming video..."}
                    {videoStatus === 'COMPLETED' && "Video processing complete!"}
                  </p>
                  {videoStatus !== 'COMPLETED' && (
                    <div className="flex justify-center">
                      <ProcessingIcon />
                    </div>
                  )}
                  {videoStatus === 'COMPLETED' && (
                    <>
                      <div className="text-6xl mb-4">🎉</div>
                      <button
                        onClick={() => setShowDialog(false)}
                        className="bg-gradient-to-r from-purple-700 to-purple-900 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:from-purple-800 hover:to-purple-950 transition duration-300"
                      >
                        Close
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

      </main>
      <Features />
      <Members />
      <ContactUs />
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
