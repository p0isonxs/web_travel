import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Plus, Edit2, Trash2, X, Save, Search, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';

const emptyForm = { title: '', slug: '', category: 'tips wisata', excerpt: '', content: '', coverImage: '', author: 'Admin', published: false, readTime: 5 };

const categories = ['tips wisata', 'destinasi', 'kuliner', 'open trip', 'private trip', 'lainnya'];

export default function AdminBlog() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState('');

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
        setLoading(true);
        const snap = await getDocs(query(collection(db, 'blog'), orderBy('createdAt', 'desc')));
        setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
  };

  const generateSlug = (title) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const openCreate = () => { setForm(emptyForm); setEditId(null); setShowForm(true); };
    const openEdit = (p) => { setForm({ ...emptyForm, ...p }); setEditId(p.id); setShowForm(true); };
    const closeForm = () => { setShowForm(false); setEditId(null); };

  const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
                const data = { ...form, slug: form.slug || generateSlug(form.title), updatedAt: serverTimestamp() };
                if (editId) {
                          await updateDoc(doc(db, 'blog', editId), data);
                          toast.success('Artikel diperbarui!');
                } else {
                          await addDoc(collection(db, 'blog'), { ...data, createdAt: serverTimestamp() });
                          toast.success('Artikel berhasil ditambahkan!');
                }
                closeForm();
                fetchPosts();
        } catch (e) { toast.error('Gagal: ' + e.message); }
        setSaving(false);
  };

  const handleDelete = async (id, title) => {
        if (!confirm(`Hapus artikel "${title}"?`)) return;
        await deleteDoc(doc(db, 'blog', id));
        toast.success('Artikel dihapus');
        fetchPosts();
  };

  const togglePublish = async (id, current) => {
        await updateDoc(doc(db, 'blog', id), { published: !current });
        fetchPosts();
  };

  const formatDate = (ts) => {
        if (!ts) return '-';
        const d = ts.toDate ? ts.toDate() : new Date(ts);
        return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const filtered = posts.filter(p => p.title?.toLowerCase().includes(search.toLowerCase()));
    const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500';
    const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

  return (
        <div className="space-y-6">
              <div className="flex items-center justify-between">
                      <div>
                                <h1 className="text-2xl font-bold text-gray-900">Blog & Artikel</h1>
                                <p className="text-gray-500 text-sm">{posts.length} artikel terdaftar</p>
                      </div>
                      <button onClick={openCreate} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-xl transition-colors">
                                <Plus className="w-5 h-5" /> Tulis Artikel
                      </button>
              </div>
        
              <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari artikel..." className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
        
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {loading ? <div className="p-8 text-center text-gray-400">Memuat...</div> :
                      filtered.length === 0 ? <div className="p-8 text-center text-gray-400">Belum ada artikel</div> : (
                        <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                                  <thead className="bg-gray-50 border-b border-gray-100">
                                                                  <tr>
                                                                                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Judul</th>
                                                                                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Kategori</th>
                                                                                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Tanggal</th>
                                                                                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Status</th>
                                                                                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Aksi</th>
                                                                  </tr>
                                                  </thead>
                                                  <tbody className="divide-y divide-gray-50">
                                                    {filtered.map(p => (
                            <tr key={p.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3">
                                                                      <div className="flex items-center gap-3">
                                                                        {p.coverImage && <img src={p.coverImage} alt="" className="w-10 h-10 rounded-lg object-cover" />}
                                                                                              <span className="font-medium text-gray-900 line-clamp-1">{p.title}</span>
                                                                      </div>
                                                </td>
                                                <td className="px-4 py-3"><span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full capitalize">{p.category}</span></td>
                                                <td className="px-4 py-3 text-gray-600">{formatDate(p.createdAt)}</td>
                                                <td className="px-4 py-3">
                                                                      <button onClick={() => togglePublish(p.id, p.published)} className={`text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 ${p.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                                        {p.published ? <><Eye className="w-3 h-3" /> Publik</> : <><EyeOff className="w-3 h-3" /> Draft</>}
                                                                      </button>
                                                </td>
                                                <td className="px-4 py-3">
                                                                      <div className="flex gap-2">
                                                                                              <button onClick={() => openEdit(p)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                                                                                              <button onClick={() => handleDelete(p.id, p.title)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                                                      </div>
                                                </td>
                            </tr>
                          ))}
                                                  </tbody>
                                    </table>
                        </div>
                      )}
              </div>
        
          {/* Form Modal */}
          {showForm && (
                  <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 py-8 px-4">
                            <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl">
                                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                                                      <h2 className="text-xl font-bold">{editId ? 'Edit Artikel' : 'Tulis Artikel Baru'}</h2>
                                                      <button onClick={closeForm}><X className="w-6 h-6 text-gray-400" /></button>
                                        </div>
                                        <form onSubmit={handleSave} className="p-6 space-y-4">
                                                      <div>
                                                                      <label className={labelClass}>Judul *</label>
                                                                      <input type="text" required value={form.title} onChange={e => setForm({...form, title: e.target.value, slug: generateSlug(e.target.value)})} className={inputClass} placeholder="Judul artikel..." />
                                                      </div>
                                                      <div className="grid grid-cols-2 gap-4">
                                                                      <div>
                                                                                        <label className={labelClass}>Slug URL</label>
                                                                                        <input type="text" value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} className={inputClass} />
                                                                      </div>
                                                                      <div>
                                                                                        <label className={labelClass}>Kategori</label>
                                                                                        <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className={inputClass}>
                                                                                          {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                                                                          </select>
                                                                      </div>
                                                                      <div>
                                                                                        <label className={labelClass}>Penulis</label>
                                                                                        <input type="text" value={form.author} onChange={e => setForm({...form, author: e.target.value})} className={inputClass} />
                                                                      </div>
                                                                      <div>
                                                                                        <label className={labelClass}>Estimasi Baca (menit)</label>
                                                                                        <input type="number" value={form.readTime} onChange={e => setForm({...form, readTime: e.target.value})} className={inputClass} min="1" />
                                                                      </div>
                                                      </div>
                                                      <div>
                                                                      <label className={labelClass}>URL Cover Image</label>
                                                                      <input type="url" value={form.coverImage} onChange={e => setForm({...form, coverImage: e.target.value})} className={inputClass} placeholder="https://..." />
                                                      </div>
                                                      <div>
                                                                      <label className={labelClass}>Ringkasan (Excerpt)</label>
                                                                      <textarea rows={2} value={form.excerpt} onChange={e => setForm({...form, excerpt: e.target.value})} className={inputClass} placeholder="Ringkasan singkat artikel..." />
                                                      </div>
                                                      <div>
                                                                      <label className={labelClass}>Konten (HTML/Teks)</label>
                                                                      <textarea rows={8} value={form.content} onChange={e => setForm({...form, content: e.target.value})} className={inputClass} placeholder="Isi konten artikel..." />
                                                      </div>
                                                      <label className="flex items-center gap-2 cursor-pointer">
                                                                      <input type="checkbox" checked={form.published} onChange={e => setForm({...form, published: e.target.checked})} className="w-4 h-4 text-emerald-600 rounded" />
                                                                      <span className="text-sm font-medium text-gray-700">Publikasikan artikel ini</span>
                                                      </label>
                                                      <div className="flex gap-3 pt-4 border-t border-gray-100">
                                                                      <button type="button" onClick={closeForm} className="flex-1 border border-gray-300 text-gray-700 font-semibold py-2 rounded-xl hover:bg-gray-50">Batal</button>
                                                                      <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold py-2 rounded-xl">
                                                                        {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
                                                                        {saving ? 'Menyimpan...' : 'Simpan Artikel'}
                                                                      </button>
                                                      </div>
                                        </form>
                            </div>
                  </div>
              )}
        </div>
      );
}</></></div>
