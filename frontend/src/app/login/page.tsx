'use client';

import React, { useState } from 'react';
import { GoogleOAuthProvider, GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useAuth } from '@/providers/AuthProvider';
import { loginWithGoogle } from '@/services/auth';
import { CheckSquare, AlertCircle, Loader2 } from 'lucide-react';
import axios from 'axios';

export default function LoginPage() {
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      setError('No credential received from Google.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const data = await loginWithGoogle(credentialResponse.credential);
      login(data.token, data.user);
    } catch (err) {
      console.error('Google auth error:', err);
      let backendError = 'Authentication failed. Please check your credentials or try again.';
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        backendError = err.response.data.error;
      }
      setError(backendError);
      setIsSubmitting(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google Sign-In was cancelled or failed to initialize.');
  };

  if (!googleClientId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md bg-white p-6 rounded-2xl border border-red-100 shadow-sm text-center space-y-3">
          <AlertCircle className="h-10 w-10 text-red-550 text-red-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">Configuration Error</h2>
          <p className="text-sm text-slate-500">
            The Google Client ID is not configured on the client app. Please set the 
            <code className="bg-slate-100 px-1.5 py-0.5 rounded text-red-600 text-xs font-mono">NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> 
            environment variable in your Vercel project settings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8 animate-slide-up">
          {/* Brand / Logo */}
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-200">
              <CheckSquare className="h-7 w-7" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-slate-900">
              TaskFlow
            </h2>
            <p className="mt-2 text-sm text-slate-500 max-w-xs">
              Simplify team task delegation. Assign tasks, track progress, and receive email notifications.
            </p>
          </div>

          {/* Card Content */}
          <div className="bg-white px-8 py-10 shadow-sm border border-slate-100 rounded-2xl">
            <div className="space-y-6">
              {error && (
                <div className="flex items-start gap-3 rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-100">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-red-500" />
                  <div>
                    <h3 className="font-semibold">Authentication Error</h3>
                    <p className="mt-0.5 text-red-500/95">{error}</p>
                  </div>
                </div>
              )}

              <div className="flex flex-col items-center justify-center">
                {isSubmitting ? (
                  <div className="flex flex-col items-center space-y-3 py-4">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <span className="text-sm font-medium text-slate-600">Verifying credentials with server...</span>
                  </div>
                ) : (
                  <div className="w-full flex justify-center py-2">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={handleGoogleError}
                      shape="pill"
                      theme="outline"
                      size="large"
                      text="continue_with"
                      width="100%"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-slate-400">
            Secure, passwordless authentication powered by Google.
          </p>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}
