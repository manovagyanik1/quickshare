import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';

export const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        await authService.handleRedirectPromise();
        navigate('/');
      } catch (error) {
        console.error('Auth callback failed:', error);
        navigate('/');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4" />
        <p className="text-gray-300">Completing authentication...</p>
      </div>
    </div>
  );
};