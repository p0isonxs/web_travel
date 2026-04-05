import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { FiTarget, FiAward, FiUsers, FiHeart } from 'react-icons/fi'

const team = [
  { name: 'Haidar Al-Rashid', role: 'CEO & Founder', photo: 'https://i.pravatar.cc/150?img=11', bio: 'Passionate traveler dengan pengalaman 10+ tahun di industri pariwisata Indonesia.' },
  { name: 'Siti Rahmawati', role: 'Head of Operations', photo: 'https://i.pravatar.cc/150?img=25', bio: 'Expert dalam manajemen operasional trip dan customer service excellence.' },
  { name: 'Budi Setiawan', role: 'Lead Guide & Trainer', photo: 'https://i.pravatar.cc/150?img=30', bio: 'Certified guide dengan sertifikasi nasional dan pengalaman guiding 8+ tahun.' },
  { name: 'Maya Kusuma', role: 'Marketing Manager', photo: 'https://i.pravatar.cc/150?img=44', bio: 'Digital marketing specialist yang berdedikasi memperkenalkan keindahan Indonesia.' },
]

const values = [
  { icon: FiTarget, title: 'Profesionalisme', desc: 'Kami berkomitmen memberikan layanan terbaik dengan standar profesional tertinggi di setiap perjalanan.' },
  { icon: FiAward, title: 'Keamanan & Kenyamanan', desc: 'Keselamatan dan kenyamanan peserta adalah prioritas utama dalam setiap trip yang kami selenggarakan.' },
  { icon: FiUsers, title: 'Komunitas', desc: 'Kami bukan hanya travel agent, tapi komunitas pecinta alam yang saling mendukung satu sama lain.' },
  { icon: FiHeart, title: 'Passion', desc: 'Setiap perjalanan direncanakan dengan penuh cinta dan dedikasi untuk menciptakan kenangan tak terlupakan.' },
]

export default function About() {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero */}
      <div className="relative bg-gradient-to-r from-primary-600 to-teal-700 text-white pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img src="https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1920" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold font-display mb-4">Tentang NusaTrip</h1>
          <p className="text-xl opacity-90 leading-relaxed">Platform wisata terpercaya yang menghubungkan para petualang dengan keindahan alam Nusantara yang tiada duanya.</p>
        </div>
      </div>

      {/* Story */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Kisah Kami</h2>
              <p className="text-gray-600 leading-relaxed mb-4">NusaTrip lahir dari kecintaan mendalam terhadap keindahan alam Indonesia yang belum banyak dijelajahi. Didirikan pada 2015, kami memulai perjalanan dengan satu misi sederhana: membuat wisata alam Indonesia dapat diakses oleh semua orang dengan mudah dan terjangkau.</p>
              <p className="text-gray-600 leading-relaxed mb-4">Selama lebih dari 10 tahun, kami telah memandu lebih dari 50.000 wisatawan menjelajahi keajaiban alam dari Sabang hingga Merauke. Dari kedalaman laut Raja Ampat hingga puncak gunung Bromo, setiap perjalanan bersama kami adalah sebuah petualangan yang tak terlupakan.</p>
              <p className="text-gray-600 leading-relaxed">Kami percaya bahwa perjalanan bukan hanya tentang destinasi, tetapi tentang pengalaman, koneksi, dan transformasi diri yang terjadi sepanjang perjalanan.</p>
            </div>
            <div className="relative">
              <img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700" alt="Tim NusaTrip" className="rounded-2xl shadow-xl" />
              <div className="absolute -bottom-6 -left-6 bg-primary-500 text-white p-6 rounded-2xl shadow-lg">
                <div className="text-4xl font-bold">10+</div>
                <div className="text-sm opacity-90">Tahun Berpengalaman</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-primary-500">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            {[
              { number: '500+', label: 'Paket Wisata' },
              { number: '50K+', label: 'Wisatawan Puas' },
              { number: '100+', label: 'Destinasi' },
              { number: '4.9/5', label: 'Rating Kepuasan' },
            ].map(stat => (
              <div key={stat.label}>
                <div className="text-4xl font-bold font-display mb-2">{stat.number}</div>
                <div className="opacity-90">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Nilai-Nilai Kami</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Prinsip yang menjadi fondasi setiap langkah perjalanan NusaTrip</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map(v => {
              const Icon = v.icon
              return (
                <div key={v.title} className="bg-white rounded-2xl p-6 shadow-sm text-center hover:shadow-md transition-shadow">
                  <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="text-primary-500" size={26} />
                  </div>
                  <h3 className="font-bold text-gray-800 mb-3">{v.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Tim Kami</h2>
            <p className="text-gray-500">Orang-orang berdedikasi di balik setiap petualangan NusaTrip</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {team.map(member => (
              <div key={member.name} className="text-center">
                <img src={member.photo} alt={member.name} className="w-24 h-24 rounded-full object-cover mx-auto mb-3 ring-4 ring-primary-100" />
                <h3 className="font-bold text-gray-800">{member.name}</h3>
                <p className="text-primary-500 text-sm font-medium mb-2">{member.role}</p>
                <p className="text-gray-500 text-xs leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* License */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-6">Legalitas & Sertifikasi</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'SIUP Travel Agent', value: '12345/SIUP/2015', desc: 'Surat Izin Usaha Perdagangan' },
              { label: 'ASITA Member', value: '#ASITA-2023-089', desc: 'Asosiasi Perusahaan Travel Indonesia' },
              { label: 'PHRI Member', value: '#PHRI-2020-456', desc: 'Perhimpunan Hotel & Restoran Indonesia' },
            ].map(item => (
              <div key={item.label} className="bg-white rounded-xl p-5 shadow-sm">
                <div className="font-bold text-gray-800 mb-1">{item.label}</div>
                <div className="text-primary-500 font-mono text-sm mb-1">{item.value}</div>
                <div className="text-gray-400 text-xs">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
