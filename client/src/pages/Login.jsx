// pages/Login.jsx
import React, { useState } from 'react';
import AuthForm from '../components/AuthForm';
import { supabase } from '../lib/supabaseClient';

export default function Login() {
  const [loading, setLoading] = useState(false);

  const handleLogin = async (formData) => {
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      })

      if (error) {
        throw new Error(error.message)
      }
    }
    catch (err) {
      console.error(err)
    }
    finally {
      setLoading(false)
    }
  };

  return <AuthForm type="login" onSubmit={handleLogin} loading={loading} />;
}