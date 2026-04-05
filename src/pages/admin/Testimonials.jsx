import { useState, useEffect } from 'react'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { FiPlus, FiEdit2, FiTrash2, FiStar, FiCheck, FiX } from 'react-icons/fi'

const dummyTestimonials = [
  { id: '1', name: 'Ahmad Ridho', city: 'Jakarta', trip: 'Sailing Komodo', rating: 5, text: 'Pengalaman terbaik! Komodo-nya seru, snorkeling di Pink Beach amazing!', avatar: 'https://i.pravatar.cc/60?img=1', featured: true, approved: true },
  { id: '2', name: 'Siti Rahmawati', city: 'Surabaya', trip: 'Raja Ampat', rating: 5, text: 'Raja Ampat trip terbaik sepanjang hidup saya. Snorkeling dengan manta ray!', avatar: 'https://i.pravatar.cc/60?img=5', featured: true, approved: true },
  { id: '3', name: 'Budi Santoso', city: 'Bandung', trip: 'Bromo Sunrise', rating: 5, text: 'Open trip Bromo sangat berkesan. Harga terjangkau, fasilitas lengkap!', avatar: 'https://i.pravatar.cc/60?img=3', featured: false, approved: true },
  { id: '4', name: 'Maya Indah', city: 'Yogyakarta', trip: 'Dieng Plateau', rating: 4, text: 'Dieng sangat indah! Guide kami sangat ramah dan informatif. Recommended!', avatar: 'https://i.pravatar.cc/60?img=7', featured: false, approved: false },
]

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState(dummyTestimonials)
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('Semua')
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({ name: '', city: '', trip: '', rating: 5, text: '', avatar: '', featured: false })

  const updateField = async (id, field, value) => {
    try {
      if (!id.match(/^[0-9]+$/)) await updateDoc(doc(db, 'testimonials', id), { [field]: value })
      setTestimonials(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t))
    } catch {
      setTestimonials(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t))
    }
  }

  const handleDelete = async (id) => {
    try {
      if (!id.match(/^[0-9]+$/)) await deleteDoc(doc(db, 'testimonials', id))
      setTestimonials(prev => prev.filter(t => t.id !== id))
    } catch {
      setTestimonials(prev => prev.filter(t => t.id !== id))
    }
    setDeleteConfirm(null)
  }

  const handleAdd = async () => {
    try {
      await addDoc(collection(db, 'testimonials'), { ...formData, approved: true, createdAt: serverTimestamp() })
    } catch {}
    setTestimonials(prev => [...prev, { id: 'new_'+Date.now(), ...formData, approved: true }])
    setShowModal(false)
    setFormData({ name: '', city: '', trip: '', rating: 5, text: '', avatar: '', featured: false })
  }

  const filtered = testimonials.filter(t => {
    if (filter === 'Featured') return t.featured
    if (filter === 'Menunggu') return !t.approved
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Kelola Testimoni</h2>
          <p className="text-gray-500 text-sm">{testimonials.length} testimoni | {testimonials.filter(t=>!t.approved).length} menunggu persetujuan</p>
        </div>
        <button onClick={()=>setShowModal(true)} className="btn-primary flex items-center gap-2 text-sm"><FiPlus size={16}/> Tambah Testimoni</button>
      </div>

      <div className="flex gap-2">
        {['Semua', 'Featured', 'Menunggu'].map(f => (
          <button key={f} onClick={()=>setFilter(f)} className={"px-4 py-2 rounded-xl text-sm font-medium transition-colors " + (filter === f ? 'bg-primary-500 text-white' : 'bg-white text-gray-600 shadow-sm')}>
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(t => (
          <div key={t.id} className={"bg-white rounded-2xl p-5 shadow-sm border-2 " + (!t.approved ? 'border-yellow-200' : 'border-transparent')}>
            {!t.approved && <div className="flex items-center gap-1 text-yellow-600 text-xs font-medium mb-3"><FiStar size={12}/> Menunggu Persetujuan</div>}
            <div className="flex items-start gap-3 mb-3">
              <img src={t.avatar || "https://i.pravatar.cc/60?img=" + t.id} alt={t.name} className="w-12 h-12 rounded-full object-cover"/>
              <div className="flex-1">
                <p className="font-semibold text-gray-800">{t.name}</p>
                <p className="text-xs text-gray-400">{t.city} • {t.trip}</p>
                <div className="flex gap-0.5 mt-1">{[...Array(5)].map((_,i) => <FiStar key={i} size={12} className={i<t.rating?'text-yellow-400 fill-yellow-400':'text-gray-200'}/>)}</div>
              </div>
            </div>
            <p className="text-gray-600 text-sm italic mb-4">"{t.text}"</p>
            <div className="flex items-center justify-between border-t border-gray-100 pt-3">
              <div className="flex gap-2">
                {!t.approved && (
                  <button onClick={()=>updateField(t.id,'approved',true)} className="flex items-center gap-1 text-green-600 text-xs bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-full transition-colors">
                    <FiCheck size={12}/> Setujui
                  </button>
                )}
                <button onClick={()=>updateField(t.id,'featured',!t.featured)} className={"flex items-center gap-1 text-xs px-3 py-1.5 rounded-full transition-colors " + (t.featured ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600 hover:bg-yellow-50')}>
                  <FiStar size={12}/> {t.featured ? 'Unfeatured' : 'Featured'}
                </button>
              </div>
              <button onClick={()=>setDeleteConfirm(t.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><FiTrash2 size={16}/></button>
            </div>
          </div>
        ))}
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><FiTrash2 className="text-red-500" size={28}/></div>
            <h3 className="text-lg font-bold mb-2">Hapus Testimoni?</h3>
            <div className="flex gap-3 mt-4">
              <button onClick={()=>setDeleteConfirm(null)} className="flex-1 py-3 border-2 border-gray-200 rounded-full font-semibold">Batal</button>
              <button onClick={()=>handleDelete(deleteConfirm)} className="flex-1 py-3 bg-red-500 text-white rounded-full font-semibold">Hapus</button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="font-bold">Tambah Testimoni</h3>
              <button onClick={()=>setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><FiX size={20}/></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Nama</label>
                  <input type="text" value={formData.name} onChange={e=>setFormData({...formData,name:e.target.value})} className="form-input text-sm" placeholder="Nama pelanggan"/>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Kota</label>
                  <input type="text" value={formData.city} onChange={e=>setFormData({...formData,city:e.target.value})} className="form-input text-sm" placeholder="Jakarta"/>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Paket Trip</label>
                  <input type="text" value={formData.trip} onChange={e=>setFormData({...formData,trip:e.target.value})} className="form-input text-sm" placeholder="Sailing Komodo"/>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Rating</label>
                  <select value={formData.rating} onChange={e=>setFormData({...formData,rating:parseInt(e.target.value)})} className="form-input text-sm">
                    {[5,4,3,2,1].map(r=><option key={r} value={r}>{r} Bintang</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">URL Avatar (opsional)</label>
                <input type="text" value={formData.avatar} onChange={e=>setFormData({...formData,avatar:e.target.value})} className="form-input text-sm" placeholder="https://..."/>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ulasan</label>
                <textarea value={formData.text} onChange={e=>setFormData({...formData,text:e.target.value})} rows={4} className="form-input text-sm" placeholder="Cerita pengalaman..."/>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.featured} onChange={e=>setFormData({...formData,featured:e.target.checked})} className="w-4 h-4"/>
                <span className="text-sm">Tampilkan di homepage (Featured)</span>
              </label>
            </div>
            <div className="px-6 py-4 border-t flex gap-3">
              <button onClick={()=>setShowModal(false)} className="flex-1 py-3 border-2 border-gray-200 rounded-full font-semibold">Batal</button>
              <button onClick={handleAdd} className="flex-1 py-3 bg-primary-500 text-white rounded-full font-semibold">Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
