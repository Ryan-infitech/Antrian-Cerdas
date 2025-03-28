import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ClipboardCheck,
  Loader2,
  Mail,
  Lock,
  UserPlus,
  LogIn,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import toast from "react-hot-toast";
import { supabase } from "../lib/supabase";
import SEO from "../components/SEO";

type AuthMode = "login" | "register" | "verify";

export default function CreateQueue() {
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [queueName, setQueueName] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [queueId, setQueueId] = useState<string | null>(null);
  const navigate = useNavigate();

  // Check authentication status on component mount
  React.useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setIsAuthenticated(true);
      }
    };
    checkAuth();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (authMode === "register") {
        const {
          data: { user },
          error,
        } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/create`,
          },
        });

        if (error) throw error;
        if (user) {
          toast.success("Registrasi berhasil! Silakan verifikasi email Anda.");
          setAuthMode("verify");
          setPassword(""); // Clear password after registration
        }
      } else {
        const {
          data: { user },
          error,
        } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        if (user) {
          toast.success("Login successful!");
          setIsAuthenticated(true);
        }
      }
    } catch (error: any) {
      console.error("Authentication error:", error);
      toast.error(
        error.message ||
          (authMode === "register" ? "Registration failed" : "Login failed")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQueue = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) throw new Error("User not authenticated");

      const { data, error: insertError } = await supabase
        .from("queues")
        .insert([
          {
            name: queueName,
            created_by: user.id,
            is_active: true,
            current_number: 0,
          },
        ])
        .select()
        .single();

      if (insertError) {
        console.error("Insert error:", insertError);
        throw new Error(insertError.message);
      }

      if (!data?.id) {
        throw new Error("Queue created but no ID returned");
      }

      setQueueId(data.id);
      toast.success("Antrian berhasil dibuat!");
    } catch (error: any) {
      console.error("Error creating queue:", error);
      toast.error(error.message || "Failed to create queue");
    } finally {
      setLoading(false);
    }
  };

  const handleManageQueue = () => {
    if (queueId) {
      navigate(`/manage/${queueId}`);
    }
  };

  const joinUrl = queueId ? `${window.location.origin}/join/${queueId}` : "";

  const renderVerificationMessage = () => (
    <div className="space-y-6 text-center">
      <div className="bg-blue-50 p-6 rounded-lg">
        <Mail className="w-12 h-12 text-blue-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Verifikasi Email Anda</h2>
        <p className="text-gray-600 mb-4">
          Kami telah mengirim email verifikasi ke <strong>{email}</strong>.
          Silakan periksa inbox Anda dan klik link verifikasi untuk mengaktifkan
          akun Anda.
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Tidak menerima email? Periksa folder spam Anda atau hubungi support.
        </p>
      </div>

      <button
        onClick={() => setAuthMode("login")}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
      >
        <LogIn className="w-5 h-5" />
        Kembali ke Login
      </button>
    </div>
  );

  const renderAuthForm = () => (
    <form onSubmit={handleAuth} className="space-y-6">
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Email
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your email"
            required
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your password"
            required
            minLength={6}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : authMode === "register" ? (
          <>
            <UserPlus className="w-5 h-5" />
            Register
          </>
        ) : (
          <>
            <LogIn className="w-5 h-5" />
            Login
          </>
        )}
      </button>

      <div className="text-center">
        <button
          type="button"
          onClick={() =>
            setAuthMode(authMode === "login" ? "register" : "login")
          }
          className="text-blue-600 hover:text-blue-700 text-sm"
        >
          {authMode === "login"
            ? "Don't have an account? Register"
            : "Already have an account? Login"}
        </button>
      </div>
    </form>
  );

  const renderQueueForm = () => (
    <form onSubmit={handleCreateQueue} className="space-y-6">
      <div>
        <label
          htmlFor="queueName"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Nama Antrian
        </label>
        <input
          type="text"
          id="queueName"
          value={queueName}
          onChange={(e) => setQueueName(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Masukkan Nama Antrian"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit"}
      </button>
    </form>
  );

  const renderQueueCreated = () => (
    <div className="space-y-6">
      <div className="flex flex-col items-center">
        <QRCodeSVG value={joinUrl} size={200} className="mb-4" />
        <p className="text-sm text-gray-600 text-center mb-4">
          Share QR Code Ini Agar Orang-Orang Bisa Scan Dan Masuk Antrian
        </p>
      </div>

      <div className="space-y-4">
        <button
          onClick={() => {
            navigator.clipboard.writeText(joinUrl);
            toast.success("Link copied to clipboard!");
          }}
          className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <ClipboardCheck className="w-5 h-5" />
          Copy link antrian
        </button>

        <button
          onClick={handleManageQueue}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Dasboard Antrian
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <SEO
        title="Buat Antrian Baru | Antrian Cerdas"
        description="Buat antrian baru dan kelola secara realtime. Dapatkan QR code untuk dibagikan kepada pelanggan anda."
        keywords="buat antrian, create queue, qr code antrian, antrian digital"
        url="https://buatantrian.web.id/create"
      />

      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          {!isAuthenticated
            ? authMode === "verify"
              ? "Email Verification"
              : authMode === "login"
              ? "Login"
              : "Register"
            : !queueId
            ? "Buat Antrian"
            : "Antrian Dibuat"}
        </h1>

        {!isAuthenticated &&
          (authMode === "verify"
            ? renderVerificationMessage()
            : renderAuthForm())}
        {isAuthenticated && !queueId && renderQueueForm()}
        {queueId && renderQueueCreated()}
      </div>
    </div>
  );
}
