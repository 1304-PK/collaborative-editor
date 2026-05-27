// pages/Login.jsx
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import AuthForm from '../components/AuthForm';

export default function Login() {
  const [loading, setLoading] = useState(false);

  const handleLogin = async (data) => {
    setLoading(true);
    console.log('Logging in with:', data);
    // TODO: Connect to your Supabase client here:
    // const { error } = await supabase.auth.signInWithPassword(data);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        
        {/* Header */}
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Welcome back
          </h1>
          <p className="text-sm text-neutral-400">
            Enter your credentials to access your account
          </p>
        </div>

        {/* The Component Wrapper */}
        <div className="bg-neutral-900/30 p-6 rounded-xl border border-neutral-900 shadow-xl">
          <AuthForm type="login" onSubmit={handleLogin} loading={loading} />
        </div>

        {/* Footer Link */}
        <p className="text-center text-sm text-neutral-500">
          Don't have an account?{' '}
          <NavLink to="/signup" className="text-neutral-300 hover:text-white underline underline-offset-4 transition-colors">
            Sign up
          </NavLink>
        </p>

      </div>
    </div>
  );
}