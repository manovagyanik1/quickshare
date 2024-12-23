import { useState, useCallback } from 'react';
import { authService } from '../services/auth';
import { oneDriveService } from '../services/oneDrive';

export const useOneDrive = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const login = useCallback(async () => {
    try {
      await authService.login();
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }, []);

  const uploadFile = useCallback(async (file: Blob, fileName: string) => {
    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      await oneDriveService.uploadFile(file, fileName, (progress) => {
        setUploadProgress(progress);
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, []);

  return {
    isLoggedIn: authService.isAuthenticated(),
    isUploading,
    uploadProgress,
    login,
    logout,
    uploadFile,
  };
};