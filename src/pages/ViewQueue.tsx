import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Clock, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface QueueEntry {
  id: string;
  number: number;
  name: string;
  status: string;
}

export default function ViewQueue() {
  const { queueId } = useParams();
  const [searchParams] = useSearchParams();
  const entryId = searchParams.get('entry');
  const [queueName, setQueueName] = useState('');
  const [entries, setEntries] = useState<QueueEntry[]>([]);
  const [myEntry, setMyEntry] = useState<QueueEntry | null>(null);

  useEffect(() => {
    const fetchQueueDetails = async () => {
      try {
        const { data: queue } = await supabase
          .from('queues')
          .select('name')
          .eq('id', queueId)
          .single();

        setQueueName(queue?.name || '');

        const { data: entries } = await supabase
          .from('queue_entries')
          .select('*')
          .eq('queue_id', queueId)
          .order('number', { ascending: true });

        setEntries(entries || []);

        if (entryId) {
          const myEntry = entries?.find(entry => entry.id === entryId) || null;
          setMyEntry(myEntry);
        }
      } catch (error) {
        console.error('Error fetching queue details:', error);
      }
    };

    fetchQueueDetails();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('queue_updates')
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
  }, [queueId, entryId]);

  const getPositionInQueue = () => {
    if (!myEntry) return 0;
    const waitingEntries = entries.filter(e => e.status === 'waiting');
    return waitingEntries.findIndex(e => e.id === myEntry.id) + 1;
  };

  const position = getPositionInQueue();

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {queueName}
          </h1>
          <div className="flex items-center gap-4 text-gray-600">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span>{entries.filter(e => e.status === 'waiting').length} waiting</span>
            </div>
            {myEntry && (
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>Your position: {position}</span>
              </div>
            )}
          </div>
        </div>

        {myEntry && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Status Anda</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900 mb-2">
                  #{myEntry.number}
                </p>
                <p className="text-gray-600">{myEntry.name}</p>
              </div>
              <div className={`
                px-4 py-2 rounded-full font-medium
                ${myEntry.status === 'waiting' ? 'bg-blue-100 text-blue-600' :
                  myEntry.status === 'called' ? 'bg-yellow-100 text-yellow-600' :
                  myEntry.status === 'completed' ? 'bg-green-100 text-green-600' :
                  'bg-gray-100 text-gray-600'}
              `}>
                {myEntry.status.charAt(0).toUpperCase() + myEntry.status.slice(1)}
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold text-gray-800">Daftar Antrian</h2>
          </div>

          <div className="divide-y">
            {entries
              .filter(entry => entry.status === 'waiting' || entry.status === 'called')
              .map((entry) => (
                <div
                  key={entry.id}
                  className={`p-4 ${
                    entry.status === 'called' ? 'bg-blue-50' :
                    entry.id === myEntry?.id ? 'bg-green-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-gray-900">
                        #{entry.number}
                      </span>
                      <span className="text-lg text-gray-800">{entry.name}</span>
                    </div>
                    <span className={`
                      px-3 py-1 rounded-full text-sm font-medium
                      ${entry.status === 'called' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-blue-100 text-blue-600'}
                    `}>
                      {entry.status === 'called' ? 'diproses' : 'Menunggu'}
                    </span>
                  </div>
                </div>
              ))}

            {entries.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                No one in the queue
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}