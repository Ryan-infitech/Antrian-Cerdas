import React from "react";
import { Link } from "react-router-dom";
import { Users, PlusCircle, QrCode } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Pixel background elements */}
      <div className="pixel-grid absolute inset-0 opacity-20"></div>
      <div className="pixel-dots absolute inset-0 opacity-30"></div>

      {/* Pixel decorations */}
      <div className="absolute top-10 left-10 pixel-box w-16 h-16 bg-pink-500 opacity-40"></div>
      <div className="absolute bottom-10 right-10 pixel-box w-20 h-20 bg-yellow-400 opacity-40"></div>
      <div className="absolute top-1/4 right-20 pixel-box w-12 h-12 bg-green-400 opacity-40"></div>
      <div className="absolute bottom-1/4 left-20 pixel-box w-14 h-14 bg-blue-400 opacity-40"></div>

      <div className="max-w-4xl w-full relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-pixel text-white mb-6 pixel-shadow animate-pulse">
            Antrian Cerdas
          </h1>
          <p className="text-lg font-pixel text-blue-100 leading-relaxed">
            Ayo buat atau masuk dalam antrian dengan mudah dan cepat
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Link
            to="/create"
            className="pixel-card bg-white p-8 transition-all hover:translate-y-[-6px] group"
          >
            <div className="flex flex-col items-center text-center">
              <div className="pixel-icon bg-blue-500 p-5 mb-6 group-hover:bg-blue-600">
                <PlusCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-pixel text-gray-800 mb-4">
                Buat Antrian
              </h2>
              <p className="text-gray-600">
                Buat antrian baru dan kelola secara real-time
              </p>
            </div>
          </Link>

          <Link
            to="/join"
            className="pixel-card bg-white p-8 transition-all hover:translate-y-[-6px] group"
          >
            <div className="flex flex-col items-center text-center">
              <div className="pixel-icon bg-purple-500 p-5 mb-6 group-hover:bg-purple-600">
                <QrCode className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-pixel text-gray-800 mb-4">
                Masuk Antrian
              </h2>
              <p className="text-gray-600">
                Masuk dalam antrian dengan scan QR Code
              </p>
            </div>
          </Link>
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 text-white pixel-badge p-3">
            <Users className="w-5 h-5" />
            <span className="font-pixel">
              Antrian Lancar, Waktu Lebih Produktif 😁
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
