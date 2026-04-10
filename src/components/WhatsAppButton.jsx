import { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

export default function WhatsAppButton() {
    const [showTooltip, setShowTooltip] = useState(false);
    const settings = useSettings();
    const [visible, setVisible] = useState(false);

  useEffect(() => {
        const timer = setTimeout(() => setVisible(true), 2000);
        return () => clearTimeout(timer);
  }, []);

  const waNumber = settings.phone || '6281234567890';
    const waMessage = encodeURIComponent(`Halo ${settings.siteName}! Saya ingin bertanya mengenai paket wisata. 🏖️`);
    const waUrl = `https://wa.me/${waNumber}?text=${waMessage}`;

  if (!visible) return null;

  return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
          {/* Tooltip */}
          {showTooltip && (
                  <div className="bg-white rounded-2xl shadow-xl p-4 max-w-xs border border-gray-100 relative">
                            <button
                                          onClick={() => setShowTooltip(false)}
                                          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                                        >
                                        <X className="w-4 h-4" />
                            </button>
                            <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white text-xl">
                                                      🌴
                                        </div>
                                        <div>
                                                      <p className="font-bold text-gray-900 text-sm">{settings.siteName}</p>
                                                      <p className="text-xs text-green-600">● Online sekarang</p>
                                        </div>
                            </div>
                            <p className="text-gray-600 text-sm mb-3">
                                        Halo! Ada yang bisa kami bantu? Tanya seputar paket wisata, booking, atau info perjalanan lainnya 😊
                            </p>
                            <a
                                          href={waUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="block w-full text-center bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-xl text-sm transition-colors"
                                        >
                                        Mulai Chat
                            </a>
                  </div>
              )}
        
          {/* Main Button */}
              <button
                        onClick={() => setShowTooltip(!showTooltip)}
                        className="relative w-16 h-16 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                        aria-label="Chat WhatsApp"
                      >
                      <MessageCircle className="w-8 h-8" fill="white" />
                {/* Ping animation */}
                      <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-30" />
              </button>
        </div>
      );
}</div>
