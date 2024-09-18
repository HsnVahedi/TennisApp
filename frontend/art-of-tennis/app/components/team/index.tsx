import React from 'react';
import { Instagram, Linkedin, Facebook } from 'lucide-react';


const MemberCard = ({ name, role, content, rating, imageUrl, instagram, linkedin, facebook }) => (
  <div className="bg-transparent rounded-lg p-6 text-purple-800">
    <div className="flex items-center mb-4">
      <img src={imageUrl} alt={name} className="w-20 h-20 rounded-full mr-4" />
      <div className="text-left">
        <h4 className="font-semibold text-2xl">{name}</h4> {/* Increased text size */}
        <p className="text-xl">{role}</p> {/* Increased text size */}
      </div>
    </div>
    <p className="mb-4 text-left text-xl">{content}</p> {/* Increased text size */}
    <div className="flex items-center space-x-4">
      {instagram && (
        <a href={instagram} target="_blank" rel="noopener noreferrer">
          <Instagram className="w-6 h-6 text-gray-600 hover:text-purple-800" />
        </a>
      )}
      {linkedin && (
        <a href={linkedin} target="_blank" rel="noopener noreferrer">
          <Linkedin className="w-6 h-6 text-gray-600 hover:text-purple-800" />
        </a>
      )}
      {facebook && (
        <a href={facebook} target="_blank" rel="noopener noreferrer">
          <Facebook className="w-6 h-6 text-gray-600 hover:text-purple-800" />
        </a>
      )}
    </div>
  </div>
);



export const Members = () => {
  const reviews = [
    // {
    //   name: "Jane Doe",
    //   role: "CEO",
    //   content:
    //     "I'm an engineer as well as a tennis player. I know what makes tennis so cool and I want to make it even cooler.",
    //   rating: "★★★★★",
    //   imageUrl: "fat-woman.png",
    //   instagram: "https://www.instagram.com/janedoe",
    //   linkedin: "https://www.linkedin.com/in/janedoe",
    //   facebook: "https://www.facebook.com/janedoe",
    // },
    // {
    //   name: "Amanda Smith",
    //   role: "Software Engineer",
    //   content:
    //     "Working with Jane Doe to make tennis more accessible to everyone. I'm a huge fan of apps that help amateur sports enthusiasts get better. Was a total Strava addict while training on the bike. SwingVision is that for tennis. Tracks your shots, gives you a summary of the match, tells you if you're getting better or worse.",
    //   rating: "★★★★★",
    //   imageUrl: "/asian-woman.png",
    //   instagram: "https://www.instagram.com/amandasmith",
    //   linkedin: "https://www.linkedin.com/in/amandasmith",
    //   facebook: "https://www.facebook.com/amandasmith",
    // },
    {
      name: "Hossein Vahedi",
      role: "Founder",
      content: "I'm an avid tennis player—not a pro, but I play for the love of the game. I believe we can make tennis even more enjoyable by leveraging the latest technologies in AI, computer vision, and robotics. One of my goals is to make it easier for you to find tennis partners and discover the perfect racket that suits your style. From automating ball collection with drones to designing next-generation ball machines, I’m committed to helping you spend more time on the court and less time on the sidelines.",
      rating: "★★★★★",
      imageUrl: "/asian-man.png",
      instagram: "https://www.instagram.com/adamsmith",
      linkedin: "https://www.linkedin.com/in/adamsmith",
      facebook: "https://www.facebook.com/adamsmith",
    },
  ];

  return (
    <div className="p-16">
      <div className="space-y-8">
        {reviews.map((review, index) => (
          <MemberCard key={index} {...review} />
        ))}
      </div>
    </div>
  );
};
