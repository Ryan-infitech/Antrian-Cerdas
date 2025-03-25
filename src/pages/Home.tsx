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
            className="pixel-card bg-white p-8 transition-all group animate-bounce-card relative"
          >
            <div className="absolute inset-0 bg-blue-500 opacity-0 group-hover:opacity-10 transition-opacity"></div>
            <div className="flex flex-col items-center text-center">
              <div className="pixel-icon bg-blue-500 p-5 mb-6 group-hover:bg-blue-600 pixel-bounce">
                <PlusCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-pixel text-gray-800 mb-4">
                Buat Antrian
              </h2>
              <p className="text-gray-600">
                Buat antrian baru dan kelola secara real-time
              </p>
              <div className="pixel-btn mt-4 group-hover:animate-pixel-glitch">
                Mulai
              </div>
            </div>
          </Link>

          <Link
            to="/join"
            className="pixel-card bg-white p-8 transition-all group animate-bounce-card-delayed relative"
          >
            <div className="absolute inset-0 bg-purple-500 opacity-0 group-hover:opacity-10 transition-opacity"></div>
            <div className="flex flex-col items-center text-center">
              <div className="pixel-icon bg-purple-500 p-5 mb-6 group-hover:bg-purple-600 pixel-bounce">
                <QrCode className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-pixel text-gray-800 mb-4">
                Masuk Antrian
              </h2>
              <p className="text-gray-600">
                Masuk dalam antrian dengan scan QR Code
              </p>
              <div className="pixel-btn mt-4 group-hover:animate-pixel-glitch">
                Scan QR
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
