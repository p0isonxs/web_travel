import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import Seo from '../components/Seo';

export default function NotFound() {
  return (
    <>
      <Seo
        title="404 - Halaman Tidak Ditemukan"
        description="Halaman yang kamu cari tidak ada atau telah dipindahkan."
        noindex={true}
      />
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-8xl font-bold text-emerald-500 mb-4">404</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Halaman Tidak Ditemukan
          </h1>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            Maaf, halaman yang kamu cari tidak ada atau telah dipindahkan.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              <Home className="w-4 h-4" />
              Kembali ke Beranda
            </Link>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Halaman Sebelumnya
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
