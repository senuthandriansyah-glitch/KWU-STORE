import React, { useState } from 'react';
import { 
  X, HelpCircle, BookOpen, ChevronRight, Smartphone, CheckCircle2, 
  Printer, ArrowRight, Database, TrendingUp, Coins, Users, 
  ShoppingBag, FileText, Settings, Layers, Wifi, ShieldAlert 
} from 'lucide-react';
import { useLanguage } from '../utils/lang';

interface AppGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'customer' | 'admin' | 'printer' | 'shares';
}

export const AppGuideModal: React.FC<AppGuideModalProps> = ({ 
  isOpen, 
  onClose,
  defaultTab = 'customer'
}) => {
  const { lang, changeLanguage, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'customer' | 'admin' | 'printer' | 'shares'>(defaultTab);
  const [selectedStep, setSelectedStep] = useState<number>(0);

  if (!isOpen) return null;

  const customerSteps = [
    {
      title: '1. Pilih Produk Mitra sediaan',
      description: 'Pelanggan dapat menyaring produk berdasarkan mitra toko sediaan tertentu atau berdasarkan kategori menu lewat pencarian real-time.',
      tip: 'Gunakan Filter Toko Mitra di bagian atas untuk melihat produk dari masing-masing brand mahasiswa / kelompok bisnis.',
      icon: ShoppingBag,
      color: 'from-blue-500 to-indigo-600'
    },
    {
      title: '2. Masukkan Informasi Kontak (WhatsApp)',
      description: 'Sebelum checkout, pelanggan harus mengisi nama lengkap dan NOMOR WHATSAPP yang valid (misal: 08123456789).',
      tip: 'Sistem membutuhkan ini agar penjual/admin dapat langsung menghubungi Anda apabila produk siap diambil atau ada penyesuaian pesanan.',
      icon: Smartphone,
      color: 'from-emerald-500 to-teal-600'
    },
    {
      title: '3. Atur Pengambilan (Pre-Order & Pickup)',
      description: 'Konsep toko kewirausahaan ini murni PRE-ORDER & PICKUP. Tentukan Tanggal dan Estimasi Jam pengambilan sesuai jadwal luang Anda.',
      tip: 'Membantu petugas sediaan menyiapkan barang Anda segar/hangat tepat waktu tanpa antre.',
      icon: FileText,
      color: 'from-amber-500 to-orange-600'
    },
    {
      title: '4. Kirim Draft WhatsApp & Bayar QRIS',
      description: 'Setelah klik "Pesan", Anda akan dialihkan otomatis ke WhatsApp dengan pesan draft terformat berisi Invoice ID, nomor WA, dan rincian barang.',
      tip: 'Kirim pesan tersebut untuk mendaftar resmi! Pembayaran dapat ditransfer via QRIS toko atau Tunai langsung di gerai saat pickup.',
      icon: CheckCircle2,
      color: 'from-violet-500 to-fuchsia-600'
    }
  ];

  const adminRoles = [
    {
      title: 'Sesi Kasir POS & Shift Mandiri',
      desc: 'Petugas kasir dapat membuka shift dengan nominal modal awal laci uang, melakukan pencatatan transaksi offline langsung, dan menutup shift untuk mencetak rekonsiliasi total pendapatan.',
      badge: 'Kasir Sesi',
      icon: Coins
    },
    {
      title: 'Monitoring Pesanan Masuk (Real-time)',
      desc: 'Setiap pesanan online yang dibuat pelanggan akan otomatis mengalir ke tab "Pesanan Masuk". Admin dapat mengecek ketersediaan sediaan produk, menyetujui, atau menolaknya jika stok habis.',
      badge: 'Alur Online',
      icon: Layers
    },
    {
      title: 'Status Sinkronisasi & Multi-Mitra',
      desc: 'Setiap produk dapat diasosiasikan ke nama Toko/Mitra masing-masing mahasiswa. Memudahkan pemisahan inventaris laporan secara transparan.',
      badge: 'KWU Konsinyasi',
      icon: Users
    }
  ];

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[9995] flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] w-full max-w-2xl border border-slate-100 shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-950 p-6 text-white text-left flex items-center justify-between relative shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2.5 rounded-2xl">
              <BookOpen className="w-6 h-6 text-blue-300" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-wide uppercase leading-tight">{t('panduan_optimal')}</h2>
              <p className="text-[10px] text-blue-200 mt-0.5 uppercase tracking-wider font-bold">{t('manual_tips')}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2.5 bg-white/10 hover:bg-white/20 active:scale-95 rounded-xl transition-all cursor-pointer text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Nav Subtabs */}
        <div className="flex border-b border-slate-100 p-2 shrink-0 bg-slate-50 gap-1 overflow-x-auto scrollbar-thin">
          <button
            onClick={() => { setActiveTab('customer'); setSelectedStep(0); }}
            className={`flex-1 min-w-[120px] px-3 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'customer' 
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Alur Pelanggan</span>
          </button>
          
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex-1 min-w-[120px] px-3 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'admin' 
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Alur Kasir/Admin</span>
          </button>

          <button
            onClick={() => setActiveTab('printer')}
            className={`flex-1 min-w-[120px] px-3 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'printer' 
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Printer Struk</span>
          </button>

          <button
            onClick={() => setActiveTab('shares')}
            className={`flex-1 min-w-[120px] px-3 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'shares' 
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>Sistem Bagi Hasil</span>
          </button>
        </div>

        {/* Scrollable Main Content Space */}
        <div className="flex-1 p-5 md:p-6 overflow-y-auto text-left space-y-5 bg-white text-slate-700 leading-relaxed">
          
          {/* TAB 1: ALUR PELANGGAN */}
          {activeTab === 'customer' && (
            <div className="space-y-5">
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3 text-xs text-blue-900 font-semibold items-start leading-relaxed">
                <HelpCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-extrabold uppercase text-[10px] tracking-wide text-blue-900 leading-none">Mengapa Memakai Pre-Order pickup?</h4>
                  <p className="mt-1">
                    Konsep KWU Store adalah optimalisasi sediaan wirausaha mahasiswa tanpa resiko sisa produk basi. Pelanggan dapat berbelanja secara cerdas dengan memesan lebih awal secara digital.
                  </p>
                </div>
              </div>

              {/* Progress Stepper representation */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-4">
                {customerSteps.map((step, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedStep(idx)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      selectedStep === idx 
                        ? 'border-blue-600 bg-blue-50/50 shadow-xs' 
                        : 'border-slate-100 bg-slate-50/65'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center ${
                        selectedStep === idx ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {idx + 1}
                      </span>
                      <step.icon className={`w-4 h-4 ${selectedStep === idx ? 'text-blue-600' : 'text-slate-400'}`} />
                    </div>
                    <p className="text-[10px] font-black mt-2 truncate text-slate-800">{step.title.split('. ')[1]}</p>
                  </button>
                ))}
              </div>

              {/* Focused Step Detail View card */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100/60 border border-slate-200/60 p-5 rounded-2xl space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl bg-gradient-to-r text-white ${customerSteps[selectedStep].color}`}>
                    {React.createElement(customerSteps[selectedStep].icon, { className: 'w-5 h-5' })}
                  </div>
                  <h3 className="font-extrabold text-slate-800 text-sm leading-snug">{customerSteps[selectedStep].title}</h3>
                </div>
                
                <p className="text-xs font-semibold text-slate-600 leading-relaxed">
                  {customerSteps[selectedStep].description}
                </p>

                <div className="bg-white p-3 rounded-xl border border-slate-100 text-[11px] font-medium text-slate-550 leading-relaxed">
                  <span className="font-extrabold text-blue-600 block mb-0.5 uppercase tracking-wide text-[9px]">💡 TIPS UNTUK PELANGGAN</span>
                  {customerSteps[selectedStep].tip}
                </div>
              </div>

              {/* Simple checkout notice footer */}
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 rounded-xl p-4 text-xs font-semibold leading-relaxed">
                👉 <strong>Garansi Pelayanan:</strong> Setelah draft pesan WhatsApp terkirim ke nomor WhatsApp resmi toko sediaan, kasir akan segera memperbarui inventaris dan memberi notifikasi balik ketika sediaan menu telah matang & siap diambil!
              </div>
            </div>
          )}

          {/* TAB 2: ALUR ADMIN */}
          {activeTab === 'admin' && (
            <div className="space-y-4">
              <div className="border-l-4 border-amber-500 bg-amber-50 rounded-r-2xl p-4 text-xs text-amber-900 font-semibold leading-relaxed">
                Aplikasi ini dilengkapi sistem multitenancy laci kasir, sehingga satu alat dapat digunakan bersama-sama atau beralih sesi kasir petugas dengan aman.
              </div>

              <div className="space-y-3">
                {adminRoles.map((role, idx) => (
                  <div key={idx} className="flex gap-4 p-4 border border-slate-100 bg-slate-50/50 rounded-2xl text-left items-start">
                    <div className="bg-blue-100 p-2 text-blue-700 rounded-xl shrink-0">
                      <role.icon className="w-5 h-5" />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-xs text-slate-800">{role.title}</h4>
                        <span className="bg-amber-100 text-amber-800 text-[9px] px-2 py-0.5 rounded-full font-black uppercase">
                          {role.badge}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-550 leading-normal">
                        {role.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-indigo-900 text-white rounded-2xl p-4 text-xs text-left">
                <h5 className="font-black text-blue-300 uppercase leading-none tracking-wide text-[10px]">🛠️ Rekomendasi Alur Penjualan Harian</h5>
                <ol className="list-decimal list-inside space-y-1.5 mt-2.5 font-semibold text-slate-205">
                  <li>Nyalakan sesi kasir baru dengan modal awal (e.g. Rp 100.000).</li>
                  <li>Pantau tab <strong>"Pesanan Masuk Online"</strong> dari pelanggan web.</li>
                  <li>Setujui pesanan online untuk mengurangi sediaan stok otomatis di katalog POS.</li>
                  <li>Untuk transaksi offline (pembeli langsung), gunakan tab <strong>"Kasir POS [F6]"</strong>.</li>
                  <li>Tutup shift di akhir hari untuk melihat total rekapitulasi cash register vs data uang fisik.</li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 3: PRINTER */}
          {activeTab === 'printer' && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-250 rounded-2xl p-4 flex gap-3 text-xs items-start text-left">
                <Printer className="w-5 h-5 text-indigo-600 shrink-0" />
                <div className="space-y-1">
                  <h4 className="font-extrabold text-slate-800">Cetak Nirkabel (Thermal ESC/POS Bluetooth / Virtual Wifi)</h4>
                  <p className="text-slate-500 font-semibold leading-relaxed">
                    Aplikasi mendukung cetak struk penjualan secara real-time ke Printer Thermal kasir 58mm / 80mm menggunakan Bluetooth web standar atau simulator jaringan.
                  </p>
                </div>
              </div>

              <div className="border border-slate-100 rounded-2xl p-4 space-y-3.5 text-xs text-slate-600 leading-relaxed font-semibold">
                <div>
                  <h5 className="font-extrabold text-slate-800 text-xs">🔗 Cara Menghubungkan Printer Bluetooth:</h5>
                  <ol className="list-decimal list-inside space-y-1.5 mt-1.5">
                    <li>Nyalakan Bluetooth di HP / Laptop Anda. Ensure printer thermal kasir menyala.</li>
                    <li>Pada Dashboard Kasir POS, gulir ke panel <strong>"Simulator & Printer Thermal"</strong> di tab Dashboard utama.</li>
                    <li>Pilih jenis koneksi Bluetooth lalu klik <strong>"Hubungkan Printer"</strong>.</li>
                    <li>Sistem akan mendeteksi nama device printer Anda (e.g. POS-58, RPP02N, Thermal).</li>
                    <li>Klik hubungkan, lampu indikator status di pojok kanan bawah dashboard akan berubah menjadi <span className="bg-emerald-150 text-emerald-800 px-1 rounded">CONNECTED</span>.</li>
                  </ol>
                </div>

                <div className="bg-amber-50 border border-amber-100 text-amber-900 rounded-xl p-3.5 flex gap-2 items-start">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-[10px] leading-relaxed">
                    <strong>Catatan Browser:</strong> Dikarenakan browser membutuhkan izin WebBluetooth, pastikan Anda menggunakan Google Chrome, Opera, atau Microsoft Edge yang terbaru dan memberikan izin akses Bluetooth saat popup browser muncul.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: BAGI HASIL */}
          {activeTab === 'shares' && (
            <div className="space-y-4 text-xs">
              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex gap-3 items-start text-left text-indigo-950">
                <Coins className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-extrabold">Sistem Konsinyasi & Persentase Bagi Hasil</h4>
                  <p className="text-[10px] font-semibold text-slate-500 leading-normal">
                    Dirancang khusus untuk sediaan mata kuliah Kewirausahaan (KWU). Memfasilitasi bagi hasil otomatis antara pengelola gerai utama (kasir kelompok) dengan pihak pemilik sediaan barang.
                  </p>
                </div>
              </div>

              <div className="bg-white border border-slate-100 rounded-2xl p-4 space-y-3.5 text-slate-600 leading-relaxed font-semibold">
                <div>
                  <h5 className="font-extrabold text-slate-800 text-xs">📈 Bagaimana Pembagian Persentase Dihitung?</h5>
                  <p className="mt-1">
                    Saat menaruh barang (restock), Anda dapat mengeset persentase bagi hasil mitra (misal: 10% untuk kasir kelompok / kasir kelas, dan 90% dikembalikan ke pemilik produk).
                  </p>
                  <ul className="list-disc list-inside space-y-1 mt-2.5 bg-slate-50 p-3 rounded-xl border border-slate-100/60 font-medium text-[11px]">
                    <li><strong>Total Omset:</strong> Akumulasi seluruh harga jual ke pelanggan.</li>
                    <li><strong>Bagi Hasil Admin/Toko:</strong> Mengambil porsi persentase setelan mitra langsung saat checkout.</li>
                    <li><strong>Sisa Bersih Mitra:</strong> Langsung dikalkulasikan transparan pada halaman dashboard "Bagi Hasil Mitra".</li>
                  </ul>
                </div>

                <p className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 rounded-xl p-3 text-[10px]">
                  <strong>Tips Sukses Bisnis:</strong> Sediakan QRIS dinamis yang terhubung ke rekening kas kelas/kelompok, lalu bagikan laba bersih setiap akhir pekan dengan mengekspor data transaksi kotor eksklusif per mitra!
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-between items-center shrink-0">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">KWU Store Pos & Preorder Guide © 2026</p>
          <button 
            onClick={onClose}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl shadow-md shadow-blue-500/15 cursor-pointer hover:shadow-lg transition-all active:scale-[0.98]"
          >
            Selesai Membaca 🚀
          </button>
        </div>

      </div>
    </div>
  );
};
