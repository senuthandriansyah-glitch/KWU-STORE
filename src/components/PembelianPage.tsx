import React, { useState } from 'react';
import { Truck, Save, History, Plus } from 'lucide-react';
import { Product, PurchaseRecord } from '../types';

interface PembelianPageProps {
  products: Product[];
  purchaseHistory: PurchaseRecord[];
  onSavePurchase: (productId: string, qty: number, cost: number, supplier: string) => void;
}

export const PembelianPage: React.FC<PembelianPageProps> = ({
  products,
  purchaseHistory,
  onSavePurchase,
}) => {
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [qtyInput, setQtyInput] = useState(1);
  const [costInput, setCostInput] = useState<number | ''>('');
  const [supplierInput, setSupplierInput] = useState('');

  const handleRecordPurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) {
      alert('Pilih produk yang ingin direstock terlebih dahulu.');
      return;
    }
    const qty = Number(qtyInput);
    const cost = costInput === '' ? 0 : Number(costInput);
    const supplier = supplierInput.trim();

    if (qty <= 0 || cost < 0 || !supplier) {
      alert('Mohon melengkapi Isian Jumlah yang valid, Harga Beli rata-rata, serta Nama Supplier.');
      return;
    }

    onSavePurchase(selectedProductId, qty, cost, supplier);
    alert('Restock pembelian sediaan berhasil tercatat!');
    
    // Reset Form
    setQtyInput(1);
    setCostInput('');
    setSupplierInput('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-800">Pembelian Stok & Restock</h2>
        <p className="text-xs text-slate-500 mt-0.5">Catat penambahan barang masuk, harga modal baru, serta supplier terdaftar</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Record replenishment Form (Col 5) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
          <h3 className="font-bold text-sm text-slate-800 mb-4 flex items-center gap-1.5 border-b border-slate-100 pb-2">
            <Truck className="w-4 h-4 text-blue-500" />
            <span>Formulir Tambah Restock</span>
          </h3>

          <form onSubmit={handleRecordPurchase} className="space-y-4">
            
            {/* Product Selector */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pilih Produk</label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2.5 bg-white focus:ring-2 focus:ring-blue-500"
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.sku ? `(${p.sku})` : ''} - Stok: {p.stock}
                  </option>
                ))}
              </select>
            </div>

            {/* Restock items Qty */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Jumlah Tambah (Pcs)</label>
              <input
                type="number"
                min={1}
                value={qtyInput}
                onChange={(e) => setQtyInput(Math.max(1, Number(e.target.value)))}
                className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2"
                placeholder="Jumlah sediaan barang masuk..."
              />
            </div>

            {/* cost HPP updated */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Harga Beli Baru per Unit (Rp)</label>
              <input
                type="number"
                value={costInput}
                onChange={(e) => setCostInput(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2"
                placeholder="HPP (Harga Beli Rata-Rata Modal)..."
              />
            </div>

            {/* Supplier */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Supplier / Pemasok</label>
              <input
                type="text"
                value={supplierInput}
                onChange={(e) => setSupplierInput(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2"
                placeholder="E.g. PT Distributor Sejahtera"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow cursor-pointer flex items-center justify-center gap-1.5 mt-2"
            >
              <Save className="w-4 h-4" /> Simpan Nota Restock
            </button>

          </form>
        </div>

        {/* History panel list scroll (Col 7) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
          <h3 className="font-bold text-sm text-slate-800 mb-4 flex items-center gap-1.5 border-b border-slate-100 pb-2">
            <History className="w-4 h-4 text-violet-500" />
            <span>Riwayat Restock Sediaan</span>
          </h3>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1 scrollbar-thin">
            {purchaseHistory.length > 0 ? (
              purchaseHistory.slice().reverse().map((record, index) => {
                const dateObj = new Date(record.date);
                const showDate = dateObj.toLocaleDateString('id-ID') + ' ' + dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
                return (
                  <div key={index} className="text-xs border-b border-slate-100 pb-3 mb-3 flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-slate-800 text-xs">{record.productName}</h4>
                      <p className="text-[10px] text-slate-400 font-medium">
                        Supplier: <strong>{record.supplier}</strong> • {showDate}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Harga modal: <strong className="text-indigo-600">Rp {record.cost.toLocaleString('id-ID')}/unit</strong>
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="inline-block bg-blue-50 text-blue-700 text-[10px] font-black px-2.5 py-1 rounded-xl">
                        +{record.qty} Pcs
                      </span>
                      <p className="text-[10px] font-extrabold text-slate-500 mt-1">
                        Rp {(record.qty * record.cost).toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-slate-400 text-center text-xs py-16 font-medium">Belum ada riwayat pencatatan pembelian restock sediaan.</p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
