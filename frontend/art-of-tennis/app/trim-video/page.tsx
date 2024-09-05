"use client";

import ProtectionProvider from "@/app/components/ProtectionProvider";
import classNames from 'classnames';
// import styles from "./page.module.css";
import React, { useState, useRef } from 'react';
import Image from 'next/image';


const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
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

const SideMenu = ({ isOpen, onClose }) => (
  <div className={`fixed inset-0 bg-purple-900 z-50 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
    <div className="flex justify-end p-4">
      <button onClick={onClose} className="text-white">
        <CloseIcon />
      </button>
    </div>
    <nav className="flex flex-col items-center">
      <a href="#" className="text-white py-2 hover:text-green-100">All Tools</a>
      <a href="#" className="text-white py-2 hover:text-green-100">Pricing</a>
      <a href="#" className="text-white py-2 hover:text-green-100">Log in</a>
      <a href="#" className="text-white py-2 hover:text-green-100">Sign up</a>
    </nav>
  </div>
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
  )
}

const VideoCards = ({videoRef, videoSrc}) => (
  <div className="w-full max-w-6xl mb-4">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8"> 
    {/* <Card title="title" description="description" />
    <Card title="title" description="description" />
    <Card title="title" description="description" />
    <Card title="title" description="description" />
    <Card title="title" description="description" />
    <Card title="title" description="description" /> */}
    
      <VideoCard videoRef={videoRef} videoSrc={videoSrc} />
      <VideoCard videoRef={videoRef} videoSrc={videoSrc} />
      <VideoCard videoRef={videoRef} videoSrc={videoSrc} />
      <VideoCard videoRef={videoRef} videoSrc={videoSrc} />
      <VideoCard videoRef={videoRef} videoSrc={videoSrc} />
    
    </div>
  </div>
  
);

const App = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVideoUploaded, setIsVideoUploaded] = useState(false);
  const [videoSrc, setVideoSrc] = useState('');
  const [isTrimming, setIsTrimming] = useState(false);
  const videoRef = useRef(null);

  const tools = [
    { title: "PDF to Word", description: "Convert PDF to editable Word documents" },
    { title: "PDF to Excel", description: "Extract data from PDF to Excel spreadsheets" },
    { title: "PDF to PowerPoint", description: "Transform PDFs into editable presentations" },
    { title: "PDF to JPG", description: "Convert PDF pages to JPG images" },
    { title: "Merge PDF", description: "Combine multiple PDFs into one file" },
    { title: "Split PDF", description: "Separate one PDF into multiple files" }
  ];

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('video/')) {
      setIsVideoUploaded(true);
      const videoUrl = URL.createObjectURL(file);
      setVideoSrc(videoUrl);
      console.log('Video file uploaded:', file.name);
    } else {
      alert('Please upload a valid video file.');
    }
  };

  const handleTrimClick = () => {
    setIsTrimming(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-green-400 to-yellow-400 font-sans pt-16">
      <header className="bg-purple-900 p-4 flex justify-between items-center fixed top-0 left-0 right-0 z-10 shadow-md">
        <div className="flex items-center">
          <button onClick={() => setIsMenuOpen(true)} className="text-white mr-4 block md:hidden">
            <MenuIcon />
          </button>
          <div className="text-white text-2xl font-bold">iLovePDF</div>
        </div>
        <nav className="hidden md:block">
          <a href="#" className="text-white ml-4 hover:text-green-100">All Tools</a>
          <a href="#" className="text-white ml-4 hover:text-green-100">Pricing</a>
          <a href="#" className="text-white ml-4 hover:text-green-100">Log in</a>
          <a href="#" className="text-white ml-4 hover:text-green-100">Sign up</a>
        </nav>
      </header>
      <SideMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <section className="max-w-6xl mx-auto mt-16 text-center text-white px-4 pb-16">
        <main className="flex flex-col items-center justify-center space-y-4">
          {isVideoUploaded ? (
            <div className="w-full max-w-6xl mb-4">
              <video
                ref={videoRef}
                src={videoSrc}
                controls
                className="w-full rounded-lg shadow-lg"
                style={{ aspectRatio: '16 / 9' }}
              />
            </div>
          ): (
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
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleFileUpload}
            />
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-4 px-8 rounded-lg shadow-lg hover:from-orange-600 hover:to-orange-700 transition duration-300 flex items-center justify-center w-full">
              <span className="flex-grow text-center">{isVideoUploaded ? "Upload another Video" : "Upload your Video"}</span>
              <UploadIcon />
            </div>
          </label>
          {isVideoUploaded && (
            <>
              <button 
                onClick={handleTrimClick}
                className="bg-gradient-to-r from-purple-700 to-purple-900 text-white font-bold py-4 px-8 rounded-lg shadow-lg hover:from-purple-800 hover:to-purple-950 transition duration-300 flex items-center justify-center w-full max-w-md"
              >
                <span className="flex-grow text-center">Trim your Video</span>
                <TrimIcon />
              </button>
              {isTrimming && <VideoCards videoRef={videoRef} videoSrc={videoSrc} />}
            </>
          )}
        </main>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {tools.map((tool, index) => (
            <Card key={index} title={tool.title} description={tool.description} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default App;