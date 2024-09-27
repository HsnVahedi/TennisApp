// import React, { useState } from 'react';
// import Link from 'next/link';
// import {
//   IntelligenceIcon,
//   TennisRacketIcon,
//   TennisMachineIcon,
//   DroneIcon,
//   TennisPlayerIcon,
//   VideoIcon
// } from "@/app/components/features/icons";

// const Card = ({ title, description, icon: IconComponent, onClick }) => (
//   <div
//     onClick={onClick}
//     className="
//       bg-white rounded-lg shadow-md p-6 flex flex-col items-center h-full 
//       hover:shadow-xl hover:bg-gray-100 
//       active:translate-y-1 active:shadow-inner 
//       transition duration-300 cursor-pointer
//     "
//   >
//     <IconComponent />
//     <h3 className="text-xl font-semibold mb-2 text-gray-800">{title}</h3>
//     <p className="text-md text-gray-600">{description}</p>
//   </div>
// );

// const Modal = ({ isOpen, onClose }) => {
//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white p-8 rounded-lg max-w-md">
//         <h2 className="text-2xl font-bold mb-4">Feature Not Ready</h2>
//         <p className="mb-6">This feature is not ready yet. Please Contact Us for more information.</p>
//         <div className="flex justify-between">
//           <Link href="/contact-us">
//             <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
//               Contact Us
//             </button>
//           </Link>
//           <button
//             onClick={onClose}
//             className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
//           >
//             Close
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export const Features = () => {
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   const tools = [
//     {
//       title: "Trim Video",
//       description: "Record your tennis games? Easily trim and edit your videos with just a few clicks.",
//       icon: VideoIcon
//     },
//     {
//       title: "Ball Picker Drones",
//       description: "Tired of chasing down tennis balls? Let our cutting-edge drones handle the cleanup for you!",
//       icon: DroneIcon
//     },
//     {
//       title: "Tennis Ball Machines",
//       description: "Want to sharpen your skills with the latest ball machines? Skip the purchase—rent the newest models with ease!",
//       icon: TennisMachineIcon
//     },
//     {
//       title: "Find Tennis Players",
//       description: "Ready to play right now? Find players at your level and jump into a match today!",
//       icon: TennisPlayerIcon
//     },
//     {
//       title: "Find your Racket",
//       description: "Looking to upgrade your racket? Try out 10 of the latest models before you decide!",
//       icon: TennisRacketIcon
//     },
//     {
//       title: "Smart Tennis Club",
//       description: "Discover how to make your tennis courts smarter! Transform your club into a more fun and tech-savvy experience.",
//       icon: IntelligenceIcon
//     }
//   ];

//   const handleCardClick = () => {
//     setIsModalOpen(true);
//   };

//   return (
//     <>
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
//         {tools.map((tool, index) => (
//           <Card
//             key={index}
//             title={tool.title}
//             description={tool.description}
//             icon={tool.icon}
//             onClick={handleCardClick}
//           />
//         ))}
//       </div>
//       <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
//     </>
//   );
// };


import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  IntelligenceIcon,
  TennisRacketIcon,
  TennisMachineIcon,
  DroneIcon,
  TennisPlayerIcon,
  VideoIcon
} from "@/app/components/features/icons";

const Card = ({ title, description, icon: IconComponent, onClick }) => (
  <div
    onClick={onClick}
    className="
      bg-white rounded-lg shadow-md p-6 flex flex-col items-center h-full 
      hover:shadow-xl hover:bg-gray-100 
      active:translate-y-1 active:shadow-inner 
      transition duration-300 cursor-pointer
    "
  >
    <IconComponent />
    <h3 className="text-xl font-semibold mb-2 text-gray-800">{title}</h3>
    <p className="text-md text-gray-600">{description}</p>
  </div>
);

const Modal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleContactUsClick = (e) => {
    e.preventDefault();
    onClose();
    setTimeout(() => {
      const contactSection = document.querySelector('#contact-us');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <div className="fixed inset-0 bg-purple-900 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gradient-to-r from-green-400 to-yellow-400 p-8 rounded-lg max-w-md shadow-xl">
        <h2 className="text-2xl font-bold mb-4 text-purple-900">Feature Not Ready</h2>
        <p className="mb-6 text-purple-800">This feature is not ready yet. Please Contact Us for more information.</p>
        <div className="flex justify-between">
          <a href="#contact-us" onClick={handleContactUsClick}>
            <button className="bg-purple-700 text-white px-4 py-2 rounded hover:bg-purple-600 transition duration-300">
              Contact Us
            </button>
          </a>
          <button
            onClick={onClose}
            className="bg-white text-purple-700 px-4 py-2 rounded hover:bg-gray-100 transition duration-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export const Features = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const tools = [
    {
      title: "Trim Video",
      description: "Record your tennis games? Easily trim and edit your videos with just a few clicks.",
      icon: VideoIcon
    },
    {
      title: "Ball Picker Drones",
      description: "Tired of chasing down tennis balls? Let our cutting-edge drones handle the cleanup for you!",
      icon: DroneIcon
    },
    {
      title: "Tennis Ball Machines",
      description: "Want to sharpen your skills with the latest ball machines? Skip the purchase—rent the newest models with ease!",
      icon: TennisMachineIcon
    },
    {
      title: "Find Tennis Players",
      description: "Ready to play right now? Find players at your level and jump into a match today!",
      icon: TennisPlayerIcon
    },
    {
      title: "Find your Racket",
      description: "Looking to upgrade your racket? Try out 10 of the latest models before you decide!",
      icon: TennisRacketIcon
    },
    {
      title: "Smart Tennis Club",
      description: "Discover how to make your tennis courts smarter! Transform your club into a more fun and tech-savvy experience.",
      icon: IntelligenceIcon
    }
  ];

  const handleCardClick = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {tools.map((tool, index) => (
          <Card
            key={index}
            title={tool.title}
            description={tool.description}
            icon={tool.icon}
            onClick={handleCardClick}
          />
        ))}
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};