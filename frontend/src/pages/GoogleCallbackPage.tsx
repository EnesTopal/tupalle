import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { extractCodeFromUrl, clearUrlParams, handleGoogleAuthCallback } from '../utils/googleOAuth';

const GoogleCallbackPage: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const { googleAuth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check if this is a popup window
        if (window.opener) {
          // This is a popup - handle it and close
          handleGoogleAuthCallback();
          return;
        }

        // This is a regular redirect - process normally
        const code = extractCodeFromUrl();
        const error = new URLSearchParams(window.location.search).get('error');

        if (error) {
          setStatus('error');
          setMessage('Google authentication was cancelled or failed.');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        if (!code) {
          setStatus('error');
          setMessage('No authorization code received from Google.');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        // Clear URL parameters
        clearUrlParams();

        // Process the authorization code
        const result = await googleAuth(code);
        
        if (result.success) {
          setStatus('success');
          setMessage('Successfully authenticated with Google! Redirecting...');
          setTimeout(() => navigate('/'), 2000);
        } else {
          setStatus('error');
          setMessage(result.message || 'Google authentication failed.');
          setTimeout(() => navigate('/login'), 3000);
        }
      } catch (err: any) {
        console.error('Google callback error:', err);
        setStatus('error');
        setMessage('An error occurred during Google authentication.');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleCallback();
  }, [googleAuth, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-100">
            {status === 'loading' && (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
            )}
            {status === 'success' && (
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {status === 'error' && (
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {status === 'loading' && 'Processing Google Authentication...'}
            {status === 'success' && 'Authentication Successful!'}
            {status === 'error' && 'Authentication Failed'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
};

export default GoogleCallbackPage;
