import React, { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import {
  Clock,
  Users,
  Share2,
  ArrowLeft,
  ChevronUp,
  CheckCircle,
  Loader2,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { supabase } from "../lib/supabase";
import SEO from "../components/SEO";

interface QueueEntry {
  id: string;
  number: number;
  name: string;
  status: string;
  created_at: string;
}

export default function ViewQueue() {
  const { queueId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const entryId = searchParams.get("entry");
  const [queueName, setQueueName] = useState("");
  const [entries, setEntries] = useState<QueueEntry[]>([]);
  const [myEntry, setMyEntry] = useState<QueueEntry | null>(null);
  const [estimatedWaitTime, setEstimatedWaitTime] = useState<number | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  // Add ref to track latest entry without causing re-renders
  const myEntryIdRef = useRef<string | null>(entryId);

  useEffect(() => {
    const fetchQueueDetails = async () => {
      try {
        setLoading(true);

        const { data: queue, error: queueError } = await supabase
          .from("queues")
          .select("name")
          .eq("id", queueId)
          .single();

        if (queueError) throw queueError;
        setQueueName(queue?.name || "");

        const { data: entries, error: entriesError } = await supabase
          .from("queue_entries")
          .select("*")
          .eq("queue_id", queueId)
          .order("number", { ascending: true });

        if (entriesError) throw entriesError;
        setEntries(entries || []);

        if (myEntryIdRef.current) {
          const myEntryData =
            entries?.find((entry) => entry.id === myEntryIdRef.current) || null;
          setMyEntry(myEntryData);

          if (myEntryData && myEntryData.status === "waiting") {
            const position = getPositionInQueue(myEntryData, entries);
            const estimatedMinutes = position * 3;
            setEstimatedWaitTime(estimatedMinutes);
          } else {
            setEstimatedWaitTime(null);
          }
        }
      } catch (error) {
        console.error("Error fetching queue details:", error);
        toast.error("Failed to load queue");
      } finally {
        setLoading(false);
      }
    };

    fetchQueueDetails();

    // Set up subscription once and avoid recreating it
    const entriesSubscription = supabase
      .channel("user-queue-entries")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "queue_entries",
          filter: `queue_id=eq.${queueId}`,
        },
        (payload) => {
          console.log("New queue entry added:", payload);
          fetchQueueDetails();

          // Check if myEntry exists before accessing its properties
          if (myEntry && myEntry.status === "waiting") {
            toast.info("Ada entry baru di antrian");
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "queue_entries",
          filter: `queue_id=eq.${queueId}`,
        },
        (payload: any) => {
          console.log("Queue entry updated:", payload);

          if (
            myEntryIdRef.current &&
            payload.new &&
            payload.new.id === myEntryIdRef.current
          ) {
            const oldStatus = payload.old?.status;
            const newStatus = payload.new.status;

            if (oldStatus !== newStatus) {
              if (newStatus === "called") {
                toast.success("Anda di panggil", {
                  icon: "🔔",
                  duration: 5000,
                });
              } else if (newStatus === "completed") {
                toast.success("Your service has been completed");
              } else if (newStatus === "skipped") {
                toast.error("Your turn has been skipped");
              }
            }
          }

          fetchQueueDetails();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "queue_entries",
          filter: `queue_id=eq.${queueId}`,
        },
        () => {
          console.log("Queue entry deleted");
          fetchQueueDetails();
        }
      )
      .subscribe();

    const queueSubscription = supabase
      .channel("user-queue-details")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "queues",
          filter: `id=eq.${queueId}`,
        },
        () => {
          console.log("Queue details updated");
          fetchQueueDetails();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "queues",
          filter: `id=eq.${queueId}`,
        },
        () => {
          console.log("Queue deleted");
          toast.error("This queue has been deleted");
          navigate("/");
        }
      )
      .subscribe();

    return () => {
      entriesSubscription.unsubscribe();
      queueSubscription.unsubscribe();
    };
  }, [queueId, entryId, navigate]);

  const getPositionInQueue = (
    entry: QueueEntry | null,
    allEntries: QueueEntry[]
  ) => {
    if (!entry) return 0;
    const waitingEntries = allEntries.filter((e) => e.status === "waiting");
    return waitingEntries.findIndex((e) => e.id === entry.id) + 1;
  };

  const position = getPositionInQueue(myEntry, entries);

  const copyShareLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success("Link berhasil di salin");
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minutes`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours} hour${hours > 1 ? "s" : ""} ${
      remainingMinutes > 0 ? `${remainingMinutes} min` : ""
    }`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "waiting":
        return "bg-blue-500";
      case "called":
        return "bg-amber-500";
      case "completed":
        return "bg-green-500";
      case "skipped":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "waiting":
        return "Waiting";
      case "called":
        return "Now Serving";
      case "completed":
        return "Completed";
      case "skipped":
        return "Skipped";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <SEO title="Loading Queue | Antrian Cerdas" noindex={true} />
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 mx-auto animate-spin mb-4" />
          <p className="text-gray-600">Loading detail Antrian...</p>
        </div>
      </div>
    );
  }

  const waitingEntries = entries.filter(
    (e) => e.status === "waiting" || e.status === "called"
  );
  const displayEntries = showAll ? waitingEntries : waitingEntries.slice(0, 5);
  const hasMore = waitingEntries.length > 5;

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title={`Antrian ${queueName} | Antrian Cerdas`}
        description={`Pantau status antrian ${queueName} secara real-time. Lihat posisi Anda dalam antrian dan waktu tunggu yang diperkirakan.`}
        keywords={`status antrian, antrian ${queueName}, antrian digital, waktu tunggu`}
        url={`https://buatantrian.web.id/view/${queueId}`}
      />

      {/* Header Navigation */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center">
            <button
              onClick={() => navigate("/")}
              className="mr-4 text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Queue Status</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {/* Queue Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden mb-6"
        >
          <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-1">{queueName}</h1>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4 opacity-80" />
                    <span className="opacity-90">
                      {waitingEntries.length} in queue
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={copyShareLink}
                className="mt-3 md:mt-0 bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-sm transition-colors self-start"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* My Status Section */}
        {myEntry && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-3 px-1">
              My Status
            </h2>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div
                className={`px-6 py-5 border-b-4 ${
                  myEntry.status === "waiting"
                    ? "border-blue-500"
                    : myEntry.status === "called"
                    ? "border-amber-500"
                    : myEntry.status === "completed"
                    ? "border-green-500"
                    : "border-gray-500"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white ${getStatusColor(
                        myEntry.status
                      )}`}
                    >
                      {myEntry.number}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 text-lg">
                        {myEntry.name}
                      </h3>
                      <div
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1
                        ${
                          myEntry.status === "waiting"
                            ? "bg-blue-100 text-blue-800"
                            : myEntry.status === "called"
                            ? "bg-amber-100 text-amber-800"
                            : myEntry.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }
                      `}
                      >
                        {getStatusText(myEntry.status)}
                      </div>
                    </div>
                  </div>

                  {myEntry.status === "waiting" && (
                    <div className="bg-gray-50 px-4 py-3 rounded-lg">
                      <div className="text-sm text-gray-500">Posisi Anda</div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-2xl font-bold text-gray-900">
                          {position}
                        </span>
                        <span className="text-gray-500">
                          of {waitingEntries.length}
                        </span>
                      </div>
                      {estimatedWaitTime !== null && (
                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Est. wait: ~{formatTime(estimatedWaitTime)}
                        </div>
                      )}
                    </div>
                  )}

                  {myEntry.status === "called" && (
                    <div className="bg-amber-50 border border-amber-200 px-4 py-3 rounded-lg animate-pulse">
                      <div className="font-medium text-amber-800">
                        Giliran Anda sudah dipanggil!
                      </div>
                      <div className="text-xs text-amber-700 mt-1">
                        Please proceed to the service area
                      </div>
                    </div>
                  )}

                  {myEntry.status === "completed" && (
                    <div className="bg-green-50 border border-green-200 px-4 py-3 rounded-lg">
                      <div className="font-medium text-green-800 flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4" />
                        Service completed
                      </div>
                      <div className="text-xs text-green-700 mt-1">
                        Thank you for your visit
                      </div>
                    </div>
                  )}

                  {myEntry.status === "skipped" && (
                    <div className="bg-gray-50 border border-gray-200 px-4 py-3 rounded-lg">
                      <div className="font-medium text-gray-800 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4" />
                        Your turn was skipped
                      </div>
                      <div className="text-xs text-gray-700 mt-1">
                        Please check with staff
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {myEntry.status === "waiting" &&
                position <= 3 &&
                position > 0 && (
                  <div className="p-4 bg-blue-50 border-t border-blue-100">
                    <div className="flex items-center gap-2 text-blue-800">
                      <AlertCircle className="w-5 h-5 text-blue-500" />
                      <span className="font-medium">
                        {position === 1
                          ? "You're next!"
                          : `${position} customers ahead of you`}
                      </span>
                    </div>
                  </div>
                )}
            </div>
          </motion.div>
        )}

        {/* Queue List Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          <div className="p-4 border-b bg-gray-50">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-600" />
                Antrian Saat ini
              </h2>
              <div className="text-sm text-gray-500">
                {entries.filter((e) => e.status === "called").length > 0 && (
                  <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md text-xs font-medium">
                    Now Serving: #
                    {entries.find((e) => e.status === "called")?.number}
                  </span>
                )}
              </div>
            </div>
          </div>

          {waitingEntries.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <div className="flex flex-col items-center gap-3">
                <CheckCircle className="w-12 h-12 text-green-400" />
                <p>Belum ada antrian</p>
              </div>
            </div>
          ) : (
            <>
              <div className="divide-y">
                <AnimatePresence>
                  {displayEntries.map((entry, index) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`
                        p-4 flex items-center justify-between
                        ${entry.status === "called" ? "bg-amber-50" : ""}
                        ${
                          myEntry && entry.id === myEntry.id ? "bg-blue-50" : ""
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${getStatusColor(
                            entry.status
                          )}`}
                        >
                          {entry.number}
                        </div>
                        <span className="font-medium">{entry.name}</span>
                      </div>

                      <div>
                        {entry.status === "called" ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                            Now Serving
                          </span>
                        ) : myEntry && entry.id === myEntry.id ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            You
                          </span>
                        ) : null}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {hasMore && (
                <div className="p-3 border-t text-center">
                  <button
                    onClick={() => setShowAll(!showAll)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center gap-1"
                  >
                    {showAll ? (
                      <>
                        Show less <ChevronUp className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        Show all {waitingEntries.length}{" "}
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </motion.div>

        {/* Additional Information Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100 text-sm text-blue-800"
        >
            <p>
            Halaman ini secara otomatis diperbarui ketika antrian berubah. Tetap buka halaman ini untuk memantau status Anda.
            </p>
        </motion.div>
      </div>
    </div>
  );
}
