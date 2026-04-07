import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Plus, Trash2, CheckCircle, X, Save, Star } from 'lucide-react';
import { toast } from 'react-toastify';

const emptyForm = { name: '', packageName: '', comment: '', rating: 5, approved: false };

export default function AdminTestimonials() {
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);

  useEffect(() => { fetchTestimonials(); }, []);

  const fetchTestimonials = async () => {
        setLoading(true);
        const snap = await getDocs(query(collection(db, 'testimonials'), orderBy('createdAt', 'desc')));
        setTestimonials(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
  };

  const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
                await addDoc(collection(db, 'testimonials'), { ...form, rating: Number(form.rating), createdAt: serverTimestamp() });
                toast.success('Testimoni ditambahkan!');
                setShowForm(false);
                setForm(emptyForm);
                fetchTestimonials();
        } catch (e) { toast.error('Gagal: ' + e.message); }
        setSaving(false);
  };

  const toggleApprove = async (id, current) => {
        await updateDoc(doc(db, 'testimonials', id), { approved: !current });
        toast.success(!current ? 'Testimoni disetujui' : 'Testimoni disembunyikan');
        fetchTestimonials();
  };

  const handleDelete = async (id) => {
        if (!confirm('Hapus testimoni ini?')) return;
        await deleteDoc(doc(db, 'testimonials', id));
        toast.success('Testimoni dihapus');
        fetchTestimonials();
  };

  const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500';

  return (
        <div className="space-y-6">
              <div className="flex items-center justify-between">
                      <div>
                                <h1 className="text-2xl font-bold text-gray-900">Testimoni</h1>h1>
                                <p className="text-gray-500 text-sm">{testimonials.length} testimoni terdaftar</p>p>
                      </div>div>
                      <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-xl">
                                <Plus className="w-5 h-5" /> Tambah Testimoni
                      </button>button>
              </div>div>
        
          {loading ? (
                  <div className="text-center py-8 text-gray-400">Memuat...</div>div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {testimonials.map(t => (
                                <div key={t.id} className={`bg-white rounded-2xl p-5 shadow-sm border-l-4 ${t.approved ? 'border-emerald-500' : 'border-gray-200'}`}>
                                              <div className="flex items-start justify-between mb-3">
                                                              <div>
                                                                                <p className="font-semibold text-gray-900">{t.name}</p>p>
                                                                                <p className="text-sm text-gray-500">{t.packageName}</p>p>
                                                                                <div className="flex gap-0.5 mt-1">
                                                                                  {[...Array(5)].map((_, i) => (
                                                        <Star key={i} className={`w-4 h-4 ${i < t.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`} />
                                                      ))}
                                                                                </div>div>
                                                              </div>div>
                                                              <div className="flex gap-2">
                                                                                <button onClick={() => toggleApprove(t.id, t.approved)}
                                                                                                      className={`p-2 rounded-lg transition-colors ${t.approved ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100' : 'text-gray-400 hover:bg-gray-100'}`}
                                                                                                      title={t.approved ? 'Sembunyikan' : 'Setujui'}>
                                                                                                    <CheckCircle className="w-5 h-5" />
                                                                                </button>button>
                                                                                <button onClick={() => handleDelete(t.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-5 h-5" /></button>button>
                                                              </div>div>
                                              </div>div>
                                              <p className="text-gray-600 text-sm italic">"{t.comment}"</p>p>
                                              <div className="mt-2">
                                                              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${t.approved ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                                                                {t.approved ? 'Ditampilkan' : 'Disembunyikan'}
                                                              </span>span>
                                              </div>div>
                                </div>div>
                              ))}
                  </div>div>
              )}
        
          {/* Form Modal */}
          {showForm && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
                                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                                                      <h2 className="text-xl font-bold">Tambah Testimoni</h2>h2>
                                                      <button onClick={() => setShowForm(false)}><X className="w-6 h-6 text-gray-400" /></button>button>
                                        </div>div>
                                        <form onSubmit={handleSave} className="p-6 space-y-4">
                                                      <div>
                                                                      <label className="block text-sm font-medium text-gray-700 mb-1">Nama *</label>label>
                                                                      <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className={inputClass} placeholder="Nama wisatawan" />
                                                      </div>div>
                                                      <div>
                                                                      <label className="block text-sm font-medium text-gray-700 mb-1">Paket yang Diambil</label>label>
                                                                      <input value={form.packageName} onChange={e => setForm({...form, packageName: e.target.value})} className={inputClass} placeholder="Nama paket wisata" />
                                                      </div>div>
                                                      <div>
                                                                      <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>label>
                                                                      <div className="flex gap-2">
                                                                        {[1,2,3,4,5].map(r => (
                                        <button key={r} type="button" onClick={() => setForm({...form, rating: r})}>
                                                              <Star className={`w-7 h-7 transition-colors ${r <= form.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 fill-gray-300'}`} />
                                        </button>button>
                                      ))}
                                                                      </div>div>
                                                      </div>div>
                                                      <div>
                                                                      <label className="block text-sm font-medium text-gray-700 mb-1">Komentar *</label>label>
                                                                      <textarea required rows={4} value={form.comment} onChange={e => setForm({...form, comment: e.target.value})} className={inputClass} placeholder="Testimoni wisatawan..." />
                                                      </div>div>
                                                      <label className="flex items-center gap-2 cursor-pointer">
                                                                      <input type="checkbox" checked={form.approved} onChange={e => setForm({...form, approved: e.target.checked})} className="w-4 h-4 text-emerald-600 rounded" />
                                                                      <span className="text-sm font-medium text-gray-700">Tampilkan di website</span>span>
                                                      </label>label>
                                                      <div className="flex gap-3">
                                                                      <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-xl hover:bg-gray-50">Batal</button>button>
                                                                      <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-xl">
                                                                        {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
                                                                                        Simpan
                                                                      </button>button>
                                                      </div>div>
                                        </form>form>
                            </div>div>
                  </div>div>
              )}
        </div>div>
      );
}</div>
