import { useState, useEffect } from 'react';
import { getPackages, addPackage, updatePackage, deletePackage } from '../../lib/database';
import { generateSlug } from '../../utils/slug';
import { uploadMultiple } from '../../utils/cloudinary';
import { Plus, Edit2, Trash2, X, Save, Eye, EyeOff, Search, Upload, CheckSquare, Square, Zap, HelpCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import SerpPreview from '../../components/admin/SerpPreview';
import { getPackageImageAlt } from '../../utils/imageAlt';

const FAQ_TEMPLATE = {
  'open-trip': [
    { q: 'Apakah bisa ikut sendiri (solo traveler)?', a: 'Tentu bisa! Open trip memang dirancang untuk peserta dari berbagai kalangan, termasuk solo traveler. Kamu akan bergabung dengan peserta lain dalam satu rombongan.' },
    { q: 'Berapa minimal peserta agar trip bisa berjalan?', a: 'Trip akan berjalan jika kuota minimum terpenuhi. Admin akan menginformasikan melalui WhatsApp jika ada perubahan jadwal.' },
    { q: 'Bagaimana cara pembayaran?', a: 'Pembayaran dilakukan via transfer bank. Kamu bisa melakukan booking online dan upload bukti transfer langsung di website.' },
    { q: 'Apakah bisa refund jika membatalkan?', a: 'Kebijakan refund tergantung pada waktu pembatalan. Hubungi admin via WhatsApp untuk informasi lebih lanjut mengenai kebijakan pembatalan.' },
    { q: 'Apa yang perlu dibawa?', a: 'Pastikan membawa pakaian yang sesuai dengan destinasi, obat pribadi, dokumen identitas, dan perlengkapan pribadi lainnya. Detail akan dikirimkan setelah booking dikonfirmasi.' },
    { q: 'Apakah ada pemandu wisata?', a: 'Ya, setiap trip didampingi oleh pemandu wisata berpengalaman yang akan memastikan perjalananmu aman dan menyenangkan.' },
  ],
  'private-trip': [
    { q: 'Apakah rute perjalanan bisa disesuaikan?', a: 'Ya, private trip bisa disesuaikan sepenuhnya dengan kebutuhan grup kamu — mulai dari destinasi, durasi, hingga aktivitas yang diinginkan.' },
    { q: 'Berapa minimal peserta untuk private trip?', a: 'Tidak ada batas minimum peserta. Private trip bisa dilakukan berdua, berkeluarga, maupun rombongan besar. Harga akan disesuaikan dengan jumlah peserta.' },
    { q: 'Bagaimana cara pemesanan private trip?', a: 'Hubungi kami via WhatsApp atau form kontak untuk konsultasi. Tim kami akan menyiapkan penawaran yang sesuai dengan kebutuhan dan anggaran kamu.' },
    { q: 'Apakah bisa request tanggal keberangkatan sendiri?', a: 'Ya, salah satu keunggulan private trip adalah fleksibilitas tanggal. Kamu bisa menentukan tanggal keberangkatan yang paling sesuai.' },
    { q: 'Apakah harga sudah termasuk akomodasi?', a: 'Detail fasilitas yang termasuk dalam paket sudah tercantum di tab Fasilitas. Jika ada kebutuhan khusus, silakan diskusikan saat konsultasi.' },
    { q: 'Apakah ada pemandu wisata pribadi?', a: 'Ya, private trip dilengkapi dengan pemandu wisata pribadi yang berdedikasi penuh untuk grup kamu sepanjang perjalanan.' },
  ],
};

const emptyForm = {
    titleId: '', titleEn: '', type: 'open-trip', locationId: '', locationEn: '', durationId: '', durationEn: '', price: '', originalPrice: '',
    descriptionId: '', descriptionEn: '', itineraryId: '', itineraryEn: '', includeId: '', includeEn: '', excludeId: '', excludeEn: '', maxParticipants: 15,
    departureDates: '', mapLink: '', mapLatitude: '', mapLongitude: '', images: [], imageAlts: [], active: true, featured: false,
    metaTitle: '', metaDescription: '', faq: [],
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

function normalizeLocalizedField(value, formatter) {
  if (value && typeof value === 'object' && !Array.isArray(value) && ('id' in value || 'en' in value)) {
    return {
      id: formatter(value.id),
      en: formatter(value.en),
    };
  }

  return {
    id: formatter(value),
    en: '',
  };
}

function getLocalizedText(value, preferred = 'id') {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value[preferred] || value.id || value.en || '';
  }
  return '';
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
    const [selectedIds, setSelectedIds] = useState([]);
    const [bulkLoading, setBulkLoading] = useState(false);
    const { currentUser } = useAuth();

  useEffect(() => { fetchPackages(); }, []);

  const fetchPackages = async () => {
        setLoading(true);
        const pkgs = await getPackages(null, false);
        setPackages(pkgs);
        setLoading(false);
  };

  const openCreate = () => {
    setForm({ ...emptyForm, faq: FAQ_TEMPLATE['open-trip'].map(f => ({...f})) });
    setEditId(null); setImageFiles([]); setImagePreviews([]); setSaveStatus(''); setShowForm(true);
  };
    const openEdit = (pkg) => {
      const title = normalizeLocalizedField(pkg.title, value => value || '');
      const location = normalizeLocalizedField(pkg.location, value => value || '');
      const duration = normalizeLocalizedField(pkg.duration, value => value || '');
      const description = normalizeLocalizedField(pkg.description, value => value || '');
      const itinerary = normalizeLocalizedField(pkg.itinerary, formatItineraryForTextarea);
      const includes = normalizeLocalizedField(pkg.includes ?? pkg.include, formatListForTextarea);
      const excludes = normalizeLocalizedField(pkg.excludes ?? pkg.exclude, formatListForTextarea);

      setForm({
        ...emptyForm,
        ...pkg,
        titleId: title.id,
        titleEn: title.en,
        locationId: location.id,
        locationEn: location.en,
        durationId: duration.id,
        durationEn: duration.en,
        descriptionId: description.id,
        descriptionEn: description.en,
        itineraryId: itinerary.id,
        itineraryEn: itinerary.en,
        includeId: includes.id,
        includeEn: includes.en,
        excludeId: excludes.id,
        excludeEn: excludes.en,
        mapLink: pkg.mapLink || '',
        mapLatitude: pkg.mapLatitude ?? '',
        mapLongitude: pkg.mapLongitude ?? '',
        images: pkg.images || [],
        imageAlts: Array.isArray(pkg.imageAlts) ? pkg.imageAlts : [],
        departureDates: formatListForTextarea(pkg.departureDates),
        metaTitle: pkg.metaTitle || '',
        metaDescription: pkg.metaDescription || '',
        faq: Array.isArray(pkg.faq) && pkg.faq.length > 0
          ? pkg.faq
          : FAQ_TEMPLATE[pkg.type] ? FAQ_TEMPLATE[pkg.type].map(f => ({...f})) : [],
      });
      setEditId(pkg.id);
      setImageFiles([]);
      setImagePreviews([]);
      setSaveStatus('');
      setShowForm(true);
    };
    const closeForm = () => { setShowForm(false); setEditId(null); setForm(emptyForm); setImageFiles([]); setImagePreviews([]); setSaveStatus(''); };

  const handleImageFiles = (e) => {
        const files = Array.from(e.target.files);
        setImageFiles(files);
        setImagePreviews(files.map(f => URL.createObjectURL(f)));
  };

  const handleSave = async (e) => {
        e.preventDefault();

        if (!currentUser) {
                toast.error('Sesi admin tidak aktif. Silakan login ulang.');
                return;
        }

        setSaving(true);
        setSaveStatus('Menyiapkan data paket...');
        try {
                // Upload new image files if any
                let images = form.images || [];
                let imageAlts = Array.isArray(form.imageAlts) ? [...form.imageAlts] : [];
                if (imageFiles.length > 0) {
                          const uploads = await uploadMultiple(imageFiles, 'packages', ({ current, total, fileName }) => {
                                    setSaveStatus(`Mengunggah foto ${current}/${total}: ${fileName}`);
                          });
                          images = [...images, ...uploads];
                          imageAlts = [...imageAlts, ...new Array(uploads.length).fill('')];
                }
                setSaveStatus('Menyimpan data paket ke database...');
                const slugId = generateSlug(form.titleId.trim())
                const slugEn = generateSlug(form.titleEn.trim() || form.titleId.trim())
                const data = {
                          type: form.type,
                          slug: { id: slugId, en: slugEn },
                          title: {
                            id: form.titleId.trim(),
                            en: form.titleEn.trim(),
                          },
                          location: {
                            id: form.locationId.trim(),
                            en: form.locationEn.trim(),
                          },
                          duration: {
                            id: form.durationId.trim(),
                            en: form.durationEn.trim(),
                          },
                          description: {
                            id: form.descriptionId.trim(),
                            en: form.descriptionEn.trim(),
                          },
                          itinerary: {
                            id: parseItinerary(form.itineraryId),
                            en: parseItinerary(form.itineraryEn),
                          },
                          includes: {
                            id: splitList(form.includeId),
                            en: splitList(form.includeEn),
                          },
                          excludes: {
                            id: splitList(form.excludeId),
                            en: splitList(form.excludeEn),
                          },
                          active: form.active,
                          featured: form.featured,
                          images,
                          imageAlts: imageAlts.map(item => item || ''),
                          image: images[0] || '',
                          metaTitle: form.metaTitle.trim(),
                          metaDescription: form.metaDescription.trim(),
                          faq: form.faq.filter(f => f.q.trim() && f.a.trim()),
                          departureDates: form.type === 'open-trip' ? normalizeDepartureDates(form.departureDates) : [],
                          mapLink: form.mapLink.trim(),
                          mapLatitude: form.mapLatitude === '' ? null : Number(form.mapLatitude),
                          mapLongitude: form.mapLongitude === '' ? null : Number(form.mapLongitude),
                          price: Number(form.price),
                          originalPrice: Number(form.originalPrice) || null,
                          maxParticipants: Number(form.maxParticipants),
                };
                if (editId) {
                          await withTimeout(
                                    updatePackage(editId, data),
                                    'Koneksi ke Supabase timeout saat memperbarui paket. Coba login ulang lalu simpan lagi.'
                          );
                          toast.success('Paket berhasil diperbarui!');
                } else {
                          await withTimeout(
                                    addPackage(data),
                                    'Koneksi ke Supabase timeout saat menyimpan paket. Coba login ulang lalu simpan lagi.'
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
                await deletePackage(id);
                toast.success('Paket berhasil dihapus');
                fetchPackages();
        } catch {
                toast.error('Gagal menghapus paket');
        }
  };

  const toggleActive = async (id, current) => {
        try {
          await updatePackage(id, { active: !current });
          fetchPackages();
        } catch {
          toast.error('Gagal mengubah status paket');
        }
  };

  const bulkActivate = async (active) => {
    if (!selectedIds.length) return;
    setBulkLoading(true);
    try {
      await Promise.all(selectedIds.map(id => updatePackage(id, { active })));
      toast.success(`${selectedIds.length} paket berhasil di${active ? 'aktifkan' : 'nonaktifkan'}`);
      setSelectedIds([]);
      fetchPackages();
    } catch { toast.error('Gagal mengubah status'); }
    setBulkLoading(false);
  };

  const bulkDelete = async () => {
    if (!selectedIds.length) return;
    if (!confirm(`Hapus ${selectedIds.length} paket sekaligus? Tindakan ini tidak bisa dibatalkan.`)) return;
    setBulkLoading(true);
    try {
      await Promise.all(selectedIds.map(id => deletePackage(id)));
      toast.success(`${selectedIds.length} paket dihapus`);
      setSelectedIds([]);
      fetchPackages();
    } catch { toast.error('Gagal menghapus'); }
    setBulkLoading(false);
  };

  const toggleSelect = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const toggleSelectAll = () => setSelectedIds(prev => prev.length === filtered.length ? [] : filtered.map(p => p.id));

  const formatPrice = (p) => p ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(p) : '-';

  const filtered = packages.filter(p => {
        const matchType = filterType === 'semua' || p.type === filterType;
        const matchSearch = getLocalizedText(p.title).toLowerCase().includes(search.toLowerCase()) || getLocalizedText(p.location).toLowerCase().includes(search.toLowerCase());
        return matchType && matchSearch;
  });

  const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500';
    const labelClass = 'block text-sm font-medium text-gray-700 mb-1';
  const packageStats = [
    {
      label: 'Total Paket',
      value: packages.length,
      helper: 'Semua data paket di sistem',
      cardClass: 'bg-white border-gray-100',
      valueClass: 'text-gray-900',
    },
    {
      label: 'Paket Aktif',
      value: packages.filter((pkg) => pkg.active).length,
      helper: 'Sedang tampil di website',
      cardClass: 'bg-emerald-50 border-emerald-200',
      valueClass: 'text-emerald-700',
    },
    {
      label: 'Paket Unggulan',
      value: packages.filter((pkg) => pkg.featured).length,
      helper: 'Ditandai sebagai featured',
      cardClass: 'bg-amber-50 border-amber-200',
      valueClass: 'text-amber-700',
    },
  ];
  const coverAltPreview = getPackageImageAlt({
    title: { id: form.titleId, en: form.titleEn },
    location: { id: form.locationId, en: form.locationEn },
    type: form.type,
    imageAlts: form.imageAlts,
  }, 'id');

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

              <div className="grid gap-4 md:grid-cols-3">
                {packageStats.map((stat) => (
                  <div key={stat.label} className={`rounded-2xl border p-5 shadow-sm ${stat.cardClass}`}>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className={`mt-2 text-3xl font-bold ${stat.valueClass}`}>{stat.value}</p>
                    <p className="mt-1 text-xs text-gray-400">{stat.helper}</p>
                  </div>
                ))}
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
        
          {/* Bulk Action Bar */}
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
              <Zap className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-sm font-semibold text-emerald-800">{selectedIds.length} paket dipilih</span>
              <div className="flex gap-2 ml-auto">
                <button onClick={() => bulkActivate(true)} disabled={bulkLoading} className="text-xs bg-green-600 hover:bg-green-700 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors">Aktifkan</button>
                <button onClick={() => bulkActivate(false)} disabled={bulkLoading} className="text-xs bg-gray-500 hover:bg-gray-600 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors">Nonaktifkan</button>
                <button onClick={bulkDelete} disabled={bulkLoading} className="text-xs bg-red-600 hover:bg-red-700 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors">Hapus</button>
                <button onClick={() => setSelectedIds([])} className="text-xs text-gray-500 hover:text-gray-700 px-2">✕ Batal</button>
              </div>
            </div>
          )}

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
                                                                                <th className="px-4 py-3 w-10">
                                                                                  <button onClick={toggleSelectAll} className="text-gray-400 hover:text-emerald-600">
                                                                                    {selectedIds.length === filtered.length && filtered.length > 0 ? <CheckSquare className="w-4 h-4 text-emerald-600" /> : <Square className="w-4 h-4" />}
                                                                                  </button>
                                                                                </th>
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
                                        <tr key={pkg.id} className={`hover:bg-gray-50 transition-colors ${selectedIds.includes(pkg.id) ? 'bg-emerald-50' : ''}`}>
                                                            <td className="px-4 py-3">
                                                                                  <button onClick={() => toggleSelect(pkg.id)} className="text-gray-400 hover:text-emerald-600">
                                                                                    {selectedIds.includes(pkg.id) ? <CheckSquare className="w-4 h-4 text-emerald-600" /> : <Square className="w-4 h-4" />}
                                                                                  </button>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                                  <div className="flex items-center gap-3">
                                                                                    {pkg.images?.[0] && <img src={pkg.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover" />}
                                                                                                          <span className="font-medium text-gray-900 line-clamp-1">{getLocalizedText(pkg.title)}</span>
                                                                                    </div>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${pkg.type === 'open-trip' ? 'bg-emerald-100 text-emerald-700' : 'bg-purple-100 text-purple-700'}`}>
                                                                                    {pkg.type}
                                                                                    </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-gray-600">{getLocalizedText(pkg.location) || '-'}</td>
                                                            <td className="px-4 py-3 text-emerald-600 font-semibold">{formatPrice(pkg.price)}</td>
                                                            <td className="px-4 py-3">
                                                                                  <button onClick={() => toggleActive(pkg.id, pkg.active)} className={`text-xs font-semibold px-2 py-1 rounded-full ${pkg.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                                                    {pkg.active ? 'Aktif' : 'Nonaktif'}
                                                                                    </button>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                                  <div className="flex items-center gap-2">
                                                                                                          <button onClick={() => openEdit(pkg)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                                                                                                          <button onClick={() => handleDelete(pkg.id, getLocalizedText(pkg.title))} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
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
                                                                      <div>
                                                                                        <label className={labelClass}>Judul Paket Indonesia *</label>
                                                                                        <input type="text" required value={form.titleId} onChange={e => setForm({...form, titleId: e.target.value})} className={inputClass} placeholder="Contoh: Open Trip Labuan Bajo 3D2N" />
                                                                      </div>
                                                                      <div>
                                                                                        <label className={labelClass}>Package Title English</label>
                                                                                        <input type="text" value={form.titleEn} onChange={e => setForm({...form, titleEn: e.target.value})} className={inputClass} placeholder="Example: Labuan Bajo Open Trip 3D2N" />
                                                                      </div>
                                                                      <div>
                                                                                        <label className={labelClass}>Tipe Paket *</label>
                                                                                        <select value={form.type} onChange={e => {
                                                                                          const newType = e.target.value;
                                                                                          const resetFaq = window.confirm('Ganti template FAQ ke tipe ' + (newType === 'open-trip' ? 'Open Trip' : 'Private Trip') + '? FAQ yang sudah diisi akan diganti.');
                                                                                          setForm(f => ({
                                                                                            ...f,
                                                                                            type: newType,
                                                                                            faq: resetFaq ? FAQ_TEMPLATE[newType].map(x => ({...x})) : f.faq,
                                                                                          }));
                                                                                        }} className={inputClass}>
                                                                                                            <option value="open-trip">Open Trip</option>
                                                                                                            <option value="private-trip">Private Trip</option>
                                                                                          </select>
                                                                      </div>
                                                                      <div>
                                                                                        <label className={labelClass}>Lokasi Indonesia *</label>
                                                                                        <input type="text" required value={form.locationId} onChange={e => setForm({...form, locationId: e.target.value})} className={inputClass} placeholder="Labuan Bajo, NTT" />
                                                                      </div>
                                                                      <div>
                                                                                        <label className={labelClass}>Location English</label>
                                                                                        <input type="text" value={form.locationEn} onChange={e => setForm({...form, locationEn: e.target.value})} className={inputClass} placeholder="Labuan Bajo, East Nusa Tenggara" />
                                                                      </div>
                                                                      <div>
                                                                                        <label className={labelClass}>Durasi Indonesia</label>
                                                                                        <input type="text" value={form.durationId} onChange={e => setForm({...form, durationId: e.target.value})} className={inputClass} placeholder="3 Hari 2 Malam" />
                                                                      </div>
                                                                      <div>
                                                                                        <label className={labelClass}>Duration English</label>
                                                                                        <input type="text" value={form.durationEn} onChange={e => setForm({...form, durationEn: e.target.value})} className={inputClass} placeholder="3 Days 2 Nights" />
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
                                                                                              <div className="space-y-3">
                                                                                                {form.images.map((url, i) => (
                                                                                                  <div key={i} className="flex gap-3 rounded-xl border border-gray-200 p-3">
                                                                                                    <div className="relative shrink-0">
                                                                                                      <img src={url} alt="" className="w-16 h-16 object-cover rounded-lg border" />
                                                                                                      <button type="button" onClick={() => setForm({
                                                                                                        ...form,
                                                                                                        images: form.images.filter((_, idx) => idx !== i),
                                                                                                        imageAlts: (form.imageAlts || []).filter((_, idx) => idx !== i),
                                                                                                      })}
                                                                                                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">×</button>
                                                                                                    </div>
                                                                                                    <div className="flex-1">
                                                                                                      <label className="block text-xs font-medium text-gray-600 mb-1">Alt Text Foto {i + 1}</label>
                                                                                                      <input
                                                                                                        type="text"
                                                                                                        value={form.imageAlts?.[i] || ''}
                                                                                                        onChange={e => {
                                                                                                          const nextAlts = [...(form.imageAlts || [])];
                                                                                                          nextAlts[i] = e.target.value;
                                                                                                          setForm({...form, imageAlts: nextAlts});
                                                                                                        }}
                                                                                                        className={inputClass}
                                                                                                        placeholder={`Contoh: ${getPackageImageAlt({ title: { id: form.titleId }, location: { id: form.locationId }, type: form.type }, 'id', i)}`}
                                                                                                      />
                                                                                                    </div>
                                                                                                  </div>
                                                                                                ))}
                                                                                              </div>
                                                                                            </div>
                                                                                          )}
                                                                                          <input type="url" value={''} onChange={e => { if(e.target.value) setForm({...form, images: [...(form.images||[]), e.target.value], imageAlts: [...(form.imageAlts || []), '']}); e.target.value=''; }} className={inputClass} placeholder="Atau tambah via URL (tekan Enter)" onKeyDown={e => { if(e.key==='Enter'){e.preventDefault(); if(e.target.value) { setForm({...form, images: [...(form.images||[]), e.target.value], imageAlts: [...(form.imageAlts || []), '']}); e.target.value=''; }}}} />
                                                                                          <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-800">
                                                                                            <p className="font-semibold">Preview alt foto cover</p>
                                                                                            <p className="mt-1">{coverAltPreview}</p>
                                                                                            <p className="mt-1 text-xs text-emerald-700">Isi alt manual per foto bila ingin deskripsi yang lebih spesifik. Jika kosong, sistem memakai judul paket, lokasi, dan tipe trip.</p>
                                                                                          </div>
                                                                                        </div>
                                                                      </div>
                                                                      <div className="col-span-2">
                                                                                        <label className={labelClass}>Deskripsi Indonesia</label>
                                                                                        <textarea rows={3} value={form.descriptionId} onChange={e => setForm({...form, descriptionId: e.target.value})} className={inputClass} placeholder="Deskripsi paket wisata..." />
                                                                      </div>
                                                                      <div className="col-span-2">
                                                                                        <label className={labelClass}>Description English</label>
                                                                                        <textarea rows={3} value={form.descriptionEn} onChange={e => setForm({...form, descriptionEn: e.target.value})} className={inputClass} placeholder="Package description..." />
                                                                      </div>
                                                                      <div className="col-span-2">
                                                                                        <label className={labelClass}>Itinerary Indonesia</label>
                                                                                        <textarea rows={4} value={form.itineraryId} onChange={e => setForm({...form, itineraryId: e.target.value})} className={inputClass} placeholder="Format per baris, contoh: 08:00 - 09:00: Penjemputan peserta" />
                                                                      </div>
                                                                      <div className="col-span-2">
                                                                                        <label className={labelClass}>Itinerary English</label>
                                                                                        <textarea rows={4} value={form.itineraryEn} onChange={e => setForm({...form, itineraryEn: e.target.value})} className={inputClass} placeholder="One line per activity, example: 08:00 - 09:00: Participant pickup" />
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
                                                                      <div className="col-span-2">
                                                                                        <label className={labelClass}>Link Google Maps</label>
                                                                                        <input
                                                                                          type="url"
                                                                                          value={form.mapLink}
                                                                                          onChange={e => setForm({...form, mapLink: e.target.value})}
                                                                                          className={inputClass}
                                                                                          placeholder="https://maps.google.com/..."
                                                                                        />
                                                                                        <p className="mt-1 text-xs text-gray-500">Cukup paste link Google Maps dari destinasi. Jika kosong, website akan memakai nama lokasi paket sebagai fallback.</p>
                                                                      </div>
                                                                      <div>
                                                                                        <label className={labelClass}>Include Indonesia</label>
                                                                                        <textarea rows={3} value={form.includeId} onChange={e => setForm({...form, includeId: e.target.value})} className={inputClass} placeholder="Tiket masuk, Penginapan, Makan..." />
                                                                      </div>
                                                                      <div>
                                                                                        <label className={labelClass}>Include English</label>
                                                                                        <textarea rows={3} value={form.includeEn} onChange={e => setForm({...form, includeEn: e.target.value})} className={inputClass} placeholder="Entrance ticket, accommodation, meals..." />
                                                                      </div>
                                                                      <div>
                                                                                        <label className={labelClass}>Exclude Indonesia</label>
                                                                                        <textarea rows={3} value={form.excludeId} onChange={e => setForm({...form, excludeId: e.target.value})} className={inputClass} placeholder="Tiket pesawat, Tips guide..." />
                                                                      </div>
                                                                      <div>
                                                                                        <label className={labelClass}>Exclude English</label>
                                                                                        <textarea rows={3} value={form.excludeEn} onChange={e => setForm({...form, excludeEn: e.target.value})} className={inputClass} placeholder="Flight ticket, guide tips..." />
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

                                                      {/* FAQ Manager */}
                                                      <div className="border-t border-gray-100 pt-4 space-y-3">
                                                        <div className="flex items-center justify-between flex-wrap gap-2">
                                                          <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                            <HelpCircle className="w-4 h-4 text-emerald-600" /> FAQ Paket Ini
                                                          </p>
                                                          <div className="flex gap-2">
                                                            <button type="button"
                                                              onClick={() => setForm(f => ({...f, faq: FAQ_TEMPLATE[f.type].map(x => ({...x}))}))}
                                                              className="text-xs bg-gray-100 text-gray-600 font-semibold px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors">
                                                              ↺ Reset Template
                                                            </button>
                                                            <button type="button" onClick={() => setForm(f => ({...f, faq: [...f.faq, {q: '', a: ''}]}))}
                                                              className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-1">
                                                              <Plus className="w-3 h-3" /> Tambah FAQ
                                                            </button>
                                                          </div>
                                                        </div>
                                                        {form.faq.length === 0 && (
                                                          <p className="text-xs text-gray-400 py-2">Belum ada FAQ. Klik "Reset Template" untuk mengisi dengan FAQ default, atau tambah manual.</p>
                                                        )}
                                                        {form.faq.map((item, i) => (
                                                          <div key={i} className="border border-gray-200 rounded-xl p-3 space-y-2 bg-gray-50">
                                                            <div className="flex items-center justify-between">
                                                              <span className="text-xs font-semibold text-gray-500">FAQ #{i + 1}</span>
                                                              <button type="button" onClick={() => setForm(f => ({...f, faq: f.faq.filter((_, idx) => idx !== i)}))}
                                                                className="text-red-400 hover:text-red-600 p-1"><X className="w-3.5 h-3.5" /></button>
                                                            </div>
                                                            <input type="text" value={item.q} onChange={e => setForm(f => ({...f, faq: f.faq.map((x, idx) => idx === i ? {...x, q: e.target.value} : x)}))}
                                                              className={inputClass} placeholder="Pertanyaan..." />
                                                            <textarea rows={2} value={item.a} onChange={e => setForm(f => ({...f, faq: f.faq.map((x, idx) => idx === i ? {...x, a: e.target.value} : x)}))}
                                                              className={inputClass} placeholder="Jawaban..." />
                                                          </div>
                                                        ))}
                                                      </div>

                                                      {/* SEO Section */}
                                                      <div className="border-t border-gray-100 pt-4 space-y-3">
                                                        <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                          <Search className="w-4 h-4 text-emerald-600" /> SEO
                                                        </p>
                                                        <div>
                                                          <label className={labelClass}>Meta Title <span className="text-gray-400 font-normal">(kosongkan = otomatis dari judul)</span></label>
                                                          <input type="text" value={form.metaTitle} onChange={e => setForm({...form, metaTitle: e.target.value})} className={inputClass} placeholder={form.titleId || 'Meta title...'} maxLength={60} />
                                                        </div>
                                                        <div>
                                                          <label className={labelClass}>Meta Description <span className="text-gray-400 font-normal">(kosongkan = otomatis dari deskripsi)</span></label>
                                                          <textarea rows={2} value={form.metaDescription} onChange={e => setForm({...form, metaDescription: e.target.value})} className={inputClass} placeholder={form.descriptionId?.substring(0, 160) || 'Meta description...'} maxLength={160} />
                                                        </div>
                                                        <SerpPreview
                                                          title={form.metaTitle || form.titleId || ''}
                                                          description={form.metaDescription || form.descriptionId?.substring(0, 160) || ''}
                                                          slug={`${form.type}/${generateSlug(form.titleId)}`}
                                                        />
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
