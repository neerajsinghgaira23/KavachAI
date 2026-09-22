import React, { useState } from 'react';
import { X, Shield, Lock, Mail, User, ArrowRight, Zap } from 'lucide-react';
import { useAuth, UserSession } from '../context/AuthContext';

interface AuthModalProps {
  onSuccessNavigate?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onSuccessNavigate }) => {
  const { isAuthModalOpen, closeAuthModal, authModalTab, openAuthModal, login, register, demoLogin } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserSession['role']>('Cyber Investigator');
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!email.trim() || !email.includes('@')) {
      setValidationError('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setValidationError('Password must contain at least 6 characters.');
      return;
    }

    if (authModalTab === 'login') {
      login(email, password, role);
    } else {
      register(name || email.split('@')[0], email, role);
    }

    if (onSuccessNavigate) {
      onSuccessNavigate();
    }
  };

  const handleDemoAccess = () => {
    demoLogin();
    if (onSuccessNavigate) {
      onSuccessNavigate();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md rounded-3xl bg-white border border-cyber-border shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-cyber-border bg-cyber-elevated">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-black text-white shadow-sm">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-black font-mono tracking-wide flex items-center gap-1.5">
                KAVACH<span className="text-zinc-500">AI</span> GATEWAY
              </h3>
              <p className="text-xs text-zinc-500">Security Operations Authentication</p>
            </div>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-2 rounded-xl hover:bg-zinc-200 text-zinc-500 hover:text-black transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1-Click Judge Demo CTA */}
        <div className="p-4 bg-zinc-50 border-b border-zinc-200">
          <button
            type="button"
            onClick={handleDemoAccess}
            className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-black hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md group"
          >
            <span className="flex items-center gap-2">
              <Zap className="w-4 h-4 fill-white" />
              1-Click Demo Access (Instant Analyst Pass)
            </span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
          <p className="text-[11px] text-zinc-500 text-center mt-2 font-mono">
            [HACKATHON DEMO] Skip login credentials and enter SOC workspace directly.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-cyber-border bg-white">
          <button
            type="button"
            onClick={() => openAuthModal('login')}
            className={`flex-1 py-3 text-xs font-semibold text-center border-b-2 transition-all ${
              authModalTab === 'login'
                ? 'border-black text-black font-bold'
                : 'border-transparent text-zinc-500 hover:text-black'
            }`}
          >
            Sign In to Workspace
          </button>
          <button
            type="button"
            onClick={() => openAuthModal('register')}
            className={`flex-1 py-3 text-xs font-semibold text-center border-b-2 transition-all ${
              authModalTab === 'register'
                ? 'border-black text-black font-bold'
                : 'border-transparent text-zinc-500 hover:text-black'
            }`}
          >
            Create Analyst Account
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {validationError && (
            <div className="p-3 rounded-xl bg-zinc-100 border border-zinc-400 text-xs text-black font-mono">
              [ERROR] {validationError}
            </div>
          )}

          {authModalTab === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-black mb-1 font-mono">Analyst Name:</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Henderson"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-cyber-elevated border border-cyber-border focus:border-black text-xs text-black placeholder-zinc-400 outline-none font-mono"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-black mb-1 font-mono">Work / Personal Email:</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="analyst@kavach.ai"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-cyber-elevated border border-cyber-border focus:border-black text-xs text-black placeholder-zinc-400 outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-black mb-1 font-mono">Security Password:</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-cyber-elevated border border-cyber-border focus:border-black text-xs text-black placeholder-zinc-400 outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-black mb-1 font-mono">Operating Role Profile:</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserSession['role'])}
              className="w-full px-3 py-2.5 rounded-xl bg-cyber-elevated border border-cyber-border focus:border-black text-xs text-black outline-none font-mono"
            >
              <option value="Cyber Investigator">Cyber Investigator (SOC Threat Analyst)</option>
              <option value="Candidate / Job Seeker">Candidate / Job Seeker (Defense Mode)</option>
              <option value="Security Analyst">Enterprise Security Auditor</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-3 rounded-xl bg-black hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center space-x-2"
          >
            <span>{authModalTab === 'login' ? 'Authenticate Session' : 'Register & Enter Workspace'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
