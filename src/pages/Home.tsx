import React from "react";
import { Link } from "react-router-dom";
import { Users, PlusCircle, QrCode, Zap, Star } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Pixel background elements */}
      <div className="pixel-grid absolute inset-0 opacity-20"></div>
      <div className="pixel-dots absolute inset-0 opacity-30"></div>

      {/* Additional animated pixel decorations */}
      <div className="absolute top-0 left-0 w-full h-full">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className={`absolute pixel-float-${
              (i % 4) + 1
            } pixel-star opacity-60`}
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 20 + 10}px`,
              height: `${Math.random() * 20 + 10}px`,
              backgroundColor: [
                "#FF5E5B",
                "#D8D8F6",
                "#00CECB",
                "#FFED66",
                "#8A4FFF",
              ][Math.floor(Math.random() * 5)],
            }}
          />
        ))}
      </div>

      {/* Existing pixel decorations */}
      <div className="absolute top-10 left-10 pixel-box w-16 h-16 bg-pink-500 opacity-40 animate-pixel-rotate"></div>
      <div className="absolute bottom-10 right-10 pixel-box w-20 h-20 bg-yellow-400 opacity-40 animate-pixel-rotate"></div>
      <div className="absolute top-1/4 right-20 pixel-box w-12 h-12 bg-green-400 opacity-40 animate-pixel-rotate"></div>
      <div className="absolute bottom-1/4 left-20 pixel-box w-14 h-14 bg-blue-400 opacity-40 animate-pixel-rotate"></div>

      {/* New pixel elements */}
      <div className="absolute top-20 right-32 pixel-circle w-10 h-10 bg-purple-300 opacity-50 animate-pulse"></div>
      <div className="absolute bottom-32 left-64 pixel-triangle w-12 h-12 bg-green-300 opacity-40 animate-bounce-slow"></div>

      <div className="max-w-4xl w-full relative z-10">
        <div className="text-center mb-12">
          <div className="pixel-glow mb-2">
            <Star className="inline-block w-6 h-6 text-yellow-300 animate-spin-slow" />
            <Zap className="inline-block w-6 h-6 text-blue-300 animate-pulse" />
          </div>
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
            className="pixel-card bg-white p-8 transition-all group animate-bounce-card relative overflow-hidden"
          >
            {/* Card Background Pattern */}
            <div className="absolute inset-0 pixel-grid-small opacity-10"></div>

            {/* Animated corner accents */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 animate-pulse-slow"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 animate-pulse-slow delay-150"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 animate-pulse-slow delay-300"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 animate-pulse-slow delay-450"></div>

            {/* Mini pixel elements */}
            <div className="absolute top-1/4 left-6 w-3 h-3 bg-blue-200 pixel-box opacity-40 animate-ping"></div>
            <div className="absolute bottom-1/3 right-8 w-4 h-4 bg-blue-300 pixel-circle opacity-50 animate-ping delay-700"></div>
            <div className="absolute bottom-10 left-10 w-2 h-2 bg-blue-400 pixel-star opacity-60 animate-spin-slow"></div>

            {/* Hover effect background */}
            <div className="absolute inset-0 bg-blue-500 opacity-0 group-hover:opacity-10 transition-opacity"></div>

            <div className="flex flex-col items-center text-center relative z-10">
              <div className="pixel-icon bg-blue-500 p-5 mb-6 group-hover:bg-blue-600 pixel-bounce">
                <PlusCircle className="w-8 h-8 text-white" />
                {/* Trail effect */}
                <div className="absolute inset-0 bg-blue-300 opacity-60 scale-90 blur-sm animate-ping"></div>
              </div>
              <h2 className="text-2xl font-pixel text-gray-800 mb-4">
                Buat Antrian
              </h2>
              <p className="text-gray-600 relative">
                Buat antrian baru dan kelola secara real-time
                <span className="inline-block animate-bounce-slow absolute -right-4 -top-2 text-xs">
                  ✨
                </span>
              </p>
              <div className="pixel-btn mt-4 group-hover:animate-pixel-glitch">
                Mulai
                <div className="absolute inset-x-0 -bottom-1 h-1 bg-black animate-pulse-slow"></div>
              </div>
            </div>
          </Link>

          <Link
            to="/join"
            className="pixel-card bg-white p-8 transition-all group animate-bounce-card-delayed relative overflow-hidden"
          >
            {/* Card Background Pattern */}
            <div className="absolute inset-0 pixel-grid-small opacity-10"></div>

            {/* Animated corner accents */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-purple-500 animate-pulse-slow"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-purple-500 animate-pulse-slow delay-150"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-purple-500 animate-pulse-slow delay-300"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-purple-500 animate-pulse-slow delay-450"></div>

            {/* Mini pixel elements */}
            <div className="absolute top-1/3 right-6 w-3 h-3 bg-purple-200 pixel-box opacity-40 animate-ping"></div>
            <div className="absolute bottom-1/4 left-8 w-4 h-4 bg-purple-300 pixel-circle opacity-50 animate-ping delay-700"></div>
            <div className="absolute top-10 right-10 w-2 h-2 bg-purple-400 pixel-triangle opacity-60 animate-spin-slow"></div>

            {/* Hover effect background */}
            <div className="absolute inset-0 bg-purple-500 opacity-0 group-hover:opacity-10 transition-opacity"></div>

            <div className="flex flex-col items-center text-center relative z-10">
              <div className="pixel-icon bg-purple-500 p-5 mb-6 group-hover:bg-purple-600 pixel-bounce">
                <QrCode className="w-8 h-8 text-white" />
                {/* Trail effect */}
                <div className="absolute inset-0 bg-purple-300 opacity-60 scale-90 blur-sm animate-ping"></div>
              </div>
              <h2 className="text-2xl font-pixel text-gray-800 mb-4">
                Masuk Antrian
              </h2>
              <p className="text-gray-600 relative">
                Masuk dalam antrian dengan scan QR Code
                <span className="inline-block animate-bounce-slow absolute -right-4 -top-2 text-xs">
                  🔍
                </span>
              </p>
              <div className="pixel-btn mt-4 group-hover:animate-pixel-glitch">
                Scan QR
                <div className="absolute inset-x-0 -bottom-1 h-1 bg-black animate-pulse-slow"></div>
              </div>
            </div>
          </Link>
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 text-white pixel-badge p-3 animate-pulse-slow">
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
