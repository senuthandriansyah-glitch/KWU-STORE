import React, { useState } from 'react';
import { UserPlus, Trash2, User, Phone } from 'lucide-react';
import { Customer } from '../types';

interface PelangganPageProps {
  customers: Customer[];
  onAddCustomer: (nama: string, hp?: string) => void;
  onDeleteCustomer: (id: string) => void;
}

export const PelangganPage: React.FC<PelangganPageProps> = ({
  customers,
  onAddCustomer,
  onDeleteCustomer,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [namaInput, setNamaInput] = useState('');
  const [hpInput, setHpInput] = useState('');

  const handleOpenAdd = () => {
    setNamaInput('');
    setHpInput('');
    setIsModalOpen(true);
  };

  const handleSaveCustomer = () => {
    const name = namaInput.trim();
    if (!name) {
      alert('Nama pelanggan harus diisi.');
      return;
    }
    onAddCustomer(name, hpInput.trim() || undefined);
    setIsModalOpen(false);
  };

  const triggerDelete = (cust: Customer) => {
    if (confirm(`Yakin ingin menghapus data pelanggan "${cust.nama}"?`)) {
      onDeleteCustomer(cust.id);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Title */}
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Kelola Data Pelanggan</h2>
          <p className="text-xs text-slate-500 mt-0.5">Daftarkan profil pelanggan tetap toko andalan Anda guna analisis retensi transaksi</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold active:scale-[0.98] transition-all flex items-center gap-1.5 shadow"
        >
          <UserPlus className="w-4 h-4" /> Tambah Pelanggan
        </button>
      </div>

      {/* Grid lists */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {customers.length > 0 ? (
          customers.map(c => (
            <div key={c.id} className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex items-center justify-between hover:shadow-md transition-all gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm">
                  <User className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-800">{c.nama}</h4>
                  <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3 text-slate-400" /> {c.hp || 'Tidak ada WhatsApp'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => triggerDelete(c)}
                className="bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-xl transition-all"
                title="Hapus Pelanggan"
              >
                <Trash2 className="w-4.5 h-4.5" />
              </button>
            </div>
          ))
        ) : (
          <div className="col-span-full py-16 text-slate-400 text-center text-xs font-medium bg-slate-50 rounded-3xl border border-slate-100">
            Belum ada profil pelanggan yang tersimpan. Klik "+ Tambah Pelanggan" untuk mulai menambahkan.
          </div>
        )}
      </div>

      {/* Add Pelanggan Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[10003] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-sm">Daftarkan Profil Pelanggan</h3>
              <p className="text-[10px] text-slate-500 mt-0.5 font-medium">Beri kemudahan pelacakan riwayat pembelian pelanggan tersebut</p>
            </div>
            
            <div className="p-5 space-y-4">
              {/* Nama Pelanggan */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nama Pelanggan (Panggilan / Lengkap)</label>
                <input
                  type="text"
                  value={namaInput}
                  onChange={(e) => setNamaInput(e.target.value)}
                  placeholder="E.g. Kak Senut"
                  className="w-full text-xs border border-slate-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 font-medium"
                />
              </div>

              {/* No Whatsapp */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nomor Telepon / WA (Format Bebas)</label>
                <input
                  type="text"
                  value={hpInput}
                  onChange={(e) => setHpInput(e.target.value)}
                  placeholder="E.g. 0812345678"
                  className="w-full text-xs border border-slate-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2 text-xs font-semibold">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition-all font-bold"
              >
                Batal
              </button>
              <button
                onClick={handleSaveCustomer}
                className="px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold shadow"
              >
                Simpan Profil
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
