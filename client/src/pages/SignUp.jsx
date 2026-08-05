import React, { useState, useRef } from 'react';
import { Toast } from 'primereact/toast';
import AuthForm from '../components/AuthForm';
import { supabase } from '../lib/supabaseClient';

// Importing schemas
import { AuthSchema } from '../schemas/auth.schema';
import errorFormatter from "../utils/errorFormatter"

export default function SignUp() {
  console.log("hey bitch")
  const [loading, setLoading] = useState(false);
  const toastRef = useRef(null);

  const handleSignUp = async (formData) => {
    console.log(formData)
    console.log("hey")
    const result = AuthSchema.safeParse(formData)
    try {
    if (!result.success) {
      throw new Error(errorFormatter(result))
    }

    setLoading(true);

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
        detail: err.message,
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