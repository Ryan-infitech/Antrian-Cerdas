import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, UserCheck, UserX, RefreshCcw, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { DeleteAlert } from '../components/DeleteAlert';

interface QueueEntry {
  id: string;
  number: number;
  name: string;
  status: string;
  created_at: string;
}

export default function ManageQueue() {
  const { queueId } = useParams();
  const navigate = useNavigate();
  const [queueName, setQueueName] = useState('');
  const [entries, setEntries] = useState<QueueEntry[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchQueueDetails = async () => {
      try {
        const { data: queue, error: queueError } = await supabase
          .from('queues')
          .select('name')
          .eq('id', queueId)
          .single();

        if (queueError) throw queueError;
        setQueueName(queue.name);

        const { data: entries, error: entriesError } = await supabase
          .from('queue_entries')
          .select('*')
          .eq('queue_id', queueId)
          .order('number', { ascending: true });

        if (entriesError) throw entriesError;
        setEntries(entries);
      } catch (error) {
        toast.error('Failed to load queue details');
        navigate('/');
      }
    };

    fetchQueueDetails();

    const subscription = supabase
      .channel('queue_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'queue_entries',
          filter: `queue_id=eq.${queueId}`
        },
        () => {
          fetchQueueDetails();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [queueId, navigate]);

  const updateEntryStatus = async (entryId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('queue_entries')
        .update({ status })
        .eq('id', entryId);

      if (error) throw error;
      toast.success(`Status updated to ${status}`);
    } catch (error) {
      toast.error('Failed to update status');
      console.error(error);
    }
  };

  const deleteQueue = async () => {
    setIsLoading(true);
    try {
      // First delete all entries
      const { error: entriesError } = await supabase
        .from('queue_entries')
        .delete()
        .eq('queue_id', queueId);

      if (entriesError) throw entriesError;

      // Then delete the queue itself
      const { error: queueError } = await supabase
        .from('queues')
        .delete()
        .eq('id', queueId);

      if (queueError) throw queueError;

      toast.success('Queue deleted successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to delete queue');
      console.error(error);
    } finally {
      setIsLoading(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-6"
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {queueName}
              </h1>
              <p className="text-gray-600">
                Manajemen Antrian
              </p>
            </div>
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="bg-red-100 text-red-600 p-3 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-2"
              disabled={isLoading}
            >
              <Trash2 className="w-5 h-5" />
              <span>Hapus Antrian</span>
            </button>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">List Antrian</h2>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-600" />
                <span className="text-gray-600">{entries.length} orang dalam antrian</span>
              </div>
            </div>
          </div>

          <div className="divide-y">
            {entries.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 flex items-center justify-between ${
                  entry.status === 'called' ? 'bg-blue-50' :
                  entry.status === 'completed' ? 'bg-green-50' :
                  entry.status === 'skipped' ? 'bg-gray-50' : ''
                }`}
              >
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-gray-900">
                      #{entry.number}
                    </span>
                    <span className="text-lg text-gray-800">{entry.name}</span>
                  </div>
                  <span className="text-sm text-gray-500 capitalize">
                    Status: {entry.status}
                  </span>
                </div>

                <div className="flex gap-2">
                  {entry.status === 'waiting' && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => updateEntryStatus(entry.id, 'called')}
                      className="bg-blue-100 text-blue-600 p-2 rounded-lg hover:bg-blue-200 transition-colors"
                      title="Call"
                    >
                      <RefreshCcw className="w-5 h-5" />
                    </motion.button>
                  )}
                  {entry.status === 'called' && (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => updateEntryStatus(entry.id, 'completed')}
                        className="bg-green-100 text-green-600 p-2 rounded-lg hover:bg-green-200 transition-colors"
                        title="Complete"
                      >
                        <UserCheck className="w-5 h-5" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => updateEntryStatus(entry.id, 'skipped')}
                        className="bg-red-100 text-red-600 p-2 rounded-lg hover:bg-red-200 transition-colors"
                        title="Skip"
                      >
                        <UserX className="w-5 h-5" />
                      </motion.button>
                    </>
                  )}
                </div>
              </motion.div>
            ))}

            {entries.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-8 text-center text-gray-500"
              >
                <div className="flex flex-col items-center gap-4">
                  <Users className="w-16 h-16 text-gray-400" />
                  <p>Belum Ada Yang Bergabung</p>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      <DeleteAlert 
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={deleteQueue}
        isLoading={isLoading}
      />
    </div>
  );
}