import React, { useState, useRef, useEffect } from 'react';
import {
    useSession, signOut
} from "next-auth/react";

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
          <div className="text-white text-2xl font-bold">iLovePDF</div>
        </div>
        <nav className="hidden md:block">
          <a href="#" className="text-white ml-4 hover:text-green-100">All Tools</a>
          <a href="#" className="text-white ml-4 hover:text-green-100">Pricing</a>
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
    </div>
  );
}

export default PageLayout;