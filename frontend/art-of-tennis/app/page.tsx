"use client";


import Image from "next/image";
import PageLayout from "@/app/components/layouts/1";
import React, { useState, useEffect } from 'react';
import {
  Camera, TrendingUp, Award, Users,
  Zap, Smartphone, Instagram, Facebook, Twitter, Youtube
} from 'lucide-react';
import { Features } from "@/app/components/features";
import { Members } from "@/app/components/team";








const Hero = () => {

  return (
    <div className="w-full max-w-6xl mb-4">
      <Image
        src="/main-bg.jpeg"
        alt="Fallback image"
        layout="responsive"
        width={16}
        height={9}
        className="w-full rounded-lg shadow-lg"
      />
    </div>
  );
};






export default function Home() {
  const features = [
    { title: "Trim Video", description: "Edit and perfect your tennis game footage with ease", icon: Camera },
    { title: "Ball Picker Drones", description: "Automate ball collection with cutting-edge drone technology", icon: Zap },
    { title: "Tennis Ball Machines", description: "Practice with advanced ball machines for skill improvement", icon: TrendingUp },
    { title: "Find Tennis Players", description: "Connect with players at your skill level for matches", icon: Users },
    { title: "Find your Racket", description: "Discover the perfect racket with our testing program", icon: Award },
    { title: "Smart Tennis Club", description: "Transform your club with IoT and AI technologies", icon: Smartphone },
  ];

  return (
    <PageLayout>
      <Hero />
      {/* <main className="max-w-6xl mx-auto px-4 pt-20 pb-16"> */}
      <main className="flex flex-col items-center justify-center space-y-4">
        {/* <Hero /> */}
        <Features />

        {/* <section className="text-center my-16">
          <h2 className="text-3xl font-bold mb-4 text-purple-900">Join the Tennis Revolution</h2>
          <p className="text-xl mb-8 text-purple-900">Experience the future of tennis training and community</p>
          <button className="bg-purple-700 text-white font-bold py-2 px-4 rounded hover:bg-purple-600 transition duration-300">
            Sign Up Now
          </button>
        </section> */}
      </main>
      <Members />
    </PageLayout>
  );
}


// const getData = async () => {
//   const backendUrl = getBackendUrl();
//   const res = await fetch(`${backendUrl}/data`);
//   const data = await res.json();
//   return data.data
// } 