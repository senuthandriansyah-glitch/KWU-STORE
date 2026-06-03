import React, { useState } from 'react';
import { Search, RotateCcw, Calendar, TrendingUp, TrendingDown, ReceiptText, Eye } from 'lucide-react';
import { Transaction } from '../types';

interface RiwayatPageProps {
  transactions: Transaction[];
  currentRole: 'admin' | 'kasir';
  staffName: string;
  onReviewInvoice: (tx: Transaction) => void;
}

export const RiwayatPage: React.FC<RiwayatPageProps> = ({
  transactions,
  currentRole,
  staffName,
  onReviewInvoice,
}) => {
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');

  // Filtering transactions based on role constraints & date range selectors
  const getFilteredTransactions = () => {
    let list = [...transactions];

    if (currentRole === 'kasir') {
      list = list.filter(t => t.operator === staffName);
    }

    if (dateStart) {
      list = list.filter(t => new Date(t.date).toISOString().split('T')[0] >= dateStart);
    }

    if (dateEnd) {
      list = list.filter(t => new Date(t.date).toISOString().split('T')[0] <= dateEnd);
    }

    return list;
  };

  const filteredTx = getFilteredTransactions();

  // Summary widgets computation details
  const totalInflow = filteredTx.filter(t => t.status === 'selesai').reduce((s, t) => s + (Number(t.total) || 0), 0);
  const totalOutflow = filteredTx.filter(t => t.status === 'selesai').reduce((s, t) => s + (Number(t.totalCost) || 0), 0);
  const netCollection = totalInflow - totalOutflow;

  const handleClearFilters = () => {
    setDateStart('');
    setDateEnd('');
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-800">Riwayat Transaksi</h2>
        <p className="text-xs text-slate-500 mt-0.5">Pantau arus uang masuk per nota penjualan, edit status lunas, dan cetak ulang invoice</p>
      </div>

      {/* Date Filters selectors panel */}
      <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/60 p-4 rounded-2xl flex-wrap">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>Rentang Tanggal:</span>
        </div>
        <input
          type="date"
          value={dateStart}
          onChange={(e) => setDateStart(e.target.value)}
          className="bg-white border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <span className="text-xs text-slate-400 font-bold">s/d</span>
        <input
          type="date"
          value={dateEnd}
          onChange={(e) => setDateEnd(e.target.value)}
          className="bg-white border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {(dateStart || dateEnd) && (
          <button
            onClick={handleClearFilters}
            className="flex items-center gap-1 py-2 px-3 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl active:scale-95 transition-all outline-none"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Filter
          </button>
        )}
      </div>

      {/* Math KPI Cards breakdown */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-2xl flex flex-col items-center justify-center text-center">
          <TrendingUp className="w-4 h-4 text-emerald-600 mb-1" />
          <p className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">Total Omset</p>
          <p className="text-xs sm:text-sm font-black text-emerald-700 mt-0.5">
            Rp {totalInflow.toLocaleString('id-ID')}
          </p>
        </div>
        <div className="bg-red-50 border border-red-100 p-3 rounded-2xl flex flex-col items-center justify-center text-center">
          <TrendingDown className="w-4 h-4 text-red-500 mb-1" />
          <p className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">Total Modal</p>
          <p className="text-xs sm:text-sm font-black text-red-700 mt-0.5">
            Rp {totalOutflow.toLocaleString('id-ID')}
          </p>
        </div>
        <div className="bg-blue-50 border border-blue-100 p-3 rounded-2xl flex flex-col items-center justify-center text-center">
          <TrendingUp className="w-4 h-4 text-blue-600 mb-1" />
          <p className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">Arus Bersih</p>
          <p className="text-xs sm:text-sm font-black text-blue-700 mt-0.5">
            Rp {netCollection.toLocaleString('id-ID')}
          </p>
        </div>
      </div>

      {/* Transaction Records details Lists */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4">
        <div className="space-y-3.5 max-h-[50vh] overflow-y-auto pr-1 scrollbar-thin">
          {filteredTx.length > 0 ? (
            filteredTx.slice().reverse().map((t) => {
              const dateObj = new Date(t.date);
              const formatStr = dateObj.toLocaleDateString('id-ID') + ' ' + dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
              return (
                <div key={t.id} className="border border-slate-100 rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 hover:bg-slate-50 transition-all">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xs text-slate-900">{t.id}</span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full capitalize ${
                        t.method === 'tunai' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                        t.method === 'qris' ? 'bg-violet-50 text-violet-700 border border-violet-100' :
                        'bg-blue-50 text-blue-700 border border-blue-100'
                      }`}>
                        {t.method}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">
                      {formatStr} • Pelanggan: <strong>{t.customerName}</strong> • {t.items.length} Barang
                    </div>
                    <div className="text-[10px] text-slate-400 border-t border-slate-100/60 pt-1 mt-1 flex gap-3">
                      <span>Laba Bersih: <strong className="text-emerald-700">Rp {(t.profit || (t.total - t.totalCost)).toLocaleString('id-ID')}</strong></span>
                      <span>Operator: <span className="font-semibold text-slate-600">{t.operator}</span></span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-start gap-4 shrink-0 border-t sm:border-0 border-slate-100 pt-2 sm:pt-0">
                    <span className="font-black text-sm text-blue-900">
                      Rp {t.total.toLocaleString('id-ID')}
                    </span>
                    <button
                      onClick={() => onReviewInvoice(t)}
                      className="py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-bold transition-all flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> Lihat Struk
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-slate-400 text-center text-xs py-16">
              Tidak ada riwayat transaksi penjualan yang tercatat pada kriteria pencarian saat ini.
            </p>
          )}
        </div>
      </div>

    </div>
  );
};
