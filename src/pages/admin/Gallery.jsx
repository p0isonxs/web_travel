import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { uploadToCloudinary } from '../../utils/cloudinary';
import { Plus, Trash2, X, Upload, Image } from 'lucide-react';
import { toast } from 'react-toastify';

const categories = ['open trip', 'private trip', 'destinasi', 'kuliner'];

export default function AdminGallery() {
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ caption: '', category: 'destinasi', imageUrl: '' });
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState('');

  useEffect(() => { fetchPhotos(); }, []);

  const fetchPhotos = async () => {
        setLoading(true);
        const snap = await getDocs(query(collection(db, 'gallery'), orderBy('createdAt', 'desc')));
        setPhotos(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
  };

  const handleFile = (e) => {
        const f = e.target.files[0];
        if (f) { setFile(f); setPreview(URL.createObjectURL(f)); }
  };

  const handleSave = async (e) => {
        e.preventDefault();
        setUploading(true);
        try {
                let imageUrl = form.imageUrl;
                if (file) {
                          imageUrl = await uploadToCloudinary(file, 'gallery');
                }
                if (!imageUrl) { toast.error('Pilih foto atau masukkan URL foto'); setUploading(false); return; }
                await addDoc(collection(db, 'gallery'), { ...form, imageUrl, createdAt: serverTimestamp() });
                toast.success('Foto berhasil ditambahkan!');
                setShowForm(false);
                setForm({ caption: '', category: 'destinasi', imageUrl: '' });
                setFile(null); setPreview('');
                fetchPhotos();
        } catch (e) { toast.error('Gagal: ' + e.message); }
        setUploading(false);
  };

  const handleDelete = async (photo) => {
        if (!confirm('Hapus foto ini?')) return;
        try {
                await deleteDoc(doc(db, 'gallery', photo.id));
                toast.success('Foto dihapus');
                fetchPhotos();
        } catch { toast.error('Gagal menghapus foto'); }
  };

  const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500';

  return (
        <div className="space-y-6">
              <div className="flex items-center justify-between">
                      <div>
                                <h1 className="text-2xl font-bold text-gray-900">Galeri Foto</h1>
                                <p className="text-gray-500 text-sm">{photos.length} foto terdaftar</p>
                      </div>
                      <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-xl transition-colors">
                                <Plus className="w-5 h-5" /> Tambah Foto
                      </button>
              </div>
        
          {loading ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {[...Array(10)].map((_, i) => <div key={i} className="aspect-square bg-gray-200 rounded-xl animate-pulse" />)}
                  </div>
                ) : photos.length === 0 ? (
                  <div className="bg-white rounded-2xl p-16 text-center text-gray-400">
                            <Image className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                            <p>Belum ada foto. Tambahkan foto pertama!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {photos.map(photo => (
                                <div key={photo.id} className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 shadow-sm">
                                              <img src={photo.imageUrl} alt={photo.caption || ''} className="w-full h-full object-cover" loading="lazy" />
                                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-end p-3">
                                                              <div className="translate-y-full group-hover:translate-y-0 transition-transform w-full">
                                                                {photo.caption && <p className="text-white text-xs mb-2 line-clamp-2">{photo.caption}</p>}
                                                                                <div className="flex items-center justify-between">
                                                                                                    <span className="text-xs text-white/80 bg-black/30 px-2 py-0.5 rounded-full capitalize">{photo.category}</span>
                                                                                                    <button onClick={() => handleDelete(photo)} className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors">
                                                                                                                          <Trash2 className="w-4 h-4" />
                                                                                                      </button>
                                                                                </div>
                                                              </div>
                                              </div>
                                </div>
                              ))}
                  </div>
              )}
        
          {/* Form Modal */}
          {showForm && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
                                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                                                      <h2 className="text-xl font-bold">Tambah Foto</h2>
                                                      <button onClick={() => { setShowForm(false); setFile(null); setPreview(''); }}><X className="w-6 h-6 text-gray-400" /></button>
                                        </div>
                                        <form onSubmit={handleSave} className="p-6 space-y-4">
                                          {/* Upload or URL */}
                                                      <div>
                                                                      <label className="block text-sm font-medium text-gray-700 mb-2">Upload Foto atau Masukkan URL</label>
                                                                      <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center mb-3 hover:border-emerald-300 transition-colors cursor-pointer" onClick={() => document.getElementById('gallery-file').click()}>
                                                                        {preview ? (
                                        <img src={preview} alt="" className="max-h-40 mx-auto rounded-lg" />
                                      ) : (
                                        <div className="text-gray-400">
                                                              <Upload className="w-10 h-10 mx-auto mb-2" />
                                                              <p className="text-sm">Klik untuk upload foto</p>
                                        </div>
                                                                                        )}
                                                                      </div>
                                                                      <input id="gallery-file" type="file" accept="image/*" onChange={handleFile} className="hidden" />
                                                                      <p className="text-center text-xs text-gray-400 mb-2">— atau —</p>
                                                                      <input type="url" value={form.imageUrl} onChange={e => { setForm({...form, imageUrl: e.target.value}); setPreview(e.target.value); setFile(null); }} placeholder="https://... (URL foto)" className={inputClass} />
                                                      </div>
                                                      <div>
                                                                      <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan Foto</label>
                                                                      <input type="text" value={form.caption} onChange={e => setForm({...form, caption: e.target.value})} className={inputClass} placeholder="Contoh: Sunset di Labuan Bajo" />
                                                      </div>
                                                      <div>
                                                                      <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                                                                      <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className={inputClass}>
                                                                        {categories.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
                                                                      </select>
                                                      </div>
                                                      <div className="flex gap-3 pt-2">
                                                                      <button type="button" onClick={() => { setShowForm(false); setFile(null); setPreview(''); }} className="flex-1 border border-gray-300 text-gray-700 font-semibold py-2 rounded-xl hover:bg-gray-50">Batal</button>
                                                                      <button type="submit" disabled={uploading} className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold py-2 rounded-xl">
                                                                        {uploading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Upload className="w-5 h-5" />}
                                                                        {uploading ? 'Mengupload...' : 'Simpan Foto'}
                                                                      </button>
                                                      </div>
                                        </form>
                            </div>
                  </div>
              )}
        </div>
      );
}</div>
