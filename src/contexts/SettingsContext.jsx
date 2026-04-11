import { createContext, useContext, useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export const defaultSettings = {
  siteName: 'Liburan Terus',
  tagline: 'Jelajahi Keindahan Indonesia Bersama Kami',
  phone: '6281234567890',
  email: 'info@liburanterus.com',
  address: 'Jl. Wisata Indah No. 123, Jakarta Selatan',
  instagram: '',
  facebook: '',
  youtube: '',
  tiktok: '',
  bankName: 'BCA',
  bankAccount: '1234567890',
  bankAccountName: 'PT Liburan Terus Indonesia',
  metaDescription: 'Liburan Terus menyediakan paket wisata open trip dan private trip terbaik ke berbagai destinasi indah di Indonesia.',
  metaKeywords: 'wisata indonesia, open trip, private trip, paket wisata',
};

const SettingsContext = createContext(defaultSettings);

export function useSettings() {
  return useContext(SettingsContext);
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(defaultSettings);

  useEffect(() => {
    if (!db) return;

    getDoc(doc(db, 'settings', 'general'))
      .then(snap => {
        if (snap.exists()) setSettings({ ...defaultSettings, ...snap.data() });
      })
      .catch(() => {});
  }, []);

  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
}
