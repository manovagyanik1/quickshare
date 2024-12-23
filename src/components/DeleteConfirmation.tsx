import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';

interface DeleteConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  videoName: string;
}

export const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({
  isOpen,
  onClose,
  onConfirm,
  videoName
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-yellow-400 mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">
          Delete Recording
        </h3>
        <p className="text-sm text-gray-400 mb-6">
          Are you sure you want to delete "{videoName}"? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </Modal>
  );
}; 