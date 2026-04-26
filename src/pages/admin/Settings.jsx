import { useState, useEffect } from 'react';
import { getSettings, updateSettings } from '../../lib/database';
import { uploadToCloudinary } from '../../utils/cloudinary';
import { Save, RefreshCw, Upload, X, ShieldCheck, Globe2, Landmark, AlertTriangle, Phone, Mail, MapPin, Undo2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { SITE_NAME } from '../../lib/siteConfig';
import { useSettings } from '../../contexts/SettingsContext';

const defaultSettings = {
    heroBackground: '',
    privateTripBackground: '',
    testimonialBackground: '',
    ogImage: '',
    siteName: SITE_NAME,
    metaTitle: '',
    tagline: 'Jelajahi Keindahan Indonesia Bersama Kami',
    brandLogo: '',
    favicon: '',
    phone: '',
    email: '',
    address: '',
    instagram: '',
    facebook: '',
    youtube: '',
    tiktok: '',
    bankName: '',
    bankAccount: '',
    bankAccountName: '',
    metaDescription: '',
    metaKeywords: 'wisata indonesia, open trip, private trip, paket wisata',
};

const SOCIAL_LABELS = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  youtube: 'YouTube',
  tiktok: 'TikTok',
};

const PHONE_REGEX = /^[0-9]{9,16}$/;
const urlFields = ['instagram', 'facebook', 'youtube', 'tiktok'];

function normalizeSettingsInput(settings) {
  return {
    ...settings,
    phone: String(settings.phone || '').replace(/[^\d]/g, ''),
    siteName: String(settings.siteName || '').trim(),
    metaTitle: String(settings.metaTitle || '').trim(),
    tagline: String(settings.tagline || '').trim(),
    brandLogo: String(settings.brandLogo || '').trim(),
    favicon: String(settings.favicon || '').trim(),
    email: String(settings.email || '').trim(),
    address: String(settings.address || '').trim(),
    bankName: String(settings.bankName || '').trim(),
    bankAccount: String(settings.bankAccount || '').replace(/\s+/g, ''),
    bankAccountName: String(settings.bankAccountName || '').trim(),
    metaDescription: String(settings.metaDescription || '').trim(),
    metaKeywords: String(settings.metaKeywords || '').trim(),
    instagram: String(settings.instagram || '').trim(),
    facebook: String(settings.facebook || '').trim(),
    youtube: String(settings.youtube || '').trim(),
    tiktok: String(settings.tiktok || '').trim(),
  };
}

function isValidUrl(value) {
  if (!value) return true;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function ImageUploadField({ label, value, settingKey, onUploaded, folder = 'backgrounds', hint }) {
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Ukuran file maksimal 5MB'); return; }
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file, folder);
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
          <p className="text-xs text-gray-400 mt-2">{hint || 'JPG/PNG/WebP, maks 5MB. Rekomendasi: 1920×1080px'}</p>
        </div>
      </div>
    </div>
  );
}

export default function AdminSettings() {
    const [settings, setSettings] = useState(defaultSettings);
    const [savedSettings, setSavedSettings] = useState(defaultSettings);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { applySettings } = useSettings();

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
        setLoading(true);
        try {
                const data = await getSettings();
                if (data && Object.keys(data).length > 0) {
                  const normalized = normalizeSettingsInput({ ...defaultSettings, ...data });
                  setSettings(normalized);
                  setSavedSettings(normalized);
                } else {
                  const fallback = normalizeSettingsInput(defaultSettings);
                  setSettings(fallback);
                  setSavedSettings(fallback);
                }
        } catch (e) { console.error(e); }
        setLoading(false);
  };

  const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
                const normalized = normalizeSettingsInput(settings);
                if (!normalized.siteName) throw new Error('Nama website wajib diisi');
                if (!normalized.phone || !PHONE_REGEX.test(normalized.phone)) throw new Error('Nomor WhatsApp harus berupa 9-16 digit angka');
                if (normalized.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized.email)) throw new Error('Format email belum valid');
                for (const field of urlFields) {
                  if (!isValidUrl(normalized[field])) {
                    throw new Error(`URL ${SOCIAL_LABELS[field]} belum valid`);
                  }
                }
                await updateSettings(normalized);
                applySettings(normalized);
                setSettings(normalized);
                setSavedSettings(normalized);
                toast.success('Pengaturan berhasil disimpan!');
        } catch (e) { toast.error('Gagal menyimpan: ' + e.message); }
        setSaving(false);
  };

  const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500';
    const labelClass = 'block text-sm font-medium text-gray-700 mb-1';
    const isDirty = JSON.stringify(settings) !== JSON.stringify(savedSettings);
    const publicChecks = [
      { label: 'Brand name dan meta title sudah terisi', done: Boolean(settings.siteName && settings.metaTitle) },
      { label: 'Logo dan favicon brand sudah terpasang', done: Boolean(settings.brandLogo && settings.favicon) },
      { label: 'Kontak utama siap tampil', done: Boolean(settings.phone && settings.email) },
      { label: 'Rekening transfer sudah lengkap', done: Boolean(settings.bankName && settings.bankAccount && settings.bankAccountName) },
      { label: 'SEO dasar homepage tersedia', done: Boolean(settings.metaDescription && settings.metaKeywords) },
      { label: 'Hero background sudah terpasang', done: Boolean(settings.heroBackground) },
    ];
    const statCards = [
      { label: 'Nama brand', value: settings.siteName || '-', icon: Globe2, tone: 'emerald' },
      { label: 'WhatsApp publik', value: settings.phone ? `+${settings.phone}` : '-', icon: Phone, tone: 'blue' },
      { label: 'Email publik', value: settings.email || '-', icon: Mail, tone: 'blue' },
      { label: 'Bank transfer', value: settings.bankName || '-', icon: Landmark, tone: 'amber' },
      { label: 'Favicon', value: settings.favicon ? 'Siap' : 'Kosong', icon: MapPin, tone: 'rose' },
    ];
    const toneClasses = {
      emerald: 'bg-emerald-50 text-emerald-600',
      blue: 'bg-blue-50 text-blue-600',
      amber: 'bg-amber-50 text-amber-600',
      rose: 'bg-rose-50 text-rose-600',
    };

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
                                  <p className="text-gray-500 text-sm">Kelola informasi publik, pembayaran manual, dan aset visual website</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {isDirty && (
                            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                              Ada perubahan belum disimpan
                            </span>
                          )}
                          <button onClick={fetchSettings} type="button" className="flex items-center gap-2 text-gray-600 border border-gray-300 px-3 py-2 rounded-xl hover:bg-gray-50 text-sm">
                                    <RefreshCw className="w-4 h-4" /> Refresh
                          </button>
                        </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {statCards.map(({ label, value, icon: Icon, tone }) => (
                    <div key={label} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                      <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-2xl ${toneClasses[tone]}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <p className="text-sm text-gray-500">{label}</p>
                      <p className="mt-1 text-sm font-semibold text-gray-900 break-words">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
                  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900">
                      <Globe2 className="w-4 h-4 text-emerald-600" />
                      Ringkasan Tampilan Publik
                    </p>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Brand</p>
                        <p className="mt-2 text-lg font-bold text-gray-900">{settings.siteName || '-'}</p>
                        <p className="mt-1 text-sm text-gray-600">{settings.tagline || 'Tagline belum diisi'}</p>
                        <p className="mt-2 text-xs text-gray-500">Meta title: {settings.metaTitle || 'Belum diisi'}</p>
                      </div>
                      <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Aset Brand</p>
                        <p className="mt-2 text-lg font-bold text-gray-900">{settings.brandLogo ? 'Logo siap' : 'Logo belum ada'}</p>
                        <p className="mt-1 text-sm text-gray-600">{settings.favicon ? 'Favicon siap dipakai' : 'Favicon belum ada'}</p>
                        <p className="text-sm text-gray-600">{settings.ogImage ? 'OG image siap dibagikan' : 'OG image belum ada'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 shadow-sm">
                    <p className="mb-4 flex items-center gap-2 text-sm font-semibold text-emerald-900">
                      <ShieldCheck className="w-4 h-4" />
                      Checklist Aman Dipakai
                    </p>
                    <div className="space-y-3 text-sm text-emerald-900">
                      {publicChecks.map((item) => (
                        <div key={item.label} className="flex items-start gap-2">
                          <span className={`mt-1 h-2.5 w-2.5 rounded-full ${item.done ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                          <span>{item.label}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                      <p className="font-semibold">Guardrail penting</p>
                      <p className="mt-1">Server key Midtrans tetap harus disimpan di environment deployment, bukan di form admin.</p>
                    </div>
                  </div>
                </div>
          
                <form onSubmit={handleSave} className="space-y-6">
                        <Section title="Informasi Umum">
                                  <div>
                                              <label className={labelClass}>Nama Website</label>
                                              <input value={settings.siteName} onChange={e => setSettings({...settings, siteName: e.target.value})} className={inputClass} />
                                  </div>
                                  <div>
                                              <label className={labelClass}>Meta Title Global</label>
                                              <input value={settings.metaTitle} onChange={e => setSettings({...settings, metaTitle: e.target.value})} className={inputClass} placeholder="Vakansi Trip - Paket Open Trip & Private Trip" maxLength={70} />
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

                        <Section title="Branding Website">
                                  <ImageUploadField
                                    label="Logo Brand"
                                    value={settings.brandLogo}
                                    settingKey="brandLogo"
                                    folder="branding"
                                    hint="PNG/WebP transparan disarankan. Logo ini tampil di navbar, footer, dan login admin."
                                    onUploaded={(key, url) => setSettings({ ...settings, [key]: url })}
                                  />
                                  <ImageUploadField
                                    label="Favicon"
                                    value={settings.favicon}
                                    settingKey="favicon"
                                    folder="branding"
                                    hint="PNG square 256×256 atau 512×512 disarankan. Ikon ini tampil di tab browser."
                                    onUploaded={(key, url) => setSettings({ ...settings, [key]: url })}
                                  />
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
                                  <div className="md:col-span-2 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 space-y-2">
                                              <p className="font-semibold">Secret Midtrans tidak disimpan di database.</p>
                                              <p>
                                                Simpan `MIDTRANS_SERVER_KEY`, `MIDTRANS_ENV`, `SUPABASE_URL`, dan `SUPABASE_SERVICE_ROLE_KEY`
                                                di environment variable deployment agar payment diproses aman dari backend.
                                              </p>
                                              <p className="flex items-start gap-2 rounded-xl border border-amber-200 bg-white/80 p-3 text-amber-900">
                                                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                                                Jangan pernah menaruh server key ke kolom teks admin atau konten website.
                                              </p>
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
                                  <div className="md:col-span-2 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-900">
                                    <p className="font-semibold">Rebrand cepat ke Vakansi Trip</p>
                                    <p className="mt-1">Isi Nama Website dan Meta Title Global dengan brand baru Anda. Perubahan ini akan dipakai di tampilan publik, admin, dan metadata dasar website.</p>
                                  </div>
                                  <div className="md:col-span-2">
                                              <label className={labelClass}>Meta Description</label>
                                              <textarea rows={2} value={settings.metaDescription} onChange={e => setSettings({...settings, metaDescription: e.target.value})} className={inputClass} />
                                  </div>
                                  <div className="md:col-span-2">
                                              <label className={labelClass}>Meta Keywords (pisahkan koma)</label>
                                              <input value={settings.metaKeywords} onChange={e => setSettings({...settings, metaKeywords: e.target.value})} className={inputClass} />
                                  </div>
                                  <ImageUploadField
                                    label="Gambar Thumbnail Share (OG Image)"
                                    value={settings.ogImage}
                                    settingKey="ogImage"
                                    folder="og"
                                    hint="JPG/PNG, maks 5MB. Wajib 1200×630px. Muncul saat link dibagikan di WhatsApp, Telegram, Discord, Twitter, dll."
                                    onUploaded={(key, url) => setSettings({ ...settings, [key]: url })}
                                  />
                        </Section>
                
                        <div className="sticky bottom-4 z-10 flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white/95 p-4 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between">
                                  <div className="text-sm text-gray-600">
                                    {isDirty ? 'Perubahan belum disimpan. Simpan agar halaman publik memakai data terbaru.' : 'Semua perubahan sudah tersimpan.'}
                                  </div>
                                  <div className="flex gap-3">
                                    <button
                                      type="button"
                                      onClick={() => setSettings(savedSettings)}
                                      disabled={!isDirty || saving}
                                      className="flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                      <Undo2 className="w-4 h-4" />
                                      Batalkan Perubahan
                                    </button>
                                  <button type="submit" disabled={saving} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold px-8 py-3 rounded-xl transition-colors text-lg">
                                    {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
                                    {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
                                  </button>
                                  </div>
                        </div>
                </form>
          </div>
        );
}
