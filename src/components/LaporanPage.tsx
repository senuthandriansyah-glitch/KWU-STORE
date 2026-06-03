import React from 'react';
import { DollarSign, FileText, PieChart, Clock, TrendingUp } from 'lucide-react';
import { Transaction, OperationalExpenses } from '../types';

interface LaporanPageProps {
  transactions: Transaction[];
  expenses: OperationalExpenses;
}

export const LaporanPage: React.FC<LaporanPageProps> = ({ transactions, expenses }) => {
  const completed = transactions.filter(t => t.status === 'selesai');

  // Math totals calculation
  const totalRev = completed.reduce((sum, t) => sum + (Number(t.total) || 0), 0);
  const totalHpp = completed.reduce((sum, t) => sum + (Number(t.totalCost) || 0), 0);
  const totalOpex = (expenses.rent || 0) + (expenses.salary || 0) + (expenses.utilities || 0) + (expenses.other || 0);
  const grossProfit = totalRev - totalHpp;
  const netProfit = grossProfit - totalOpex;

  // Breakdown classifications
  const methodsSum: Record<string, number> = { tunai: 0, qris: 0, transfer: 0, online: 0 };
  completed.forEach(t => {
    const med = t.method || 'tunai';
    methodsSum[med] = (methodsSum[med] || 0) + (Number(t.total) || 0);
  });

  // Hours math
  const hoursDistribution = Array(24).fill(0);
  completed.forEach(t => {
    try {
      const date = new Date(t.date);
      const hour = date.getHours();
      hoursDistribution[hour]++;
    } catch {
      // invalid date fallback
    }
  });

  const maxHourVal = Math.max(1, ...hoursDistribution);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header title */}
      <div>
        <h2 className="text-xl font-bold text-slate-800">Laporan Keuangan & Analisis</h2>
        <p className="text-xs text-slate-500 mt-0.5">Pantau ringkasan margin kotor, pengeluaran opex, dan grafik performa jam sibuk</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* PnL Statement Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
          <h3 className="font-bold text-sm text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
            <DollarSign className="w-4 h-4 text-emerald-500" />
            <span>Statistik Laba Rugi Toko</span>
          </h3>
          
          <div className="space-y-3.5 text-xs">
            <div className="flex justify-between items-center text-slate-600">
              <span className="font-semibold">Total Pendapatan (Omset Kotor)</span>
              <span className="font-black text-rose-900 bg-slate-100 px-2.5 py-1 rounded-xl">
                Rp {totalRev.toLocaleString('id-ID')}
              </span>
            </div>
            
            <div className="flex justify-between items-center text-red-600">
              <span className="font-semibold">HPP (Harga Pokok Penjualan/Modal)</span>
              <span className="font-bold">-Rp {totalHpp.toLocaleString('id-ID')}</span>
            </div>

            <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-slate-700">
              <span className="font-bold text-[14px]">Margin Kotor / Laba Kasar</span>
              <span className="font-extrabold text-[14px]">Rp {grossProfit.toLocaleString('id-ID')}</span>
            </div>

            <div className="flex justify-between items-center text-red-500">
              <span className="font-semibold">Operational Expenses (Beban Bulanan)</span>
              <span className="font-bold">-Rp {totalOpex.toLocaleString('id-ID')}</span>
            </div>

            <div className="border-t-2 border-dashed border-slate-300 pt-3.5 flex justify-between items-center">
              <span className="font-black text-slate-800 text-sm">LABA BERSIH (NET PROFIT)</span>
              <span className={`font-black text-base px-3 py-1 rounded-2xl ${
                netProfit >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
              }`}>
                Rp {netProfit.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </div>

        {/* Payment breakdown usages */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
          <h3 className="font-bold text-sm text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
            <PieChart className="w-4 h-4 text-blue-500" />
            <span>Kanal Koleksi Pembayaran</span>
          </h3>

          <div className="space-y-2.5 text-xs">
            {Object.entries(methodsSum).map(([method, total]) => (
              <div key={method} className="flex justify-between items-center border-b border-slate-50 pb-2">
                <span className="capitalize text-slate-600 font-bold flex items-center gap-1.5">
                  {method === 'tunai' && '💵 Tunai'}
                  {method === 'qris' && '🔳 QRIS'}
                  {method === 'transfer' && '🏦 Transfer'}
                  {method === 'online' && '📱 Online Storefront'}
                </span>
                <span className="bg-slate-100/50 text-slate-800 px-3 py-1 rounded-xl font-extrabold">
                  Rp {total.toLocaleString('id-ID')}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Hourly Busy chart distribution */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
        <h3 className="font-bold text-sm text-slate-800 mb-3 flex items-center gap-2 border-b border-slate-100 pb-2">
          <Clock className="w-4 h-4 text-purple-500" />
          <span>Grafik Lalin Transaksi per Jam Terpadu (06:00 - 22:00)</span>
        </h3>
        
        <div className="h-32 flex items-end gap-1.5 px-3 pt-3">
          {Array.from({ length: 17 }, (_, i) => {
            const h = i + 6; // 6 to 22
            const count = hoursDistribution[h] || 0;
            const barHeightPct = Math.max(4, (count / maxHourVal) * 100);
            return (
              <div key={h} className="flex-1 flex flex-col items-center gap-1 group relative">
                <div className="absolute bottom-[calc(100%+4px)] left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] px-2 py-0.5 rounded shadow-md opacity-0 group-hover:opacity-100 transition-all font-bold z-10 pointer-events-none">
                  {count} tx
                </div>
                <div
                  style={{ height: `${barHeightPct}%` }}
                  className="w-full bg-indigo-500 hover:bg-indigo-400 rounded-t-sm transition-all cursor-pointer"
                ></div>
                <span className="text-[9px] text-slate-400 font-bold mt-1">
                  {String(h).padStart(2, '0')}
                </span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
