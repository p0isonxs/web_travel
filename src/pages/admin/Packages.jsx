import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { uploadMultiple } from '../../utils/cloudinary';
import { Plus, Edit2, Trash2, X, Save, Eye, EyeOff, Search, Upload } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';

const emptyForm = {
    title: '', type: 'open-trip', location: '', duration: '', price: '', originalPrice: '',
    description: '', itinerary: '', include: '', exclude: '', maxParticipants: 15,
    departureDates: '', images: [], active: true, featured: false,
};

const FIRESTORE_TIMEOUT_MS = 15000;

function withTimeout(promise, message, ms = FIRESTORE_TIMEOUT_MS) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(message)), ms);
    }),
  ]);
}

function splitList(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value !== 'string') return [];
  return value
    .split(/\r?\n|,/)
    .map(item => item.trim())
    .filter(Boolean);
}

function cleanTimeLabel(value) {
  if (typeof value !== 'string') return '';
  return value
    .replace(/\s*[–—]\s*/g, ' - ')
    .replace(/\s*-\s*/g, ' - ')
    .replace(/:\s*$/, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function parseItineraryLine(line, index) {
  const trimmed = line.trim();
  if (!trimmed) return null;

  const timeRangeMatch = trimmed.match(/^(\d{1,2}[:.]\d{2}\s*[-–]\s*(?:\d{1,2}[:.]\d{2}|[A-Za-zÀ-ÿ]+))(?:\s*[:|\-]\s*|\s+)(.+)$/);
  if (timeRangeMatch) {
    return {
      time: cleanTimeLabel(timeRangeMatch[1]),
      activity: timeRangeMatch[2].trim(),
    };
  }

  const labelMatch = trimmed.match(/^([^:]+):\s+(.+)$/);
  if (labelMatch) {
    return {
      time: cleanTimeLabel(labelMatch[1]),
      activity: labelMatch[2].trim(),
    };
  }

  return {
    time: `Kegiatan ${index + 1}`,
    activity: trimmed,
  };
}

function parseItinerary(value) {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string') return [];

  return value
    .split(/\r?\n/)
    .map(parseItineraryLine)
    .filter(Boolean);
}

function formatListForTextarea(value) {
  if (Array.isArray(value)) return value.filter(Boolean).join('\n');
  return value || '';
}

function normalizeDepartureDates(value) {
  const dates = Array.isArray(value) ? value : splitList(value);
  return [...new Set(
    dates
      .map(item => typeof item === 'string' ? item.trim() : '')
      .filter(Boolean)
  )].sort();
}

function formatItineraryForTextarea(value) {
  if (!Array.isArray(value)) return value || '';
  return value
    .map((item) => {
      if (typeof item === 'string') return item;
      const time = cleanTimeLabel(item?.time || '');
      const activity = item?.activity || item?.title || '';
      return time ? `${time}: ${activity}` : activity;
    })
    .filter(Boolean)
    .join('\n');
}

export default function AdminPackages() {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('semua');
    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [saveStatus, setSaveStatus] = useState('');
    const { currentUser } = useAuth();

  useEffect(() => { fetchPackages(); }, []);

  const fetchPackages = async () => {
        setLoading(true);
        const snap = await getDocs(query(collection(db, 'packages'), orderBy('createdAt', 'desc')));
        setPackages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
  };

  const openCreate = () => { setForm(emptyForm); setEditId(null); setImageFiles([]); setImagePreviews([]); setSaveStatus(''); setShowForm(true); };
    const openEdit = (pkg) => { setForm({ ...emptyForm, ...pkg, images: pkg.images || [], itinerary: formatItineraryForTextarea(pkg.itinerary), include: formatListForTextarea(pkg.includes ?? pkg.include), exclude: formatListForTextarea(pkg.excludes ?? pkg.exclude), departureDates: formatListForTextarea(pkg.departureDates) }); setEditId(pkg.id); setImageFiles([]); setImagePreviews([]); setSaveStatus(''); setShowForm(true); };
    const closeForm = () => { setShowForm(false); setEditId(null); setForm(emptyForm); setImageFiles([]); setImagePreviews([]); setSaveStatus(''); };

  const handleImageFiles = (e) => {
        const files = Array.from(e.target.files);
        setImageFiles(files);
        setImagePreviews(files.map(f => URL.createObjectURL(f)));
  };

  const handleSave = async (e) => {
        e.preventDefault();

        if (!db) {
                toast.error('Firestore belum dikonfigurasi.');
                return;
        }

        if (!currentUser) {
                toast.error('Sesi admin tidak aktif. Silakan login ulang.');
                return;
        }

        setSaving(true);
        setSaveStatus('Menyiapkan data paket...');
        try {
                // Upload new image files if any
                let images = form.images || [];
                if (imageFiles.length > 0) {
                          const uploads = await uploadMultiple(imageFiles, 'packages', ({ current, total, fileName }) => {
                                    setSaveStatus(`Mengunggah foto ${current}/${total}: ${fileName}`);
                          });
                          images = [...images, ...uploads];
                }
                setSaveStatus('Menyimpan data paket ke database...');
                const data = {
                          ...form,
                          images,
                          image: images[0] || '',
                          itinerary: parseItinerary(form.itinerary),
                          includes: splitList(form.include),
                          excludes: splitList(form.exclude),
                          departureDates: form.type === 'open-trip' ? normalizeDepartureDates(form.departureDates) : [],
                          price: Number(form.price),
                          originalPrice: Number(form.originalPrice) || null,
                          maxParticipants: Number(form.maxParticipants),
                          updatedAt: serverTimestamp(),
                };
                if (editId) {
                          await withTimeout(
                                    updateDoc(doc(db, 'packages', editId), data),
                                    'Koneksi ke Firestore timeout saat memperbarui paket. Coba login ulang lalu simpan lagi.'
                          );
                          toast.success('Paket berhasil diperbarui!');
                } else {
                          await withTimeout(
                                    addDoc(collection(db, 'packages'), { ...data, createdAt: serverTimestamp() }),
                                    'Koneksi ke Firestore timeout saat menyimpan paket. Coba login ulang lalu simpan lagi.'
                          );
                          toast.success('Paket berhasil ditambahkan!');
                }
                closeForm();
                fetchPackages();
        } catch (e) {
                toast.error('Gagal menyimpan: ' + e.message);
                setSaveStatus('');
        }
        setSaving(false);
  };

  const handleDelete = async (id, title) => {
        if (!confirm(`Hapus paket "${title}"? Tindakan ini tidak bisa dibatalkan.`)) return;
        try {
                await deleteDoc(doc(db, 'packages', id));
                toast.success('Paket berhasil dihapus');
                fetchPackages();
        } catch {
                toast.error('Gagal menghapus paket');
        }
  };

  const toggleActive = async (id, current) => {
        await updateDoc(doc(db, 'packages', id), { active: !current });
        fetchPackages();
  };

  const formatPrice = (p) => p ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(p) : '-';

  const filtered = packages.filter(p => {
        const matchType = filterType === 'semua' || p.type === filterType;
        const matchSearch = p.title?.toLowerCase().includes(search.toLowerCase()) || p.location?.toLowerCase().includes(search.toLowerCase());
        return matchType && matchSearch;
  });

  const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500';
    const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

  return (
        <div className="space-y-6">
              <div className="flex items-center justify-between">
                      <div>
                                <h1 className="text-2xl font-bold text-gray-900">Paket Wisata</h1>
                                <p className="text-gray-500 text-sm">{packages.length} paket terdaftar</p>
                      </div>
                      <button onClick={openCreate} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-xl transition-colors">
                                <Plus className="w-5 h-5" /> Tambah Paket
                      </button>
              </div>
        
          {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                      <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari paket..." className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                      </div>
                      <select value={filterType} onChange={e => setFilterType(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                                <option value="semua">Semua Tipe</option>
                                <option value="open-trip">Open Trip</option>
                                <option value="private-trip">Private Trip</option>
                      </select>
              </div>
        
          {/* Table */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-400">Memuat data...</div>
                  ) : filtered.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">Tidak ada paket ditemukan</div>
                  ) : (
                    <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                              <thead className="bg-gray-50 border-b border-gray-100">
                                                              <tr>
                                                                                <th className="text-left px-4 py-3 font-semibold text-gray-700">Paket</th>
                                                                                <th className="text-left px-4 py-3 font-semibold text-gray-700">Tipe</th>
                                                                                <th className="text-left px-4 py-3 font-semibold text-gray-700">Lokasi</th>
                                                                                <th className="text-left px-4 py-3 font-semibold text-gray-700">Harga</th>
                                                                                <th className="text-left px-4 py-3 font-semibold text-gray-700">Status</th>
                                                                                <th className="text-left px-4 py-3 font-semibold text-gray-700">Aksi</th>
                                                              </tr>
                                              </thead>
                                              <tbody className="divide-y divide-gray-50">
                                                {filtered.map(pkg => (
                                        <tr key={pkg.id} className="hover:bg-gray-50 transition-colors">
                                                            <td className="px-4 py-3">
                                                                                  <div className="flex items-center gap-3">
                                                                                    {pkg.images?.[0] && <img src={pkg.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover" />}
                                                                                                          <span className="font-medium text-gray-900 line-clamp-1">{pkg.title}</span>
                                                                                    </div>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${pkg.type === 'open-trip' ? 'bg-emerald-100 text-emerald-700' : 'bg-purple-100 text-purple-700'}`}>
                                                                                    {pkg.type}
                                                                                    </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-gray-600">{pkg.location || '-'}</td>
                                                            <td className="px-4 py-3 text-emerald-600 font-semibold">{formatPrice(pkg.price)}</td>
                                                            <td className="px-4 py-3">
                                                                                  <button onClick={() => toggleActive(pkg.id, pkg.active)} className={`text-xs font-semibold px-2 py-1 rounded-full ${pkg.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                                                    {pkg.active ? 'Aktif' : 'Nonaktif'}
                                                                                    </button>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                                  <div className="flex items-center gap-2">
                                                                                                          <button onClick={() => openEdit(pkg)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                                                                                                          <button onClick={() => handleDelete(pkg.id, pkg.title)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                                                                                    </div>
                                                            </td>
                                        </tr>
                                      ))}
                                              </tbody>
                                </table>
                    </div>
                      )}
              </div>
        
          {/* Modal Form */}
          {showForm && (
                  <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 py-8 px-4">
                            <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl">
                                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                                                      <h2 className="text-xl font-bold text-gray-900">{editId ? 'Edit Paket' : 'Tambah Paket Baru'}</h2>
                                                      <button onClick={closeForm} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
                                        </div>
                                        <form onSubmit={handleSave} className="p-6 space-y-5">
                                                      <div className="grid grid-cols-2 gap-4">
                                                                      <div className="col-span-2">
                                                                                        <label className={labelClass}>Judul Paket *</label>
                                                                                        <input type="text" required value={form.title} onChange={e => setForm({...form, title: e.target.value})} className={inputClass} placeholder="Contoh: Open Trip Labuan Bajo 3D2N" />
                                                                      </div>
                                                                      <div>
                                                                                        <label className={labelClass}>Tipe Paket *</label>
                                                                                        <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className={inputClass}>
                                                                                                            <option value="open-trip">Open Trip</option>
                                                                                                            <option value="private-trip">Private Trip</option>
                                                                                          </select>
                                                                      </div>
                                                                      <div>
                                                                                        <label className={labelClass}>Lokasi *</label>
                                                                                        <input type="text" required value={form.location} onChange={e => setForm({...form, location: e.target.value})} className={inputClass} placeholder="Labuan Bajo, NTT" />
                                                                      </div>
                                                                      <div>
                                                                                        <label className={labelClass}>Durasi</label>
                                                                                        <input type="text" value={form.duration} onChange={e => setForm({...form, duration: e.target.value})} className={inputClass} placeholder="3D2N" />
                                                                      </div>
                                                                      <div>
                                                                                        <label className={labelClass}>Max Peserta</label>
                                                                                        <input type="number" value={form.maxParticipants} onChange={e => setForm({...form, maxParticipants: e.target.value})} className={inputClass} min="1" />
                                                                      </div>
                                                                      <div>
                                                                                        <label className={labelClass}>Harga (Rp) *</label>
                                                                                        <input type="number" required value={form.price} onChange={e => setForm({...form, price: e.target.value})} className={inputClass} placeholder="1500000" />
                                                                      </div>
                                                                      <div>
                                                                                        <label className={labelClass}>Harga Coret (Rp)</label>
                                                                                        <input type="number" value={form.originalPrice} onChange={e => setForm({...form, originalPrice: e.target.value})} className={inputClass} placeholder="2000000" />
                                                                      </div>
                                                                      <div className="col-span-2">
                                                                                        <label className={labelClass}>Foto Paket</label>
                                                                                        <div className="space-y-2">
                                                                                          <div className="flex items-center gap-2">
                                                                                            <label className="flex items-center gap-2 cursor-pointer bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                                                                                              <Upload className="w-4 h-4" />
                                                                                              Upload Foto
                                                                                              <input type="file" multiple accept="image/*" onChange={handleImageFiles} className="hidden" />
                                                                                            </label>
                                                                                            {imageFiles.length > 0 && <span className="text-xs text-gray-500">{imageFiles.length} file dipilih</span>}
                                                                                          </div>
                                                                                          {imagePreviews.length > 0 && (
                                                                                            <div className="flex gap-2 flex-wrap">
                                                                                              {imagePreviews.map((p, i) => (
                                                                                                <img key={i} src={p} alt="" className="w-16 h-16 object-cover rounded-lg border" />
                                                                                              ))}
                                                                                            </div>
                                                                                          )}
                                                                                          {form.images?.length > 0 && (
                                                                                            <div>
                                                                                              <p className="text-xs text-gray-500 mb-1">Foto tersimpan ({form.images.length}):</p>
                                                                                              <div className="flex gap-2 flex-wrap">
                                                                                                {form.images.map((url, i) => (
                                                                                                  <div key={i} className="relative">
                                                                                                    <img src={url} alt="" className="w-16 h-16 object-cover rounded-lg border" />
                                                                                                    <button type="button" onClick={() => setForm({...form, images: form.images.filter((_, idx) => idx !== i)})}
                                                                                                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">×</button>
                                                                                                  </div>
                                                                                                ))}
                                                                                              </div>
                                                                                            </div>
                                                                                          )}
                                                                                          <input type="url" value={''} onChange={e => { if(e.target.value) setForm({...form, images: [...(form.images||[]), e.target.value]}); e.target.value=''; }} className={inputClass} placeholder="Atau tambah via URL (tekan Enter)" onKeyDown={e => { if(e.key==='Enter'){e.preventDefault(); if(e.target.value) { setForm({...form, images: [...(form.images||[]), e.target.value]}); e.target.value=''; }}}} />
                                                                                        </div>
                                                                      </div>
                                                                      <div className="col-span-2">
                                                                                        <label className={labelClass}>Deskripsi</label>
                                                                                        <textarea rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} className={inputClass} placeholder="Deskripsi paket wisata..." />
                                                                      </div>
                                                                      <div className="col-span-2">
                                                                                        <label className={labelClass}>Itinerary (format: Hari 1: ..., Hari 2: ...)</label>
                                                                                        <textarea rows={4} value={form.itinerary} onChange={e => setForm({...form, itinerary: e.target.value})} className={inputClass} />
                                                                      </div>
                                                                      {form.type === 'open-trip' && (
                                                                        <div className="col-span-2">
                                                                                          <label className={labelClass}>Jadwal Keberangkatan Open Trip</label>
                                                                                          <textarea
                                                                                            rows={3}
                                                                                            value={form.departureDates}
                                                                                            onChange={e => setForm({...form, departureDates: e.target.value})}
                                                                                            className={inputClass}
                                                                                            placeholder={`Satu tanggal per baris, contoh:\n2026-05-10\n2026-05-24\n2026-06-07`}
                                                                                          />
                                                                                          <p className="mt-1 text-xs text-gray-500">Tanggal ini yang bisa dipilih user saat memesan open trip.</p>
                                                                        </div>
                                                                      )}
                                                                      <div>
                                                                                        <label className={labelClass}>Include (pisahkan dengan koma)</label>
                                                                                        <textarea rows={3} value={form.include} onChange={e => setForm({...form, include: e.target.value})} className={inputClass} placeholder="Tiket masuk, Penginapan, Makan..." />
                                                                      </div>
                                                                      <div>
                                                                                        <label className={labelClass}>Exclude (pisahkan dengan koma)</label>
                                                                                        <textarea rows={3} value={form.exclude} onChange={e => setForm({...form, exclude: e.target.value})} className={inputClass} placeholder="Tiket pesawat, Tips guide..." />
                                                                      </div>
                                                                      <div className="flex items-center gap-6">
                                                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                                                                            <input type="checkbox" checked={form.active} onChange={e => setForm({...form, active: e.target.checked})} className="w-4 h-4 text-emerald-600 rounded" />
                                                                                                            <span className="text-sm font-medium text-gray-700">Aktif (tampil di website)</span>
                                                                                          </label>
                                                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                                                                            <input type="checkbox" checked={form.featured} onChange={e => setForm({...form, featured: e.target.checked})} className="w-4 h-4 text-emerald-600 rounded" />
                                                                                                            <span className="text-sm font-medium text-gray-700">Featured</span>
                                                                                          </label>
                                                                      </div>
                                                      </div>
                                        
                                                      <div className="flex gap-3 pt-4 border-t border-gray-100">
                                                                      <button type="button" onClick={closeForm} className="flex-1 border border-gray-300 text-gray-700 font-semibold py-2 rounded-xl hover:bg-gray-50 transition-colors">Batal</button>
                                                                      <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold py-2 rounded-xl transition-colors">
                                                                        {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
                                                                        {saving ? 'Menyimpan...' : 'Simpan Paket'}
                                                                      </button>
                                                      </div>
                                                      {saving && saveStatus && (
                                                        <p className="text-sm text-gray-500">{saveStatus}</p>
                                                      )}
                                        </form>
                            </div>
                  </div>
              )}
        </div>
      );
}
