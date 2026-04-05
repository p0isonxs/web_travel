import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { updatePassword, updateProfile, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth'
import { auth } from '../../firebase/config'
import { FiSave, FiUser, FiLock, FiGlobe, FiPhone, FiMail, FiMapPin } from 'react-icons/fi'

export default function AdminSettings() {
  const { currentUser } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const [profileForm, setProfileForm] = useState({
    displayName: currentUser?.displayName || '',
    email: currentUser?.email || '',
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [siteSettings, setSiteSettings] = useState({
    siteName: 'NusaTrip',
    siteTagline: 'Platform Wisata Terbaik Indonesia',
    siteEmail: 'info@nusatrip.com',
    sitePhone: '+62 812-3456-7890',
    siteWhatsapp: '6281234567890',
    siteAddress: 'Jl. Wisata Nusantara No. 123, Jakarta Selatan',
    instagramUrl: 'https://instagram.com/nusatrip',
    facebookUrl: 'https://facebook.com/nusatrip',
    youtubeUrl: 'https://youtube.com/@nusatrip',
    tiktokUrl: 'https://tiktok.com/@nusatrip',
    midtransClientKey: 'SB-Mid-client-xxxxxxxxxxxxxxxx',
    midtransServerKey: 'SB-Mid-server-xxxxxxxxxxxxxxxx',
    midtransSandbox: true,
  })

  const showSuccess = (msg) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 3000) }
  const showError = (msg) => { setErrorMsg(msg); setTimeout(() => setErrorMsg(''), 3000) }

  const handleProfileSave = async () => {
    setSaving(true)
    try {
      await updateProfile(auth.currentUser, { displayName: profileForm.displayName })
      showSuccess('Profil berhasil diperbarui!')
    } catch (err) {
      showError('Gagal memperbarui profil: ' + err.message)
    }
    setSaving(false)
  }

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showError('Password baru tidak cocok!')
      return
    }
    if (passwordForm.newPassword.length < 6) {
      showError('Password minimal 6 karakter!')
      return
    }
    setSaving(true)
    try {
      const credential = EmailAuthProvider.credential(currentUser.email, passwordForm.currentPassword)
      await reauthenticateWithCredential(auth.currentUser, credential)
      await updatePassword(auth.currentUser, passwordForm.newPassword)
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      showSuccess('Password berhasil diubah!')
    } catch (err) {
      showError('Gagal mengubah password: ' + err.message)
    }
    setSaving(false)
  }

  const handleSiteSettingsSave = () => {
    // In production: save to Firestore or env config
    showSuccess('Pengaturan website berhasil disimpan!')
  }

  const tabs = [
    { id: 'profile', label: 'Profil Admin', icon: FiUser },
    { id: 'password', label: 'Ubah Password', icon: FiLock },
    { id: 'site', label: 'Pengaturan Website', icon: FiGlobe },
    { id: 'payment', label: 'Konfigurasi Pembayaran', icon: FiPhone },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Pengaturan</h2>
        <p className="text-gray-500 text-sm">Kelola konfigurasi admin dan website</p>
      </div>

      {successMsg && <div className="bg-green-50 border border-green-200 text-green-600 rounded-xl px-4 py-3">{successMsg}</div>}
      {errorMsg && <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3">{errorMsg}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="bg-white rounded-2xl shadow-sm p-3 h-fit">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)} className={"w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors " + (activeTab === id ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50')}>
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeTab === 'profile' && (
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-bold text-lg mb-5">Profil Admin</h3>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
                  <FiUser className="text-primary-500" size={36} />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{currentUser?.displayName || 'Admin'}</p>
                  <p className="text-gray-400 text-sm">{currentUser?.email}</p>
                  <p className="text-xs text-green-500 mt-1">● Admin verified</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nama Tampilan</label>
                  <input type="text" value={profileForm.displayName} onChange={e=>setProfileForm({...profileForm,displayName:e.target.value})} className="form-input" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input type="email" value={profileForm.email} disabled className="form-input bg-gray-50 text-gray-400 cursor-not-allowed" />
                  <p className="text-xs text-gray-400 mt-1">Email tidak dapat diubah</p>
                </div>
                <button onClick={handleProfileSave} disabled={saving} className="btn-primary flex items-center gap-2">
                  <FiSave size={16}/> Simpan Profil
                </button>
              </div>
            </div>
          )}

          {activeTab === 'password' && (
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-bold text-lg mb-5">Ubah Password</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Password Saat Ini</label>
                  <input type="password" value={passwordForm.currentPassword} onChange={e=>setPasswordForm({...passwordForm,currentPassword:e.target.value})} className="form-input" placeholder="••••••••"/>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Password Baru</label>
                  <input type="password" value={passwordForm.newPassword} onChange={e=>setPasswordForm({...passwordForm,newPassword:e.target.value})} className="form-input" placeholder="Minimal 6 karakter"/>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Konfirmasi Password Baru</label>
                  <input type="password" value={passwordForm.confirmPassword} onChange={e=>setPasswordForm({...passwordForm,confirmPassword:e.target.value})} className="form-input" placeholder="Ulangi password baru"/>
                </div>
                <button onClick={handlePasswordChange} disabled={saving} className="btn-primary flex items-center gap-2">
                  <FiLock size={16}/> Ubah Password
                </button>
              </div>
            </div>
          )}

          {activeTab === 'site' && (
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-bold text-lg mb-5">Pengaturan Website</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nama Website</label>
                    <input type="text" value={siteSettings.siteName} onChange={e=>setSiteSettings({...siteSettings,siteName:e.target.value})} className="form-input"/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Tagline</label>
                    <input type="text" value={siteSettings.siteTagline} onChange={e=>setSiteSettings({...siteSettings,siteTagline:e.target.value})} className="form-input"/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email Kontak</label>
                    <input type="email" value={siteSettings.siteEmail} onChange={e=>setSiteSettings({...siteSettings,siteEmail:e.target.value})} className="form-input"/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">No. Telepon</label>
                    <input type="text" value={siteSettings.sitePhone} onChange={e=>setSiteSettings({...siteSettings,sitePhone:e.target.value})} className="form-input"/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">No. WhatsApp</label>
                    <input type="text" value={siteSettings.siteWhatsapp} onChange={e=>setSiteSettings({...siteSettings,siteWhatsapp:e.target.value})} className="form-input"/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Instagram URL</label>
                    <input type="text" value={siteSettings.instagramUrl} onChange={e=>setSiteSettings({...siteSettings,instagramUrl:e.target.value})} className="form-input"/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Facebook URL</label>
                    <input type="text" value={siteSettings.facebookUrl} onChange={e=>setSiteSettings({...siteSettings,facebookUrl:e.target.value})} className="form-input"/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">TikTok URL</label>
                    <input type="text" value={siteSettings.tiktokUrl} onChange={e=>setSiteSettings({...siteSettings,tiktokUrl:e.target.value})} className="form-input"/>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Alamat Kantor</label>
                  <textarea value={siteSettings.siteAddress} onChange={e=>setSiteSettings({...siteSettings,siteAddress:e.target.value})} rows={2} className="form-input"/>
                </div>
                <button onClick={handleSiteSettingsSave} className="btn-primary flex items-center gap-2">
                  <FiSave size={16}/> Simpan Pengaturan
                </button>
              </div>
            </div>
          )}

          {activeTab === 'payment' && (
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-bold text-lg mb-2">Konfigurasi Midtrans</h3>
              <p className="text-gray-500 text-sm mb-5">Atur kunci API Midtrans untuk proses pembayaran online</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Client Key</label>
                  <input type="text" value={siteSettings.midtransClientKey} onChange={e=>setSiteSettings({...siteSettings,midtransClientKey:e.target.value})} className="form-input font-mono text-sm"/>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Server Key (RAHASIA - jangan share)</label>
                  <input type="password" value={siteSettings.midtransServerKey} onChange={e=>setSiteSettings({...siteSettings,midtransServerKey:e.target.value})} className="form-input font-mono text-sm"/>
                </div>
                <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-xl">
                  <input type="checkbox" id="sandbox" checked={siteSettings.midtransSandbox} onChange={e=>setSiteSettings({...siteSettings,midtransSandbox:e.target.checked})} className="w-4 h-4"/>
                  <label htmlFor="sandbox" className="text-sm text-yellow-700 cursor-pointer"><strong>Mode Sandbox</strong> - Aktifkan untuk testing, nonaktifkan untuk production</label>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-700">
                  <p className="font-semibold mb-1">Cara mendapatkan API key Midtrans:</p>
                  <ol className="list-decimal ml-4 space-y-1">
                    <li>Daftar/login ke dashboard.midtrans.com</li>
                    <li>Pilih Settings → Access Keys</li>
                    <li>Copy Client Key dan Server Key</li>
                    <li>Untuk production, ubah ke mode Live di Midtrans dashboard</li>
                  </ol>
                </div>
                <button onClick={handleSiteSettingsSave} className="btn-primary flex items-center gap-2">
                  <FiSave size={16}/> Simpan Konfigurasi
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
