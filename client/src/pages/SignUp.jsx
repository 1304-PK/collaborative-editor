import React, { useState } from 'react';
import AuthForm from '../components/AuthForm';
import { supabase } from '../lib/supabaseClient';

export default function SignUp() {
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (formData) => {
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
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
    finally{
      setLoading(false)
    }
  };

  return <AuthForm type="signup" onSubmit={handleSignUp} loading={loading} />;
}