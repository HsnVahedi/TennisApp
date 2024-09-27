"use client";


import Image from "next/image";
import PageLayout from "@/app/components/layouts/1";
import React, {  } from 'react';
import {
  Camera, TrendingUp, Award, Users,
  Zap, Smartphone} from 'lucide-react';
import { Features } from "@/app/components/features";
import { Members } from "@/app/components/team";
// import ContactUs from "@/app/components/contact-us";
import dynamic from 'next/dynamic';
const ContactUs = dynamic(() => import('@/app/components/contact-us'), { ssr: false });






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

  return (
    <PageLayout>
      <Hero />
      <main className="flex flex-col items-center justify-center space-y-4">
        <Features />

      </main>
      <Members />
      <ContactUs />
    </PageLayout>
  );
}


// const getData = async () => {
//   const backendUrl = getBackendUrl();
//   const res = await fetch(`${backendUrl}/data`);
//   const data = await res.json();
//   return data.data
// } 