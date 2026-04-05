import { useState, useEffect } from 'react'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '../../firebase/config'
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiSave, FiImage, FiEye } from 'react-icons/fi'
import { Link } from 'react-router-dom'

const emptyPackage = {
  title: '', location: '', duration: '', price: '', originalPrice: '', type: 'Open Trip', category: 'bahari',
  description: '', image: '', featured: false, minPersons: 2, maxPersons: 15,
  highlights: '', includes: '', excludes: '', meetingPoint: '', whatsappNumber: '6281234567890',
  availableDates: ''
}

export default function AdminPackages() {
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPkg, setEditingPkg] = useState(null)
  const [formData, setFormData] = useState(emptyPackage)
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const dummyPackages = [
    { id: '1', title: 'Sailing Komodo Labuan Bajo', location: 'NTT', duration: '3D2N', price: 2750000, type: 'Open Trip', category: 'bahari', rating: 5.0, reviews: 721, featured: true, image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=200' },
    { id: '2', title: 'Raja Ampat Piaynemo', location: 'Papua Barat', duration: '4D3N', price: 4500000, type: 'Open Trip', category: 'bahari', rating: 5.0, reviews: 456, featured: true, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200' },
    { id: '3', title: 'Bromo Midnight Sunrise', location: 'Jawa Timur', duration: '2D1N', price: 345000, type: 'Open Trip', category: 'gunung', rating: 5.0, reviews: 551, featured: true, image: 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?w=200' },
  ]

  const fetchPackages = async () => {
    try {
      const snap = await getDocs(query(collection(db, 'packages'), orderBy('createdAt', 'desc')))
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      setPackages(data.length > 0 ? data : dummyPackages)
    } catch {
      setPackages(dummyPackages)
    }
    setLoading(false)
  }

  useEffect(() => { fetchPackages() }, [])

  const openModal = (pkg = null) => {
    if (pkg) {
      setEditingPkg(pkg)
      setFormData({ ...emptyPackage, ...pkg, highlights: (pkg.highlights || []).join('
'), includes: (pkg.includes || []).join('
'), excludes: (pkg.excludes || []).join('
'), availableDates: (pkg.availableDates || []).join('
') })
    } else {
      setEditingPkg(null)
      setFormData(emptyPackage)
    }
    setImageFile(null)
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!formData.title || !formData.price) {
      alert('Judul dan harga wajib diisi!')
      return
    }
    setSaving(true)
    try {
      let imageUrl = formData.image
      if (imageFile) {
        const storageRef = ref(storage, "packages/" + Date.now() + "_" + imageFile.name)
        const snap = await uploadBytes(storageRef, imageFile)
        imageUrl = await getDownloadURL(snap.ref)
      }

      const data = {
        ...formData,
        price: parseInt(formData.price),
        originalPrice: formData.originalPrice ? parseInt(formData.originalPrice) : null,
        minPersons: parseInt(formData.minPersons) || 2,
        maxPersons: parseInt(formData.maxPersons) || 15,
        image: imageUrl,
        highlights: formData.highlights.split('
').filter(Boolean),
        includes: formData.includes.split('
').filter(Boolean),
        excludes: formData.excludes.split('
').filter(Boolean),
        availableDates: formData.availableDates.split('
').filter(Boolean),
        updatedAt: serverTimestamp()
      }

      if (editingPkg && editingPkg.id && !editingPkg.id.startsWith('dummy')) {
        await updateDoc(doc(db, 'packages', editingPkg.id), data)
      } else {
        await addDoc(collection(db, 'packages'), { ...data, rating: 5.0, reviews: 0, createdAt: serverTimestamp() })
      }
      await fetchPackages()
      setShowModal(false)
    } catch (err) {
      console.error(err)
      // Demo: update local state
      if (editingPkg) {
        setPackages(prev => prev.map(p => p.id === editingPkg.id ? { ...p, ...formData } : p))
      } else {
        setPackages(prev => [{ id: 'new_' + Date.now(), ...formData }, ...prev])
      }
      setShowModal(false)
    }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    try {
      if (!id.startsWith('dummy') && !id.match(/^[0-9]+$/)) {
        await deleteDoc(doc(db, 'packages', id))
      }
      setPackages(prev => prev.filter(p => p.id !== id))
    } catch {
      setPackages(prev => prev.filter(p => p.id !== id))
    }
    setDeleteConfirm(null)
  }

  const formatPrice = (price) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price)
  const filtered = packages.filter(p => p.title?.toLowerCase().includes(search.toLowerCase()) || p.location?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Kelola Paket Wisata</h2>
          <p className="text-gray-500 text-sm">{packages.length} paket tersedia</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-2 text-sm">
          <FiPlus size={16} /> Tambah Paket
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-3">
        <FiSearch className="text-gray-400" size={18} />
        <input type="text" placeholder="Cari paket wisata..." value={search} onChange={(e) => setSearch(e.target.value)} className="outline-none flex-1 text-sm" />
        {search && <button onClick={() => setSearch('')}><FiX size={16} className="text-gray-400" /></button>}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-500 border-t-transparent mx-auto" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Paket</th>
                  <th className="px-4 py-3 text-left">Lokasi</th>
                  <th className="px-4 py-3 text-left">Tipe</th>
                  <th className="px-4 py-3 text-left">Harga</th>
                  <th className="px-4 py-3 text-left">Rating</th>
                  <th className="px-4 py-3 text-left">Featured</th>
                  <th className="px-4 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(pkg => (
                  <tr key={pkg.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <img src={pkg.image} alt="" className="w-12 h-10 rounded-lg object-cover" onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=100'} />
                        <div>
                          <p className="font-medium text-gray-800 text-sm">{pkg.title}</p>
                          <p className="text-xs text-gray-400">{pkg.duration}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">{pkg.location}</td>
                    <td className="px-4 py-4">
                      <span className={"px-2 py-1 rounded-full text-xs font-medium " + (pkg.type === 'Open Trip' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700')}>{pkg.type}</span>
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold text-primary-500">{formatPrice(pkg.price)}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">{pkg.rating || 5.0} ⭐ ({pkg.reviews || 0})</td>
                    <td className="px-4 py-4">
                      <span className={"px-2 py-1 rounded-full text-xs " + (pkg.featured ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500')}>{pkg.featured ? 'Ya' : 'Tidak'}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Link to={"/paket/" + pkg.id} target="_blank" className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><FiEye size={16} /></Link>
                        <button onClick={() => openModal(pkg)} className="p-1.5 text-gray-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors"><FiEdit2 size={16} /></button>
                        <button onClick={() => setDeleteConfirm(pkg.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><FiTrash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-12 text-gray-400">Tidak ada paket ditemukan</div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiTrash2 className="text-red-500" size={28} />
            </div>
            <h3 className="text-lg font-bold mb-2">Hapus Paket?</h3>
            <p className="text-gray-500 text-sm mb-6">Tindakan ini tidak dapat dibatalkan.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3 border-2 border-gray-200 rounded-full font-semibold hover:bg-gray-50">Batal</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-full font-semibold">Hapus</button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h3 className="font-bold text-lg">{editingPkg ? 'Edit Paket' : 'Tambah Paket Baru'}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><FiX size={20} /></button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Judul Paket *</label>
                  <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="Sailing Komodo Labuan Bajo" className="form-input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi *</label>
                  <input type="text" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} placeholder="Nusa Tenggara Timur" className="form-input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Durasi</label>
                  <input type="text" value={formData.duration} onChange={(e) => setFormData({...formData, duration: e.target.value})} placeholder="3 Hari 2 Malam" className="form-input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Harga (Rp) *</label>
                  <input type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} placeholder="2750000" className="form-input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Harga Asli (Rp)</label>
                  <input type="number" value={formData.originalPrice} onChange={(e) => setFormData({...formData, originalPrice: e.target.value})} placeholder="3200000" className="form-input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipe</label>
                  <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="form-input">
                    <option>Open Trip</option>
                    <option>Private Trip</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                  <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="form-input">
                    {['bahari', 'gunung', 'budaya', 'mancanegara', 'adventure', 'fotografi'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Peserta</label>
                  <input type="number" value={formData.minPersons} onChange={(e) => setFormData({...formData, minPersons: e.target.value})} className="form-input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Peserta</label>
                  <input type="number" value={formData.maxPersons} onChange={(e) => setFormData({...formData, maxPersons: e.target.value})} className="form-input" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Foto Utama</label>
                  <div className="flex gap-3 items-start">
                    <div>
                      <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="hidden" id="img-upload" />
                      <label htmlFor="img-upload" className="flex items-center gap-2 border-2 border-dashed border-gray-300 rounded-xl px-4 py-3 cursor-pointer hover:border-primary-400 text-sm text-gray-500">
                        <FiImage /> Upload Foto
                      </label>
                    </div>
                    <div className="flex-1">
                      <input type="text" value={formData.image} onChange={(e) => setFormData({...formData, image: e.target.value})} placeholder="Atau masukkan URL gambar" className="form-input text-sm" />
                    </div>
                  </div>
                  {(formData.image || imageFile) && (
                    <img src={imageFile ? URL.createObjectURL(imageFile) : formData.image} alt="" className="mt-2 w-32 h-20 object-cover rounded-lg" />
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={3} className="form-input" placeholder="Deskripsi lengkap paket wisata..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Highlights (satu per baris)</label>
                  <textarea value={formData.highlights} onChange={(e) => setFormData({...formData, highlights: e.target.value})} rows={4} className="form-input text-sm" placeholder="Bertemu komodo di habitat aslinya&#10;Snorkeling di Pink Beach&#10;Sunset di Padar Island" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sudah Termasuk (satu per baris)</label>
                  <textarea value={formData.includes} onChange={(e) => setFormData({...formData, includes: e.target.value})} rows={4} className="form-input text-sm" placeholder="Kapal kayu selama 2 malam&#10;Makan 3x sehari&#10;Guide berpengalaman" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Belum Termasuk (satu per baris)</label>
                  <textarea value={formData.excludes} onChange={(e) => setFormData({...formData, excludes: e.target.value})} rows={4} className="form-input text-sm" placeholder="Tiket pesawat PP&#10;Penginapan di Labuan Bajo&#10;Tip guide" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Tersedia (satu per baris, format: YYYY-MM-DD)</label>
                  <textarea value={formData.availableDates} onChange={(e) => setFormData({...formData, availableDates: e.target.value})} rows={4} className="form-input text-sm font-mono" placeholder="2026-04-10&#10;2026-04-17&#10;2026-04-24" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Point</label>
                  <input type="text" value={formData.meetingPoint} onChange={(e) => setFormData({...formData, meetingPoint: e.target.value})} className="form-input text-sm" placeholder="Pelabuhan Labuan Bajo" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
                  <input type="text" value={formData.whatsappNumber} onChange={(e) => setFormData({...formData, whatsappNumber: e.target.value})} className="form-input text-sm" placeholder="6281234567890" />
                </div>
                <div className="md:col-span-2 flex items-center gap-3">
                  <input type="checkbox" id="featured" checked={formData.featured} onChange={(e) => setFormData({...formData, featured: e.target.checked})} className="w-4 h-4 text-primary-500" />
                  <label htmlFor="featured" className="text-sm font-medium text-gray-700">Tampilkan di Halaman Utama (Featured)</label>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex gap-3 rounded-b-2xl">
              <button onClick={() => setShowModal(false)} className="flex-1 py-3 border-2 border-gray-200 rounded-full font-semibold hover:bg-gray-50">Batal</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-full font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
                {saving ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" /> : <><FiSave size={18} /> Simpan</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
