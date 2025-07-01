import { useState } from 'react';
import { supabase } from '../types/supabase';

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Signup function
  const signup = async (email: string, password: string, firstName: string, lastName: string) => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          firstName,
          lastName,
        }
      }
    });
    setLoading(false);
    if (error) setError(error.message);
    return !error;
  };

  // Login function
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setError(error.message);
    return !error;
  };

  return { signup, login, loading, error };
} 