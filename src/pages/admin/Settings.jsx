import { useState, useEffect } from 'react';
import { getSettings, updateSettings } from '../../lib/database';
import { uploadToCloudinary } from '../../utils/cloudinary';
import { Save, RefreshCw, Upload, X } from 'lucide-react';
import { toast } from 'react-toastify';

const defaultSettings = {
    heroBackground: '',
    privateTripBackground: '',
    testimonialBackground: '',
    siteName: 'Liburan Terus',
    tagline: 'Jelajahi Keindahan Indonesia Bersama Kami',
    phone: '6281234567890',
    email: 'info@liburanterus.com',
    address: 'Jl. Wisata Indah No. 123, Jakarta Selatan',
    instagram: 'https://instagram.com/liburanterus',
    facebook: 'https://facebook.com/liburanterus',
    youtube: '',
    tiktok: '',
    bankName: 'BCA',
    bankAccount: '1234567890',
    bankAccountName: 'PT Liburan Terus Indonesia',
    midtransClientKey: '',
    midtransServerKey: '',
    metaDescription: 'Liburan Terus menyediakan paket wisata open trip dan private trip terbaik ke berbagai destinasi indah di Indonesia.',
    metaKeywords: 'wisata indonesia, open trip, private trip, paket wisata, liburan terus',
};

function ImageUploadField({ label, value, settingKey, onUploaded }) {
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Ukuran file maksimal 5MB'); return; }
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file, 'backgrounds');
      onUploaded(settingKey, url);
      toast.success('Gambar berhasil diupload!');
    } catch (err) { toast.error('Gagal upload: ' + (err.message || err)); }
    setUploading(false);
  };

  return (
    <div className="md:col-span-2">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex gap-4 items-start">
        {value ? (
          <div className="relative shrink-0">
            <img src={value} alt={label} className="w-40 h-24 object-cover rounded-xl border border-gray-200" />
            <button type="button" onClick={() => onUploaded(settingKey, '')}
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
            {uploading ? <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" /> : <Upload className="w-4 h-4" />}
            <span>{uploading ? 'Mengupload...' : 'Upload Foto'}</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading} />
          </label>
          <p className="text-xs text-gray-400 mt-2">JPG/PNG/WebP, maks 5MB. Rekomendasi: 1920×1080px</p>
        </div>
      </div>
    </div>
  );
}

export default function AdminSettings() {
    const [settings, setSettings] = useState(defaultSettings);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
        setLoading(true);
        try {
                const data = await getSettings();
                if (data && Object.keys(data).length > 0) setSettings({ ...defaultSettings, ...data });
        } catch (e) { console.error(e); }
        setLoading(false);
  };

  const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
                await updateSettings(settings);
                toast.success('Pengaturan berhasil disimpan!');
        } catch (e) { toast.error('Gagal menyimpan: ' + e.message); }
        setSaving(false);
  };

  const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500';
    const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

  const Section = ({ title, children }) => (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                      <h2 className="font-semibold text-gray-900">{title}</h2>
              </div>
              <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">{children}</div>
              </div>
        </div>
      );
  
    if (loading) return <div className="text-center py-16 text-gray-400">Memuat pengaturan...</div>;
  
    return (
          <div className="space-y-6">
                <div className="flex items-center justify-between">
                        <div>
                                  <h1 className="text-2xl font-bold text-gray-900">Pengaturan Website</h1>
                                  <p className="text-gray-500 text-sm">Kelola informasi dan konfigurasi website</p>
                        </div>
                        <button onClick={fetchSettings} className="flex items-center gap-2 text-gray-600 border border-gray-300 px-3 py-2 rounded-xl hover:bg-gray-50 text-sm">
                                  <RefreshCw className="w-4 h-4" /> Refresh
                        </button>
                </div>
          
                <form onSubmit={handleSave} className="space-y-6">
                        <Section title="Informasi Umum">
                                  <div>
                                              <label className={labelClass}>Nama Website</label>
                                              <input value={settings.siteName} onChange={e => setSettings({...settings, siteName: e.target.value})} className={inputClass} />
                                  </div>
                                  <div>
                                              <label className={labelClass}>Tagline</label>
                                              <input value={settings.tagline} onChange={e => setSettings({...settings, tagline: e.target.value})} className={inputClass} />
                                  </div>
                                  <div className="md:col-span-2">
                                              <label className={labelClass}>Alamat</label>
                                              <input value={settings.address} onChange={e => setSettings({...settings, address: e.target.value})} className={inputClass} />
                                  </div>
                                  <div>
                                              <label className={labelClass}>No. WhatsApp (tanpa +)</label>
                                              <input value={settings.phone} onChange={e => setSettings({...settings, phone: e.target.value})} className={inputClass} placeholder="6281234567890" />
                                  </div>
                                  <div>
                                              <label className={labelClass}>Email</label>
                                              <input type="email" value={settings.email} onChange={e => setSettings({...settings, email: e.target.value})} className={inputClass} />
                                  </div>
                        </Section>
                
                        <Section title="Media Sosial">
                                  <div>
                                              <label className={labelClass}>Instagram URL</label>
                                              <input type="url" value={settings.instagram} onChange={e => setSettings({...settings, instagram: e.target.value})} className={inputClass} placeholder="https://instagram.com/..." />
                                  </div>
                                  <div>
                                              <label className={labelClass}>Facebook URL</label>
                                              <input type="url" value={settings.facebook} onChange={e => setSettings({...settings, facebook: e.target.value})} className={inputClass} placeholder="https://facebook.com/..." />
                                  </div>
                                  <div>
                                              <label className={labelClass}>YouTube URL</label>
                                              <input type="url" value={settings.youtube} onChange={e => setSettings({...settings, youtube: e.target.value})} className={inputClass} placeholder="https://youtube.com/..." />
                                  </div>
                                  <div>
                                              <label className={labelClass}>TikTok URL</label>
                                              <input type="url" value={settings.tiktok} onChange={e => setSettings({...settings, tiktok: e.target.value})} className={inputClass} placeholder="https://tiktok.com/@..." />
                                  </div>
                        </Section>
                
                        <Section title="Rekening Bank (Transfer Manual)">
                                  <div>
                                              <label className={labelClass}>Nama Bank</label>
                                              <input value={settings.bankName} onChange={e => setSettings({...settings, bankName: e.target.value})} className={inputClass} placeholder="BCA, BRI, Mandiri..." />
                                  </div>
                                  <div>
                                              <label className={labelClass}>Nomor Rekening</label>
                                              <input value={settings.bankAccount} onChange={e => setSettings({...settings, bankAccount: e.target.value})} className={inputClass} />
                                  </div>
                                  <div className="md:col-span-2">
                                              <label className={labelClass}>Atas Nama</label>
                                              <input value={settings.bankAccountName} onChange={e => setSettings({...settings, bankAccountName: e.target.value})} className={inputClass} />
                                  </div>
                        </Section>
                
                        <Section title="Midtrans Payment Gateway">
                                  <div>
                                              <label className={labelClass}>Client Key</label>
                                              <input value={settings.midtransClientKey} onChange={e => setSettings({...settings, midtransClientKey: e.target.value})} className={inputClass} placeholder="SB-Mid-client-..." />
                                  </div>
                                  <div>
                                              <label className={labelClass}>Server Key</label>
                                              <input type="password" value={settings.midtransServerKey} onChange={e => setSettings({...settings, midtransServerKey: e.target.value})} className={inputClass} placeholder="SB-Mid-server-..." />
                                  </div>
                                  <div className="md:col-span-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-700">
                                              ⚠️ Server Key sebaiknya disimpan hanya di backend/environment variables, bukan di Firestore. Gunakan ini hanya untuk referensi admin.
                                  </div>
                        </Section>
                
                        <Section title="Background Halaman">
                                  <ImageUploadField
                                    label="Background Hero"
                                    value={settings.heroBackground}
                                    settingKey="heroBackground"
                                    onUploaded={(key, url) => setSettings({ ...settings, [key]: url })}
                                  />
                                  <ImageUploadField
                                    label="Background Section Private Trip"
                                    value={settings.privateTripBackground}
                                    settingKey="privateTripBackground"
                                    onUploaded={(key, url) => setSettings({ ...settings, [key]: url })}
                                  />
                                  <ImageUploadField
                                    label="Background Section Testimoni"
                                    value={settings.testimonialBackground}
                                    settingKey="testimonialBackground"
                                    onUploaded={(key, url) => setSettings({ ...settings, [key]: url })}
                                  />
                        </Section>

                        <Section title="SEO Meta Tags">
                                  <div className="md:col-span-2">
                                              <label className={labelClass}>Meta Description</label>
                                              <textarea rows={2} value={settings.metaDescription} onChange={e => setSettings({...settings, metaDescription: e.target.value})} className={inputClass} />
                                  </div>
                                  <div className="md:col-span-2">
                                              <label className={labelClass}>Meta Keywords (pisahkan koma)</label>
                                              <input value={settings.metaKeywords} onChange={e => setSettings({...settings, metaKeywords: e.target.value})} className={inputClass} />
                                  </div>
                        </Section>
                
                        <div className="flex justify-end">
                                  <button type="submit" disabled={saving} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold px-8 py-3 rounded-xl transition-colors text-lg">
                                    {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
                                    {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
                                  </button>
                        </div>
                </form>
          </div>
        );
}
