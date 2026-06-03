import React from 'react';
import { Printer, Share2, Smartphone, X } from 'lucide-react';
import { Transaction } from '../types';

interface ReceiptModalProps {
  isOpen: boolean;
  transaction: Transaction | null;
  onClose: () => void;
  storeName: string;
  storeAddress: string;
  storeWhatsapp: string;
  taxRate: number;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  transaction,
  onClose,
  storeName,
  storeAddress,
  storeWhatsapp,
  taxRate,
}) => {
  if (!isOpen || !transaction) return null;

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }) + ' ' + d.toLocaleTimeString('id-ID');
    } catch {
      return dateStr;
    }
  };

  const savedLogo = localStorage.getItem('pos_logo') || '';
  const receiptFooter = localStorage.getItem('pos_receipt_footer') || 'Terima kasih sudah berbelanja! 🙏';

  const subtotal = transaction.subtotal || transaction.items.reduce((s, i) => s + i.price * i.qty, 0);
  const discountPct = transaction.discountPct || 0;
  const discountAmt = Math.round((subtotal * discountPct) / 100);
  const afterDiscount = subtotal - discountAmt;
  const taxRateValVal = taxRate || 11;
  const taxAmt = transaction.taxIncluded ? Math.round((afterDiscount * taxRateValVal) / 100) : 0;

  // Print function matching the exact high-fidelity popup layout that successfully bypasses iframe hurdles
  const handlePrint = () => {
    const win = window.open('', '_blank', 'width=450,height=750');
    if (!win) {
      alert('Pop-up printer diblokir oleh browser Anda. Harap izinkan pop-up untuk melakukan pencetakan.');
      return;
    }

    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Invoice - ${transaction.id}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;550;700&display=swap');
          * {
            box-sizing: border-box;
            font-family: 'DM Sans', sans-serif;
            margin: 0;
            padding: 0;
          }
          body {
            width: 80mm;
            padding: 8px;
            color: #1e293b;
            background: #fff;
          }
          .header {
            text-align: center;
            padding-bottom: 12px;
            border-bottom: 2px dashed #cbd5e1;
            margin-bottom: 12px;
          }
          .logo-circle {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid #e2e8f0;
            margin: 0 auto 8px;
            display: block;
          }
          .logo-emoji {
            font-size: 38px;
            display: block;
            margin-bottom: 6px;
            text-align: center;
          }
          .store-name {
            font-size: 16px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .store-sub {
            font-size: 11px;
            color: #64748b;
            margin-top: 3px;
          }
          .txn-info {
            font-size: 11px;
            color: #475569;
            margin-top: 6px;
            line-height: 1.4;
          }
          .item-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            font-size: 12px;
            padding: 4px 0;
          }
          .item-name {
            flex: 1;
            padding-right: 12px;
            color: #334155;
          }
          .item-price {
            text-align: right;
            white-space: nowrap;
          }
          .item-unit {
            font-size: 10px;
            color: #94a3b8;
            margin-top: 1px;
            padding-bottom: 4px;
            border-bottom: 1px solid #f1f5f9;
          }
          .divider {
            border: none;
            border-top: 1.5px dashed #cbd5e1;
            margin: 10px 0;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            padding: 3px 0;
          }
          .total-row.grand {
            font-size: 14px;
            font-weight: 700;
            border-top: 1.5px solid #000;
            padding-top: 8px;
            margin-top: 6px;
          }
          .footer {
            margin-top: 16px;
            padding-top: 12px;
            border-top: 2px dashed #cbd5e1;
            text-align: center;
          }
          .footer-msg {
            font-size: 12px;
            font-weight: 600;
            color: #334155;
            margin-bottom: 4px;
          }
          .footer-sub {
            font-size: 10px;
            color: #94a3b8;
          }
          .payment-badge {
            display: inline-block;
            background: #e2e8f0;
            color: #334155;
            font-size: 10px;
            font-weight: 700;
            padding: 2px 8px;
            border-radius: 12px;
            margin-top: 6px;
            text-transform: uppercase;
          }
        </style>
      </head>
      <body>
        <div class="header">
          ${savedLogo ? `<img src="${savedLogo}" class="logo-circle">` : `<span class="logo-emoji">🏪</span>`}
          <div class="store-name">${storeName}</div>
          <div class="store-sub">${storeAddress}</div>
          <div class="divider"></div>
          <div class="txn-info">
            <strong>ID:</strong> ${transaction.id}<br>
            <strong>Waktu:</strong> ${formatDate(transaction.date)}<br>
            <strong>Operator:</strong> ${transaction.operator}
          </div>
        </div>
        
        <div>
          ${transaction.items.map(item => `
            <div class="item-row">
              <span class="item-name">${item.name}</span>
              <span class="item-price">x${item.qty}</span>
            </div>
            <div class="item-row" style="font-size: 11px; margin-top: -2px; color: #64748b;">
              <span>@ Rp ${item.price.toLocaleString('id-ID')}</span>
              <span>Rp ${(item.price * item.qty).toLocaleString('id-ID')}</span>
            </div>
            <div class="item-unit"></div>
          `).join('')}
        </div>
        
        <div style="margin-top: 8px;">
          <div class="total-row">
            <span>Subtotal</span>
            <span>Rp ${subtotal.toLocaleString('id-ID')}</span>
          </div>
          ${discountPct > 0 ? `
            <div class="total-row" style="color: #dc2626;">
              <span>Diskon (${discountPct}%)</span>
              <span>-Rp ${discountAmt.toLocaleString('id-ID')}</span>
            </div>
          ` : ''}
          ${transaction.taxIncluded ? `
            <div class="total-row" style="color: #2563eb;">
              <span>PPN (${taxRateValVal}%)</span>
              <span>Rp ${taxAmt.toLocaleString('id-ID')}</span>
            </div>
          ` : ''}
          <div class="total-row grand">
            <span>TOTAL</span>
            <span>Rp ${transaction.total.toLocaleString('id-ID')}</span>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 10px;">
          <span class="payment-badge">${transaction.method}</span>
          ${transaction.customerName && transaction.customerName !== 'Umum' ? `
            <div style="font-size: 11px; color: #475569; margin-top: 6px;">
              Pelanggan: <strong>${transaction.customerName}</strong>
            </div>
          ` : ''}
          ${transaction.notes ? `
            <div style="font-size: 11px; color: #64748b; font-style: italic; margin-top: 4px;">
              Catatan: "${transaction.notes}"
            </div>
          ` : ''}
        </div>
        
        <div class="footer">
          <p class="footer-msg">${receiptFooter}</p>
          ${storeWhatsapp ? `<p style="font-size: 11px; color: #16a34a; margin-top: 4px;">📞 WhatsApp: +${storeWhatsapp}</p>` : ''}
          <p class="footer-sub" style="margin-top: 8px;">— Powered by KWU POS —</p>
        </div>
      </body>
      </html>
    `);

    win.document.close();
    win.onload = function() {
      win.print();
      setTimeout(() => win.close(), 1000);
    };
  };

  const handleBluetoothPrint = async () => {
    // Exact ESC/POS compilation logic for Bluetooth thermal printer
    const lines: string[] = [];
    lines.push('================================');
    lines.push(storeName.toUpperCase().substring(0, 32));
    lines.push(storeAddress.substring(0, 32));
    lines.push(formatDate(transaction.date));
    lines.push('ID Transaksi: ' + transaction.id);
    lines.push('--------------------------------');
    transaction.items.forEach(i => {
      const namePart = i.name.substring(0, 18).padEnd(18);
      const qtyPart = ('x' + i.qty).padStart(4);
      const prcPart = ('Rp' + i.price.toLocaleString('id')).padStart(10);
      lines.push(namePart + qtyPart + prcPart);
    });
    lines.push('--------------------------------');
    lines.push('TOTAL'.padEnd(18) + ('Rp ' + transaction.total.toLocaleString('id')).padStart(14));
    lines.push('METODE BAYAR: ' + transaction.method.toUpperCase());
    if (transaction.customerName && transaction.customerName !== 'Umum') {
      lines.push('Pelanggan: ' + transaction.customerName);
    }
    lines.push('================================');
    lines.push(receiptFooter);
    lines.push('\n\n');

    const textContent = lines.join('\n');

    const simulatedPrinterName = localStorage.getItem('pos_simulated_printer_name');
    if (simulatedPrinterName) {
      alert(`🖨️ [KASIR - PRINTER VIRUTAL SIMULATED]\n\nMengirimkan sinyal ESC/POS nirkabel ke perangkat Terkoneksi:\n🔗 "${simulatedPrinterName}"\n\nStruk transaksi #${transaction.id} terkoneksi & berhasil dicetak virtual! 🎉\nMemunculkan dialog print sistem sebagai kelengkapan akhir.`);
      handlePrint();
      return;
    }

    if ('bluetooth' in navigator) {
      try {
        const device = await (navigator as any).bluetooth.requestDevice({
          filters: [
            { namePrefix: 'Printer' },
            { namePrefix: 'printer' },
            { namePrefix: 'POS' },
            { namePrefix: 'RPP' },
            { namePrefix: 'MTP' },
            { namePrefix: 'BlueTooth' }
          ],
          optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb']
        });
        const server = await device.gatt.connect();
        const services = await server.getPrimaryServices();
        let writeChar: any = null;
        for (const svc of services) {
          const chars = await svc.getCharacteristics();
          for (const c of chars) {
            if (c.properties.write || c.properties.writeWithoutResponse) {
              writeChar = c;
              break;
            }
          }
          if (writeChar) break;
        }

        if (!writeChar) {
          alert('Printer thermal Bluetooth terhubung tapi tidak memiliki karakteristik TULIS.');
          return;
        }

        const encoder = new TextEncoder();
        const initCmd = new Uint8Array([0x1B, 0x40]); // ESC @ System Reset
        const centerCmd = new Uint8Array([0x1B, 0x61, 0x01]); // Center
        const textBytes = encoder.encode(textContent);

        await writeChar.writeValueWithoutResponse(initCmd);
        await writeChar.writeValueWithoutResponse(centerCmd);
        
        const chunkSize = 20;
        for (let i = 0; i < textBytes.length; i += chunkSize) {
          await writeChar.writeValueWithoutResponse(textBytes.slice(i, i + chunkSize));
          await new Promise(r => setTimeout(r, 20));
        }
        alert('Struk berhasil dicetak via printer Bluetooth terhubung!');
        return;
      } catch (err: any) {
        if (err.name !== 'NotFoundError' && err.name !== 'SecurityError') {
          console.warn('Bluetooth Error fallback:', err);
        }
      }
    }

    // Fallback dialogue modal with custom template text for print confirmation
    alert("Pratinjau Struk Thermal Anda:\n\n" + textContent.substring(0, 300) + "\n...\n\nSistem mengarahkan Anda ke dialog cetak default.");
    handlePrint();
  };

  const handleShare = async () => {
    const formattedItems = transaction.items
      .map(i => `${i.name} x${i.qty} = Rp ${(i.price * i.qty).toLocaleString('id-ID')}`)
      .join('\n');

    const shareText = `🧾 *${storeName}*
${storeAddress}
━━━━━━━━━━━━━━━━━━━━
${formattedItems}
━━━━━━━━━━━━━━━━━━━━
*TOTAL: Rp ${transaction.total.toLocaleString('id-ID')}*
💳 Metode: ${transaction.method.toUpperCase()}
📋 ID: ${transaction.id}
━━━━━━━━━━━━━━━━━━━━
${receiptFooter}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Struk - ${transaction.id}`,
          text: shareText,
        });
        return;
      } catch {
        // user cancelled or fallback needed
      }
    }

    // fallback copy to clipboard
    try {
      await navigator.clipboard.writeText(shareText);
      alert('Teks struk berhasil disalin ke clipboard! Silakan paste ke WhatsApp.');
    } catch {
      alert('Gagal menyalin otomatis, silakan bagikan secara manual.');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[10001] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-[390px] max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="overflow-y-auto flex-1 p-5 scrollbar-thin">
          <div id="receipt-paper" className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-800">
            {/* Header */}
            <div className="text-center pb-3 border-b-2 border-dashed border-slate-300">
              {savedLogo ? (
                <img src={savedLogo} className="w-16 h-16 rounded-full object-cover border-2 border-slate-200 mx-auto mb-2" alt="Logo Toko" />
              ) : (
                <div className="text-3xl mb-1">🏪</div>
              )}
              <h4 className="font-bold text-lg text-slate-900 leading-tight uppercase">{storeName}</h4>
              <p className="text-xs text-slate-500 mt-1">{storeAddress}</p>
              
              <div className="text-[11px] text-slate-400 mt-2 text-left space-y-0.5">
                <div><strong>No:</strong> {transaction.id}</div>
                <div><strong>Waktu:</strong> {formatDate(transaction.date)}</div>
                <div><strong>Operator:</strong> {transaction.operator}</div>
              </div>
            </div>

            {/* Items */}
            <div className="py-3 space-y-1">
              {transaction.items.map(item => (
                <div key={item.id} className="text-xs border-b border-dashed border-slate-100 pb-2 mb-2">
                  <div className="flex justify-between font-medium text-slate-800">
                    <span className="truncate pr-4">{item.name}</span>
                    <span>x{item.qty}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400 mt-0.5">
                    <span>@ Rp {item.price.toLocaleString('id-ID')}</span>
                    <span>Rp {(item.price * item.qty).toLocaleString('id-ID')}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="pt-2 border-t border-dashed border-slate-300 text-xs space-y-1">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span>Rp {subtotal.toLocaleString('id-ID')}</span>
              </div>
              {discountPct > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Diskon {discountPct}%</span>
                  <span>-Rp {discountAmt.toLocaleString('id-ID')}</span>
                </div>
              )}
              {transaction.taxIncluded && (
                <div className="flex justify-between text-blue-600">
                  <span>PPN {taxRateValVal}%</span>
                  <span>Rp {taxAmt.toLocaleString('id-ID')}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm text-slate-900 border-t border-slate-200 pt-1.5 mt-1.5">
                <span>TOTAL</span>
                <span>Rp {transaction.total.toLocaleString('id-ID')}</span>
              </div>
            </div>

            {/* Badges */}
            <div className="text-center mt-4">
              <span className="inline-block bg-blue-100 text-blue-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                {transaction.method === 'tunai' && '💵 Tunai'}
                {transaction.method === 'qris' && '🔳 QRIS'}
                {transaction.method === 'transfer' && '🏦 Transfer'}
                {transaction.method === 'online' && '📱 Online'}
              </span>
              {transaction.customerName && transaction.customerName !== 'Umum' && (
                <div className="text-xs text-slate-500 mt-2">
                  Pelanggan: <strong className="text-slate-700">{transaction.customerName}</strong>
                </div>
              )}
              {transaction.notes && (
                <div className="text-[11px] text-slate-400 italic mt-1">
                  Catatan: "{transaction.notes}"
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="text-center mt-4 pt-3 border-t-2 border-dashed border-slate-300 text-[10px] text-slate-400">
              <p className="font-semibold text-slate-600 text-[11px] mb-1">{receiptFooter}</p>
              {storeWhatsapp && <p className="text-emerald-600">📞 WhatsApp: +{storeWhatsapp}</p>}
              <p className="mt-2 text-[9px]">— Powered by KWU POS —</p>
            </div>
          </div>
        </div>

        {/* Actions panel */}
        <div className="bg-slate-50 border-t border-slate-100 p-4 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold active:scale-[0.98] transition-all"
            >
              <Printer className="w-4 h-4" /> Cetak
            </button>
            <button
              onClick={handleBluetoothPrint}
              className="flex items-center justify-center gap-2 py-2.5 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-semibold active:scale-[0.98] transition-all"
            >
              <Smartphone className="w-4 h-4" /> BT/Thermal
            </button>
          </div>
          <button
            onClick={handleShare}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold active:scale-[0.98] transition-all"
          >
            <Share2 className="w-4 h-4" /> Bagikan via WhatsApp
          </button>
          <button
            onClick={onClose}
            className="w-full py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold active:scale-[0.98] transition-all"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
