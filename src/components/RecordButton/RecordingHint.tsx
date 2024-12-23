import React from 'react';
import { ArrowDown } from 'lucide-react';

export const RecordingHint = () => {
  return (
    <div className="absolute -top-16 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce">
      <p className="text-blue-400 font-medium mb-2">Click here to start</p>
      <ArrowDown className="h-6 w-6 text-blue-400" />
    </div>
  );
};