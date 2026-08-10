import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';

export const MainLayout = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-slate-800/80 bg-slate-950 py-8 px-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© 2026 Schedulo Platform. Built with MongoDB, Express, React, Node.js.</p>
          <div className="flex gap-6">
            <a href="#features" className="hover:text-slate-300">Features</a>
            <a href="#how-it-works" className="hover:text-slate-300">How It Works</a>
            <a href="#privacy" className="hover:text-slate-300">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
