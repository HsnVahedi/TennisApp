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


export const Features = () => {
    const tools = [
        {
        title: "Trim Video",
        description: "Record your tennis games? Easily trim and edit your videos with just a few clicks.", link: "/trim-video",
        icon: VideoIcon
        },
        {
        title: "Ball Picker Drones",
        description: "Tired of chasing down tennis balls? Let our cutting-edge drones handle the cleanup for you!", link: "/trim-video",
        icon: DroneIcon
        },
        {
        title: "Tennis Ball Machines",
        description: "Want to sharpen your skills with the latest ball machines? Skip the purchase—rent the newest models with ease!", link: "/trim-video",
        icon: TennisMachineIcon
        },
        {
        title: "Find Tennis Players",
        description: "Ready to play right now? Find players at your level and jump into a match today!", link: "/trim-video",
        icon: TennisPlayerIcon
        },
        {
        title: "Find your Racket",
        description: "Looking to upgrade your racket? Try out 10 of the latest models before you decide!", link: "/trim-video",
        icon: TennisRacketIcon
        },
        {
        title: "Smart Tennis Club",
        description: "Discover how to make your tennis courts smarter! Transform your club into a more fun and tech-savvy experience.", link: "/trim-video",
        icon: IntelligenceIcon
        }
    ];
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {tools.map((tool, index) => (
                <Card key={index} title={tool.title} description={tool.description} link={tool.link} icon={tool.icon} />
            ))}
        </div>
    )
}