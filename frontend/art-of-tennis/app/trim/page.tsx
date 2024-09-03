"use client";

import ProtectionProvider from "@/app/components/ProtectionProvider";
import React, { useState, useEffect } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

const VideoUpload = () => {
  const [videoFile, setVideoFile] = useState(null);
  const [segments, setSegments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const videosPerPage = 10;
  const [ffmpeg, setFFmpeg] = useState(null);

  useEffect(() => {
    const loadFFmpeg = async () => {
      const ffmpegInstance = new FFmpeg({ log: true });
      setFFmpeg(ffmpegInstance);
      await ffmpegInstance.load();
    };

    loadFFmpeg();
  }, []);

  const handleFileUpload = async (event) => {
    if (!ffmpeg) return;

    const file = event.target.files[0];
    setVideoFile(URL.createObjectURL(file));

    await ffmpeg.writeFile('input.mp4', await fetchFile(file));
    generateSegments(file);
  };

  const generateSegments = async (file) => {
    const videoElement = document.createElement('video');
    videoElement.src = URL.createObjectURL(file);

    videoElement.onloadedmetadata = async () => {
      const videoLengthInSeconds = videoElement.duration;
      const numberOfSegments = Math.floor(videoLengthInSeconds / (2 * 60));
      const generatedSegments = [];
      let previousEnd = 0;

      for (let i = 0; i < numberOfSegments; i++) {
        let start = previousEnd + Math.random() * (videoLengthInSeconds - previousEnd - 5 * (numberOfSegments - i));
        let end = start + 5 + Math.random() * (videoLengthInSeconds - start - 5);

        start = Math.max(0, parseFloat(start.toFixed(2)));
        end = Math.min(videoLengthInSeconds, parseFloat(end.toFixed(2)));

        if (start >= end) break;

        const outputFile = `segment${i}.mp4`;

        // Updated FFmpeg command
        await ffmpeg.exec([
            '-ss', start.toString(),
            '-i', 'input.mp4',
            '-to', (end - start).toString(),
            '-c:v', 'copy', // Copy video codec to prevent re-encoding
            outputFile
        ]);

        const data = await ffmpeg.readFile(outputFile);
        const segmentURL = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));

        generatedSegments.push({
          start: start / 60,
          end: end / 60,
          segmentURL,
        });

        previousEnd = end; 
      }

      setSegments(generatedSegments);
    };
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const indexOfLastVideo = currentPage * videosPerPage;
  const indexOfFirstVideo = indexOfLastVideo - videosPerPage;
  const currentVideos = segments.slice(indexOfFirstVideo, indexOfFirstVideo + videosPerPage);
  const totalPages = Math.ceil(segments.length / videosPerPage);

  return (
    <div>
      <h2>Upload Video</h2>
      <input type="file" accept="video/*" onChange={handleFileUpload} />
      {videoFile && (
        <div>
          <video src={videoFile} controls width="600" />
          <h3>Generated Video Segments</h3>
          <ul>
            {currentVideos.map((segment, index) => (
              <li key={index}>
                <p>
                  Start: {segment.start.toFixed(2)} minutes, End: {segment.end.toFixed(2)} minutes
                </p>
                <video
                  src={segment.segmentURL}
                  controls
                  width="300"
                  height="200"
                />
                <br />
                <a
                  href={segment.segmentURL}
                  download={`segment-${index + 1}.mp4`}
                >
                  Download Segment
                </a>
              </li>
            ))}
          </ul>
          <div>
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i} onClick={() => paginate(i + 1)}>
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default function ProtectedRoute() {
  return (
    <ProtectionProvider>
        <VideoUpload />
    </ProtectionProvider>
  );
}
