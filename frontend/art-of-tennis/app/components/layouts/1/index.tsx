import React, { useState } from 'react';
import {
    useSession, signOut
} from "next-auth/react";
import Link from 'next/link';
import {
  Camera, TrendingUp, Award, Users,
  Zap, Smartphone, Instagram, Facebook, Twitter, Youtube
} from 'lucide-react';

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

const SideMenu = ({ isOpen, onClose }) => {
  const { data: session, status } = useSession();
  return (
    <div className={`fixed inset-0 bg-purple-900 z-50 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
      <div className="flex justify-end p-4">
        <button onClick={onClose} className="text-white">
          <CloseIcon />
        </button>
      </div>
      <nav className="flex flex-col items-center">
        {session && session.user ? (
          <a href="#" onClick={() => signOut()} className="text-white py-2 hover:text-green-100">Sign Out</a>
        ): (
          <a href="#" className="text-white ml-4 hover:text-green-100">Sign In</a>
        )}
      </nav>
    </div>
  );
} 


const Footer = () => {
  const footerSections = [
    {
      title: "PRODUCT",
      links: ["SWING STICK", "HOW-TO VIDEO", "FAQ", "TEAMS", "TRACK AN ORDER"]
    },
    {
      title: "COMMUNITY",
      links: ["REFER A FRIEND", "GIFT ART OF TENNIS", "AMBASSADORS", "NEWSLETTERS", "FORUM", "ART OF TENNIS GUIDELINES"]
    },
    {
      title: "COMPANY",
      links: ["ABOUT US", "CAREERS", "EULA", "PRIVACY POLICY", "CONTACT US"]
    }
  ];

  return (
    <footer className="bg-purple-900 text-white py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4">Art of Tennis</h3>
            {/* <button className="bg-black text-white px-4 py-2 rounded flex items-center">
              <img src="/api/placeholder/20/20" alt="App Store" className="mr-2" />
              Download on the App Store
            </button> */}
            <div className="mt-4 flex space-x-4">
              <Instagram size={24} />
              <Facebook size={24} />
              <Twitter size={24} />
              <Youtube size={24} />
            </div>
          </div>
          {footerSections.map((section, index) => (
            <div key={index}>
              <h4 className="text-green-400 font-semibold mb-4">{section.title}</h4>
              <ul>
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex} className="mb-2">
                    <a href="#" className="hover:text-green-400 transition duration-300">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-sm">
          <p>&copy; 2024 Art of Tennis. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

const PageLayout = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session, status } = useSession();
  return (
    <div className="min-h-screen bg-gradient-to-r from-green-400 to-yellow-400 font-sans pt-16">
      <header className="bg-purple-900 p-4 flex justify-between items-center fixed top-0 left-0 right-0 z-10 shadow-md">
        <div className="flex items-center">
          <button onClick={() => setIsMenuOpen(true)} className="text-white mr-4 block md:hidden">
            <MenuIcon />
          </button>
          <Link href="/">
            <div className="text-white text-2xl font-bold">Art of Tennis</div>
          </Link>
        </div>
        <nav className="hidden md:block">
          {session && session.user ? (
            <a href="#" className="text-white ml-4 hover:text-green-100"
              onClick={() => signOut()}>
              Sign Out
            </a>
          ) : (
            <a href="#" className="text-white ml-4 hover:text-green-100">Sign In</a>
          )}
        </nav>
      </header>
      <SideMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <section className="max-w-6xl mx-auto mt-16 text-center text-white px-4 pb-16">
        {children} 
      </section>
      <Footer />
    </div>
  );
}

export default PageLayout;