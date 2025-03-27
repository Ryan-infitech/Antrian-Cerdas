import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Users,
  UserCheck,
  UserX,
  RefreshCcw,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  Share2,
  Filter,
  ArrowLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { supabase } from "../lib/supabase";
import { DeleteAlert } from "../components/DeleteAlert";

interface QueueEntry {
  id: string;
  number: number;
  name: string;
  status: string;
  created_at: string;
}

interface QueueStats {
  waiting: number;
  called: number;
  completed: number;
  skipped: number;
  total: number;
}

export default function ManageQueue() {
  const { queueId } = useParams();
  const navigate = useNavigate();
  const [queueName, setQueueName] = useState("");
  const [entries, setEntries] = useState<QueueEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<QueueEntry[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [stats, setStats] = useState<QueueStats>({
    waiting: 0,
    called: 0,
    completed: 0,
    skipped: 0,
    total: 0,
  });
  const [qrVisible, setQrVisible] = useState(false);

  useEffect(() => {
    const fetchQueueDetails = async () => {
      try {
        const { data: queue, error: queueError } = await supabase
          .from("queues")
          .select("name")
          .eq("id", queueId)
          .single();

        if (queueError) throw queueError;
        setQueueName(queue.name);

        const { data: entries, error: entriesError } = await supabase
          .from("queue_entries")
          .select("*")
          .eq("queue_id", queueId)
          .order("number", { ascending: true });

        if (entriesError) throw entriesError;
        setEntries(entries);

        // Calculate statistics
        const stats = entries.reduce(
          (acc: QueueStats, entry) => {
            acc.total++;
            acc[entry.status as keyof Omit<QueueStats, "total">]++;
            return acc;
          },
          { waiting: 0, called: 0, completed: 0, skipped: 0, total: 0 }
        );

        setStats(stats);
      } catch (error) {
        toast.error("Failed to load queue details");
        navigate("/");
      }
    };

    fetchQueueDetails();

    // Improved real-time subscription setup
    const queueSubscription = supabase
      .channel("admin-queue-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "queue_entries",
          filter: `queue_id=eq.${queueId}`,
        },
        (payload) => {
          console.log("New queue entry:", payload);
          fetchQueueDetails();
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
        (payload) => {
          console.log("Updated queue entry:", payload);
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
        (payload) => {
          console.log("Deleted queue entry:", payload);
          fetchQueueDetails();
        }
      )
      .subscribe();

    // Also watch for updates to the queue itself
    const queueDetailsSubscription = supabase
      .channel("admin-queue-details")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "queues",
          filter: `id=eq.${queueId}`,
        },
        (payload) => {
          console.log("Queue details updated:", payload);
          fetchQueueDetails();
        }
      )
      .subscribe();

    return () => {
      queueSubscription.unsubscribe();
      queueDetailsSubscription.unsubscribe();
    };
  }, [queueId, navigate]);

  useEffect(() => {
    if (statusFilter === "all") {
      setFilteredEntries(entries);
    } else {
      setFilteredEntries(
        entries.filter((entry) => entry.status === statusFilter)
      );
    }
  }, [statusFilter, entries]);

  const updateEntryStatus = async (entryId: string, status: string) => {
    try {
      const { error } = await supabase
        .from("queue_entries")
        .update({ status })
        .eq("id", entryId);

      if (error) throw error;

      setEntries((prevEntries) =>
        prevEntries.map((entry) =>
          entry.id === entryId ? { ...entry, status } : entry
        )
      );
    } catch (error) {
      toast.error("Failed to update status");
      console.error(error);
    }
  };

  const deleteQueue = async () => {
    setIsLoading(true);
    try {
      // First delete all entries
      const { error: entriesError } = await supabase
        .from("queue_entries")
        .delete()
        .eq("queue_id", queueId);

      if (entriesError) throw entriesError;

      // Then delete the queue itself
      const { error: queueError } = await supabase
        .from("queues")
        .delete()
        .eq("id", queueId);

      if (queueError) throw queueError;

      toast.success("Queue deleted successfully");
      navigate("/");
    } catch (error) {
      toast.error("Failed to delete queue");
      console.error(error);
    } finally {
      setIsLoading(false);
      setShowDeleteDialog(false);
    }
  };

  const copyQueueLink = () => {
    const url = `${window.location.origin}/join/${queueId}`;
    navigator.clipboard.writeText(url);
    toast.success("Queue link copied to clipboard");
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

  const getStatusBg = (status: string) => {
    switch (status) {
      case "waiting":
        return "bg-blue-50 border-blue-200";
      case "called":
        return "bg-amber-50 border-amber-200";
      case "completed":
        return "bg-green-50 border-green-200";
      case "skipped":
        return "bg-gray-50 border-gray-200";
      default:
        return "bg-white";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "waiting":
        return <Clock className="w-4 h-4" />;
      case "called":
        return <RefreshCcw className="w-4 h-4" />;
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "skipped":
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with navigation */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <button
              onClick={() => navigate("/")}
              className="mr-4 text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">
              Queue Management
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden mb-6"
        >
          <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-1">{queueName}</h1>
                <p className="opacity-90">
                  Manage your queue and track customer progress
                </p>
              </div>
              <div className="flex space-x-2 mt-4 md:mt-0">
                <button
                  onClick={copyQueueLink}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share Queue</span>
                </button>
                <button
                  onClick={() => setShowDeleteDialog(true)}
                  className="bg-red-500/80 hover:bg-red-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                  disabled={isLoading}
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Queue</span>
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 border-t">
            <div className="p-4 md:p-6">
              <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">
                Total Customers
              </p>
              <div className="flex items-end">
                <span className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </span>
              </div>
            </div>
            <div className="p-4 md:p-6">
              <p className="text-sm text-gray-500 uppercase tracking-wider mb-1 flex items-center">
                <span className="w-2 h-2 rounded-full bg-blue-500 mr-1"></span>{" "}
                Waiting
              </p>
              <div className="flex items-end">
                <span className="text-2xl font-bold text-gray-900">
                  {stats.waiting}
                </span>
              </div>
            </div>
            <div className="p-4 md:p-6">
              <p className="text-sm text-gray-500 uppercase tracking-wider mb-1 flex items-center">
                <span className="w-2 h-2 rounded-full bg-amber-500 mr-1"></span>{" "}
                In Progress
              </p>
              <div className="flex items-end">
                <span className="text-2xl font-bold text-gray-900">
                  {stats.called}
                </span>
              </div>
            </div>
            <div className="p-4 md:p-6">
              <p className="text-sm text-gray-500 uppercase tracking-wider mb-1 flex items-center">
                <span className="w-2 h-2 rounded-full bg-green-500 mr-1"></span>{" "}
                Completed
              </p>
              <div className="flex items-end">
                <span className="text-2xl font-bold text-gray-900">
                  {stats.completed}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filter Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex justify-between items-center mb-4 bg-white p-4 rounded-lg shadow-sm"
        >
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" /> Filter
          </h2>
          <div className="flex space-x-1">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors 
              ${
                statusFilter === "all"
                  ? "bg-gray-200 text-gray-800"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter("waiting")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors 
              ${
                statusFilter === "waiting"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Waiting
            </button>
            <button
              onClick={() => setStatusFilter("called")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors 
              ${
                statusFilter === "called"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => setStatusFilter("completed")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors 
              ${
                statusFilter === "completed"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Completed
            </button>
          </div>
        </motion.div>

        {/* Queue List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          <div className="p-4 border-b bg-gray-50">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-600" />
                <span>Customer Queue</span>
              </h2>
              <span className="text-sm font-medium bg-gray-200 text-gray-800 px-3 py-1 rounded-full">
                {filteredEntries.length} shown
              </span>
            </div>
          </div>

          {filteredEntries.length === 0 ? (
            <div className="p-12 text-center text-gray-500 border-b">
              <div className="flex flex-col items-center gap-4">
                <Users className="w-16 h-16 text-gray-300" />
                {entries.length === 0 ? (
                  <p>No customers have joined the queue yet</p>
                ) : (
                  <p>No customers match the selected filter</p>
                )}
              </div>
            </div>
          ) : (
            <div className="divide-y">
              <AnimatePresence>
                {filteredEntries.map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.05 }}
                    className={`border-l-4 ${getStatusBg(entry.status)} ${
                      entry.status === "called"
                        ? "border-l-amber-500"
                        : entry.status === "completed"
                        ? "border-l-green-500"
                        : entry.status === "skipped"
                        ? "border-l-gray-500"
                        : "border-l-blue-500"
                    }`}
                  >
                    <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${getStatusColor(
                            entry.status
                          )}`}
                        >
                          {entry.number}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 text-lg">
                            {entry.name}
                          </h3>
                          <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {formatTime(entry.created_at)}
                            </span>
                            <span
                              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
                              ${
                                entry.status === "waiting"
                                  ? "bg-blue-100 text-blue-800"
                                  : entry.status === "called"
                                  ? "bg-amber-100 text-amber-800"
                                  : entry.status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {getStatusIcon(entry.status)}
                              <span className="capitalize">{entry.status}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 self-end sm:self-auto">
                        {entry.status === "waiting" && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() =>
                              updateEntryStatus(entry.id, "called")
                            }
                            className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors flex items-center gap-2"
                          >
                            <RefreshCcw className="w-4 h-4" />
                            <span>Call</span>
                          </motion.button>
                        )}
                        {entry.status === "called" && (
                          <>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() =>
                                updateEntryStatus(entry.id, "completed")
                              }
                              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors flex items-center gap-2"
                            >
                              <UserCheck className="w-4 h-4" />
                              <span>Complete</span>
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() =>
                                updateEntryStatus(entry.id, "skipped")
                              }
                              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors flex items-center gap-2"
                            >
                              <UserX className="w-4 h-4" />
                              <span>Skip</span>
                            </motion.button>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
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
