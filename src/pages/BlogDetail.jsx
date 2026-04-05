import { useParams, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { FiCalendar, FiUser, FiArrowLeft, FiTag } from 'react-icons/fi'

export default function BlogDetail() {
  const { slug } = useParams()
  
  const post = {
    title: 'Petualangan Epik di Derawan Labuan Cermin',
    author: 'Umar Dary Muhammad',
    date: 'September 11, 2024',
    category: 'Informasi',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200',
    tags: ['Derawan', 'Diving', 'Kalimantan', 'Bahari'],
    content: [
      { type: 'paragraph', text: 'Derawan adalah salah satu kepulauan tersembunyi di Kalimantan Timur yang menyimpan keindahan alam bawah laut yang luar biasa. Dengan kejernihan air yang mencapai visibilitas hingga 30 meter, snorkeling dan diving di sini adalah pengalaman yang tidak akan pernah terlupakan.' },
      { type: 'heading', text: 'Mengenal Kepulauan Derawan' },
      { type: 'paragraph', text: 'Kepulauan Derawan terdiri dari beberapa pulau utama, yaitu Pulau Derawan, Pulau Sangalaki, Pulau Kakaban, dan Pulau Maratua. Setiap pulau memiliki keunikan dan keindahannya masing-masing. Pulau Sangalaki terkenal sebagai tempat bersarangnya penyu hijau raksasa, sementara Kakaban memiliki danau ubur-ubur yang langka.' },
      { type: 'heading', text: 'Labuan Cermin: Cermin Alam yang Memukau' },
      { type: 'paragraph', text: 'Labuan Cermin adalah sebuah danau air asin yang terletak di Kecamatan Biduk-Biduk, Kabupaten Berau. Yang membuat tempat ini unik adalah fenomena dua lapisan air yang berbeda - air tawar di permukaan dan air asin di dasar. Kejernihan air yang sempurna membuat danau ini seperti cermin yang memantulkan bayangan langit dan pepohonan sekitarnya.' },
      { type: 'heading', text: 'Tips Mengunjungi Derawan' },
      { type: 'list', items: ['Waktu terbaik kunjungan: Maret-Oktober (musim kering)', 'Bawa sunscreen dan peralatan snorkeling sendiri untuk hemat', 'Booking penginapan jauh-jauh hari, terutama saat weekend', 'Paket open trip tersedia mulai Rp 4,5 juta/orang (3D2N)', 'Bawa uang tunai karena ATM terbatas di sana'] },
      { type: 'paragraph', text: 'Perjalanan ke Derawan biasanya dimulai dari Berau (Tanjung Redeb). Dari sana, tersedia speedboat yang bisa mengantarkan Anda langsung ke pulau-pulau di Kepulauan Derawan. Dengan NusaTrip, Anda bisa memesan paket lengkap termasuk akomodasi, transportasi, dan guide berpengalaman.' },
    ]
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 pt-24 pb-16">
        {/* Back button */}
        <Link to="/blog" className="flex items-center gap-2 text-gray-500 hover:text-primary-500 mb-6 transition-colors">
          <FiArrowLeft/> Kembali ke Blog
        </Link>

        {/* Article */}
        <article className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <img src={post.image} alt={post.title} className="w-full h-80 object-cover"/>
          
          <div className="p-8">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="badge bg-primary-100 text-primary-600">{post.category}</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4 leading-snug">{post.title}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-400 mb-8 pb-6 border-b border-gray-100">
              <span className="flex items-center gap-1"><FiUser size={14}/> {post.author}</span>
              <span className="flex items-center gap-1"><FiCalendar size={14}/> {post.date}</span>
            </div>

            <div className="prose max-w-none space-y-4">
              {post.content.map((block, i) => {
                if (block.type === 'paragraph') return <p key={i} className="text-gray-600 leading-relaxed">{block.text}</p>
                if (block.type === 'heading') return <h2 key={i} className="text-xl font-bold text-gray-800 mt-6">{block.text}</h2>
                if (block.type === 'list') return (
                  <ul key={i} className="space-y-2 ml-4">
                    {block.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-2 text-gray-600">
                        <span className="text-primary-500 mt-1 shrink-0">•</span> {item}
                      </li>
                    ))}
                  </ul>
                )
                return null
              })}
            </div>

            {/* Tags */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="flex flex-wrap gap-2 items-center">
                <FiTag className="text-gray-400" size={16}/>
                {post.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full hover:bg-primary-50 hover:text-primary-500 cursor-pointer transition-colors">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </article>

        {/* CTA */}
        <div className="mt-8 bg-primary-500 rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-2">Tertarik Wisata ke Derawan?</h3>
          <p className="opacity-90 mb-4">Temukan paket open trip dan private trip terbaik ke Kepulauan Derawan</p>
          <Link to="/paket-wisata?destination=Derawan" className="inline-block bg-white text-primary-500 font-bold px-6 py-3 rounded-full hover:bg-gray-100 transition-colors">
            Lihat Paket Wisata
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  )
}
