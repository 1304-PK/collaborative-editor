import React from 'react';
import { NavLink } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-neutral-800 selection:text-white">
      
      {/* Navbar */}
      <header className="w-full max-w-5xl mx-auto px-6 h-16 flex items-center justify-end">
        <button className="text-sm font-medium text-neutral-400 hover:text-white transition-colors duration-200 py-1.5 px-4 rounded-md border border-neutral-800 hover:border-neutral-700 bg-neutral-900/50">
          Log In
        </button>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 max-w-3xl mx-auto -mt-16">
        
        {/* Main Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-white mb-6">
          Collaborative editor
        </h1>
        
        {/* Subtext */}
        <p className="text-base sm:text-lg text-neutral-400 max-w-xl mb-10 leading-relaxed">
          Write, review, and refine together in real-time. A distraction-free workspace designed for engineering teams who value speed and seamless cooperation.
        </p>
        
        {/* CTA Button */}
        <NavLink className="bg-white text-neutral-950 hover:bg-neutral-200 font-medium px-6 py-3 rounded-lg text-sm sm:text-base shadow-sm hover:shadow transition-all duration-200 transform active:scale-[0.98]"
        to={"/auth/login"}>
          Get Started
        </NavLink>
        
      </main>

      {/* Footer  */}
      <footer className="h-16" />
    </div>
  );
}