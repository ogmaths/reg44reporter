import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '../../lib/useAuth';
import { toast } from '../../components/ui/use-toast';
import { supabase } from '../../types/supabase';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login, loading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const success = await login(email, password);
    if (success) {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Check if user exists in users table
        const { data: existingUser, error: userFetchError } = await supabase
          .from('users')
          .select('id, role, organization_id')
          .eq('id', user.id)
          .single();
        let userRole = user.user_metadata?.role;
        let organizationId = user.user_metadata?.organization_id;
        if (!userRole && existingUser) {
          userRole = existingUser.role;
        }
        if (!organizationId && existingUser) {
          organizationId = existingUser.organization_id;
        }
        if (userRole) {
          localStorage.setItem('user_role', userRole);
        }
        if (organizationId) {
          localStorage.setItem('organization_id', organizationId);
        }
        if (!existingUser) {
          // Insert user info into users table
          await supabase.from('users').insert([{
            id: user.id,
            email: user.email,
            full_name: (user.user_metadata?.firstName || '') + ' ' + (user.user_metadata?.lastName || ''),
            // You can add more fields here if needed
          }]);
        }
      }
      // Get the session from supabase
      const session = (await import('../../types/supabase')).supabase.auth.getSession();
      session.then(({ data }) => {
        const token = data.session?.access_token;
        if (token) {
          if (rememberMe) {
            localStorage.setItem('access_token', token);
          } else {
            sessionStorage.setItem('access_token', token);
          }
        }
      });
      toast({
        title: 'Login successful!',
        description: 'You are now signed in.',
      });
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="ml-3 text-2xl font-bold text-gray-900">Regulation 44</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
          <p className="mt-2 text-gray-600">Sign in to your account to continue</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="remember-me"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <Label htmlFor="remember-me" className="text-sm">
                Remember me
              </Label>
            </div>
            <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-500">
              Forgot your password?
            </Link>
          </div>

          {(formError || error) && (
            <div className="text-red-600 text-sm">{formError || error}</div>
          )}

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>

          <div className="text-center">
            <span className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500">
                Sign up
              </Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
