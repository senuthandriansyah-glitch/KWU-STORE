import React, { useState } from 'react';
import { Inbox, Check, X, PhoneCall, Calendar, AlertTriangle, Clock, MapPin, Smile, MessageCircle } from 'lucide-react';
import { OnlineOrder } from '../types';

interface PesananMasukPageProps {
  incomingOrders: OnlineOrder[];
  onAcceptOrder: (orderId: string) => void;
  onRejectOrder: (orderId: string, reason: string) => void;
  onUpdateOrderStatus: (orderId: string, nextStatus: 'ready' | 'completed') => void;
  shopWhatsapp: string;
}

export const PesananMasukPage: React.FC<PesananMasukPageProps> = ({
  incomingOrders,
  onAcceptOrder,
  onRejectOrder,
  onUpdateOrderStatus,
  shopWhatsapp,
}) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'active' | 'archived'>('pending');
  
  // Reject reason modal states
  const [rejectingOrderId, setRejectingOrderId] = useState<string | null>(null);
  const [selectedReason, setSelectedReason] = useState('Stok sediaan barang di toko habis');
  const [customReason, setCustomReason] = useState('');

  const getFilteredOrders = () => {
    if (activeTab === 'pending') {
      return incomingOrders.filter(o => o.status === 'pending');
    } else if (activeTab === 'active') {
      return incomingOrders.filter(o => o.status === 'accepted' || o.status === 'ready');
    } else {
      return incomingOrders.filter(o => o.status === 'completed' || o.status === 'rejected');
    }
  };

  const currentOrders = getFilteredOrders();

  const handleOpenRejectModal = (orderId: string) => {
    setRejectingOrderId(orderId);
    setSelectedReason('Stok sediaan barang di toko habis');
    setCustomReason('');
  };

  const handleConfirmReject = () => {
    if (!rejectingOrderId) return;
    const finalReason = selectedReason === 'lainnya' ? customReason.trim() || 'Alasan operasional terpaksa dibatalkan' : selectedReason;
    
    const targetOrder = incomingOrders.find(o => o.id === rejectingOrderId);
    onRejectOrder(rejectingOrderId, finalReason);
    setRejectingOrderId(null);

    // Auto trigger WhatsApp message if client phone is available
    if (targetOrder) {
      const buyerName = targetOrder.name;
      const orderIdStr = targetOrder.id;
      const textMsg = `Halo ${buyerName} 👋\n\nKami dari Toko ingin menginformasikan bahwa sediaan pre-order Anda dengan Order ID *${orderIdStr}* terpaksa kami batalkan/ditolak karena alasan berikut:\n\n👉 *"${finalReason}"*\n\nMohon maaf atas ketidaknyamanannya. Terima kasih! 🙏`;
      
      const destinationPhone = targetOrder.whatsapp || shopWhatsapp || '628';
      const waLink = `https://wa.me/${destinationPhone}?text=${encodeURIComponent(textMsg)}`;
      window.open(waLink, '_blank');
      alert(`Pesanan #${orderIdStr} ditolak.\nMenyambungkan langsung ke WhatsApp Pelanggan (${destinationPhone}) untuk pemberitahuan.`);
    }
  };

  const handleSendReadyNotification = (order: OnlineOrder) => {
    const textMsg = `Halo ${order.name}! 🎉\n\nKabar gembira! Pre-order Anda dengan Order ID *${order.id}* telah selesai kami siapkan dan *SIAP UNTUK DIAMBIL* (Ready for Pickup) di lokasi gerai toko kami.\n\nWaktu pengambilan terjadwal:\n📅 Tanggal: ${order.pickupDate || '-'}\n⏰ Jam: ${order.pickupTime || '-'}\n\nSilakan tunjukkan Invoice ini saat berkunjung. Sampai jumpa! 🏪`;
    const destinationPhone = order.whatsapp || shopWhatsapp || '628';
    const waLink = `https://wa.me/${destinationPhone}?text=${encodeURIComponent(textMsg)}`;
    window.open(waLink, '_blank');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-bold px-3 py-1 rounded-full">Menunggu Approval</span>;
      case 'accepted':
        return <span className="bg-blue-100 text-blue-800 border border-blue-200 text-[10px] font-bold px-3 py-1 rounded-full">Sedang Diproses</span>;
      case 'ready':
        return <span className="bg-emerald-100 text-emerald-800 border border-emerald-250 text-[10px] font-bold px-3 py-1 rounded-full animate-pulse">Siap Diambil</span>;
      case 'completed':
        return <span className="bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold px-3 py-1 rounded-full">Selesai Diambil</span>;
      case 'rejected':
        return <span className="bg-red-100 text-red-800 border border-red-200 text-[10px] font-bold px-3 py-1 rounded-full">Pesanan Ditolak</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-1.5">
            <span className="p-1.5 bg-blue-500 rounded-xl text-white">📥</span> Antrean Pesanan Pre-Order
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Terima, kelola, pantau sediaan, dan progres pre-order pickup pelanggan dalam satu dasbor terpusat.
          </p>
        </div>

        {/* Tab Filter Pills */}
        <div className="inline-flex rounded-2xl bg-slate-100 p-1 border border-slate-200 text-xs shadow-xs shrink-0 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer ${activeTab === 'pending' ? 'bg-amber-500 text-white shadow-md' : 'text-slate-600'}`}
          >
            Masuk ({incomingOrders.filter(o => o.status === 'pending').length})
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer ${activeTab === 'active' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600'}`}
          >
            Aktif ({incomingOrders.filter(o => o.status === 'accepted' || o.status === 'ready').length})
          </button>
          <button
            onClick={() => setActiveTab('archived')}
            className={`px-4 py-2 font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer ${activeTab === 'archived' ? 'bg-slate-700 text-white shadow-md' : 'text-slate-600'}`}
          >
            Arsip ({incomingOrders.filter(o => o.status === 'completed' || o.status === 'rejected').length})
          </button>
        </div>
      </div>

      {/* Main Queue layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {currentOrders.length > 0 ? (
          currentOrders.map(order => {
            const dateObj = new Date(order.date);
            const formattedTime = dateObj.toLocaleDateString('id-ID', { weekday: 'short', month: 'short', day: 'numeric' }) + ' ' + dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl border-2 border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex justify-between items-start border-b border-slate-100 pb-3 mb-3">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-800 flex items-center gap-1">
                        👤 {order.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 font-semibold">
                        <Clock className="w-3.5 h-3.5 text-slate-350" /> Masuk: {formattedTime}
                      </p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1 shrink-0">
                      <span className="text-[9px] bg-slate-100 font-extrabold text-slate-500 px-2.5 py-0.5 rounded-lg">
                        #{order.id}
                      </span>
                      {getStatusBadge(order.status)}
                    </div>
                  </div>

                  {/* Pickup schedule specifics */}
                  <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-3 mb-3 text-xs flex gap-2 items-center">
                    <Calendar className="w-5 h-5 text-amber-600 shrink-0" />
                    <div className="text-left">
                      <p className="text-[9px] font-black uppercase text-amber-800 leading-none">Jadwal Ambil Mandiri (Pickup)</p>
                      <p className="font-extrabold text-slate-800 text-[11px] mt-1">
                        📅 {order.pickupDate ? new Date(order.pickupDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '-'} 
                        <span className="text-slate-400 mx-1">|</span> 
                        ⏰ Jam {order.pickupTime || '-'} WIB
                      </p>
                    </div>
                  </div>

                  {/* Items listing Table */}
                  <div className="space-y-1.5">
                    <p className="text-[9px] uppercase font-black tracking-wider text-slate-400 mb-1">Rincian Sediaan</p>
                    <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100 space-y-1.5 text-xs text-slate-700">
                      {order.items.map(item => (
                        <div key={item.id} className="flex justify-between items-center bg-white border border-slate-100/40 rounded-lg p-1.5 shadow-5xs">
                          <span className="font-semibold text-slate-800 truncate max-w-[180px]">
                            {item.name} <span className="text-slate-400 font-bold">x{item.qty}</span>
                          </span>
                          <span className="font-extrabold text-slate-500">
                            Rp {(item.price * item.qty).toLocaleString('id-ID')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Store Name tag */}
                  {order.storeName && (
                    <div className="mt-2 text-right">
                      <span className="text-[10px] text-blue-600 font-bold bg-blue-50/50 px-2.5 py-0.5 rounded-full border border-blue-100/50">🏪 Cabang Toko: {order.storeName}</span>
                    </div>
                  )}

                  {/* Rejection Reasons text output */}
                  {order.status === 'rejected' && order.rejectReason && (
                    <div className="bg-red-50 border border-red-150 rounded-2xl p-3 mt-3 text-xs text-red-800">
                      <strong>✕ Alasan Ditolak:</strong> "{order.rejectReason}"
                    </div>
                  )}
                </div>

                {/* Operations Actions Control box based on status */}
                <div className="pt-3 border-t border-slate-100/60 flex flex-col gap-3">
                  <div className="flex justify-between items-center font-black text-xs text-slate-800">
                    <span>NILAI TRANSAKSI</span>
                    <span className="text-sm text-blue-900 bg-blue-50/50 px-2.5 py-1 rounded-xl">
                      Rp {order.total.toLocaleString('id-ID')}
                    </span>
                  </div>

                  <div className="flex gap-2 text-xs">
                    {/* Level 1: Pending -> Accept / Reject options */}
                    {order.status === 'pending' && (
                      <>
                        <button
                          onClick={() => onAcceptOrder(order.id)}
                          className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-2xl font-black transition-all flex items-center justify-center gap-1 shadow-sm cursor-pointer"
                        >
                          <Check className="w-4 h-4 stroke-[3]" /> Terima Pre-Order
                        </button>
                        <button
                          onClick={() => handleOpenRejectModal(order.id)}
                          className="py-3 px-4 bg-red-50 hover:bg-red-100 active:scale-95 text-red-650 border border-red-200 rounded-2xl font-black transition-all cursor-pointer"
                        >
                          <X className="w-4.5 h-4.5" /> Tolak
                        </button>
                      </>
                    )}

                    {/* Level 2: Accepted -> Ready for pick up options */}
                    {order.status === 'accepted' && (
                      <>
                        <button
                          onClick={() => onUpdateOrderStatus(order.id, 'ready')}
                          className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          📦 Set Siap Diambil
                        </button>
                        <button
                          onClick={() => handleSendReadyNotification(order)}
                          className="py-3 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-bold border border-slate-200 flex items-center justify-center cursor-pointer"
                          title="Kirim Chat Ready WA"
                        >
                          <MessageCircle className="w-4.5 h-4.5 text-blue-500" />
                        </button>
                      </>
                    )}

                    {/* Level 3: Ready -> Mark Picked-Up / Complete */}
                    {order.status === 'ready' && (
                      <>
                        <button
                          onClick={() => onUpdateOrderStatus(order.id, 'completed')}
                          className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-black transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          🤝 Selesai (Ambil Produk Done)
                        </button>
                        <button
                          onClick={() => handleSendReadyNotification(order)}
                          className="py-3 px-3.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-2xl font-bold border border-emerald-200 flex items-center justify-center cursor-pointer animate-pulse"
                          title="Kirim Chat Ready WA"
                        >
                          <MessageCircle className="w-4.5 h-4.5 text-emerald-600" />
                        </button>
                      </>
                    )}

                    {/* Archived Completed status badge */}
                    {order.status === 'completed' && (
                      <div className="w-full text-center text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 py-2.5 rounded-2xl font-bold flex items-center justify-center gap-1">
                        <Smile className="w-4.5 h-4.5" /> Transaksi selesai dilakukan serah-terima
                      </div>
                    )}

                    {/* Archived Rejected status badge */}
                    {order.status === 'rejected' && (
                      <div className="w-full text-center text-xs text-slate-500 bg-slate-50 border border-slate-200 py-2.5 rounded-2xl font-semibold">
                        Pesanan ini telah resmi ditolak/dibatalkan
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-20 text-center text-slate-400 bg-slate-50 border border-dashed border-slate-250 rounded-3xl p-6">
            <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="font-bold text-slate-700 text-sm">Tidak Ada Transaksi di Filter Ini</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
              Seluruh antrean pre-order pickup yang sesuai dengan filter tab Anda akan muncul di hadapan Anda di halaman dashboard ini.
            </p>
          </div>
        )}
      </div>

      {/* Reject Reason Confirmation dialog Overlay popup */}
      {rejectingOrderId && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[10005] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-150 shadow-2xl p-6 max-w-md w-full animate-in zoom-in-95 duration-250 text-left">
            <h3 className="font-black text-slate-800 text-base flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" /> Alasan Menolak Pesanan
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Pilih alasan pembatalan pre-order ini agar sistem otomatis mem-format pesan konfirmasi penolakan ke WhatsApp pembeli secara sopan.
            </p>

            <div className="space-y-2 mt-4 text-xs font-semibold text-slate-705">
              {[
                'Stok sediaan barang di toko habis',
                'Kapasitas produksi / antrean toko sedang penuh',
                'Gerai toko Anda terpaksa tutup sementara waktu',
              ].map(reason => (
                <label key={reason} className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100/60 cursor-pointer">
                  <input
                    type="radio"
                    name="reject_reason"
                    checked={selectedReason === reason}
                    onChange={() => setSelectedReason(reason)}
                    className="accent-red-650"
                  />
                  <span>{reason}</span>
                </label>
              ))}

              <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100/60 cursor-pointer">
                <input
                  type="radio"
                  name="reject_reason"
                  checked={selectedReason === 'lainnya'}
                  onChange={() => setSelectedReason('lainnya')}
                  className="accent-red-650"
                />
                <span>Alasan Kustom Lainnya...</span>
              </label>

              {selectedReason === 'lainnya' && (
                <textarea
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Ketik detail alasan pembatalan di sini secara ringkas..."
                  className="w-full text-xs border border-slate-300 rounded-xl p-3 bg-white focus:outline-none focus:ring-1 focus:ring-red-600 mt-2 font-medium"
                  rows={2}
                />
              )}
            </div>

            <div className="mt-6 flex gap-2.5 text-xs font-bold">
              <button
                onClick={handleConfirmReject}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl transition-all shadow active:scale-95 flex items-center justify-center gap-1"
              >
                Kirim Pembatalan WhatsApp
              </button>
              <button
                onClick={() => setRejectingOrderId(null)}
                className="py-3 px-4 bg-slate-200 hover:bg-slate-350 text-slate-700 rounded-2xl"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
