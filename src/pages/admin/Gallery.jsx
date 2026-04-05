import { useState, useEffect } from 'react'
import { collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '../../firebase/config'
import { FiPlus, FiTrash2, FiUpload, FiX, FiImage } from 'react-icons/fi'

export default function AdminGallery() {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [formData, setFormData] = useState({ imageUrl: '', caption: '', destination: '', type: 'photo' })
  const [imageFile, setImageFile] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const dummyImages = [
    { id: '1', imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400', caption: 'Komodo Island', destination: 'NTT', type: 'photo' },
    { id: '2', imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', caption: 'Raja Ampat', destination: 'Papua', type: 'photo' },
    { id: '3', imageUrl: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=400', caption: 'Bali Temple', destination: 'Bali', type: 'photo' },
    { id: '4', imageUrl: 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?w=400', caption: 'Bromo Sunrise', destination: 'Jawa Timur', type: 'photo' },
    { id: '5', imageUrl: 'https://images.unsplash.com/photo-1559827291-72ee739d0d9a?w=400', caption: 'Wakatobi Diving', destination: 'Sulawesi', type: 'photo' },
    { id: '6', imageUrl: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400', caption: 'Derawan Beach', destination: 'Kalimantan', type: 'photo' },
  ]

  useEffect(() => {
    const fetch = async () => {
      try {
        const snap = await getDocs(collection(db, 'gallery'))
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        setImages(data.length > 0 ? data : dummyImages)
      } catch { setImages(dummyImages) }
      setLoading(false)
    }
    fetch()
  }, [])

  const handleAdd = async () => {
    setUploading(true)
    try {
      let url = formData.imageUrl
      if (imageFile) {
        const sRef = ref(storage, "gallery/" + Date.now() + "_" + imageFile.name)
        const snap = await uploadBytes(sRef, imageFile)
        url = await getDownloadURL(snap.ref)
      }
      const data = { ...formData, imageUrl: url, createdAt: serverTimestamp() }
      await addDoc(collection(db, 'gallery'), data)
      setImages(prev => [...prev, { id: 'new_'+Date.now(), ...data }])
    } catch {
      setImages(prev => [...prev, { id: 'new_'+Date.now(), ...formData, imageUrl: imageFile ? URL.createObjectURL(imageFile) : formData.imageUrl }])
    }
    setShowAddModal(false)
    setImageFile(null)
    setFormData({ imageUrl: '', caption: '', destination: '', type: 'photo' })
    setUploading(false)
  }

  const handleDelete = async (id) => {
    try {
      if (!id.match(/^[0-9]+$/) && !id.startsWith('new_')) await deleteDoc(doc(db, 'gallery', id))
      setImages(prev => prev.filter(i => i.id !== id))
    } catch { setImages(prev => prev.filter(i => i.id !== id)) }
    setDeleteConfirm(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Kelola Galeri</h2>
          <p className="text-gray-500 text-sm">{images.length} foto/video</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center gap-2 text-sm"><FiPlus size={16}/> Tambah Foto</button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="bg-gray-200 animate-pulse rounded-2xl h-48"/>)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map(img => (
            <div key={img.id} className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <img src={img.imageUrl} alt={img.caption} className="w-full h-48 object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                <p className="text-white text-sm font-medium text-center px-2">{img.caption}</p>
                <p className="text-white/70 text-xs">{img.destination}</p>
                <button onClick={()=>setDeleteConfirm(img.id)} className="mt-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors">
                  <FiTrash2 size={16}/>
                </button>
              </div>
            </div>
          ))}
          <button onClick={()=>setShowAddModal(true)} className="border-2 border-dashed border-gray-300 rounded-2xl h-48 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-primary-400 hover:text-primary-500 transition-colors">
            <FiImage size={32}/>
            <span className="text-sm">Tambah Foto</span>
          </button>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><FiTrash2 className="text-red-500" size={28}/></div>
            <h3 className="text-lg font-bold mb-2">Hapus Foto?</h3>
            <div className="flex gap-3 mt-4">
              <button onClick={()=>setDeleteConfirm(null)} className="flex-1 py-3 border-2 border-gray-200 rounded-full font-semibold">Batal</button>
              <button onClick={()=>handleDelete(deleteConfirm)} className="flex-1 py-3 bg-red-500 text-white rounded-full font-semibold">Hapus</button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="font-bold text-lg">Tambah Foto</h3>
              <button onClick={()=>setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><FiX size={20}/></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Upload Foto</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                  <input type="file" accept="image/*,video/*" onChange={e=>setImageFile(e.target.files[0])} className="hidden" id="gallery-upload"/>
                  <label htmlFor="gallery-upload" className="cursor-pointer flex flex-col items-center gap-2 text-gray-400 hover:text-primary-500">
                    <FiUpload size={32}/>
                    <span className="text-sm">{imageFile ? imageFile.name : 'Klik untuk upload foto/video'}</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Atau URL Gambar</label>
                <input type="text" value={formData.imageUrl} onChange={e=>setFormData({...formData,imageUrl:e.target.value})} className="form-input" placeholder="https://..."/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Caption</label>
                  <input type="text" value={formData.caption} onChange={e=>setFormData({...formData,caption:e.target.value})} className="form-input text-sm" placeholder="Deskripsi foto"/>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Destinasi</label>
                  <input type="text" value={formData.destination} onChange={e=>setFormData({...formData,destination:e.target.value})} className="form-input text-sm" placeholder="Raja Ampat"/>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t flex gap-3">
              <button onClick={()=>setShowAddModal(false)} className="flex-1 py-3 border-2 border-gray-200 rounded-full font-semibold">Batal</button>
              <button onClick={handleAdd} disabled={uploading} className="flex-1 py-3 bg-primary-500 text-white rounded-full font-semibold flex items-center justify-center gap-2">
                {uploading ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"/> : <><FiUpload size={18}/> Upload</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
