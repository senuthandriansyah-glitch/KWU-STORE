import React, { useState } from 'react';
import { UserPlus, Trash2, Shield, Mail, Key } from 'lucide-react';
import { Staff } from '../types';

interface PetugasPageProps {
  staffList: Staff[];
  onAddStaff: (nama: string, email: string, pin: string) => Promise<void>;
  onDeleteStaff: (id: string) => void;
}

export const PetugasPage: React.FC<PetugasPageProps> = ({
  staffList,
  onAddStaff,
  onDeleteStaff,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [namaInput, setNamaInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [pinInput, setPinInput] = useState('');

  const handleOpenAdd = () => {
    setNamaInput('');
    setEmailInput('');
    setPinInput('');
    setIsModalOpen(true);
  };

  const handleSaveStaff = async () => {
    const name = namaInput.trim();
    const email = emailInput.trim();
    const pin = pinInput.trim();

    if (!name || !email || pin.length < 4) {
      alert('Mohon mengisi nama, email valid, serta PIN minimum 4 digit angka.');
      return;
    }

    try {
      await onAddStaff(name, email, pin);
      setIsModalOpen(false);
    } catch (e: any) {
      alert(e.message || 'Gagal menambahkan petugas kasir.');
    }
  };

  const triggerDelete = (staff: Staff) => {
    if (confirm(`Yakin ingin menonaktifkan dan menghapus petugas "${staff.nama}"? Sesi kredensial login miliknya akan ditarik otomatis.`)) {
      onDeleteStaff(staff.id);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Title */}
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Kelola Petugas Kasir</h2>
          <p className="text-xs text-slate-500 mt-0.5">Daftarkan akun kasir, generate PIN login, dan evaluasi jumlah operator aktif</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold active:scale-[0.98] transition-all flex items-center gap-1.5 shadow"
        >
          <UserPlus className="w-4 h-4" /> Tambah Staff
        </button>
      </div>

      {/* Staff Grid Cards list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {staffList.length > 0 ? (
          staffList.map(s => (
            <div key={s.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-all gap-4">
              <div className="flex justify-between items-start">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center font-bold text-sm">
                  {s.nama.charAt(0).toUpperCase()}
                </div>
                <button
                  onClick={() => triggerDelete(s)}
                  className="bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-xl transition-all"
                  title="Hapus Staff"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div>
                <h4 className="font-bold text-sm text-slate-800">{s.nama}</h4>
                <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1.5 mt-1">
                  <Mail className="w-3 h-3" /> {s.email}
                </p>
                <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full mt-2">
                  <Shield className="w-3 h-3 text-slate-400" /> Kasir Sesi Aktif
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-16 text-slate-400 text-center text-xs font-medium bg-slate-50 rounded-3xl border border-slate-100">
            Belum ada staff kasir yang terdaftar di toko Anda. Klik "+ Tambah Staff" untuk mulai menambahkan staff kasir pertamamu.
          </div>
        )}
      </div>

      {/* Add Staff Dialog Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[10003] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-sm">Daftarkan Petugas Baru</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Staff kasir akan memiliki akses login terpisah menggunakan PIN pribadi mereka</p>
            </div>
            
            <div className="p-5 space-y-4">
              {/* Nama Kasir */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nama Lengkap Kasir</label>
                <input
                  type="text"
                  value={namaInput}
                  onChange={(e) => setNamaInput(e.target.value)}
                  placeholder="E.g. Senut Handriansyah"
                  className="w-full text-xs border border-slate-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                />
              </div>

              {/* Email Login */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Alamat Email Login</label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="E.g. kasir@toko.com"
                  className="w-full text-xs border border-slate-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                />
              </div>

              {/* PIN code */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">PIN Kredensial Login (4-6 digit)</label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    maxLength={6}
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    placeholder="E.g. 1717"
                    className="w-full text-xs border border-slate-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 font-bold tracking-widest"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2 text-xs font-semibold">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 font-bold transition-all"
              >
                Batal
              </button>
              <button
                onClick={handleSaveStaff}
                className="px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold transition-all shadow"
              >
                Tambah Kasir
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
