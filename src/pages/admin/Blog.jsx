import { useState, useEffect } from 'react';
import { getBlogPosts, addBlogPost, updateBlogPost, deleteBlogPost } from '../../lib/database';
import { Plus, Edit2, Trash2, X, Save, Search, Eye, EyeOff, Upload, Search as SearchIcon, FileText, Globe2, Clock3, Link as LinkIcon, ShieldCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import { uploadToCloudinary } from '../../utils/cloudinary';
import RichTextEditor from '../../components/admin/RichTextEditor';
import SerpPreview from '../../components/admin/SerpPreview';
import { getBlogImageAlt } from '../../utils/imageAlt';

const emptyForm = {
  titleId: '', titleEn: '', slug: '', category: 'tips wisata',
  excerptId: '', excerptEn: '', contentId: '', contentEn: '',
  metaTitle: '', metaDescription: '',
  coverImage: '', coverAlt: '', author: 'Admin', published: false, readTime: 5,
};

const categories = ['tips wisata', 'destinasi', 'kuliner', 'open trip', 'private trip', 'lainnya'];

function normalizeLocalizedField(value) {
  if (value && typeof value === 'object' && !Array.isArray(value) && ('id' in value || 'en' in value)) {
    return {
      id: value.id || '',
      en: value.en || '',
    };
  }

  return {
    id: value || '',
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

function stripHtml(value) {
  return String(value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export default function AdminBlog() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [coverUploading, setCoverUploading] = useState(false);
    const [search, setSearch] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
        setLoading(true);
        setPosts(await getBlogPosts());
        setLoading(false);
  };

  const generateSlug = (title) => String(title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const openCreate = () => { setForm(emptyForm); setEditId(null); setShowForm(true); };
    const openEdit = (p) => {
      const title = normalizeLocalizedField(p.title);
      const excerpt = normalizeLocalizedField(p.excerpt);
      const content = normalizeLocalizedField(p.content);
      setForm({
        ...emptyForm,
        ...p,
        titleId: title.id,
        titleEn: title.en,
        excerptId: excerpt.id,
        excerptEn: excerpt.en,
        contentId: content.id,
        contentEn: content.en,
        metaTitle: p.metaTitle || '',
        metaDescription: p.metaDescription || '',
        coverAlt: p.coverAlt || '',
      });
      setEditId(p.id);
      setShowForm(true);
    };
    const closeForm = () => { setShowForm(false); setEditId(null); };

  const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
                const normalizedSlug = generateSlug(form.slug || form.titleId);
                if (!form.titleId.trim()) throw new Error('Judul Indonesia wajib diisi');
                if (!normalizedSlug) throw new Error('Slug URL belum valid');
                if (!stripHtml(form.contentId)) throw new Error('Konten Indonesia wajib diisi');
                const slugExists = posts.some((post) => post.slug === normalizedSlug && post.id !== editId);
                if (slugExists) throw new Error('Slug sudah dipakai artikel lain. Gunakan slug yang berbeda.');
                const data = {
                  slug: normalizedSlug,
                  category: form.category,
                  title: {
                    id: form.titleId.trim(),
                    en: form.titleEn.trim(),
                  },
                  excerpt: {
                    id: form.excerptId.trim(),
                    en: form.excerptEn.trim(),
                  },
                  content: {
                    id: form.contentId.trim(),
                    en: form.contentEn.trim(),
                  },
                  coverImage: form.coverImage,
                  coverAlt: form.coverAlt.trim(),
                  author: form.author,
                  published: form.published,
                  readTime: Number(form.readTime) || 5,
                  metaTitle: form.metaTitle.trim(),
                  metaDescription: form.metaDescription.trim(),
                };
                if (editId) {
                          await updateBlogPost(editId, data);
                          toast.success('Artikel diperbarui!');
                } else {
                          await addBlogPost(data);
                          toast.success('Artikel berhasil ditambahkan!');
                }
                closeForm();
                fetchPosts();
        } catch (e) { toast.error('Gagal: ' + e.message); }
        setSaving(false);
  };

  const handleDelete = async (id, title) => {
        if (!confirm(`Hapus artikel "${title}"?`)) return;
        await deleteBlogPost(id);
        toast.success('Artikel dihapus');
        fetchPosts();
  };

  const togglePublish = async (id, current) => {
        await updateBlogPost(id, { published: !current });
        fetchPosts();
  };

  const formatDate = (ts) => {
        if (!ts) return '-';
        const d = ts.toDate ? ts.toDate() : new Date(ts);
        return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const filtered = posts.filter((p) => {
        const titleId = getLocalizedText(p.title, 'id').toLowerCase();
        const titleEn = getLocalizedText(p.title, 'en').toLowerCase();
        const matchesSearch = titleId.includes(search.toLowerCase()) || titleEn.includes(search.toLowerCase());
        if (!matchesSearch) return false;
        if (activeFilter === 'published') return p.published;
        if (activeFilter === 'draft') return !p.published;
        if (activeFilter === 'withCover') return Boolean(p.coverImage);
        return true;
  });
    const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500';
    const labelClass = 'block text-sm font-medium text-gray-700 mb-1';
    const totalPosts = posts.length;
    const publishedPosts = posts.filter((post) => post.published).length;
    const draftPosts = totalPosts - publishedPosts;
    const localizedWordCount = stripHtml(form.contentId).split(/\s+/).filter(Boolean).length;
    const estimatedReadTime = Math.max(1, Math.ceil(localizedWordCount / 180));
    const hasSeoReady = Boolean((form.metaTitle || form.titleId).trim()) && Boolean((form.metaDescription || form.excerptId).trim());
    const stats = [
      { label: 'Total artikel', value: totalPosts, tone: 'emerald', icon: FileText },
      { label: 'Sudah publik', value: publishedPosts, tone: 'blue', icon: Globe2 },
      { label: 'Masih draft', value: draftPosts, tone: 'amber', icon: EyeOff },
      { label: 'Kategori aktif', value: new Set(posts.map((post) => post.category).filter(Boolean)).size, tone: 'rose', icon: LinkIcon },
    ];
    const filterOptions = [
      { id: 'all', label: 'Semua' },
      { id: 'published', label: 'Publik' },
      { id: 'draft', label: 'Draft' },
      { id: 'withCover', label: 'Ada cover' },
    ];
    const toneClasses = {
      emerald: 'bg-emerald-50 text-emerald-600',
      blue: 'bg-blue-50 text-blue-600',
      amber: 'bg-amber-50 text-amber-600',
      rose: 'bg-rose-50 text-rose-600',
    };
    const coverAltPreview = getBlogImageAlt({
      title: { id: form.titleId, en: form.titleEn },
      excerpt: { id: form.excerptId, en: form.excerptEn },
      category: form.category,
      coverAlt: form.coverAlt,
    }, 'id');

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

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map(({ label, value, tone, icon: Icon }) => (
                  <div key={label} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-2xl ${toneClasses[tone]}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <p className="text-sm text-gray-500">{label}</p>
                    <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari artikel..." className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {filterOptions.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setActiveFilter(option.id)}
                        className={`rounded-full px-3 py-2 text-sm font-medium transition-colors ${activeFilter === option.id ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
        
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {loading ? <div className="p-8 text-center text-gray-400">Memuat...</div> :
                      filtered.length === 0 ? <div className="p-8 text-center text-gray-400">Belum ada artikel yang cocok dengan filter saat ini</div> : (
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
                                                                                              <span className="font-medium text-gray-900 line-clamp-1">{getLocalizedText(p.title)}</span>
                                                                      </div>
                                                </td>
                                                <td className="px-4 py-3"><span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full capitalize">{p.category}</span></td>
                                                <td className="px-4 py-3 text-gray-600">
                                                  <div>{formatDate(p.createdAt)}</div>
                                                  <div className="text-xs text-gray-400">{p.readTime || 5} menit baca</div>
                                                </td>
                                                <td className="px-4 py-3">
                                                                      <button onClick={() => togglePublish(p.id, p.published)} className={`text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 ${p.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                                        {p.published ? <><Eye className="w-3 h-3" /> Publik</> : <><EyeOff className="w-3 h-3" /> Draft</>}
                                                                      </button>
                                                </td>
                                                <td className="px-4 py-3">
                                                                      <div className="flex gap-2">
                                                                                              <button onClick={() => openEdit(p)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                                                                                              <button onClick={() => handleDelete(p.id, getLocalizedText(p.title))} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
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
                            <div className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl">
                                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                                                      <h2 className="text-xl font-bold">{editId ? 'Edit Artikel' : 'Tulis Artikel Baru'}</h2>
                                                      <button onClick={closeForm}><X className="w-6 h-6 text-gray-400" /></button>
                                        </div>
                                        <form onSubmit={handleSave} className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_300px]">
                                          <div className="space-y-4">
                                                      <div className="grid grid-cols-2 gap-4">
                                                                      <div>
                                                                                        <label className={labelClass}>Judul Indonesia *</label>
                                                                                        <input type="text" required value={form.titleId} onChange={e => setForm({...form, titleId: e.target.value, slug: generateSlug(e.target.value)})} className={inputClass} placeholder="Judul artikel..." />
                                                                      </div>
                                                                      <div>
                                                                                        <label className={labelClass}>Title English</label>
                                                                                        <input type="text" value={form.titleEn} onChange={e => setForm({...form, titleEn: e.target.value})} className={inputClass} placeholder="Article title..." />
                                                                      </div>
                                                      </div>
                                                      <div className="grid grid-cols-2 gap-4">
                                                                      <div>
                                                                                        <label className={labelClass}>Slug URL</label>
                                                                                        <input type="text" value={form.slug} onChange={e => setForm({...form, slug: generateSlug(e.target.value)})} className={inputClass} />
                                                                                        <p className="mt-1 text-xs text-gray-400">URL artikel akan menjadi `/blog/{form.slug || generateSlug(form.titleId) || 'slug-artikel'}`</p>
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
                                                                      <label className={labelClass}>Cover Image</label>
                                                                      <div className="flex gap-4 items-start">
                                                                        {form.coverImage ? (
                                                                          <div className="relative shrink-0">
                                                                            <img src={form.coverImage} alt="cover" className="w-40 h-24 object-cover rounded-xl border border-gray-200" />
                                                                            <button type="button" onClick={() => setForm({...form, coverImage: ''})}
                                                                              className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600">
                                                                              <X className="w-3 h-3" />
                                                                            </button>
                                                                          </div>
                                                                        ) : (
                                                                          <div className="w-40 h-24 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 shrink-0">
                                                                            <span className="text-xs text-gray-400 text-center px-2">Belum ada foto</span>
                                                                          </div>
                                                                        )}
                                                                        <div className="flex-1">
                                                                          <label className="inline-flex items-center gap-2 cursor-pointer bg-white border border-gray-300 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                                                                            {coverUploading ? <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" /> : <Upload className="w-4 h-4" />}
                                                                            <span>{coverUploading ? 'Mengupload...' : 'Upload Foto'}</span>
                                                                            <input type="file" accept="image/*" className="hidden" disabled={coverUploading} onChange={async (e) => {
                                                                              const file = e.target.files[0];
                                                                              if (!file) return;
                                                                              if (file.size > 5 * 1024 * 1024) { toast.error('Ukuran file maksimal 5MB'); return; }
                                                                              setCoverUploading(true);
                                                                              try {
                                                                                const url = await uploadToCloudinary(file, 'blog-covers');
                                                                                setForm(f => ({...f, coverImage: url}));
                                                                                toast.success('Gambar berhasil diupload!');
                                                                              } catch { toast.error('Gagal upload gambar'); }
                                                                              setCoverUploading(false);
                                                                            }} />
                                                                          </label>
                                                                          <p className="text-xs text-gray-400 mt-2">JPG/PNG/WebP, maks 5MB. Rekomendasi: 1200×630px</p>
                                                                        </div>
                                                                      </div>
                                                                      <div className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-800">
                                                                        <p className="font-semibold">Preview alt cover</p>
                                                                        <p className="mt-1">{coverAltPreview}</p>
                                                                        <p className="mt-1 text-xs text-emerald-700">Isi alt manual bila ingin deskripsi yang lebih spesifik. Jika kosong, sistem memakai judul dan kategori artikel.</p>
                                                                      </div>
                                                      </div>
                                                      <div>
                                                                      <label className={labelClass}>Alt Text Cover</label>
                                                                      <input type="text" value={form.coverAlt} onChange={e => setForm({...form, coverAlt: e.target.value})} className={inputClass} placeholder="Contoh: Kapal phinisi berlayar di Labuan Bajo saat matahari terbenam" />
                                                                      <p className="mt-1 text-xs text-gray-500">Gunakan deskripsi visual yang natural, bukan daftar keyword.</p>
                                                      </div>
                                                      <div>
                                                                      <label className={labelClass}>Ringkasan Indonesia</label>
                                                                      <textarea rows={2} value={form.excerptId} onChange={e => setForm({...form, excerptId: e.target.value})} className={inputClass} placeholder="Ringkasan singkat artikel..." />
                                                      </div>
                                                      <div>
                                                                      <label className={labelClass}>Excerpt English</label>
                                                                      <textarea rows={2} value={form.excerptEn} onChange={e => setForm({...form, excerptEn: e.target.value})} className={inputClass} placeholder="Short article excerpt..." />
                                                      </div>
                                                      <div>
                                                                      <label className={labelClass}>Konten Indonesia</label>
                                                                      <RichTextEditor value={form.contentId} onChange={v => setForm(f => ({...f, contentId: v}))} placeholder="Tulis konten artikel dalam Bahasa Indonesia..." />
                                                      </div>
                                                      <div>
                                                                      <label className={labelClass}>Content English</label>
                                                                      <RichTextEditor value={form.contentEn} onChange={v => setForm(f => ({...f, contentEn: v}))} placeholder="Write article content in English..." />
                                                      </div>

                                                      {/* SEO Section */}
                                                      <div className="border-t border-gray-100 pt-4">
                                                        <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                                          <SearchIcon className="w-4 h-4 text-emerald-600" /> SEO
                                                        </p>
                                                        <div className="space-y-3">
                                                          <div>
                                                            <label className={labelClass}>Meta Title <span className="text-gray-400 font-normal">(kosongkan = otomatis dari judul)</span></label>
                                                            <input type="text" value={form.metaTitle} onChange={e => setForm({...form, metaTitle: e.target.value})} className={inputClass} placeholder={form.titleId || 'Meta title...'} maxLength={60} />
                                                          </div>
                                                          <div>
                                                            <label className={labelClass}>Meta Description <span className="text-gray-400 font-normal">(kosongkan = otomatis dari ringkasan)</span></label>
                                                            <textarea rows={2} value={form.metaDescription} onChange={e => setForm({...form, metaDescription: e.target.value})} className={inputClass} placeholder={form.excerptId || 'Meta description...'} maxLength={160} />
                                                          </div>
                                                          <SerpPreview
                                                            title={form.metaTitle || form.titleId || ''}
                                                            description={form.metaDescription || form.excerptId || ''}
                                                            slug={`blog/${form.slug || ''}`}
                                                          />
                                                        </div>
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
                                          </div>

                                          <aside className="space-y-4">
                                            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                                              <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-900">
                                                <ShieldCheck className="w-4 h-4" />
                                                Checklist Publikasi
                                              </p>
                                              <div className="space-y-2 text-sm text-emerald-900">
                                                <div className="flex items-start gap-2">
                                                  <span className={`mt-1 h-2.5 w-2.5 rounded-full ${form.titleId.trim() ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                                                  <span>Judul Indonesia sudah diisi</span>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                  <span className={`mt-1 h-2.5 w-2.5 rounded-full ${(form.slug || generateSlug(form.titleId)).trim() ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                                                  <span>Slug artikel sudah valid</span>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                  <span className={`mt-1 h-2.5 w-2.5 rounded-full ${stripHtml(form.contentId) ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                                                  <span>Konten utama sudah tersedia</span>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                  <span className={`mt-1 h-2.5 w-2.5 rounded-full ${hasSeoReady ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                                                  <span>SEO snippet sudah layak tayang</span>
                                                </div>
                                              </div>
                                            </div>

                                            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                                              <p className="mb-4 text-sm font-semibold text-gray-900">Ringkasan Artikel</p>
                                              <div className="space-y-3 text-sm text-gray-600">
                                                <div className="flex items-center justify-between">
                                                  <span>Estimasi baca</span>
                                                  <span className="font-semibold text-gray-900">{estimatedReadTime} menit</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                  <span>Jumlah kata</span>
                                                  <span className="font-semibold text-gray-900">{localizedWordCount}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                  <span>Status</span>
                                                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${form.published ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                                                    {form.published ? 'Siap publik' : 'Masih draft'}
                                                  </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                  <span>Cover</span>
                                                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${form.coverImage ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                                                    {form.coverImage ? 'Sudah ada' : 'Belum ada'}
                                                  </span>
                                                </div>
                                              </div>
                                            </div>

                                            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                                              <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
                                                <Clock3 className="w-4 h-4 text-emerald-600" />
                                                Catatan Editor
                                              </p>
                                              <ul className="space-y-2 text-sm text-gray-600">
                                                <li>Gunakan cover 1200×630 agar thumbnail artikel lebih konsisten.</li>
                                                <li>Judul sebaiknya di bawah 60 karakter agar preview Google tidak terpotong.</li>
                                                <li>Isi ringkasan 1-2 kalimat agar artikel lebih mudah dipahami sebelum dibuka.</li>
                                              </ul>
                                            </div>
                                          </aside>
                                        </form>
                            </div>
                  </div>
              )}
        </div>
      );
}
