import { useMsal } from '@azure/msal-react';
import { useState } from 'react';
import { uploadToOneDrive } from '../services/oneDrive';

export const useOneDrive = () => {
  const { instance, accounts } = useMsal();
  const [isUploading, setIsUploading] = useState(false);

  const login = async () => {
    try {
      await instance.loginPopup({
        scopes: ['Files.ReadWrite', 'Files.ReadWrite.All'],
      });
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  };

  const uploadFile = async (file: Blob, fileName: string) => {
    try {
      setIsUploading(true);
      await uploadToOneDrive(file, fileName);
    } finally {
      setIsUploading(false);
    }
  };

  return {
    isLoggedIn: accounts.length > 0,
    isUploading,
    login,
    uploadFile,
  };
};