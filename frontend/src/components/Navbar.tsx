import React from 'react';
import { Shield, LogOut, LayoutDashboard, Zap, Menu, X, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  currentView: 'home' | 'about' | 'dashboard';
  onNavigate: (view: 'home' | 'about' | 'dashboard') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleLaunchScanner = () => {
    if (isAuthenticated) onNavigate('dashboard');
    else openAuthModal('login');
    setMobileOpen(false);
  };

  const navLink = (view: 'home' | 'about', label: string) => (
    <button
      onClick={() => { onNavigate(view); setMobileOpen(false); }}
      className={`px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all ${
        currentView === view
          ? 'bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white font-bold'
          : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'
      }`}
    >
      {label}
    </button>
  );

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-cyber-border dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl shadow-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* Brand */}
        <div
          onClick={() => onNavigate('home')}
          className="flex items-center space-x-2.5 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-black dark:bg-white flex items-center justify-center shadow-sm group-hover:bg-zinc-800 dark:group-hover:bg-zinc-200 transition-colors">
            <Shield className="w-5 h-5 text-white dark:text-black" />
          </div>
          <div>
            <div className="font-black text-lg tracking-tight text-black dark:text-white font-sans leading-none">
              KAVACH<span className="text-zinc-500">AI</span>
            </div>
            <div className="text-[9px] text-zinc-400 font-mono tracking-widest uppercase">
              DEFENSE TELEMETRY
            </div>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center space-x-1">
          {navLink('home', 'Home')}
          {navLink('about', 'About Engine')}
          <button
            onClick={() => {
              if (currentView !== 'home') onNavigate('home');
              setTimeout(() => {
                document.getElementById('how-it-works-section')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
              setMobileOpen(false);
            }}
            className="px-3.5 py-1.5 rounded-xl text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
          >
            How It Works
          </button>
        </div>

        {/* Right: Theme Toggle & Auth */}
        <div className="hidden md:flex items-center space-x-2.5">
          {/* Dark / Light Mode Toggle */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 hover:text-black dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all shadow-sm flex items-center gap-1.5 text-xs font-mono"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400 fill-amber-400/20" />
                <span className="font-semibold">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-zinc-700 fill-zinc-700/20" />
                <span className="font-semibold">Dark</span>
              </>
            )}
          </button>

          {isAuthenticated && user ? (
            <>
              <button
                onClick={() => onNavigate('dashboard')}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  currentView === 'dashboard'
                    ? 'bg-black dark:bg-white text-white dark:text-black shadow-sm'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>SOC Dashboard</span>
              </button>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-xs font-mono text-zinc-700 dark:text-zinc-300">
                <span className="w-2 h-2 rounded-full bg-black dark:bg-white" />
                <span className="font-semibold">{user.name.split(' ')[0]}</span>
              </div>

              <button
                onClick={logout}
                title="Sign Out"
                className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-black dark:hover:text-white border border-zinc-300 dark:border-zinc-700 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => openAuthModal('login')}
                className="px-4 py-2 text-sm font-semibold text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={handleLaunchScanner}
                className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-black dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-black font-bold text-sm shadow-sm transition-all"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Launch Scanner</span>
              </button>
            </>
          )}
        </div>

        {/* Mobile items */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-700" />}
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 space-y-2 shadow-lg">
          {navLink('home', 'Home')}
          {navLink('about', 'About Engine')}
          {isAuthenticated ? (
            <button onClick={() => { onNavigate('dashboard'); setMobileOpen(false); }}
              className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold bg-black dark:bg-white text-white dark:text-black">
              SOC Dashboard
            </button>
          ) : (
            <button onClick={handleLaunchScanner}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold text-sm">
              <Zap className="w-4 h-4 fill-current" /> Launch Scanner
            </button>
          )}
        </div>
      )}
    </nav>
  );
};
