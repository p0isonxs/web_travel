import { useState, useEffect } from 'react';
import { getTestimonials, addTestimonial, updateTestimonial, deleteTestimonial, getPackages } from '../../lib/database';
import { Plus, Trash2, CheckCircle, X, Save, Star, Search, MessageSquareQuote } from 'lucide-react';
import { toast } from 'react-toastify';

const emptyForm = { name: '', packageName: '', packageId: '', comment: '', rating: 5, approved: false };

export default function AdminTestimonials() {
    const [testimonials, setTestimonials] = useState([]);
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState('');

  useEffect(() => {
    fetchTestimonials();
    getPackages(null, false).then(pkgs => setPackages(pkgs)).catch(() => {});
  }, []);

  const fetchTestimonials = async () => {
        setLoading(true);
        setTestimonials(await getTestimonials());
        setLoading(false);
  };

  const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
                await addTestimonial({ ...form, rating: Number(form.rating) });
                toast.success('Testimoni ditambahkan!');
                setShowForm(false);
                setForm(emptyForm);
                fetchTestimonials();
        } catch (e) { toast.error('Gagal: ' + e.message); }
        setSaving(false);
  };

  const toggleApprove = async (id, current) => {
        await updateTestimonial(id, { approved: !current });
        toast.success(!current ? 'Testimoni disetujui' : 'Testimoni disembunyikan');
        fetchTestimonials();
  };

  const handleDelete = async (id) => {
        if (!confirm('Hapus testimoni ini?')) return;
        await deleteTestimonial(id);
        toast.success('Testimoni dihapus');
        fetchTestimonials();
  };

  const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500';
  const filteredTestimonials = testimonials.filter((testimonial) => {
    const keyword = search.toLowerCase();
    return (
      testimonial.name?.toLowerCase().includes(keyword) ||
      testimonial.packageName?.toLowerCase().includes(keyword) ||
      testimonial.comment?.toLowerCase().includes(keyword)
    );
  });
  const testimonialStats = [
    { label: 'Total Testimoni', value: testimonials.length, helper: 'Semua data yang tersimpan', cardClass: 'bg-white border-gray-100', valueClass: 'text-gray-900' },
    { label: 'Ditampilkan', value: testimonials.filter((item) => item.approved).length, helper: 'Aktif di halaman publik', cardClass: 'bg-emerald-50 border-emerald-200', valueClass: 'text-emerald-700' },
    { label: 'Perlu Review', value: testimonials.filter((item) => !item.approved).length, helper: 'Belum tampil di website', cardClass: 'bg-amber-50 border-amber-200', valueClass: 'text-amber-700' },
  ];

  return (
        <div className="space-y-6">
              <div className="flex items-center justify-between">
                      <div>
                                <h1 className="text-2xl font-bold text-gray-900">Testimoni</h1>
                                <p className="text-gray-500 text-sm">{testimonials.length} testimoni terdaftar</p>
                      </div>
                      <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-xl">
                                <Plus className="w-5 h-5" /> Tambah Testimoni
                      </button>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {testimonialStats.map((stat) => (
                  <div key={stat.label} className={`rounded-2xl border p-5 shadow-sm ${stat.cardClass}`}>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className={`mt-2 text-3xl font-bold ${stat.valueClass}`}>{stat.value}</p>
                    <p className="mt-1 text-xs text-gray-400">{stat.helper}</p>
                  </div>
                ))}
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari nama traveler, paket, atau isi testimoni..."
                  className="w-full rounded-xl border border-gray-300 py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
        
          {loading ? (
                  <div className="text-center py-8 text-gray-400">Memuat...</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredTestimonials.map(t => (
                                <div key={t.id} className={`bg-white rounded-2xl p-5 shadow-sm border-l-4 ${t.approved ? 'border-emerald-500' : 'border-gray-200'}`}>
                                              <div className="flex items-start justify-between mb-3">
                                                              <div>
                                                                                <p className="font-semibold text-gray-900">{t.name}</p>
                                                                                <p className="text-sm text-gray-500">{t.packageName}</p>
                                                                                <div className="flex gap-0.5 mt-1">
                                                                                  {[...Array(5)].map((_, i) => (
                                                        <Star key={i} className={`w-4 h-4 ${i < t.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`} />
                                                      ))}
                                                                                </div>
                                                              </div>
                                                              <div className="flex gap-2">
                                                                                <button onClick={() => toggleApprove(t.id, t.approved)}
                                                                                                      className={`p-2 rounded-lg transition-colors ${t.approved ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100' : 'text-gray-400 hover:bg-gray-100'}`}
                                                                                                      title={t.approved ? 'Sembunyikan' : 'Setujui'}>
                                                                                                    <CheckCircle className="w-5 h-5" />
                                                                                </button>
                                                                                <button onClick={() => handleDelete(t.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-5 h-5" /></button>
                                                              </div>
                                              </div>
                                              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                                                <MessageSquareQuote className="w-5 h-5" />
                                              </div>
                                              <p className="text-gray-600 text-sm italic">"{t.comment}"</p>
                                              <div className="mt-2">
                                                              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${t.approved ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                                                                {t.approved ? 'Ditampilkan' : 'Disembunyikan'}
                                                              </span>
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
                                                      <h2 className="text-xl font-bold">Tambah Testimoni</h2>
                                                      <button onClick={() => setShowForm(false)}><X className="w-6 h-6 text-gray-400" /></button>
                                        </div>
                                        <form onSubmit={handleSave} className="p-6 space-y-4">
                                                      <div>
                                                                      <label className="block text-sm font-medium text-gray-700 mb-1">Nama *</label>
                                                                      <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className={inputClass} placeholder="Nama wisatawan" />
                                                      </div>
                                                      <div>
                                                                      <label className="block text-sm font-medium text-gray-700 mb-1">Paket yang Diambil</label>
                                                                      <select value={form.packageId} onChange={e => {
                                                                        const pkg = packages.find(p => p.id === e.target.value);
                                                                        const name = typeof pkg?.title === 'string' ? pkg.title : (pkg?.title?.id || '');
                                                                        setForm({...form, packageId: e.target.value, packageName: name});
                                                                      }} className={inputClass}>
                                                                        <option value="">-- Pilih Paket --</option>
                                                                        {packages.map(p => {
                                                                          const t = typeof p.title === 'string' ? p.title : (p.title?.id || p.title?.en || '');
                                                                          return <option key={p.id} value={p.id}>{t}</option>;
                                                                        })}
                                                                      </select>
                                                      </div>
                                                      <div>
                                                                      <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                                                                      <div className="flex gap-2">
                                                                        {[1,2,3,4,5].map(r => (
                                        <button key={r} type="button" onClick={() => setForm({...form, rating: r})}>
                                                              <Star className={`w-7 h-7 transition-colors ${r <= form.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 fill-gray-300'}`} />
                                        </button>
                                      ))}
                                                                      </div>
                                                      </div>
                                                      <div>
                                                                      <label className="block text-sm font-medium text-gray-700 mb-1">Komentar *</label>
                                                                      <textarea required rows={4} value={form.comment} onChange={e => setForm({...form, comment: e.target.value})} className={inputClass} placeholder="Testimoni wisatawan..." />
                                                      </div>
                                                      <label className="flex items-center gap-2 cursor-pointer">
                                                                      <input type="checkbox" checked={form.approved} onChange={e => setForm({...form, approved: e.target.checked})} className="w-4 h-4 text-emerald-600 rounded" />
                                                                      <span className="text-sm font-medium text-gray-700">Tampilkan di website</span>
                                                      </label>
                                                      <div className="flex gap-3">
                                                                      <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-xl hover:bg-gray-50">Batal</button>
                                                                      <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-xl">
                                                                        {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
                                                                                        Simpan
                                                                      </button>
                                                      </div>
                                        </form>
                            </div>
                  </div>
              )}
        </div>
      );
}
