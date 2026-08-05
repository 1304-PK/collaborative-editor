import React, { useState, useRef } from 'react';
import { Toast } from 'primereact/toast';
import AuthForm from '../components/AuthForm';
import { supabase } from '../lib/supabaseClient';

import { AuthSchema } from '../schemas/auth.schema';
import { fromError } from 'zod-validation-error';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const toastRef = useRef(null);

  const handleLogin = async (formData) => {

    const result = AuthSchema.safeParse(formData)
    if (!result.success){
      throw new Error(fromError(result.error).message)
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        throw error;
      }
    } catch (err) {
      const isWrongCredentials =
        // err?.code === 'invalid_credentials' ||
        // err?.message === 'Invalid login credentials';

      toastRef.current?.show({
        severity: 'error',
        summary: 'Login failed',
        // detail: isWrongCredentials
        //   ? 'The email or password you entered is incorrect.'
        //   : "Couldn't sign in",
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
      <AuthForm type="login" onSubmit={handleLogin} loading={loading} />
    </>
  );
}