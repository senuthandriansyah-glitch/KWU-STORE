import React, { useState, useEffect } from 'react';

export type Language = 'id' | 'en';

const translations = {
  id: {
    // Nav Items
    dashboard: "Dashboard",
    pesanan_masuk: "Pesanan Masuk",
    katalog: "Katalog",
    pembelian: "Restock Pembelian",
    kasir: "Kasir POS",
    laporan: "Laporan Keuangan",
    riwayat: "Riwayat Transaksi",
    pelanggan: "Data Pelanggan",
    petugas: "Kelola Petugas",
    pengaturan: "Pengaturan Sesi",
    
    // Storefront general
    adminLogin: "🔐 Login Admin",
    panduan: "📖 Panduan",
    cari_produk: "Cari produk...",
    semua_kategori: "Semua Kategori",
    semua_mitra: "Semua Toko Mitra",
    hubungi_admin_wa: "Hubungi Admin",
    stok_per_mitra: "sediaan per kelompok",
    stok_habis: "Habis",
    keranjang: "Keranjang Belanja",
    menu_terpilih: "menu terpilih",
    buka_checkout: "Buka & Checkout",
    detail_keranjang: "Detail Keranjang Belanja",
    batal_shop: "Let's Shop Better",
    total_estimasi: "TOTAL ESTIMASI PRE-ORDER",
    tanggal_ambil: "Tanggal Ambil",
    estimasi_jam_ambil: "Estimasi Jam Ambil",
    jam_ambil_gerai: "Jam Ambil Gerai: 08:00 - 17:00 WIB (Senin - Jumat)",
    nama_lengkap_pemesan: "Nama Lengkap Pemesan...",
    no_wa: "Nomor WhatsApp Anda (Contoh: 08123456789)",
    catatan_khusus: "Catatan Khusus (misal: es dikit, bungkus pisah)...",
    pembayaran_preorder: "💳 Pembayaran Pre-Order",
    sembunyikan_qris: "Sembunyikan QRIS ✕",
    tampilkan_qris: "Tampilkan QRIS Toko 📱",
    pesan_whatsapp: "Pesan Pre-Order & Kirim WhatsApp",
    pembayaran_info: "Pembayaran diselesaikan langsung saat pengambilan barang di gerai sediaan (mendukung QRIS Elektronik atau Tunai/Cash).",
    qris_resmi: "QRIS RESMI",
    scan_qris: "Silakan scan kode QRIS di atas untuk menyelesaikan pesanan non-tunai Anda.",

    // Alerts/validations
    stok_terbatas: "Stok sediaan barang di toko terbatas.",
    tulis_nama: "Tulis nama lengkap Anda terlebih dahulu.",
    tulis_wa: "Tulis nomor WhatsApp Anda terlebih dahulu agar toko dapat menghubungi Anda.",
    konsep_pickup: "Konsep KWU Store adalah PRE-ORDER & PICKUP.\nMohon pilih Tanggal dan Jam pengambilan sediaan pesanan Anda di gerai terlebih dahulu.",
    checkout_sukses: "Pesanan Pre-Order berhasil diajukan! 🎉",
    ig_co_sukses: "Pesanan berhasil dikirim ke Toko! 🎉",

    // Guide Modal
    panduan_optimal: "Panduan Optimal Aplikasi",
    manual_tips: "Manual Book, Alur Pembelian & Tips Sukses Bisnis",
    alur_pelanggan: "Alur Pelanggan",
    alur_kasir_admin: "Alur Kasir/Admin",
    printer_struk: "Printer Struk",
    bagi_hasil: "Sistem Bagi Hasil",
    selesai_membaca: "Selesai Membaca 🚀",

    // Settings Page
    pengaturan_pos: "Pengaturan POS Terpadu",
    sub_pengaturan: "Konfigurasi profil toko, database sinkronisasi sheets, pin pengaman, opex serta struk belanja",
    profil_legalitas: "Profil Legalitas Toko",
    logo_toko: "Logo Toko",
    ganti_logo: "Ganti Logo",
    favicon_tab: "Favicon Tab",
    ganti_fav: "Ganti Fav",
    nama_toko_utama: "Nama Toko Utama",
    no_wa_toko: "No. Whatsapp Toko (E.g. 62812...)",
    ig_opsional: "Instagram Handle (Opsional)",
    alamat_lengkap: "Alamat Lengkap Toko",
    dukungan_ppn: "Dukungan Pajak PPN Default",
    simpan_profil: "Simpan Profil & Legalitas",
    biaya_operasional: "Biaya Operasional Toko Bulanan (Opex)",
    sewa_gedung: "Sewa Gedung / Lapak",
    gaji_petugas: "Gaji Petugas / Kasir",
    listrik_air: "Listrik & Air Bersih",
    beban_operasional_lain: "Beban Opex Lainnya",
    simpan_beban: "Simpan Beban Operasional",
    qris_mandiri: "Gambar QRIS Toko Mandiri",
    sub_qris_mandiri: "Unggah foto barcode QRIS (Gopay/ShopeePay/OVO/Dana/BCA/dll) Anda di bawah ini supaya kasir & pembeli online dapat memindai langsung secara realtime.",
    pilih_qris: "📁 Pilih Foto QRIS dari Galeri",
    tips_qris: "Dapatkan foto QRIS dari m-banking atau e-wallet lalu unggah.",
    memo_footer: "Memo & Pesan Kaki (Footer) Struk",
    simpan_footer: "Simpan Pesan Custom Struk",
    integrasi_sheets: "Integrasi Google Sheets Cloud Database",
    sub_sheets: "Koneksikan web applet ini ke spreadsheet Google Drive Anda secara langsung. Seluruh sediaan, petugas kasir, dan ringkasan omset penjualan Anda akan di-backup realtime gratis!",
    uji_koneksi: "⚡ Uji Koneksi Database (Apps Script)",
    menguji_koneksi: "Menguji Koneksi...",
    buka_panduan: "Buka Panduan",
    simpan_url: "Simpan URL GAS",
    ubah_pin_admin: "🔐 Ubah PIN Kredensial Admin",
    pin_lama: "PIN Lama Anda",
    pin_baru: "PIN Baru Kredensial",
    ganti_pin: "Ganti PIN Admin",
    zona_bahaya: "Zona Merah Penghapusan Data",
    sub_zona_bahaya: "Tindakan di bawah merupakan tindakan rawan tinggi yang akan menyapu bersih seluruh rekaman kasir, database cache offline browser Anda, serta log keluar sistem. Gunakan hanya jika Anda ingin memulai ulang konfigurasi organisasi dari nol.",
    hapus_semua: "Semburkan Hapus Saja Semua Data Toko",
    buku_panduan_pos: "Buku Panduan POS",
    log_out: "Keluar Sesi",

    // Language configuration label
    pilih_bahasa: "Bahasa Aplikasi (Language Setting)",
    sub_bahasa: "Pilih bahasa tampilan untuk pelanggan dan admin"
  },
  en: {
    // Nav Items
    dashboard: "Dashboard",
    pesanan_masuk: "Incoming Orders",
    katalog: "Catalog",
    pembelian: "Restock Purchases",
    kasir: "Cashier POS",
    laporan: "Financial Reports",
    riwayat: "Transaction History",
    pelanggan: "Customer Data",
    petugas: "Staff Management",
    pengaturan: "Session Settings",

    // Storefront general
    adminLogin: "🔐 Admin Login",
    panduan: "📖 Guide Docs",
    cari_produk: "Search products...",
    semua_kategori: "All Categories",
    semua_mitra: "All Partner Stores",
    hubungi_admin_wa: "Contact Admin",
    stok_per_mitra: "stock per group",
    stok_habis: "Sold Out",
    id_lang: "Bahasa Indonesia",
    en_lang: "English (US)",
    keranjang: "Shopping Cart",
    menu_terpilih: "items selected",
    buka_checkout: "Open & Checkout",
    detail_keranjang: "Detailed Cart Info",
    batal_shop: "Keep Shopping",
    total_estimasi: "TOTAL PRE-ORDER ESTIMATION",
    tanggal_ambil: "Pickup Date",
    estimasi_jam_ambil: "Pickup Time Estimation",
    jam_ambil_gerai: "Pickup Hours: 08:05 AM - 05:00 PM WIB (Mon - Fri)",
    nama_lengkap_pemesan: "Full Name...",
    no_wa: "WhatsApp Number (e.g. +628123456789)",
    catatan_khusus: "Special Notes (e.g. less sugar, separate container)...",
    pembayaran_preorder: "Pre-order Payment Information",
    sembunyikan_qris: "Hide QRIS Code ✕",
    tampilkan_qris: "Show Shop QRIS Code 📱",
    pesan_whatsapp: "Make Pre-order & Send WhatsApp",
    pembayaran_info: "Payments are completed in person upon pickup at the store booth (understands Cash/QRIS).",
    qris_resmi: "OFFICIAL QRIS CODE",
    scan_qris: "Scan this QR code above to complete your non-cash transactions.",

    // Alerts / validations
    stok_terbatas: "Sorry, available store stock is limited.",
    tulis_nama: "Please write down your full name first.",
    tulis_wa: "Please write your WhatsApp number so we can reach you.",
    konsep_pickup: "This Kewirausahaan Store operates via PRE-ORDER & PICKUP.\nPlease choose your pickup Date and Time first.",
    checkout_sukses: "Pre-Order successfully submitted! 🎉",
    ig_co_sukses: "Order sent to shop successfully! 🎉",

    // Guide Modal
    panduan_optimal: "App Guide Book & Manual",
    manual_tips: "User Guide, Order Flow & Startup Tips",
    alur_pelanggan: "Customer Flow",
    alur_kasir_admin: "Cashier/Admin Flow",
    printer_struk: "Receipt Printer",
    bagi_hasil: "Revenue Share System",
    selesai_membaca: "Finish Reading Guide 🚀",

    // Settings Page
    pengaturan_pos: "Unified POS Settings",
    sub_pengaturan: "Configure store profiles, Sheets syncing database, security admin pins, opex variables & cash invoice layout info",
    profil_legalitas: "Legal Store Identity",
    logo_toko: "Store Logo",
    ganti_logo: "Change Logo",
    favicon_tab: "Favicon Tab Icon",
    ganti_fav: "Change Fav",
    nama_toko_utama: "Store Display Name",
    no_wa_toko: "Store WhatsApp Contact No (e.g., 62812...)",
    ig_opsional: "Instagram Handle Link (Optional)",
    alamat_lengkap: "Complete Store Address",
    dukungan_ppn: "Enable Default Government VAT Tax",
    simpan_profil: "Save Store Identity",
    biaya_operasional: "Monthly Store Operating Expenses (Opex)",
    sewa_gedung: "Rent / Booth Fees",
    gaji_petugas: "Staff / Cashor Wages",
    listrik_air: "Electricity & Utility Bills",
    beban_operasional_lain: "Other Opex Reserves",
    simpan_beban: "Save Operational Expenses",
    qris_mandiri: "Digital Store QRIS Image",
    sub_qris_mandiri: "Upload your store QRIS image (BCA/Gopay/OVO/Dana) below so cashiers and online pre-order customers can scan directly.",
    pilih_qris: "📁 Choose QRIS Image from Device",
    tips_qris: "Get your QRIS code from bank or digital wallets, then upload it.",
    memo_footer: "Custom Invoice Footer Message",
    simpan_footer: "Save Custom Receipt Footer",
    integrasi_sheets: "Google Sheets Cloud Database Sync",
    sub_sheets: "Directly sync this web applet to your Google Drive workbook. Free, instant backups for all transactions, staff members, and stock levels!",
    uji_koneksi: "⚡ Verify Sheet API Connection",
    menguji_koneksi: "Verifying API...",
    buka_panduan: "Open Integration Guide",
    simpan_url: "Save GAS Server URL",
    ubah_pin_admin: "🔐 Reset Administrator Security PIN",
    pin_lama: "Your Current PIN",
    pin_baru: "New Numeric PIN",
    ganti_pin: "Verify and Update PIN",
    zona_bahaya: "Dangerous Reset Operations",
    sub_zona_bahaya: "The actions below will clear all local transaction caches, wipe staff roles, reset branding assets, and log everyone out. Use only under full reset requirements.",
    hapus_semua: "Wipe & Re-initialize Entire Database",
    buku_panduan_pos: "POS Quick Guide",
    log_out: "Log Out Session",

    // Language configuration label
    pilih_bahasa: "Bahasa Aplikasi (Language Setting)",
    sub_bahasa: "Pilih bahasa tampilan untuk pelanggan dan admin"
  }
};

export const useLanguage = () => {
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('pos_lang') as Language) || 'id';
  });

  const changeLanguage = (newLang: Language) => {
    localStorage.setItem('pos_lang', newLang);
    setLang(newLang);
    // Force some events if needed
    window.dispatchEvent(new Event('storage'));
  };

  useEffect(() => {
    const handleStorageChange = () => {
      const stored = (localStorage.getItem('pos_lang') as Language) || 'id';
      setLang(stored);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const t = (key: keyof typeof translations['id']) => {
    const dict = translations[lang] || translations['id'];
    return dict[key] || translations['id'][key] || key;
  };

  return { lang, changeLanguage, t };
};
