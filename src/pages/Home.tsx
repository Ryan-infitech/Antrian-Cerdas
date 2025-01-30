import React from 'react';
import { Link } from 'react-router-dom';
import { Users, PlusCircle, QrCode } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
           Antrian Cerdas
          </h1>
          <p className="text-lg text-gray-600">
            Ayo buat atau masuk dalam antrian dengan mudah dan cepat
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Link
            to="/create"
            className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow group"
          >
            <div className="flex flex-col items-center text-center">
              <div className="bg-blue-100 p-4 rounded-full mb-6 group-hover:bg-blue-200 transition-colors">
                <PlusCircle className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Buat Antrian
              </h2>
                <p className="text-gray-600">
                Buat antrian baru dan kelola secara real-time
                </p>
            </div>
          </Link>

          <Link
            to="/join"
            className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow group"
          >
            <div className="flex flex-col items-center text-center">
              <div className="bg-indigo-100 p-4 rounded-full mb-6 group-hover:bg-indigo-200 transition-colors">
                <QrCode className="w-8 h-8 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Masuk Antrian
              </h2>
              <p className="text-gray-600">
                Masuk dalam antrian dengan scan QR Code
              </p>
            </div>
          </Link>
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 text-gray-600">
            <Users className="w-5 h-5" />
            <span>Antrian Lancar, Waktu Lebih Produktif 😁</span>
          </div>
        </div>
      </div>
    </div>
  );
}