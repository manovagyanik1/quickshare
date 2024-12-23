import React from 'react';
import { Cloud, LogOut } from 'lucide-react';
import { useOneDrive } from '../hooks/useOneDrive';

interface OneDriveButtonProps {
  className?: string;
}

export const OneDriveButton: React.FC<OneDriveButtonProps> = ({ className = '' }) => {
  const { isLoggedIn, isUploading, uploadProgress, login, logout } = useOneDrive();

  if (isUploading) {
    return (
      <div className={`flex flex-col items-center gap-2 ${className}`}>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
        <span className="text-sm text-gray-400">
          Uploading to OneDrive: {Math.round(uploadProgress)}%
        </span>
      </div>
    );
  }

  if (isLoggedIn) {
    return (
      <button
        onClick={logout}
        className={`flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors ${className}`}
        aria-label="Disconnect from OneDrive"
      >
        <LogOut size={20} />
        Disconnect OneDrive
      </button>
    );
  }

  return (
    <button
      onClick={login}
      className={`flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors ${className}`}
      aria-label="Connect with OneDrive"
    >
      <Cloud size={20} />
      Connect with OneDrive
    </button>
  );
};