import React, { useEffect, useState } from 'react';
import { Check, QrCode, RotateCw, X } from 'lucide-react';
import { Transaction } from '../types';

interface QrisModalProps {
  isOpen: boolean;
  transaction: Transaction | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export const QrisModal: React.FC<QrisModalProps> = ({
  isOpen,
  transaction,
  onConfirm,
  onCancel,
}) => {
  const [status, setStatus] = useState<'waiting' | 'paid'>('waiting');

  useEffect(() => {
    if (isOpen) {
      setStatus('waiting');
    }
  }, [isOpen]);

  if (!isOpen || !transaction) return null;

  const qrisImg = localStorage.getItem('pos_qris') || '';

  const playPaymentSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6 chords (triumph!)
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.35);
        osc.start(ctx.currentTime + i * 0.12);
        osc.stop(ctx.currentTime + i * 0.12 + 0.4);
      });
    } catch (e) {
      console.warn('Web Audio gagal berdering:', e);
    }
  };

  const handleManualLunas = () => {
    setStatus('paid');
    playPaymentSound();
    
    // Auto click confirm on visual delay
    setTimeout(() => {
      onConfirm();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[10002] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-[340px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-5 text-center text-white relative">
          <QrCode className="w-8 h-8 mx-auto opacity-30 absolute top-3 right-4 rotate-12" />
          <h3 className="font-bold text-base">🔳 Scan QRIS untuk Bayar</h3>
          <p className="text-xs text-white/80 mt-1">Arahkan kamera e-wallet atau m-banking Anda</p>
        </div>

        {/* QR Code Canvas Frame */}
        <div className="p-6 bg-slate-50 flex flex-col items-center">
          <div className="relative bg-white p-3 rounded-2xl shadow-md border-2 border-slate-200">
            {qrisImg ? (
              <img
                src={qrisImg}
                alt="QRIS Merchant"
                className="w-48 h-48 rounded-xl object-contain"
              />
            ) : (
              <div className="w-48 h-48 rounded-xl bg-slate-100 flex flex-col items-center justify-center text-slate-400 p-3 text-center">
                <QrCode className="w-12 h-12 mb-2 text-violet-400" />
                <p className="text-[10px]">QRIS Toko belum disetup di Pengaturan.</p>
              </div>
            )}
            
            {status === 'paid' && (
              <div className="absolute inset-0 bg-emerald-500/90 rounded-2xl flex flex-col items-center justify-center text-white animate-in fade-in duration-300">
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-emerald-600 mb-2 shadow-lg scale-in">
                  <Check className="w-10 h-10 stroke-[3]" />
                </div>
                <span className="font-bold text-sm tracking-wide">LUNAS!</span>
              </div>
            )}
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Dukung Gopay, OVO, Dana, LinkAja, BCA, dll.</p>
        </div>

        {/* Amount */}
        <div className="text-center px-6 py-2">
          <p className="text-[10px] text-slate-400 uppercase tracking-widest">Jumlah Tagihan</p>
          <p className="text-2xl font-black text-blue-900 mt-0.5">
            Rp {transaction.total.toLocaleString('id-ID')}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Pelanggan: <span className="font-semibold text-slate-700">{transaction.customerName}</span> ({transaction.id})
          </p>
        </div>

        {/* Status indicator pill */}
        <div className="px-6 py-3">
          {status === 'waiting' ? (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold px-4 py-2.5 rounded-2xl flex items-center justify-center gap-2">
              <RotateCw className="w-4 h-4 text-amber-500 animate-spin" />
              Menunggu pembayaran dari pelanggan...
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold px-4 py-2.5 rounded-2xl flex items-center justify-center gap-2">
              <Check className="w-4 h-4 text-emerald-500 animate-bounce" />
              Berhasil! Mengambil Invoice...
            </div>
          )}
        </div>

        {/* Action button options */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2">
          <button
            onClick={handleManualLunas}
            disabled={status === 'paid'}
            className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 shadow"
          >
            <Check className="w-4 h-4" /> Konfirmasi Lunas
          </button>
          <button
            onClick={onCancel}
            className="py-3 px-4 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold active:scale-[0.98] transition-all"
          >
            Batal
          </button>
        </div>

      </div>
    </div>
  );
};
