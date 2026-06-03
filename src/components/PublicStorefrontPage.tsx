import React, { useState } from 'react';
import { Search, ShoppingCart, ShoppingBag, Plus, Trash2, Send, ArrowRight, BookOpen, Globe } from 'lucide-react';
import { Product, CartItem, OnlineOrder } from '../types';
import { AppGuideModal } from './AppGuideModal';
import { useLanguage } from '../utils/lang';

interface PublicStorefrontPageProps {
  products: Product[];
  categories: string[];
  storeName: string;
  storeLogo: string;
  storeWhatsapp: string;
  storeInstagram: string;
  orgId: string;
  onSendPublicOrder: (order: OnlineOrder) => void;
  onAdminLoginToggle: () => void;
}

export const PublicStorefrontPage: React.FC<PublicStorefrontPageProps> = ({
  products,
  categories,
  storeName,
  storeLogo,
  storeWhatsapp,
  storeInstagram,
  orgId,
  onSendPublicOrder,
  onAdminLoginToggle,
}) => {
  const { lang, changeLanguage, t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStore, setSelectedStore] = useState('');
  const [searchText, setSearchText] = useState('');
  const [custCart, setCustCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerWhatsapp, setCustomerWhatsapp] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [showQrisCode, setShowQrisCode] = useState(false);
  const [isCartExpanded, setIsCartExpanded] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Extract unique stores active in database
  const activeStores = Array.from(new Set(products.map(p => p.storeName || storeName).filter(Boolean)));

  const getProductImgSrc = (id: string) => {
    return localStorage.getItem('pos_img_' + id) || '';
  };

  const handleAddToCart = (p: Product) => {
    const existing = custCart.find(item => item.id === p.id);
    if (existing) {
      if (existing.qty >= p.stock) {
        alert('Stok sediaan barang di toko terbatas.');
        return;
      }
      setCustCart(custCart.map(item => item.id === p.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCustCart([...custCart, { id: p.id, name: p.name, price: p.price, cost: p.cost || 0, qty: 1 }]);
    }
  };

  const handleRemoveFromCart = (id: string) => {
    setCustCart(custCart.filter(item => item.id !== id));
  };

  const cartTotal = custCart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const handleCheckoutSend = () => {
    const name = customerName.trim();
    const phone = customerWhatsapp.trim();
    if (!name) {
      alert('Tulis nama lengkap Anda terlebih dahulu.');
      return;
    }
    if (!phone) {
      alert('Tulis nomor WhatsApp Anda terlebih dahulu agar toko dapat menghubungi Anda.');
      return;
    }
    if (!pickupDate || !pickupTime) {
      alert('Konsep KWU Store adalah PRE-ORDER & PICKUP.\nMohon pilih Tanggal dan Jam pengambilan sediaan pesanan Anda di gerai terlebih dahulu.');
      return;
    }
    const targetWhatsapp = storeWhatsapp || '62';

    const orderId = 'ORD' + Date.now().toString().slice(-8);
    const order: OnlineOrder = {
      id: orderId,
      name,
      items: custCart,
      total: cartTotal,
      date: new Date().toISOString(),
      status: 'pending',
      whatsapp: phone,
      pickupDate,
      pickupTime,
      storeName: selectedStore || storeName,
      notes: orderNotes.trim() || undefined
    };

    // Callback to register locally/cloud DB
    onSendPublicOrder(order);

    // Format WhatsApp message text block with Pre-order Pickup details
    const formattedItems = custCart
      .map(item => `• ${item.name} x${item.qty} = Rp ${(item.price * item.qty).toLocaleString('id-ID')}`)
      .join('\n');

    const formattedDate = new Date(pickupDate).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const notesText = orderNotes.trim() ? `\n*Catatan Tambahan:* _${orderNotes.trim()}_` : '';

    const wpMessage = `Halo ${storeName}! 🏪\nSaya mengajukan PRE-ORDER produk di toko Anda:\n\n*Nama Pemesan:* ${name}\n*No WhatsApp:* ${phone}\n*Rencana Ambil:* ${formattedDate} Pukul ${pickupTime} WIB\n*Metode:* Self-Pickup (Ambil Sendiri di Gerai)${notesText}\n\n*Daftar Belanjaan:*\n${formattedItems}\n\n*Total Tagihan:* *Rp ${cartTotal.toLocaleString('id-ID')}*\n*Order ID:* ${orderId}\n\nMohon siapkan pesanan sediaan sesuai jam tersebut. Terima kasih! 🙏`;
    
    // Clear storefront cart after checkout
    setCustCart([]);
    setCustomerName('');
    setCustomerWhatsapp('');
    setPickupDate('');
    setPickupTime('');
    setOrderNotes('');
    setShowQrisCode(false);
    setIsCartExpanded(false);

    // Open WhatsApp
    const waUrl = `https://wa.me/${targetWhatsapp}?text=${encodeURIComponent(wpMessage)}`;
    window.open(waUrl, '_blank');

    if (storeInstagram) {
      // Allow Instagram copy helper
      const igMsg = `Halo Kak @${storeInstagram}! Saya baru saja mengorder produk dengan Order ID: #${orderId}. Mohon di-approve ya!`;
      navigator.clipboard.writeText(igMsg).catch(() => {});
      alert(`Pesanan berhasil dikirim ke Toko! 🎉\n\nOrder ID: ${orderId}\nWaktu Pengambilan: ${formattedDate} (${pickupTime})\n\nPesan konfirmasi Instagram telah kami salin ke clipboard Anda:\n"${igMsg}"\nSilakan DM Instagram kami @${storeInstagram} untuk respon kilat!`);
    } else {
      alert(`Pesanan Pre-Order berhasil diajukan! 🎉\n\nOrder ID: ${orderId}\nWaktu Pengambilan: ${formattedDate} sekitar pukul ${pickupTime} WIB.\n\nMenghubungkan langsung ke WhatsApp Penjual.`);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesCat = !selectedCategory || p.category === selectedCategory;
    const matchesStore = !selectedStore || (p.storeName || storeName) === selectedStore;
    const matchesSearch = !searchText || p.name.toLowerCase().includes(searchText.toLowerCase());
    return p.stock > 0 && matchesCat && matchesStore && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between animate-in fade-in duration-200">
      
      {/* Banner / Store Header */}
      <header className="bg-gradient-to-r from-blue-700 via-blue-900 to-indigo-900 shadow-md">
        <div className="max-w-4xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white border border-white/20 overflow-hidden flex items-center justify-center p-1 shrink-0">
              {storeLogo ? <img src={storeLogo} className="w-full h-full object-cover rounded-xl" alt="Store logo" /> : <span className="text-3xl">🏪</span>}
            </div>
            <div className="text-white text-left">
              <h1 className="font-extrabold text-base tracking-wide leading-tight uppercase">{storeName || 'KWU Store'}</h1>
              <p className="text-[10px] text-blue-200 mt-0.5 font-bold uppercase tracking-widest">Digital Online Storefront</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsGuideOpen(true)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white rounded-xl text-xs font-black shadow-sm border border-blue-405/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-200" />
              <span>{t('panduan')}</span>
            </button>
            <button
              onClick={onAdminLoginToggle}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/25 active:scale-95 text-white rounded-xl text-xs font-black shadow border border-white/30 transition-all flex items-center gap-1 cursor-pointer"
            >
              <span>{t('adminLogin')}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Core Body */}
      <main className="max-w-4xl w-full mx-auto p-4 md:p-5 flex-1 space-y-6">
        
        {/* Concept Notice Banner */}
        <div className="bg-amber-500/10 border-2 border-amber-500/20 rounded-2xl p-4 text-xs text-amber-850 flex items-start gap-3">
          <span className="text-xl">🔔</span>
          <div>
            <h4 className="font-extrabold uppercase tracking-wide text-amber-900">
              {lang === 'en' ? 'IMPORTANT INFORMATION (NO DELIVERY)' : 'INFORMASI PENTING (TANPA KURIR/PENGIRIMAN)'}
            </h4>
            <p className="mt-1 leading-relaxed font-semibold">
              {lang === 'en'
                ? 'This store operates under standard Pre-Order & Self-Pickup. You choose pickup date and estimate hour, then take your items directly to the booths. Pay via Cash or QRIS on spot.'
                : 'KWU Store beroperasi dengan konsep Pre-Order & Self-Pickup. Anda menentukan tanggal & waktu pengambilan pesanan, lalu mengambilnya langsung di gerai toko sediaan bersangkutan. Pembayaran via QRIS atau Tunai di tempat.'}
            </p>
          </div>
        </div>

        {/* Search Input bar query & Store Switcher */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder={t('cari_produk')}
              className="w-full pl-10 pr-4 py-3 text-xs border border-slate-200 rounded-2xl bg-white shadow-xs focus:ring-blue-500 focus:ring-2 focus:outline-none focus:border-transparent font-medium text-slate-705"
            />
          </div>

          {/* Multi-Toko Selector */}
          <div className="relative">
            <select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="w-full py-3 px-3.5 text-xs bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-extrabold text-slate-700 cursor-pointer appearance-none"
            >
              <option value="">🏪 {t('semua_mitra')}</option>
              {activeStores.map(st => (
                <option key={st} value={st}>🏬 Toko: {st}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Categories Tab selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition-all ${
              !selectedCategory
                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Semua Kategori
          </button>
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition-all ${
                selectedCategory === c
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Products Grid list */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-28">
          {filteredProducts.length > 0 ? (
            filteredProducts.map(p => {
              const img = getProductImgSrc(p.id);
              const isSelectedInCart = custCart.find(item => item.id === p.id);
              return (
                <div
                  key={p.id}
                  onClick={() => handleAddToCart(p)}
                  className="bg-white border border-slate-100 rounded-3xl overflow-hidden hover:shadow-md transition-all text-left flex flex-col active:scale-[0.98] cursor-pointer group shadow-xs"
                >
                  <div className="h-28 bg-slate-50 flex items-center justify-center overflow-hidden border-b border-slate-100/60 w-full relative">
                    {img ? (
                      <img src={img} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300" alt={p.name} />
                    ) : (
                      <div className="text-3xl text-slate-300">📦</div>
                    )}
                    {isSelectedInCart && (
                      <span className="absolute top-2 right-2 bg-blue-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow animate-bounce">
                        {isSelectedInCart.qty}
                      </span>
                    )}
                  </div>
                  <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <div className="flex justify-between items-center text-[9px] uppercase tracking-widest font-bold text-slate-400">
                        <span>{p.category || 'Umum'}</span>
                        <span className="text-blue-500 font-extrabold font-sans normal-case">@{p.storeName || storeName}</span>
                      </div>
                      <h4 className="font-extrabold text-xs text-slate-800 leading-tight mt-1 truncate">{p.name}</h4>
                    </div>
                    <div className="flex justify-between items-end">
                      <div className="text-left">
                        <p className="text-[8px] text-slate-400 uppercase font-black leading-none">Harga</p>
                        <span className="font-black text-emerald-600 text-xs mt-0.5 inline-block">Rp {p.price.toLocaleString('id-ID')}</span>
                      </div>
                      <button
                        type="button"
                        className="py-1.5 px-3 bg-blue-50 text-blue-700 text-[10px] font-black hover:bg-blue-100 rounded-xl flex items-center gap-0.5-wide"
                      >
                        <Plus className="w-3w-3" /> Ambil
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="col-span-full py-16 text-center text-slate-400 text-xs font-semibold">
              Belum ada produk sediaan yang dipublish oleh Admin di toko ini.
            </p>
          )}
        </div>

      </main>

      {/* Floating Bottom Card Order tray Basket */}
      {custCart.length > 0 && !isCartExpanded && (
        <div className="fixed bottom-4 left-4 right-4 bg-slate-900/95 backdrop-blur-md text-white rounded-3xl shadow-2xl px-5 py-4 z-[9990] flex items-center justify-between border border-white/10 animate-in slide-in-from-bottom duration-300 max-w-lg mx-auto">
          <div className="flex items-center gap-3">
            <div className="relative bg-white/10 p-2.5 rounded-2xl">
              <ShoppingCart className="w-5 h-5 text-blue-300" />
              <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-950 shadow-sm animate-pulse">
                {custCart.reduce((sum, item) => sum + item.qty, 0)}
              </span>
            </div>
            <div className="text-left">
              <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">Keranjang Belanja</p>
              <p className="text-xs font-semibold text-slate-300 mt-0.5">{custCart.length} menu terpilih</p>
              <p className="text-sm font-black text-emerald-400 font-sans">Rp {cartTotal.toLocaleString('id-ID')}</p>
            </div>
          </div>
          <button
            onClick={() => setIsCartExpanded(true)}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-black rounded-2xl shadow-lg shadow-blue-500/20 transition-all flex items-center gap-1.5 cursor-pointer hover:shadow-xl"
          >
            <span>Buka & Checkout</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Expanded Modal Bottom Sheet */}
      {custCart.length > 0 && isCartExpanded && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-[9990] flex items-end justify-center animate-in fade-in duration-200"
          onClick={() => setIsCartExpanded(false)}
        >
          <div 
            className="w-full max-w-lg bg-white rounded-t-[32px] p-5 md:p-6 shadow-2xl border-t border-slate-200 animate-in slide-in-from-bottom duration-300 space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            
            <div className="flex justify-between items-center text-xs border-b border-slate-100 pb-3">
              <span className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-blue-600" /> Detail Keranjang Belanja ({custCart.length})
              </span>
              <button 
                onClick={() => setIsCartExpanded(false)}
                className="text-[10px] font-black uppercase text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200/80 px-3 py-2 rounded-xl transition-all cursor-pointer"
              >
                ✕ Let's Shop Better
              </button>
            </div>

            {/* Micro items list */}
            <div className="space-y-1.5 max-h-36 overflow-y-auto scrollbar-thin pr-1">
              {custCart.map(item => (
                <div key={item.id} className="flex justify-between items-center text-xs bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-100/80">
                  <div className="text-left font-semibold text-slate-800 max-w-[200px]">
                    <p className="truncate font-black">{item.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Rp {item.price.toLocaleString('id-ID')} / pcs</p>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className="text-slate-400 font-extrabold text-xs">x{item.qty}</span>
                    <span className="font-black text-blue-900 bg-blue-50/80 border border-blue-100 px-2 py-1 rounded-lg">
                      Rp {(item.price * item.qty).toLocaleString('id-ID')}
                    </span>
                    <button
                      onClick={() => handleRemoveFromCart(item.id)}
                      className="text-red-500 hover:text-white p-1.5 hover:bg-red-500 rounded-xl transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-3">
              <div className="flex justify-between items-center font-black text-xs text-slate-800 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-100">
                <span className="text-emerald-800 font-black">TOTAL ESTIMASI PRE-ORDER</span>
                <span className="text-sm text-emerald-700">Rp {cartTotal.toLocaleString('id-ID')}</span>
              </div>

              {/* Preorder Schedule Inputs */}
              <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase mb-1">📅 Tanggal Ambil</label>
                  <input
                    type="date"
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    className="w-full text-[10px] border border-slate-300 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase mb-1">⏰ Estimasi Jam Ambil</label>
                  <input
                    type="time"
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    className="w-full text-[10px] border border-slate-300 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 font-bold text-slate-800"
                  />
                </div>
                <p className="text-[9px] text-slate-500 font-semibold block col-span-2 text-center mt-1">
                  💡 Jam Ambil Gerai: <span className="text-blue-600 font-black">08:00 - 17:00 WIB</span> (Senin - Jumat)
                </p>
              </div>

              {/* Checkout inputs */}
              <div className="space-y-2">
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Nama Lengkap Pemesan..."
                  className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2.5 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-600 font-semibold text-slate-705"
                />
                
                <input
                  type="tel"
                  value={customerWhatsapp}
                  onChange={(e) => setCustomerWhatsapp(e.target.value)}
                  placeholder="Nomor WhatsApp Anda (Contoh: 08123456789)"
                  className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2.5 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-600 font-semibold text-slate-705"
                />

                <input
                  type="text"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Catatan Khusus (misal: es dikit, bungkus pisah)..."
                  className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2.5 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-600 font-semibold text-slate-705"
                />

                {/* QRIS & Payment Info Box */}
                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/60 text-left space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] font-bold text-slate-600 uppercase flex items-center gap-1">
                      💳 Pembayaran Pre-Order
                    </p>
                    {localStorage.getItem('pos_qris') && (
                      <button
                        type="button"
                        onClick={() => setShowQrisCode(!showQrisCode)}
                        className="text-[9px] font-black uppercase text-blue-600 hover:text-blue-800 transition-all bg-blue-50 px-2 py-1 rounded-lg cursor-pointer"
                      >
                        {showQrisCode ? 'Sembunyikan QRIS ✕' : 'Tampilkan QRIS Toko 📱'}
                      </button>
                    )}
                  </div>
                  <p className="text-[9.5px] text-slate-500 font-medium leading-relaxed">
                    Pembayaran diselesaikan langsung saat pengambilan barang di gerai sediaan (mendukung <strong>QRIS Elektronik</strong> atau <strong>Tunai/Cash</strong>).
                  </p>

                  {showQrisCode && localStorage.getItem('pos_qris') && (
                    <div className="pt-2 flex flex-col items-center justify-center bg-white p-3 rounded-xl border border-slate-100 animate-in zoom-in-95 duration-200">
                      <p className="text-[9px] font-black uppercase text-slate-400 mb-2">QRIS RESMI {storeName || 'KWU Store'}</p>
                      <img 
                        src={localStorage.getItem('pos_qris') || ''} 
                        alt="QRIS Toko Resmi" 
                        className="max-h-56 max-w-full rounded-lg border border-slate-200 shadow-xs"
                      />
                      <p className="text-[9px] text-slate-500 font-bold mt-2 text-center">Silakan scan kode QRIS di atas untuk menyelesaikan pesanan non-tunai Anda.</p>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleCheckoutSend}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black shadow-lg shadow-emerald-600/10 transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                >
                  Pesan Pre-Order & Kirim WhatsApp <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      <AppGuideModal 
        isOpen={isGuideOpen} 
        onClose={() => setIsGuideOpen(false)} 
        defaultTab="customer"
      />

    </div>
  );
};
