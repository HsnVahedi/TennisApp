"use client";

import ProtectionProvider from "@/app/components/ProtectionProvider";
import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { useSession } from "next-auth/react";
import PageLayout from "@/app/components/layouts/1";
import Link from 'next/link';


const IntelligenceIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="2.5em" height="2.5em" viewBox="0 0 24 24" className="text-green-500 mb-2">
    <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 18v-5.25m0 0a6 6 0 0 0 1.5-.189m-1.5.189a6 6 0 0 1-1.5-.189m3.75 7.478a12.1 12.1 0 0 1-4.5 0m3.75 2.383a14.4 14.4 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"/>
  </svg>
)

const TennisRacketIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="2.5em" height="2.5em" viewBox="0 0 32 32" className="text-green-500 mb-2">
    <g fill="currentColor">
      <path d="M24.235 3.19c-3.36-1.938-7.647-.783-9.594 2.573v.001l-1.27 2.2a7.02 7.02 0 0 0 .02 7.052l-.431 3.283c-.18 1.34-.61 2.64-1.29 3.81l-.85 1.47l.001.001l-2.641 4.6a1.405 1.405 0 0 0 2.43 1.41l2.65-4.6l.85-1.47c.68-1.17 1.58-2.2 2.65-3.02l2.616-2.001a7.04 7.04 0 0 0 6.163-3.513l1.27-2.202l.002-.003c1.923-3.365.785-7.653-2.576-9.591m-3.529 13.663a5.5 5.5 0 0 1-1.793.12l.04.003l-.923-1.747l1.77-.06l.892 1.687zm2.065-.962c-.431.324-.905.58-1.404.764l-.797-1.506l1.77-.06l.426.806zm.94-.895q-.192.231-.405.437l-.196-.374l.562-.017zm.53-.762l-.058.098l-1.423.047l-.83-1.56l1.77-.06l.669 1.253zm.884-1.531l-.346.6l-.309-.574zm.612-1.109a6 6 0 0 1-.227.442l.019-.034l-1.419.047l-.83-1.57l1.77-.06l.66 1.234zm.403-1.243q-.045.226-.11.45l-.23-.412l.334-.008zm-.019-2.24c.11.516.148 1.048.109 1.58l-.79.028l-.83-1.56zm-1.059-2.26c.377.48.668 1.014.868 1.58l-1.68.058l-.84-1.58zM23.485 4.49c.349.2.666.434.953.693l-1.388.047l-.642-1.217a5.5 5.5 0 0 1 1.077.477m-3.756-.646a5.5 5.5 0 0 1 1.792-.036l.769 1.442l-1.77.06zm-2.116.87a5.6 5.6 0 0 1 1.431-.698l.706 1.324l-1.77.07zm-.87.734q.155-.161.32-.306l.157.288zm-.774 1.017q.094-.157.196-.306l1.415-.049l.83 1.56l-1.77.06zm-.764 1.323l.357-.618l.318.59zm-.535.927l.13-.227l1.43-.048l.83 1.57l-1.77.06l-.671-1.265zm-.571 1.403q.065-.258.156-.511l.265.493zm-.089 2.28a5.5 5.5 0 0 1-.04-1.59l.91-.028l.83 1.56zm.925 2.25a5.6 5.6 0 0 1-.764-1.57l1.899-.068l.83 1.57zm1.76 1.613a5.6 5.6 0 0 1-1.207-.943l1.772-.058l.834 1.57l.056.015a5.5 5.5 0 0 1-1.455-.584m-1.953.421q.543.493 1.202.877l.001.001a7 7 0 0 0 1.334.596L15.3 19.669c-.18.13-.42.15-.61.04a.56.56 0 0 1-.27-.55zM20.11 6.03l.83 1.56l-1.77.06l-.83-1.56zm1.19 2.24l.83 1.56l-1.77.06l-.83-1.56zm-2.28 3.95l-.83-1.56l1.77-.06l.83 1.56zm-.26-3.86l.83 1.57l-1.77.06l-.83-1.57zm-1.35 2.33l.83 1.56l-1.76.06l-.84-1.56zm-.57 2.3l1.77-.06l.83 1.56l-1.77.07zm3.37 1.48l-.83-1.56l1.77-.06l.83 1.56zm1.34-2.34l-.83-1.57l1.77-.06l.83 1.57zm1.35-2.32l-.83-1.56l1.77-.06l.83 1.55zm-1.19-2.25L20.88 6l1.77-.06l.83 1.56zM8.256 13.01a3 3 0 0 1 2.734 2.74a2.8 2.8 0 0 1-1.59-.427a2.37 2.37 0 0 1-.8-.935a3.4 3.4 0 0 1-.344-1.277z"/>
      <path d="M7.756 13.01a3 3 0 0 0-2.746 2.74a3.3 3.3 0 0 1 1.863.518c.418.284.755.672.976 1.127a4 4 0 0 1 .395 1.463q.006.061.005.1l-.005.002v.03a3 3 0 0 0 2.746-2.74a3.3 3.3 0 0 1-1.863-.515a2.9 2.9 0 0 1-.976-1.127a4 4 0 0 1-.395-1.463z"/>
      <path d="M7.744 18.99a3 3 0 0 1-2.734-2.74a2.8 2.8 0 0 1 1.59.427c.344.236.62.558.8.935a3.4 3.4 0 0 1 .344 1.277z"/>
    </g>
  </svg>
)

const TennisMachineIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="2.5em" height="2.5em" viewBox="0 0 24 24" className="text-green-500 mb-2">
    <g fill="none">
      <path d="m12.594 23.258l-.012.002l-.071.035l-.02.004l-.014-.004l-.071-.036q-.016-.004-.024.006l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.016-.018m.264-.113l-.014.002l-.184.093l-.01.01l-.003.011l.018.43l.005.012l.008.008l.201.092q.019.005.029-.008l.004-.014l-.034-.614q-.005-.019-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.003-.011l.018-.43l-.003-.012l-.01-.01z"/>
      <path fill="currentColor" d="M17 2a3 3 0 0 1 3 3v14a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3zm1 8H6v9a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1zm-6 1a4 4 0 1 1 0 8a4 4 0 0 1 0-8m0 2a2 2 0 1 0 0 4a2 2 0 0 0 0-4m5-9H7a1 1 0 0 0-.993.883L6 5v3h12V5a1 1 0 0 0-1-1m-1 1a1 1 0 0 1 .117 1.993L16 7h-1a1 1 0 0 1-.117-1.993L15 5zm-4 0a1 1 0 1 1 0 2a1 1 0 0 1 0-2"/>
    </g>
  </svg>
)

const DroneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="2.5em" height="2.5em" viewBox="0 0 512 512" className="text-green-500 mb-2">
    <path fill="currentColor" d="M407 24.98v14.04h16V25zM88.99 25v14.03H105V25zM487 57H344.9v15.96H487zm-320 0H25v15.98h142zm256 33.93h-16.1v27.97l13.7.1h2.4zm-318 .1H88.97v28.07H105zm272 45.87l-.1 32.1h-78.5l-16-32h-52.8l-16 32.1l-78.6-.1v-32H55.03l-12.04 48L199 214.4V208c.1-31.4 25.7-56.9 57.1-57c31.3 0 57 25.6 56.9 57c0 4.1.1 6.4.1 6.4L469 185.1L457 137zM256.1 169c-21.6 0-39 17.4-39.1 39.1c.1 21.5 17.5 38.9 39.1 38.9s39-17.4 38.9-39c.1-21.5-17.3-39-38.9-39m-.2 14c13.8 0 25 11.3 25.1 25c0 13.7-11.3 25.1-25 25c-13.7 0-25.1-11.3-25-24.9c0-13.8 11.3-25 24.9-25.1m-54.7 40.5L215 279h82l13.9-55.4c-6.8 23.9-28.8 41.4-54.8 41.4c-26.1 0-48.1-17.6-54.9-41.5m-35.8 4.2L60.35 321.1l83.85 107.7c5-5 11.3-8.8 18.2-11.1L100.2 318l87.9-73l-3.4-13.4zm181.3.2l-19.4 3.8l-3.3 13.4l87.8 73l-62.2 99.6c7 2.3 13.2 6.2 18.3 11.3l83.8-107.8zM176 433.6c-15 0-26.9 11.9-26.9 26.7c0 14.9 11.9 26.7 27 26.8c14.9-.1 26.9-12 26.9-26.8c-.1-14.8-11.9-26.7-27-26.7m159.9 0c-14.9.1-27 11.9-26.9 26.8c0 14.7 11.9 26.6 27 26.6c15 0 27-11.8 26.9-26.7c.1-14.8-11.9-26.7-27-26.7"/>
  </svg> 
)

const TennisPlayerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="2.5em" height="2.5em" viewBox="0 0 50 50" className="text-green-500 mb-2">
    <path fill="currentColor" d="M5.809 24.21a1.843 1.843 0 0 0-1.838 1.835c0 1.007.828 1.82 1.838 1.82a1.82 1.82 0 0 0 1.826-1.82a1.833 1.833 0 0 0-1.826-1.835M31.297 8.951a3.975 3.975 0 0 0 3.98-3.969a3.986 3.986 0 0 0-7.973 0c0 2.198 1.79 3.969 3.993 3.969m17.131 35.412l-6.477-7.626s-2.023-11.774-2.023-11.799l-.303-1.335c.012.013-.814-3.714-1.447-6.627c1.01.582 1.922 1.104 1.971 1.129c.049.108 3.432 6.53 3.432 6.53c.258.475.686.827 1.195.983a2 2 0 0 0 1.547-.146a1.95 1.95 0 0 0 .984-1.189a1.9 1.9 0 0 0-.135-1.529L43.463 15.7s-.148-.255-.342-.448c-.268-.267-.855-.595-.855-.595l-7.205-4.092c-.914-.461-1.924-.618-2.936-.4c-.416.085-.803.243-1.24.486c-.051.011-1.646.715-2.57 2.878l-3.7 7.429l-5.833 1.129l-.134.048l-5.266-3.715c-1.181-.825-1.326-3.302-1.34-3.399c-.145-1.699-1.12-3.302-2.678-4.407c-1.411-.995-3.117-1.419-4.676-1.166c-1.218.207-2.252.838-2.91 1.762A4.27 4.27 0 0 0 1 13.71l.073.803c.269 1.564 1.23 3.021 2.643 4.029c1.424 1.007 3.117 1.433 4.675 1.166l.366-.073c.036-.024 2.374-.742 3.518.037c0 .011 3.938 2.779 4.986 3.52c-.109.17-.304.545-.292.935a2.023 2.023 0 0 0 2.411 1.967l6.987-1.361s.598-.182.854-.365c.33-.23.572-.715.572-.715l1.838-3.691s1.268 5.96 1.289 6.069c-.145.146-5.732 6.058-5.732 6.058l-.215.122c-.551.496-.973 1.151-.973 1.845v12.526C24 47.92 25.167 49 26.506 49C27.834 49 29 47.92 29 46.582V36.119c1-.533 4.844-5.036 5.988-6.229c.123.704 1.252 7.056 1.252 7.056c.098.559.379 1.068.781 1.479c0 .014 7.699 9.071 7.699 9.071a2.53 2.53 0 0 0 1.657.848a2.47 2.47 0 0 0 1.769-.568a2.44 2.44 0 0 0 .853-1.848a2.4 2.4 0 0 0-.571-1.565M10.022 17.049c-.426.595-1.083.983-1.899 1.129c-1.145.193-2.424-.134-3.494-.911c-1.083-.766-1.815-1.857-2.009-2.998l-.05-.571c0-.595.159-1.128.488-1.59c1.059-1.48 3.481-1.577 5.404-.218c1.913 1.36 2.619 3.678 1.56 5.159"/>
  </svg>
)

const VideoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="2.5em" height="2.5em" viewBox="0 0 24 24" className="text-green-500 mb-2">
    <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" color="currentColor">
      <path d="M2 11c0-3.3 0-4.95 1.025-5.975S5.7 4 9 4h1c3.3 0 4.95 0 5.975 1.025S17 7.7 17 11v2c0 3.3 0 4.95-1.025 5.975S13.3 20 10 20H9c-3.3 0-4.95 0-5.975-1.025S2 16.3 2 13zm15-2.094l.126-.104c2.116-1.746 3.174-2.619 4.024-2.197c.85.421.85 1.819.85 4.613v1.564c0 2.794 0 4.192-.85 4.613s-1.908-.451-4.024-2.197L17 15.094"/>
      <circle cx="11.5" cy="9.5" r="1.5"/>
    </g>
  </svg>
)

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
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  </Link>
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