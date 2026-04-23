import { useState, useEffect } from 'react';
import { getContacts, updateContact, deleteContact } from '../../lib/database';
import { Trash2, Mail, Phone, Clock, CheckCheck, Inbox } from 'lucide-react';
import { toast } from 'react-toastify';

export default function AdminContacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => { fetchContacts(); }, []);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      setContacts(await getContacts());
    } catch (e) {
      toast.error('Gagal memuat pesan');
    }
    setLoading(false);
  };

  const handleOpen = async (contact) => {
    setSelected(contact);
    if (contact.status === 'unread') {
      await updateContact(contact.id, { status: 'read' });
      setContacts(prev => prev.map(c => c.id === contact.id ? { ...c, status: 'read' } : c));
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Hapus pesan ini?')) return;
    await deleteContact(id);
    toast.success('Pesan dihapus');
    if (selected?.id === id) setSelected(null);
    setContacts(prev => prev.filter(c => c.id !== id));
  };

  const formatDate = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const filtered = contacts.filter(c => filter === 'all' ? true : c.status === filter);
  const unreadCount = contacts.filter(c => c.status === 'unread').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pesan Masuk</h1>
          <p className="text-gray-500 text-sm">{contacts.length} pesan · {unreadCount} belum dibaca</p>
        </div>
        <div className="flex gap-2">
          {[
            { val: 'all', label: 'Semua' },
            { val: 'unread', label: 'Belum Dibaca' },
            { val: 'read', label: 'Sudah Dibaca' },
          ].map(f => (
            <button key={f.val} onClick={() => setFilter(f.val)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === f.val ? 'bg-emerald-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}>
              {f.label}
              {f.val === 'unread' && unreadCount > 0 && (
                <span className="ml-1.5 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{unreadCount}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Memuat pesan...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Inbox className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Tidak ada pesan</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-5 gap-6">
          {/* List */}
          <div className="lg:col-span-2 space-y-2">
            {filtered.map(c => (
              <div key={c.id} onClick={() => handleOpen(c)}
                className={`relative bg-white rounded-xl p-4 cursor-pointer border transition-all hover:shadow-md ${
                  selected?.id === c.id ? 'border-emerald-500 shadow-md' : 'border-gray-100'
                } ${c.status === 'unread' ? 'border-l-4 border-l-emerald-500' : ''}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {c.status === 'unread' && <span className="w-2 h-2 bg-emerald-500 rounded-full shrink-0" />}
                      <p className={`text-sm truncate ${c.status === 'unread' ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                        {c.name}
                      </p>
                    </div>
                    <p className="text-xs text-emerald-600 font-medium truncate mt-0.5">{c.subject}</p>
                    <p className="text-xs text-gray-400 truncate mt-1">{c.message}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="text-xs text-gray-400 whitespace-nowrap">{formatDate(c.createdAt)}</span>
                    <button onClick={(e) => handleDelete(c.id, e)}
                      className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Detail */}
          <div className="lg:col-span-3">
            {selected ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selected.subject}</h2>
                    <div className="flex items-center gap-1.5 mt-1">
                      <CheckCheck className="w-4 h-4 text-emerald-500" />
                      <span className="text-xs text-emerald-600 font-medium">Sudah dibaca</span>
                    </div>
                  </div>
                  <button onClick={(e) => handleDelete(selected.id, e)}
                    className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold text-sm">
                      {selected.name?.[0]?.toUpperCase()}
                    </div>
                    <span className="font-semibold">{selected.name}</span>
                  </div>
                  {selected.email && (
                    <a href={`mailto:${selected.email}`}
                      className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline">
                      <Mail className="w-4 h-4" /> {selected.email}
                    </a>
                  )}
                  {selected.phone && (
                    <a href={`https://wa.me/${selected.phone?.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm text-green-600 hover:underline">
                      <Phone className="w-4 h-4" /> {selected.phone}
                    </a>
                  )}
                  <div className="flex items-center gap-1.5 text-sm text-gray-400">
                    <Clock className="w-4 h-4" /> {formatDate(selected.createdAt)}
                  </div>
                </div>

                <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {selected.message}
                </div>

                {selected.email && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <a href={`mailto:${selected.email}?subject=Re: ${selected.subject}`}
                      className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm">
                      <Mail className="w-4 h-4" /> Balas via Email
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 h-64 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <Mail className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Pilih pesan untuk dibaca</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
