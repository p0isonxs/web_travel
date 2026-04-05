import { useState, useEffect } from 'react'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiSave } from 'react-icons/fi'

const emptyPost = { title: '', slug: '', content: '', excerpt: '', image: '', category: 'Informasi', author: 'Admin', published: false, tags: '' }

export default function AdminBlog() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPost, setEditingPost] = useState(null)
  const [formData, setFormData] = useState(emptyPost)
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const dummyPosts = [
    { id: '1', title: 'Petualangan Epik di Derawan Labuan Cermin', slug: 'derawan-labuan-cermin', excerpt: 'Menjelajahi keajaiban bawah laut Derawan yang memukau...', category: 'Informasi', author: 'Umar Dary', published: true, image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=200', tags: 'derawan,diving,bahari' },
    { id: '2', title: 'Tips Hemat Traveling ke Raja Ampat', slug: 'tips-hemat-raja-ampat', excerpt: 'Cara menikmati Raja Ampat dengan budget terbatas...', category: 'Tips', author: 'Admin', published: true, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200', tags: 'raja ampat,tips,budget' },
    { id: '3', title: '10 Destinasi Wisata Terbaik 2026', slug: 'destinasi-wisata-2026', excerpt: 'Daftar destinasi wisata paling populer tahun 2026...', category: 'Informasi', author: 'Admin', published: false, image: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=200', tags: 'destinasi,2026,populer' },
  ]

  const fetchPosts = async () => {
    try {
      const snap = await getDocs(query(collection(db, 'blog'), orderBy('createdAt', 'desc')))
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      setPosts(data.length > 0 ? data : dummyPosts)
    } catch { setPosts(dummyPosts) }
    setLoading(false)
  }

  useEffect(() => { fetchPosts() }, [])

  const openModal = (post = null) => {
    setEditingPost(post)
    setFormData(post ? { ...emptyPost, ...post } : emptyPost)
    setShowModal(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const data = { ...formData, updatedAt: serverTimestamp(), slug: formData.slug || formData.title.toLowerCase().replace(/s+/g, '-') }
      if (editingPost && !editingPost.id.match(/^[0-9]+$/)) {
        await updateDoc(doc(db, 'blog', editingPost.id), data)
      } else {
        await addDoc(collection(db, 'blog'), { ...data, createdAt: serverTimestamp() })
      }
      await fetchPosts()
    } catch {
      if (editingPost) setPosts(prev => prev.map(p => p.id === editingPost.id ? {...p,...formData} : p))
      else setPosts(prev => [{id: 'new_'+Date.now(),...formData},...prev])
    }
    setShowModal(false)
    setSaving(false)
  }

  const handleDelete = async (id) => {
    try {
      if (!id.match(/^[0-9]+$/)) await deleteDoc(doc(db, 'blog', id))
      setPosts(prev => prev.filter(p => p.id !== id))
    } catch { setPosts(prev => prev.filter(p => p.id !== id)) }
    setDeleteConfirm(null)
  }

  const filtered = posts.filter(p => p.title?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Blog & Artikel</h2>
          <p className="text-gray-500 text-sm">{posts.length} artikel</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-2 text-sm"><FiPlus size={16}/> Tulis Artikel</button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-3 flex items-center gap-2">
        <FiSearch className="text-gray-400" size={18}/>
        <input type="text" placeholder="Cari artikel..." value={search} onChange={e=>setSearch(e.target.value)} className="outline-none flex-1 text-sm"/>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="px-4 py-3 text-left">Artikel</th>
              <th className="px-4 py-3 text-left">Kategori</th>
              <th className="px-4 py-3 text-left">Penulis</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(post => (
              <tr key={post.id} className="hover:bg-gray-50">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <img src={post.image} alt="" className="w-12 h-10 rounded-lg object-cover" onError={e=>e.target.src='https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=100'}/>
                    <div>
                      <p className="font-medium text-sm text-gray-800">{post.title}</p>
                      <p className="text-xs text-gray-400 line-clamp-1">{post.excerpt}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-gray-500">{post.category}</td>
                <td className="px-4 py-4 text-sm text-gray-500">{post.author}</td>
                <td className="px-4 py-4">
                  <span className={"px-2 py-1 rounded-full text-xs font-medium " + (post.published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700')}>
                    {post.published ? 'Dipublish' : 'Draft'}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={()=>openModal(post)} className="p-1.5 text-gray-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg"><FiEdit2 size={16}/></button>
                    <button onClick={()=>setDeleteConfirm(post.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><FiTrash2 size={16}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><FiTrash2 className="text-red-500" size={28}/></div>
            <h3 className="text-lg font-bold mb-2">Hapus Artikel?</h3>
            <div className="flex gap-3 mt-4">
              <button onClick={()=>setDeleteConfirm(null)} className="flex-1 py-3 border-2 border-gray-200 rounded-full font-semibold">Batal</button>
              <button onClick={()=>handleDelete(deleteConfirm)} className="flex-1 py-3 bg-red-500 text-white rounded-full font-semibold">Hapus</button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h3 className="font-bold text-lg">{editingPost ? 'Edit Artikel' : 'Tulis Artikel Baru'}</h3>
              <button onClick={()=>setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><FiX size={20}/></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Judul Artikel *</label>
                <input type="text" value={formData.title} onChange={e=>setFormData({...formData,title:e.target.value})} className="form-input" placeholder="Judul menarik..." />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Excerpt / Ringkasan</label>
                <textarea value={formData.excerpt} onChange={e=>setFormData({...formData,excerpt:e.target.value})} rows={2} className="form-input" placeholder="Deskripsi singkat artikel..." />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Konten Artikel</label>
                <textarea value={formData.content} onChange={e=>setFormData({...formData,content:e.target.value})} rows={10} className="form-input" placeholder="Tulis konten artikel di sini... Mendukung Markdown." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">URL Gambar</label>
                  <input type="text" value={formData.image} onChange={e=>setFormData({...formData,image:e.target.value})} className="form-input" placeholder="https://..." />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Kategori</label>
                  <select value={formData.category} onChange={e=>setFormData({...formData,category:e.target.value})} className="form-input">
                    {['Informasi','Tips','Kuliner','Budaya','Adventure','Destinasi'].map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Penulis</label>
                  <input type="text" value={formData.author} onChange={e=>setFormData({...formData,author:e.target.value})} className="form-input" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tags (koma pisah)</label>
                  <input type="text" value={formData.tags} onChange={e=>setFormData({...formData,tags:e.target.value})} className="form-input" placeholder="wisata,bahari,tips" />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.published} onChange={e=>setFormData({...formData,published:e.target.checked})} className="w-4 h-4" />
                <span className="text-sm font-medium">Publish artikel sekarang</span>
              </label>
            </div>
            <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex gap-3 rounded-b-2xl">
              <button onClick={()=>setShowModal(false)} className="flex-1 py-3 border-2 border-gray-200 rounded-full font-semibold">Batal</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-3 bg-primary-500 text-white rounded-full font-semibold flex items-center justify-center gap-2">
                {saving ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"/> : <><FiSave size={18}/> Simpan</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
