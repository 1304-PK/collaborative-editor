import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import treeBackground from '../assets/tree_background.jpg';

export default function AuthForm({ type, onSubmit, loading }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ email, password });
  };

  const isLogin = type === 'login';

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat relative font-sans overflow-hidden select-none"
      style={{ backgroundImage: `url(${treeBackground})` }}
    >
      {/* Background Overlay for Soft Contrast */}
      <div className="absolute inset-0 bg-black/10 backdrop-brightness-[0.95] z-0" />

      {/* Main Glassmorphic Card Container */}
      <div className="w-full max-w-[400px] bg-white/40 backdrop-blur-xl border border-white/50 rounded-[2.5rem] shadow-[0_24px_50px_-12px_rgba(0,0,0,0.12)] px-8 py-10 sm:px-9 sm:py-11 flex flex-col relative z-10 transition-all duration-300 hover:shadow-[0_32px_60px_-10px_rgba(0,0,0,0.18)]">
        
        {/* Dynamic Top Icon Container */}
        <div className="w-14 h-14 bg-white rounded-2xl shadow-[0_8px_20px_rgba(0,0,0,0.06)] border border-white/80 flex items-center justify-center mb-6 mx-auto transform hover:rotate-6 transition-transform duration-300">
          {isLogin ? (
            <LogIn className="w-6 h-6" />
          ) : (
            <UserPlus className="w-6 h-6" />
          )}
        </div>

        {/* Heading & Subheading */}
        <div className="text-center mb-6">
          <h2 className="text-[28px] text-neutral-900 tracking-tight mb-2">
            {isLogin ? 'Sign In' : 'Create Your Account'}
          </h2>
          <p className="text-s text-neutral-700/80 leading-relaxed max-w-[270px] mx-auto">
            {isLogin
              ? 'Welcome back. Ready to create something amazing?'
              : 'Create your account and start creating in real-time. For free'}
          </p>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col">
          {/* Email Field */}
          <div className="relative mb-3.5 w-full group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center text-neutral-500 group-focus-within:text-neutral-800 transition-colors">
              <Mail className="w-[18px] h-[18px]" />
            </span>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full bg-white/60 focus:bg-white/85 border border-white/20 focus:border-white/50 rounded-2xl pl-11 pr-4 py-3 text-sm text-neutral-900 placeholder-neutral-500 focus:outline-none transition-all shadow-sm focus:ring-4 focus:ring-white/20"
            />
          </div>

          {/* Password Field */}
          <div className="relative mb-2 w-full group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center text-neutral-500 group-focus-within:text-neutral-800 transition-colors">
              <Lock className="w-[18px] h-[18px]" />
            </span>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-white/60 focus:bg-white/85 border border-white/20 focus:border-white/50 rounded-2xl pl-11 pr-11 py-3 text-sm text-neutral-900 placeholder-neutral-500 focus:outline-none transition-all shadow-sm focus:ring-4 focus:ring-white/20"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-800 transition-colors flex items-center justify-center p-1 cursor-pointer focus:outline-none"
            >
              {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
            </button>
          </div>

          {/* Forgot Password Link (Only for Login) */}
          {isLogin && (
            <div className="text-right w-full mb-5">
              <a
                href="#forgot-password"
                className="text-[12px] text-neutral-600 hover:text-neutral-900 transition-colors outline-none"
              >
                Forgot password?
              </a>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-[#1b1924] hover:bg-[#282635] text-white font-semibold py-3.5 rounded-2xl text-sm transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer select-none active:scale-[0.99] focus:outline-none ${
              !isLogin ? 'mt-3.5 mb-5' : 'mb-5'
            }`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Processing...
              </span>
            ) : isLogin ? (
              'Get Started'
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Social Login Divider */}
        <div className="w-full text-center mb-4.5">
          <span className="text-[11px] text-black uppercase tracking-widest select-none">
            {isLogin ? "Or sign in with" : "Or sign up with"}
          </span>
        </div>

        {/* Social Buttons Grid */}
        <div className="flex items-center justify-center w-full mb-6.5">
          <button
            type="button"
            className="flex-1 flex justify-center items-center gap-3 bg-white/70 hover:bg-white/90 border border-white/60 rounded-2xl py-2.5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer focus:outline-none"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                fill="#EA4335"
              />
            </svg>
            {isLogin ? "Sign in with Google" : "Sign up with Google"}
          </button>
        </div>

        {/* Footer Redirect Link */}
        <p className="text-center text-[13x] text-black select-none">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <NavLink
            to={isLogin ? '/auth/signup' : '/auth/login'}
            className="text-neutral-900 hover:underline ml-1 transition-all"
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </NavLink>
        </p>

      </div>
    </div>
  );
}
