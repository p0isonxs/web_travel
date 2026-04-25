import { createContext, useContext, useEffect, useState } from 'react';
import { getSettings } from '../lib/database';

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
  heroBackground: '',
  privateTripBackground: '',
  testimonialBackground: '',
};

// Module-level cache: fetched once per app session, survives re-renders & StrictMode double-invoke
let settingsCache = null;

const SettingsContext = createContext(defaultSettings);

export function useSettings() {
  return useContext(SettingsContext);
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(settingsCache || defaultSettings);

  useEffect(() => {
    if (settingsCache) return;
    getSettings()
      .then((data) => {
        if (data && Object.keys(data).length > 0) {
          settingsCache = { ...defaultSettings, ...data };
          setSettings(settingsCache);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
}
