import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface DeleteAlertProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

export const DeleteAlert: React.FC<DeleteAlertProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
        <div className="mb-4">
          <div className="flex items-center gap-2 text-red-600 text-lg font-semibold mb-2">
            <AlertTriangle className="w-5 h-5" />
            <h2>Hapus Antrian</h2>
          </div>
          <p className="text-gray-600">
            Apakah Anda yakin ingin menghapus antrian ini? Semua data antrian akan dihapus permanen.
          </p>
        </div>
        
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
          >
            {isLoading ? 'Menghapus...' : 'Hapus'}
          </button>
        </div>
      </div>
    </div>
  );
};