import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, Camera, QrCode } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

export default function JoinQueue() {
  const { queueId: paramQueueId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [queueName, setQueueName] = useState('');
  const [userName, setUserName] = useState('');
  const [showScanner, setShowScanner] = useState(!paramQueueId);
  const [queueId, setQueueId] = useState<string | null>(paramQueueId || null);

  useEffect(() => {
    if (queueId) {
      fetchQueueDetails();
    }
  }, [queueId]);

  useEffect(() => {
    if (showScanner) {
      const scanner = new Html5QrcodeScanner(
        'qr-reader',
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );

      scanner.render(onScanSuccess, onScanError);

      return () => {
        scanner.clear().catch(console.error);
      };
    }
  }, [showScanner]);

  const fetchQueueDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('queues')
        .select('name')
        .eq('id', queueId)
        .single();

      if (error) throw error;
      setQueueName(data.name);
    } catch (error) {
      toast.error('Queue not found');
      navigate('/');
    }
  };

  const onScanSuccess = (decodedText: string) => {
    try {
      const url = new URL(decodedText);
      const pathParts = url.pathname.split('/');
      const scannedQueueId = pathParts[pathParts.length - 1];
      setQueueId(scannedQueueId);
      setShowScanner(false);
    } catch (error) {
      toast.error('Invalid QR code');
    }
  };

  const onScanError = (error: any) => {
    console.error(error);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queueId) return;
    setLoading(true);

    try {
      // Get the current number
      const { data: queue } = await supabase
        .from('queues')
        .select('current_number')
        .eq('id', queueId)
        .single();

      const nextNumber = (queue?.current_number || 0) + 1;

      // Create queue entry
      const { data: entry, error: entryError } = await supabase
        .from('queue_entries')
        .insert([
          {
            queue_id: queueId,
            name: userName,
            number: nextNumber
          }
        ])
        .select()
        .single();

      if (entryError) throw entryError;

      // Update queue current number
      const { error: updateError } = await supabase
        .from('queues')
        .update({ current_number: nextNumber })
        .eq('id', queueId);

      if (updateError) throw updateError;

      toast.success('Berhasil masuk dalam antrian!');
      navigate(`/view/${queueId}?entry=${entry.id}`);
    } catch (error) {
      toast.error('Gagal bergabung dalam antrian');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (showScanner) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <QrCode className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Scan QR Code
            </h1>
            <p className="text-gray-600">
              Position the QR code within the frame to join the queue
            </p>
          </div>
          <div id="qr-reader" className="mb-6"></div>
          <p className="text-sm text-gray-500 text-center">
            Make sure your camera is enabled and the QR code is clearly visible
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
          Masuk Antrian
        </h1>
        <p className="text-gray-600 text-center mb-6">
          {queueName}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-2">
              Nama Anda
            </label>
            <input
              type="text"
              id="userName"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Masukkan Nama Anda"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Masuk'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}