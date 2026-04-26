import { createContext, useContext, useEffect, useState } from 'react';
import { getSettings } from '../lib/database';
import { SITE_NAME } from '../lib/siteConfig';

export const defaultSettings = {
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
  heroBackground: '',
  privateTripBackground: '',
  testimonialBackground: '',
  ogImage: '',
};

// Module-level cache: fetched once per app session, survives re-renders & StrictMode double-invoke
let settingsCache = null;

const SettingsContext = createContext(defaultSettings);

export function useSettings() {
  return useContext(SettingsContext);
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(settingsCache || defaultSettings);

  const applySettings = (nextSettings) => {
    settingsCache = { ...defaultSettings, ...nextSettings };
    setSettings(settingsCache);
  };

  useEffect(() => {
    if (settingsCache) return;
    getSettings()
      .then((data) => {
        if (data && Object.keys(data).length > 0) {
          applySettings(data);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <SettingsContext.Provider value={{ ...settings, applySettings }}>
      {children}
    </SettingsContext.Provider>
  );
}
