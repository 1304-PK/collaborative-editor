import React, { useState, useRef } from 'react';
import { Toast } from 'primereact/toast';
import AuthForm from '../components/AuthForm';
import { supabase } from '../lib/supabaseClient';

export default function SignUp() {
  const [loading, setLoading] = useState(false);
  const toastRef = useRef(null);

  const handleSignUp = async (formData) => {
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        throw error;
      }
    } catch (err) {
      toastRef.current?.show({
        severity: 'error',
        summary: 'Signup failed',
        detail: "Couldn't create account",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toast ref={toastRef} />
      <AuthForm type="signup" onSubmit={handleSignUp} loading={loading} />
    </>
  );
}