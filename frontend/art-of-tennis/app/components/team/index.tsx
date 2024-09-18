import React from 'react';
import { Instagram, Linkedin, Facebook } from 'lucide-react';

const MemberCard = ({ name, role, content, rating, imageUrl, instagram, linkedin, facebook }) => (
  <div className="bg-transparent rounded-lg p-6 text-purple-800">
    <div className="flex items-center mb-4">
      <img src={imageUrl} alt={name} className="w-20 h-20 rounded-full mr-4" />
      <div className="text-left">
        <h4 className="font-semibold">{name}</h4>
        <p>{role}</p>
      </div>
    </div>
    <p className="mb-4 text-left">{content}</p>
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
    {
      name: "Jane Doe",
      role: "CEO",
      content:
        "I'm an engineer as well as a tennis player. I know what makes tennis so cool and I want to make it even cooler.",
      rating: "★★★★★",
      imageUrl: "fat-woman.png",
      instagram: "https://www.instagram.com/janedoe",
      linkedin: "https://www.linkedin.com/in/janedoe",
      facebook: "https://www.facebook.com/janedoe",
    },
    {
      name: "Amanda Smith",
      role: "Software Engineer",
      content:
        "Working with Jane Doe to make tennis more accessible to everyone. I'm a huge fan of apps that help amateur sports enthusiasts get better. Was a total Strava addict while training on the bike. SwingVision is that for tennis. Tracks your shots, gives you a summary of the match, tells you if you're getting better or worse.",
      rating: "★★★★★",
      imageUrl: "/asian-woman.png",
      instagram: "https://www.instagram.com/amandasmith",
      linkedin: "https://www.linkedin.com/in/amandasmith",
      facebook: "https://www.facebook.com/amandasmith",
    },
    {
      name: "Adam Smith",
      role: "Marketing Manager",
      content:
        "Marketing has never been easier for me because this app markets itself. It's so obvious for our customers.",
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
