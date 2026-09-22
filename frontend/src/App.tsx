import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { DashboardPage } from './pages/DashboardPage';
import { Shield } from 'lucide-react';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'home' | 'about' | 'dashboard'>('home');

  return (
    <div className="min-h-screen bg-cyber-bg text-black flex flex-col font-sans cyber-grid selection:bg-black selection:text-white">
      {/* Persistent Navigation Bar */}
      <Navbar currentView={currentView} onNavigate={setCurrentView} />

      {/* Main Content View */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentView === 'home' && (
          <HomePage
            onLaunchScanner={() => setCurrentView('dashboard')}
            onNavigateAbout={() => setCurrentView('about')}
          />
        )}
        {currentView === 'about' && (
          <AboutPage onLaunchScanner={() => setCurrentView('dashboard')} />
        )}
        {currentView === 'dashboard' && <DashboardPage />}
      </main>

      {/* Global Authentication Modal */}
      <AuthModal onSuccessNavigate={() => setCurrentView('dashboard')} />

      {/* Global Persistent Footer */}
      <footer className="relative z-10 border-t border-cyber-border bg-white/80 backdrop-blur-md py-6 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded-lg bg-black text-white flex items-center justify-center">
              <Shield className="w-3 h-3" />
            </div>
            <span className="font-bold text-black font-mono">KavachAI</span>
            <span className="text-zinc-400 font-mono">— Autonomous Phishing &amp; Advance-Fee Defense Engine</span>
          </div>
          <div className="flex items-center space-x-4 font-mono text-[11px] text-zinc-500">
            <span>Client-Side Threat Heuristics</span>
            <span>•</span>
            <span>Zero Backend Required</span>
            <span>•</span>
            <span>FastAPI Bridge Ready</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
