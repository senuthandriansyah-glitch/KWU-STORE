import React, { useState, useEffect } from 'react';
import { Settings, ShieldAlert, Image as ImageIcon, QrCode, Clipboard, HelpCircle, Save, Database, Trash2, Globe } from 'lucide-react';
import { BusinessProfile, OperationalExpenses, Organization } from '../types';
import { testGasConnectionUrl } from '../utils/gas';
import { useLanguage } from '../utils/lang';

interface SettingsPageProps {
  businessProfile: BusinessProfile;
  expenses: OperationalExpenses;
  orgInfo: Organization;
  onSaveBusinessProfile: (profile: BusinessProfile) => void;
  onSaveExpenses: (expenses: OperationalExpenses) => void;
  onSaveOrgInfo: (info: Partial<Organization>) => void;
  onSaveGasUrl: (url: string) => void;
  onChangeAdminPin: (oldPin: string, newPin: string) => Promise<void>;
  onResetOrgData: () => void;
  onOpenGasGuide: () => void;
  gasUrl: string;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  businessProfile,
  expenses,
  orgInfo,
  onSaveBusinessProfile,
  onSaveExpenses,
  onSaveOrgInfo,
  onSaveGasUrl,
  onChangeAdminPin,
  onResetOrgData,
  onOpenGasGuide,
  gasUrl,
}) => {
  const { lang, changeLanguage, t } = useLanguage();
  
  // Business Profile states
  const [storeName, setStoreName] = useState(businessProfile.storeName);
  const [storeWhatsapp, setStoreWhatsapp] = useState(businessProfile.whatsapp);
  const [storeAddress, setStoreAddress] = useState(businessProfile.address);
  const [taxEnabled, setTaxEnabled] = useState(businessProfile.taxEnabled);
  const [taxRate, setTaxRate] = useState(businessProfile.taxRate || 11);
  const [igHandle, setIgHandle] = useState(businessProfile.instagram || '');

  // Expenses states
  const [expRent, setExpRent] = useState<number | ''>(expenses.rent || '');
  const [expSalary, setExpSalary] = useState<number | ''>(expenses.salary || '');
  const [expUtilities, setExpUtilities] = useState<number | ''>(expenses.utilities || '');
  const [expOther, setExpOther] = useState<number | ''>(expenses.other || '');

  // Org states
  const [orgName, setOrgName] = useState(orgInfo.name);
  const [orgAddress, setOrgAddress] = useState(orgInfo.address || '');
  const [orgWhatsapp, setOrgWhatsapp] = useState(orgInfo.whatsapp || '');

  // Security stats
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');

  // GAS url state
  const [gasUrlInput, setGasUrlInput] = useState(gasUrl);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTestConnection = async () => {
    if (!gasUrlInput.trim()) {
      setTestResult({ success: false, message: 'URL Google Apps Script kosong.' });
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testGasConnectionUrl(gasUrlInput);
      if (res.success) {
        setTestResult({ success: true, message: 'Koneksi Berhasil! Database Apps Script aktif & tersambung.' });
      } else {
        setTestResult({ success: false, message: res.error || 'Server database mengirim respons tidak dikenal.' });
      }
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'Gagal terhubung. Pastikan URL benar & dideploy dengan akses "Anyone".' });
    } finally {
      setIsTesting(false);
    }
  };

  // Footer message
  const [receiptFooter, setReceiptFooter] = useState(localStorage.getItem('pos_receipt_footer') || 'Terima kasih sudah berbelanja! 🙏');

  // Photo handlers
  const [logoB64, setLogoB64] = useState(localStorage.getItem('pos_logo') || '');
  const [favB64, setFavB64] = useState(localStorage.getItem('pos_favicon') || '');
  const [qrisB64, setQrisB64] = useState(localStorage.getItem('pos_qris') || '');

  // Sync bindings on changes
  useEffect(() => {
    setStoreName(businessProfile.storeName);
    setStoreWhatsapp(businessProfile.whatsapp);
    setStoreAddress(businessProfile.address);
    setTaxEnabled(businessProfile.taxEnabled);
    setTaxRate(businessProfile.taxRate || 11);
    setIgHandle(businessProfile.instagram || '');
  }, [businessProfile]);

  const handleUpdateLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const r = new FileReader();
      r.onload = (event) => {
        if (event.target?.result) {
          const b64 = event.target.result as string;
          localStorage.setItem('pos_logo', b64);
          setLogoB64(b64);
          alert('Logo Toko diperbarui!');
          window.location.reload();
        }
      };
      r.readAsDataURL(file);
    }
  };

  const handleUpdateFavicon = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const r = new FileReader();
      r.onload = (event) => {
        if (event.target?.result) {
          const b64 = event.target.result as string;
          localStorage.setItem('pos_favicon', b64);
          setFavB64(b64);
          const link = document.getElementById('dynamic-favicon') as HTMLLinkElement | null;
          if (link) link.href = b64;
          alert('Favicon Toko diperbarui!');
        }
      };
      r.readAsDataURL(file);
    }
  };

  const handleUpdateQris = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const r = new FileReader();
      r.onload = (event) => {
        if (event.target?.result) {
          const b64 = event.target.result as string;
          localStorage.setItem('pos_qris', b64);
          setQrisB64(b64);
          alert('Foto QRIS Toko diperbarui! Muncul otomatis pada metode QRIS.');
        }
      };
      r.readAsDataURL(file);
    }
  };

  const handleSaveBusinessSubmit = () => {
    onSaveBusinessProfile({
      storeName: storeName.trim() || 'Toko',
      whatsapp: storeWhatsapp.trim(),
      address: storeAddress.trim(),
      taxEnabled,
      taxRate: Number(taxRate) || 11,
      instagram: igHandle.trim()
    });
    alert('Profil Toko & Pajak berhasil disimpan!');
  };

  const handleSaveExpensesSubmit = () => {
    onSaveExpenses({
      rent: expRent === '' ? 0 : Number(expRent),
      salary: expSalary === '' ? 0 : Number(expSalary),
      utilities: expUtilities === '' ? 0 : Number(expUtilities),
      other: expOther === '' ? 0 : Number(expOther),
    });
    alert('Biaya Operasional bulanan disimpan!');
  };

  const handleSaveOrgSubmit = () => {
    onSaveOrgInfo({
      name: orgName.trim(),
      address: orgAddress.trim(),
      whatsapp: orgWhatsapp.trim(),
    });
    alert('Informasi Organisasi disimpan!');
  };

  const handleSaveGasSubmit = () => {
    onSaveGasUrl(gasUrlInput.trim());
    alert('Google Apps Script Server URL disimpan!');
  };

  const handleSavePinSubmit = async () => {
    if (!newPin || newPin.length < 4 || !/^\d+$/.test(newPin)) {
      alert('PIN Baru harus berupa 4-6 digit angka.');
      return;
    }
    try {
      await onChangeAdminPin(oldPin, newPin);
      alert('Kredensial PIN Admin berhasil diubah!');
      setOldPin('');
      setNewPin('');
    } catch (e: any) {
      alert(e.message || 'Gagal mengubah PIN.');
    }
  };

  const handleSaveReceiptFooterText = () => {
    localStorage.setItem('pos_receipt_footer', receiptFooter.trim());
    alert('Pesan footer struk disimpan!');
  };

  const handleResetWipeAllData = () => {
    if (confirm('⚠️ PERINGATAN BAHAYA!\n\nApakah Anda yakin ingin menghapus SELURUH data organisasi, produk, sediaan, riwayat transaksi, logo, foto QRIS, dan kredensial? Tindakan ini tidak dapat dibatalkan.')) {
      if (confirm('Ketik "SETUJU" untuk mengonfirmasi tindakan pembersihan total ini.')) {
        onResetOrgData();
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Title */}
      <div className="border-b border-slate-100 pb-3">
        <h2 className="text-xl font-bold text-slate-800">{t('pengaturan_pos')}</h2>
        <p className="text-xs text-slate-500 mt-0.5">{t('sub_pengaturan')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 align-start">
        
        {/* Left Side elements column */}
        <div className="space-y-5">
          
          {/* Profile Toko Panel */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Settings className="w-4 h-4 text-slate-400" />
              <span>{t('profil_legalitas')}</span>
            </h3>

            {/* Photos Logo & Favicon triggers */}
            <div className="grid grid-cols-2 gap-3 pb-2 border-b border-slate-50">
              {/* Logo upload picker */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('logo_toko')}</span>
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                    {logoB64 ? <img src={logoB64} className="w-full h-full object-cover" alt="Logo" /> : '🏪'}
                  </div>
                  <div>
                    <input type="file" accept="image/*" id="logo-setup-file" className="hidden" onChange={handleUpdateLogo} />
                    <label htmlFor="logo-setup-file" className="px-2.5 py-1 bg-slate-100 font-bold hover:bg-slate-250 cursor-pointer text-[9px] rounded-lg text-slate-600 transition-all border border-slate-200">
                      {t('ganti_logo')}
                    </label>
                  </div>
                </div>
              </div>

              {/* Favicon picker */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('favicon_tab')}</span>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                    {favB64 ? <img src={favB64} className="w-full h-full object-cover" alt="Favicon" /> : '🏠'}
                  </div>
                  <div>
                    <input type="file" accept="image/*" id="favicon-setup-file" className="hidden" onChange={handleUpdateFavicon} />
                    <label htmlFor="favicon-setup-file" className="px-2.5 py-1 bg-slate-100 font-bold hover:bg-slate-250 cursor-pointer text-[9px] rounded-lg text-slate-600 transition-all border border-slate-200">
                      {t('ganti_fav')}
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Fields */}
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('nama_toko_utama')}</label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50/50 focus:ring-blue-500 focus:ring-2 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('no_wa_toko')}</label>
                <input
                  type="text"
                  value={storeWhatsapp}
                  onChange={(e) => setStoreWhatsapp(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50/50 focus:ring-blue-500 focus:ring-2 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('ig_opsional')}</label>
                <input
                  type="text"
                  value={igHandle}
                  onChange={(e) => setIgHandle(e.target.value)}
                  placeholder="E.g. tokokwu.id"
                  className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50/50 focus:ring-blue-500 focus:ring-2 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('alamat_lengkap')}</label>
                <textarea
                  value={storeAddress}
                  onChange={(e) => setStoreAddress(e.target.value)}
                  rows={2}
                  className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50/50 focus:ring-blue-500 focus:ring-2 focus:outline-none resize-none"
                />
              </div>

              {/* Tax configuration checkbox */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-50">
                <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={taxEnabled}
                    onChange={(e) => setTaxEnabled(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>{t('dukungan_ppn')}</span>
                </label>
                {taxEnabled && (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={taxRate}
                      onChange={(e) => setTaxRate(Number(e.target.value))}
                      className="w-12 border border-slate-200 text-xs text-center px-1 py-1 rounded-lg"
                    />
                    <span className="text-xs text-slate-400 font-bold">%</span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleSaveBusinessSubmit}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex justify-center items-center gap-1 cursor-pointer transition-all active:scale-[0.98]"
              >
                <Save className="w-3.5 h-3.5" /> {t('simpan_profil')}
              </button>
            </div>
          </div>

          {/* Opex variables card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Database className="w-4 h-4 text-emerald-500" />
              <span>{t('biaya_operasional')}</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t('sewa_gedung')}</label>
                <input
                  type="number"
                  value={expRent}
                  onChange={(e) => setExpRent(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Rp 0"
                  className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50/50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t('gaji_petugas')}</label>
                <input
                  type="number"
                  value={expSalary}
                  onChange={(e) => setExpSalary(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Rp 0"
                  className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50/50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t('listrik_air')}</label>
                <input
                  type="number"
                  value={expUtilities}
                  onChange={(e) => setExpUtilities(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Rp 0"
                  className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50/50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t('beban_operasional_lain')}</label>
                <input
                  type="number"
                  value={expOther}
                  onChange={(e) => setExpOther(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Rp 0"
                  className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50/50"
                />
              </div>
            </div>

            <button
              onClick={handleSaveExpensesSubmit}
              type="button"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex justify-center items-center gap-1 cursor-pointer transition-all active:scale-[0.98]"
            >
              <Save className="w-3.5 h-3.5" /> {t('simpan_beban')}
            </button>
          </div>

        </div>

        {/* Right Side panel configurations */}
        <div className="space-y-5">
          
          {/* QRIS Toko setting image */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3">
            <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <QrCode className="w-4 h-4 text-purple-500" />
              <span>{t('qris_mandiri')}</span>
            </h3>

            <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
              {t('sub_qris_mandiri')}
            </p>

            <div className="flex items-center gap-3">
              <div className="w-20 h-20 bg-slate-50 border border-dashed border-slate-300 rounded-2xl flex items-center justify-center p-1 shrink-0 overflow-hidden">
                {qrisB64 ? <img src={qrisB64} className="w-full h-full object-contain" alt="QRIS" /> : <QrCode className="w-6 h-6 text-slate-300" />}
              </div>
              <div>
                <input type="file" accept="image/*" id="qris-setup-file" className="hidden" onChange={handleUpdateQris} />
                <label htmlFor="qris-setup-file" className="inline-block py-2 px-4 bg-purple-55 text-purple-700 hover:bg-purple-100 border border-purple-200 font-bold rounded-xl text-xs cursor-pointer transition-all active:scale-95 text-center">
                  {t('pilih_qris')}
                </label>
                <p className="text-[9px] text-slate-400 mt-1">{t('tips_qris')}</p>
              </div>
            </div>
          </div>

          {/* Receipt Custom footer lines */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3.5">
            <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Clipboard className="w-4 h-4 text-blue-500" />
              <span>{t('memo_footer')}</span>
            </h3>

            <textarea
              value={receiptFooter}
              onChange={(e) => setReceiptFooter(e.target.value)}
              placeholder="Terima kasih atas kunjungannya! 🙏"
              rows={2}
              className="w-full text-xs px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-blue-500 focus:ring-2 focus:outline-none resize-none text-slate-700 font-semibold"
            />

            <button
              onClick={handleSaveReceiptFooterText}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex justify-center items-center gap-1 cursor-pointer transition-all active:scale-[0.98]"
            >
              <Save className="w-3.5 h-3.5" /> Simpan Pesan Custom Struk
            </button>
          </div>

          {/* Apps Script sync integration panel */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3.5 border-t-4 border-t-blue-600">
            <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <span>🔌</span>
              <span>Integrasi Google Sheets Cloud Database</span>
            </h3>

            <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
              Koneksikan web applet ini ke spreadsheet Google Drive Anda secara langsung. Seluruh sediaan, petugas kasir, dan ringkasan omset penjualan Anda akan di-backup realtime gratis!
            </p>

            <div className="space-y-3">
              <input
                type="url"
                value={gasUrlInput}
                onChange={(e) => {
                  setGasUrlInput(e.target.value);
                  setTestResult(null);
                }}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="w-full text-xs font-mono border border-slate-200 px-3 py-2.5 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-600"
              />

              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  disabled={isTesting}
                  onClick={handleTestConnection}
                  className={`w-full py-2.5 px-3 border rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-[0.98] cursor-pointer ${
                    isTesting 
                      ? 'bg-blue-50 border-blue-200 text-blue-500 cursor-wait'
                      : 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100/80 text-emerald-700 font-extrabold'
                  }`}
                >
                  {isTesting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
                      <span>Menguji Koneksi...</span>
                    </>
                  ) : (
                    <span>⚡ Uji Koneksi Database (Apps Script)</span>
                  )}
                </button>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={onOpenGasGuide}
                    className="py-2 px-3 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 rounded-xl font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <HelpCircle className="w-4 h-4" /> Buka Panduan
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveGasSubmit}
                    className="py-2 px-3 bg-blue-600 hover:bg-blue-700 font-bold rounded-xl text-white transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Save className="w-4 h-4" /> Simpan URL GAS
                  </button>
                </div>
              </div>

              {testResult && (
                <div className={`p-3 rounded-xl border text-xs leading-normal font-bold transition-all animate-in fade-in zoom-in duration-150 ${
                  testResult.success 
                    ? 'bg-emerald-55/10 border-emerald-500/30 text-emerald-600' 
                    : 'bg-rose-55/10 border-rose-500/30 text-rose-600'
                }`}>
                  {testResult.success ? '✓ ' : '⚠️ '} {testResult.message}
                </div>
              )}
            </div>
          </div>

          {/* Language Setting Block */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Globe className="w-4 h-4 text-blue-500" />
              <span>{t('pilih_bahasa')}</span>
            </h3>

            <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
              {t('sub_bahasa')}
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  changeLanguage('id');
                  alert('Bahasa diubah ke Bahasa Indonesia 🇮🇩');
                }}
                className={`py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 border cursor-pointer ${
                  lang === 'id'
                    ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/10'
                    : 'bg-slate-50 border-slate-250 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>🇮🇩</span>
                <span>Bahasa Indonesia</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  changeLanguage('en');
                  alert('Language changed to English 🇺🇸');
                }}
                className={`py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 border cursor-pointer ${
                  lang === 'en'
                    ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/10'
                    : 'bg-slate-50 border-slate-250 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>🇺🇸</span>
                <span>English (US)</span>
              </button>
            </div>
          </div>

          {/* Change PIN Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <span>🔐</span>
              <span>Ubah PIN Kredensial Admin</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">PIN Lama Anda</label>
                <input
                  type="password"
                  maxLength={6}
                  value={oldPin}
                  onChange={(e) => setOldPin(e.target.value)}
                  placeholder="PIN Lama"
                  className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50/50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">PIN Baru Kredensial</label>
                <input
                  type="password"
                  maxLength={6}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="PIN Baru"
                  className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50/50"
                />
              </div>
            </div>

            <button
              onClick={handleSavePinSubmit}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex justify-center items-center gap-1 cursor-pointer transition-all active:scale-[0.98]"
            >
              <Save className="w-3.5 h-3.5" /> Ganti PIN Admin
            </button>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50 border border-red-200 rounded-3xl p-5 shadow-sm space-y-3">
            <h3 className="font-extrabold text-sm text-red-800 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-red-500 animate-bounce" />
              <span>Zona Merah Penghapusan Data</span>
            </h3>
            <p className="text-[10px] text-red-700 font-semibold leading-relaxed">
              Tindakan di bawah merupakan tindakan rawan tinggi yang akan menyapu bersih seluruh rekaman kasir, database cache offline browser Anda, serta log keluar sistem. Gunakan hanya jika Anda ingin memulai ulang konfigurasi organisasi dari nol.
            </p>
            <button
              onClick={handleResetWipeAllData}
              className="w-full py-3 bg-red-600 hover:bg-red-700 font-extrabold text-white rounded-xl text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-95"
            >
              <Trash2 className="w-4 h-4" /> Semburkan Hapus Saja Semua Data Toko
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
