export default function AboutContent() {
  return (
    <section aria-labelledby="about-heading" className="py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Üst başlık + logo */}
        <div className="flex items-center gap-4 mb-6">
          <img src="/Brand/1.png" alt="Yüksi" className="h-12 w-auto" />
          <h2 id="about-heading" className="text-4xl font-extrabold text-black">
            Yüksi Hakkımızda
          </h2>
        </div>

        <p className="text-lg leading-relaxed text-gray-600 mb-10">
          <span className="font-semibold text-black">Yüksi</span>, lojistik ve taşıma sektörüne
          yenilikçi çözümler sunmak amacıyla geliştirilmiş dijital bir platformdur. Yüksi mobil
          uygulaması sayesinde, yük verenlerle taşıyıcıları güvenli, hızlı ve verimli bir şekilde
          bir araya getiriyoruz.
        </p>
   <br />
        {/* Hizmet Özellikleri */}
        <h3 className="text-3xl font-extrabold text-black flex items-center gap-3 mb-4">
          <span>🚚</span> Hizmet Özellikleri
        </h3>
        <ul className="space-y-3 text-gray-700 mb-10">
          <li>
            <span className="font-semibold text-black">Akıllı Eşleştirme:</span> Gelişmiş
            algoritmalarla yükler, en uygun taşıyıcılarla saniyeler içinde eşleştirilir.
          </li>
          <li>
            <span className="font-semibold text-black">Gerçek Zamanlı Takip:</span> Araç konumlarını
            sevkiyat boyunca anlık izleyin.
          </li>
          <li>
            <span className="font-semibold text-black">Belgeli Taşıyıcı Ağı:</span> Onaylı ve
            belgeli taşıyıcılar.
          </li>
          <li>
            <span className="font-semibold text-black">Esnek Ödeme Çözümleri:</span> Güvenli ve
            sorunsuz ödeme altyapısı.
          </li>
        </ul>

        <br />

        {/* Müşteri Avantajları */}
        <h3 className="text-3xl font-extrabold text-black flex items-center gap-3 mb-4">
          <span>🎯</span> Müşteri Avantajları
        </h3>
        <ul className="space-y-3 text-gray-700 mb-10">
          <li>
            <span className="font-semibold text-black">Zaman ve Maliyet Tasarrufu:</span> Doğru
            eşleşme ile beklemeler ve boş taşıma azalır.
          </li>
          <li>
            <span className="font-semibold text-black">Şeffaflık ve Güven:</span> İşlemler dijital
            kayıtlı; taraflar arası güven artar.
          </li>
          <li>
            <span className="font-semibold text-black">7/24 Destek:</span> Her zaman yanınızda
            destek ekibi.
          </li>
        </ul>

        <br />

        {/* Teknolojik Altyapı */}
        <h3 className="text-3xl font-extrabold text-black flex items-center gap-3 mb-4">
          <span>🧠</span> Teknolojik Altyapı
        </h3>
        <ul className="space-y-3 text-gray-700">
          <li>
            <span className="font-semibold text-black">Konum Tabanlı Akıllı Sistem:</span> En yakın
            ve uygun taşıyıcıyı anında tespit eder.
          </li>
          <li>
            <span className="font-semibold text-black">Güvenli Veri Yönetimi:</span> Modern
            standartlarla korunan veriler.
          </li>
        </ul>
      </div>
    </section>
  );
}