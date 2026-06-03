import React, { useState } from 'react';
import { Copy, X, Database, ListOrdered, Lock, KeyRound } from 'lucide-react';
import { GAS_SCRIPT_CODE } from '../utils/gas';

interface GasGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GasGuideModal: React.FC<GasGuideModalProps> = ({ isOpen, onClose }) => {
  const [passwordInput, setPasswordInput] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(() => {
    return sessionStorage.getItem('pos_guide_unlocked') === 'true';
  });

  if (!isOpen) return null;

  const handleCopyCode = () => {
    try {
      navigator.clipboard.writeText(GAS_SCRIPT_CODE);
      alert('Kode Google Apps Script berhasil disalin ke clipboard! Silakan tempel/paste di editor Google Apps Script.');
    } catch {
      alert('Penyalinan otomatis gagal. Silakan salin teks kode di kotak secara manual.');
    }
  };

  const handleUnlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput.trim() === 'nutlopez_ade_17') {
      setIsUnlocked(true);
      sessionStorage.setItem('pos_guide_unlocked', 'true');
    } else {
      alert('Password Salah! Silakan periksa kembali.');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[10000] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-blue-700 to-indigo-800 text-white flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <Database className="w-6 h-6 text-yellow-400" />
            <div>
              <h3 className="font-bold text-lg">📖 Panduan Setup Database Google Sheets</h3>
              <p className="text-xs text-white/70">Miliki database cloud gratis dan andal menggunakan Google Sheets</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-full text-white/80 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Locked Screen / Form */}
        {!isUnlocked ? (
          <div className="p-8 flex flex-col items-center justify-center space-y-6 text-center bg-slate-50 flex-1 min-h-[350px]">
            <div className="w-16 h-16 bg-blue-50 border border-blue-200 flex items-center justify-center rounded-3xl text-blue-600 shadow-sm animate-pulse">
              <Lock className="w-8 h-8" />
            </div>
            
            <div className="space-y-2 max-w-md">
              <h4 className="font-extrabold text-slate-800 text-base">Panduan Terkunci Aman</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Masukkan password khusus untuk membuka panduan langkah demi langkah dan salin kode Google Apps Script untuk server database Anda.
              </p>
            </div>

            <form onSubmit={handleUnlockSubmit} className="w-full max-w-sm space-y-3">
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Masukkan Password Panduan..."
                  className="w-full text-xs border border-slate-200 pl-10 pr-4 py-3 bg-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 font-bold tracking-wider"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-xs font-black rounded-2xl shadow-md transition-all flex items-center justify-center gap-1.5 uppercase"
              >
                Buka Kunci Panduan
              </button>
            </form>
          </div>
        ) : (
          /* Content */
          <div className="overflow-y-auto p-6 space-y-5 text-sm text-slate-600 leading-relaxed scrollbar-thin">
            
            {/* Schema Overview */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-1.5 text-xs text-slate-500 uppercase tracking-wider">
                <span>🗄️</span> Struktur Tabel yang Akan Terbentuk Otomatis
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] font-mono scrollbar-thin max-h-40 overflow-y-auto">
                <div className="bg-white p-2.5 rounded-xl border border-slate-200/60">
                  <span className="text-blue-700 font-bold">ORGANISASI</span><br />
                  ID_ORG, NAMA, ALAMAT, WHATSAPP, EMAIL_ADMIN, CREATED_AT
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200/60">
                  <span className="text-blue-700 font-bold">PENGGUNA</span><br />
                  ID_ORG, STAFF_ID, NAMA, EMAIL, PIN, ROLE, STATUS, CREATED_AT
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200/60">
                  <span className="text-blue-700 font-bold">KATEGORI</span><br />
                  ID_ORG, KATEGORI_ID, NAMA, CREATED_AT
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200/60">
                  <span className="text-blue-700 font-bold">PRODUK</span><br />
                  ID_ORG, PRODUK_ID, NAMA, SKU, KATEGORI, HPP, HARGA, STOK, IMAGE_ID, CREATED_AT
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200/60">
                  <span className="text-blue-700 font-bold">PELANGGAN</span><br />
                  ID_ORG, PELANGGAN_ID, NAMA, TELEPON, EMAIL, CREATED_AT
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200/60">
                  <span className="text-blue-700 font-bold">TRANSAKSI</span><br />
                  ID_ORG, TX_ID, TOTAL, SUBTOTAL, DISKON_PCT, PAJAK, METHOD, OPERATOR, PELANGGAN, STATUS, CATATAN, CREATED_AT
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200/60">
                  <span className="text-blue-700 font-bold">DETAIL_TRANSAKSI</span><br />
                  ID_ORG, TX_ID, PRODUK_ID, NAMA, HARGA, QTY, SUBTOTAL
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200/60">
                  <span className="text-blue-700 font-bold">PEMBELIAN</span><br />
                  ID_ORG, PEMBELIAN_ID, PRODUK_ID, NAMA, QTY, HPP, SUPPLIER, CREATED_AT
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200/60">
                  <span className="text-blue-700 font-bold">BIAYA_OPERASIONAL</span><br />
                  ID_ORG, SEWA, GAJI, LISTRIK_AIR, LAINNYA, UPDATED_AT
                </div>
              </div>
            </div>

            {/* Setup Steps */}
            <div>
              <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                <ListOrdered className="w-4 h-4 text-slate-600" /> Langkah Setup Database
              </h4>
              <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-600 pl-1">
                <li>Buat <strong>Spreadsheet baru</strong> di Google Drive Anda.</li>
                <li>Salin ID dari URL Spreadsheet Anda (karakter acak panjang antara <code className="bg-slate-100 px-1 rounded">/d/</code> dan <code className="bg-slate-100 px-1 rounded">/edit</code>).</li>
                <li>Klik menu <strong>Mengekstensi (Extensions)</strong> &gt; <strong>Apps Script</strong>.</li>
                <li>Hapus semua kode default di editor, lalu klik tombol <strong>Salin Kode</strong> di bawah dan tempelkan (paste).</li>
                <li>Ganti baris <code className="bg-slate-100 text-red-600 px-1.5 py-0.5 rounded font-mono">[GANTI DENGAN ID SPREADSHEET ANDA]</code> dengan ID Spreadsheet yang Anda salin pada langkah 2.</li>
                <li>Klik ikon simpan/save.</li>
                <li>Klik tombol <strong>Terapkan (Deploy)</strong> &gt; <strong>Penerapan baru (New deployment)</strong>.</li>
                <li>Pilih jenis: <strong>Aplikasi web (Web app)</strong>.</li>
                <li>Setel konfigurasi:
                  <ul className="list-disc list-inside pl-4 mt-1 space-y-0.5">
                    <li><strong>Jalankan sebagai (Execute as):</strong> Saya (Akun Google Anda)</li>
                    <li><strong>Siapa yang memiliki akses (Who has access):</strong> Siapa saja (Anyone)</li>
                  </ul>
                </li>
                <li>Klik Terapkan. Izinkan akses jika diminta Google.</li>
                <li>Salin <strong>URL Aplikasi Web (Web App URL)</strong> yang dihasilkan, lalu masukkan ke kolom input URL Database di menu Pengaturan aplikasi POS ini.</li>
              </ol>
            </div>

            {/* Code block preview */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Script Code Preview</span>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-bold"
                >
                  <Copy className="w-3.5 h-3.5" /> Salin Teks Kode
                </button>
              </div>
              <div className="bg-slate-900 text-slate-100 rounded-2xl p-4 overflow-x-auto max-h-56 border border-slate-800">
                <pre className="text-[10px] leading-relaxed font-mono whitespace-pre">{GAS_SCRIPT_CODE}</pre>
              </div>
            </div>

          </div>
        )}

        {/* Footer actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
          {isUnlocked && (
            <button
              onClick={handleCopyCode}
              className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold active:scale-[0.98] transition-all flex items-center gap-1.5 shadow"
            >
              <Copy className="w-3.5 h-3.5" /> 📋 Salin Seluruh Kode
            </button>
          )}
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold active:scale-[0.98] transition-all"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
