import React, { useState } from 'react';
import { Search, ShoppingCart, Trash2, Tag, Percent, Receipt, AlertCircle, Play, LogOut, Check } from 'lucide-react';
import { Product, CartItem } from '../types';

interface KasirPageProps {
  products: Product[];
  categories: string[];
  cart: CartItem[];
  paymentMethod: 'tunai' | 'qris' | 'transfer';
  taxRate: number;
  onAddToCart: (id: string) => void;
  onRemoveFromCart: (id: string) => void;
  onSetPaymentMethod: (method: 'tunai' | 'qris' | 'transfer') => void;
  onCheckout: (customerName: string, discountPct: number, taxToggle: boolean, notes: string) => void;
  shiftOpen: boolean;
  onOpenShift: () => void;
  onCloseShift: (totalInShift: number) => void;
  shiftStartTime: string | null;
  shiftTransactionsSum: number;
}

export const KasirPage: React.FC<KasirPageProps> = ({
  products,
  categories,
  cart,
  paymentMethod,
  taxRate,
  onAddToCart,
  onRemoveFromCart,
  onSetPaymentMethod,
  onCheckout,
  shiftOpen,
  onOpenShift,
  onCloseShift,
  shiftStartTime,
  shiftTransactionsSum,
}) => {
  const [kasirSearch, setKasirSearch] = useState('');
  const [kasirCat, setKasirCat] = useState('');

  // Cart Form bindings
  const [customerName, setCustomerName] = useState('');
  const [discountPct, setDiscountPct] = useState(0);
  const [taxIncluded, setTaxIncluded] = useState(false);
  const [txNotes, setTxNotes] = useState('');

  const getProductImgSrc = (id: string) => {
    return localStorage.getItem('pos_img_' + id) || '';
  };

  // Pricing math
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const discountAmt = Math.round((cartSubtotal * discountPct) / 100);
  const afterDiscount = cartSubtotal - discountAmt;
  const computedTaxRate = taxRate || 11;
  const taxAmt = taxIncluded ? Math.round((afterDiscount * computedTaxRate) / 100) : 0;
  const cartTotal = afterDiscount + taxAmt;

  const handleCheckoutSubmit = () => {
    if (!shiftOpen) {
      alert('Sesi kasir (shift) belum dibuka. Buka kasir terlebih dahulu!');
      return;
    }
    if (cart.length === 0) {
      alert('Keranjang kasir kosong.');
      return;
    }
    onCheckout(customerName || 'Umum', discountPct, taxIncluded, txNotes);
    
    // Clear inputs on successful send trigger
    setCustomerName('');
    setDiscountPct(0);
    setTaxIncluded(false);
    setTxNotes('');
  };

  const handleCloseShiftTrigger = () => {
    if (confirm(`Yakin ingin menutup sesi kasir saat ini? Total transaksi terkumpul pada shift ini adalah Rp ${shiftTransactionsSum.toLocaleString('id-ID')}.`)) {
      onCloseShift(shiftTransactionsSum);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(kasirSearch.toLowerCase()) || (p.sku || '').toLowerCase().includes(kasirSearch.toLowerCase());
    const matchesCat = !kasirCat || p.category === kasirCat;
    return p.stock > 0 && matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Shift blocker if closed */}
      {!shiftOpen ? (
        <div className="min-h-[50vh] flex flex-col items-center justify-center bg-slate-50 border border-slate-100 rounded-3xl p-8 text-center shadow-inner">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-3xl flex items-center justify-center mb-4">
            <Play className="w-8 h-8 fill-blue-600 ml-1" />
          </div>
          <h3 className="text-lg font-black text-slate-800">Sesi Kasir Belum Dibuka</h3>
          <p className="text-xs text-slate-500 max-w-sm mt-1.5 mb-6">
            Silakan buka sesi kasir (buka shift) Anda untuk dapat mencatat pesanan, menghitung keranjang belanja, serta mencetak struk transaksi pelanggan.
          </p>
          <button
            onClick={onOpenShift}
            className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-bold shadow-lg shadow-blue-200 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
          >
            Buka Kasir Sekarang
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          
          {/* Header kasir */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Kasir POS</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Shift Aktif Terhitung Mulai: <span className="font-bold text-slate-700">{shiftStartTime || '-'}</span>
              </p>
            </div>
            <button
              onClick={handleCloseShiftTrigger}
              className="py-2.5 px-4 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0"
            >
              <LogOut className="w-4 h-4" /> Tutup Shift Kasir
            </button>
          </div>

          {/* Desktop & Mobile split layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 align-start">
            
            {/* Left selector item catalog (Grid Col 7) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex gap-2.5">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={kasirSearch}
                    onChange={(e) => setKasirSearch(e.target.value)}
                    placeholder="Ketik produk atau scan barcode SKU..."
                    className="w-full text-xs border border-slate-200 pl-9 pr-4 py-2.5 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <select
                  value={kasirCat}
                  onChange={(e) => setKasirCat(e.target.value)}
                  className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none"
                >
                  <option value="">Semua</option>
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Items grid selection list */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map(p => {
                    const img = getProductImgSrc(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => onAddToCart(p.id)}
                        className="bg-white border border-slate-100 rounded-2xl overflow-hidden hover:border-blue-500 hover:shadow-md text-left transition-all relative flex flex-col active:scale-[0.97]"
                      >
                        <div className="h-20 bg-slate-50 flex items-center justify-center overflow-hidden border-b border-slate-100/60 w-full">
                          {img ? (
                            <img src={img} className="w-full h-full object-cover" alt={p.name} />
                          ) : (
                            <div className="text-xl">📦</div>
                          )}
                        </div>
                        <div className="p-2 flex-1 flex flex-col justify-between">
                          <div>
                            <p className="text-[10px] text-slate-400 truncate">{p.category || 'Tanpa Kategori'}</p>
                            <h5 className="font-bold text-xs text-slate-800 truncate leading-tight mt-0.5">{p.name}</h5>
                          </div>
                          <div className="flex justify-between items-end mt-2">
                            <span className="font-extrabold text-[11px] text-emerald-600">Rp {p.price.toLocaleString('id-ID')}</span>
                            <span className="text-[9px] font-semibold text-slate-400 bg-slate-100 px-1 py-0.5 rounded">
                              Stok {p.stock}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <p className="col-span-full py-16 text-slate-400 text-center text-xs">Produk habis atau tidak cocok.</p>
                )}
              </div>
            </div>

            {/* Right side checkouts basket (Grid Col 5) */}
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between self-start sticky top-24">
              
              <div>
                <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2 mb-3">
                  <ShoppingCart className="w-4 h-4 text-blue-500" />
                  <span>Keranjang Belanja</span>
                  {cart.length > 0 && (
                    <span className="bg-blue-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center ml-auto">
                      {cart.reduce((sum, item) => sum + item.qty, 0)}
                    </span>
                  )}
                </h3>

                {/* Cart Loop */}
                <div className="space-y-2 max-h-48 overflow-y-auto mb-4 scrollbar-thin">
                  {cart.length > 0 ? (
                    cart.map(item => (
                      <div key={item.id} className="flex justify-between items-center text-xs bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <div className="truncate flex-1 pr-3">
                          <p className="font-bold text-slate-800 truncate">{item.name}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Rp {item.price.toLocaleString('id-ID')} x{item.qty}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-extrabold text-blue-900 bg-blue-50 px-2 py-1 rounded">
                            Rp {(item.price * item.qty).toLocaleString('id-ID')}
                          </span>
                          <button
                            onClick={() => onRemoveFromCart(item.id)}
                            className="bg-red-50 hover:bg-red-100 text-red-600 p-1 rounded-lg transition-all"
                            title="Hapus Satu Item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-slate-400 text-xs text-medium">
                      Keranjang kasir masih kosong. Klik salah satu produk di daftar katalog untuk menambahkan.
                    </div>
                  )}
                </div>
              </div>

              {/* Bill Details Inputs */}
              <div className="border-t border-slate-100 pt-3 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Nama Pelanggan"
                    className="text-xs border border-slate-200 px-3 py-2 rounded-xl focus:ring-blue-500 focus:ring-2 w-full bg-slate-50/50"
                  />
                  <div className="relative">
                    <Percent className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={discountPct || ''}
                      onChange={(e) => setDiscountPct(Math.min(100, Math.max(0, Number(e.target.value))))}
                      placeholder="Disc %"
                      className="text-xs border border-slate-200 pl-3 pr-8 py-2 rounded-xl focus:ring-blue-500 focus:ring-2 w-full bg-slate-50/50 font-bold"
                    />
                  </div>
                </div>

                {/* Tax Option toggle checkbox */}
                <div className="flex justify-between items-center text-xs bg-slate-50 p-2 rounded-xl">
                  <label className="text-slate-500 font-semibold cursor-pointer select-none flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={taxIncluded}
                      onChange={(e) => setTaxIncluded(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                    <span>Aktifkan PPN {computedTaxRate}%</span>
                  </label>
                  {taxIncluded && <span className="font-extrabold text-blue-600">Rp {taxAmt.toLocaleString('id-ID')}</span>}
                </div>

                <input
                  type="text"
                  value={txNotes}
                  onChange={(e) => setTxNotes(e.target.value)}
                  placeholder="Catatan Transaksi..."
                  className="text-xs border border-slate-200 px-3 py-2 rounded-xl focus:ring-blue-500 focus:ring-2 w-full bg-slate-50/50"
                />

                {/* Subtotals & Grandtotal Panel */}
                <div className="text-xs bg-slate-100/40 border border-slate-100 p-3 rounded-2xl space-y-1.5">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal</span>
                    <span>Rp {cartSubtotal.toLocaleString('id-ID')}</span>
                  </div>
                  {discountPct > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Harga Diskon ({discountPct}%)</span>
                      <span>-Rp {discountAmt.toLocaleString('id-ID')}</span>
                    </div>
                  )}
                  {taxIncluded && (
                    <div className="flex justify-between text-blue-600">
                      <span>Biaya Pajak PPN</span>
                      <span>Rp {taxAmt.toLocaleString('id-ID')}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-black text-sm text-slate-900 border-t border-slate-200/60 pt-1.5 mt-1">
                    <span>TOTAL TAGIHAN</span>
                    <span className="text-blue-900 text-base">Rp {cartTotal.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                {/* Payment Selection Methods */}
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Metode Pembayaran</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['tunai', 'qris', 'transfer'] as const).map(method => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => onSetPaymentMethod(method)}
                        className={`py-2 text-[10px] font-bold rounded-xl border transition-all text-center capitalize ${
                          paymentMethod === method
                            ? 'bg-blue-600 text-white border-blue-600 shadow'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {method === 'tunai' && '💵 Tunai'}
                        {method === 'qris' && '🔳 QRIS'}
                        {method === 'transfer' && '🏦 Bank'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Trigger confirmation */}
                <button
                  onClick={handleCheckoutSubmit}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold active:scale-[0.98] transition-all shadow-md mt-1 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Receipt className="w-4 h-4" /> Bayar & Cetak Nota Lunas
                </button>

              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};
