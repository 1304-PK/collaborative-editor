// pages/SignUp.jsx
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import AuthForm from '../components/AuthForm';

export default function SignUp() {
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (data) => {
    setLoading(true);
    console.log('Registering user with:', data);
    // TODO: Connect to your Supabase client here:
    // const { error } = await supabase.auth.signUp(data);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        
        {/* Header */}
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Create an account
          </h1>
          <p className="text-sm text-neutral-400">
            Get started with your collaborative editor today
          </p>
        </div>

        {/* The Component Wrapper */}
        <div className="bg-neutral-900/30 p-6 rounded-xl border border-neutral-900 shadow-xl">
          <AuthForm type="signup" onSubmit={handleSignUp} loading={loading} />
        </div>

        {/* Footer Link */}
        <p className="text-center text-sm text-neutral-500">
          Already have an account?{' '}
          <NavLink to="/login" className="text-neutral-300 hover:text-white underline underline-offset-4 transition-colors">
            Log in
          </NavLink>
        </p>

      </div>
    </div>
  );
}