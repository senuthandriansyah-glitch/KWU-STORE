import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, ShoppingCart, Archive, Award, AlertTriangle, BarChart3, 
  Calendar, CreditCard, Users, HelpCircle, ArrowRightLeft, DollarSign, 
  FileText, Briefcase, ChevronRight, Settings, Printer, CheckCircle2, Trash2, Smartphone, Monitor
} from 'lucide-react';
import { Product, Transaction, Warehouse, StockTransfer, PartnerShare, OperationalExpenses, OnlineOrder } from '../types';

interface DashboardPageProps {
  products: Product[];
  transactions: Transaction[];
  expenses: OperationalExpenses;
  onUpdateProducts: (updated: Product[]) => void;
  shopName: string;
  incomingOrders?: OnlineOrder[];
  onUpdateIncomingOrders?: (updated: OnlineOrder[]) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ 
  products, 
  transactions, 
  expenses,
  onUpdateProducts,
  shopName,
  incomingOrders,
  onUpdateIncomingOrders
}) => {
  // Navigation Sub-Views
  const [subView, setSubView] = useState<'analytics' | 'gudang' | 'financials' | 'shares' | 'simulator'>('analytics');

  // Filters state (matching the screenshot dashboard layout)
  const [filterYear, setFilterYear] = useState<'2021' | '2022' | '2026'>('2026');
  const [filterPayment, setFilterPayment] = useState<'semua' | 'tunai' | 'kredit'>('semua');
  const [filterMonth, setFilterMonth] = useState<string>('Semua');

  // Multi-Shop Filter (supports multi-toko visibility)
  const storeNames = Array.from(new Set(products.map(p => p.storeName || shopName).filter(Boolean)));
  const [filterStore, setFilterStore] = useState<string>('Semua');

  // Multi-Gudang/Warehouse State
  const [warehouses, setWarehouses] = useState<Warehouse[]>([
    { id: 'wh_main', name: 'Gudang Pusat Utama', location: 'Bandung Area A' },
    { id: 'wh_store', name: 'Gudang Display Toko', location: 'Bandung Area B (Gerai)' },
    { id: 'wh_back', name: 'Gudang Cadangan UMKM', location: 'Gedung Produksi C' }
  ]);
  const [stockToTransfer, setStockToTransfer] = useState<{
    productId: string;
    fromWh: string;
    toWh: string;
    qty: number;
  }>({ productId: '', fromWh: 'wh_main', toWh: 'wh_store', qty: 1 });
  const [transferHistory, setTransferHistory] = useState<StockTransfer[]>([]);

  // Owner split percentage state
  const [partners, setPartners] = useState<PartnerShare[]>([
    { id: '1', name: 'Modal Internal Utama', percentage: 60 },
    { id: '2', name: 'Partner Investor UMKM', percentage: 25 },
    { id: '3', name: 'Kas Kasir Bersama', percentage: 15 }
  ]);
  const [newPartnerName, setNewPartnerName] = useState('');
  const [newPartnerPct, setNewPartnerPct] = useState<number | ''>('');

  // Thermal print connection simulation states
  const [printerType, setPrinterType] = useState<'bluetooth' | 'wifi'>('bluetooth');
  const [isConnectedPrinter, setIsConnectedPrinter] = useState(false);
  const [discoveredDevices, setDiscoveredDevices] = useState<{ id: string; name: string }[]>([]);
  const [isScanningPrinter, setIsScanningPrinter] = useState(false);
  const [selectedPrinterId, setSelectedPrinterId] = useState('');

  // Simulation log list
  const [simLog, setSimLog] = useState<string[]>([
    'Sistem KWU Store siap menerima aliran data pre-order.',
    'Pencet tombol Simulasi di tab panduan untuk mencoba alur beli & approve.'
  ]);

  // Restore/Save state changes locally
  useEffect(() => {
    const savedWh = localStorage.getItem('pos_warehouses');
    if (savedWh) setWarehouses(JSON.parse(savedWh));

    const savedTransfers = localStorage.getItem('pos_transfers');
    if (savedTransfers) setTransferHistory(JSON.parse(savedTransfers));

    const savedShares = localStorage.getItem('pos_shares');
    if (savedShares) setPartners(JSON.parse(savedShares));

    const savedPrinterId = localStorage.getItem('pos_simulated_printer_id');
    const savedPrinterName = localStorage.getItem('pos_simulated_printer_name');
    if (savedPrinterId && savedPrinterName) {
      setSelectedPrinterId(savedPrinterId);
      setIsConnectedPrinter(true);
    }
  }, []);

  const saveWhState = (whs: Warehouse[]) => {
    setWarehouses(whs);
    localStorage.setItem('pos_warehouses', JSON.stringify(whs));
  };

  const saveTransfers = (trs: StockTransfer[]) => {
    setTransferHistory(trs);
    localStorage.setItem('pos_transfers', JSON.stringify(trs));
  };

  const saveShares = (shs: PartnerShare[]) => {
    setPartners(shs);
    localStorage.setItem('pos_shares', JSON.stringify(shs));
  };

  // --- MATHEMATICAL COMPUTATIONS ---
  // Get finalized transactions
  const getCompletedTransactions = () => {
    return transactions.filter(t => t.status === 'selesai');
  };

  // Extract date variables and apply filters
  const getFilteredTx = () => {
    let list = getCompletedTransactions();

    // Store filter
    if (filterStore !== 'Semua') {
      list = list.filter(t => t.notes?.includes(`@${filterStore}`) || t.operator === filterStore || t.notes?.includes(filterStore) || products.some(p => p.storeName === filterStore && t.items.some(ti => ti.id === p.id)));
    }

    // Year filter (simulated match for 2021, 2022, 2026 based on mock intervals)
    list = list.filter(t => {
      const yrObj = new Date(t.date).getFullYear();
      if (filterYear === '2021') return yrObj === 2021;
      if (filterYear === '2022') return yrObj === 2022;
      return yrObj === 2026 || yrObj === 2025; // fallback current mock
    });

    // Payment Type filter
    if (filterPayment === 'tunai') {
      list = list.filter(t => t.method === 'tunai');
    } else if (filterPayment === 'kredit') {
      list = list.filter(t => t.method === 'qris' || t.method === 'transfer' || t.method === 'online');
    }

    // Month filter
    if (filterMonth !== 'Semua') {
      const monthsMap: Record<string, number> = {
        'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
        'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
      };
      const monthIdx = monthsMap[filterMonth];
      list = list.filter(t => new Date(t.date).getMonth() === monthIdx);
    }

    return list;
  };

  const filteredTx = getFilteredTx();

  // Metrics (Dashboard cards matching the values)
  const totalSalesVal = filteredTx.reduce((sum, t) => sum + (Number(t.total) || 0), 0);
  const totalCostVal = filteredTx.reduce((sum, t) => sum + (Number(t.totalCost) || 0), 0);
  const totalProfitVal = filteredTx.reduce((sum, t) => sum + (Number(t.profit) || (Number(t.total) - Number(t.totalCost)) || 0), 0);
  const profitPercentage = totalSalesVal > 0 ? ((totalProfitVal / totalSalesVal) * 100).toFixed(1) : '0';
  const totalItemsSold = filteredTx.reduce((sum, t) => sum + (t.items?.reduce((s, i) => s + i.qty, 0) || 0), 0);

  // Asset values from stock (Kekayaan Stock Sediaan)
  // Wealth calculation from available quantities * purchase cost
  const totalAssetsFromStock = products.reduce((sum, p) => sum + (p.stock * (p.cost || p.price * 0.6)), 0);
  const totalInventoryMarketValue = products.reduce((sum, p) => sum + (p.stock * p.price), 0);

  // Best selling products leaderboard (10 items matching horizontal bar chart)
  const getLeaderboardData = () => {
    const counts: Record<string, { qty: number; value: number }> = {};
    filteredTx.forEach(t => {
      (t.items || []).forEach(item => {
        const prev = counts[item.name] || { qty: 0, value: 0 };
        counts[item.name] = {
          qty: prev.qty + item.qty,
          value: prev.value + (item.price * item.qty)
        };
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1].qty - a[1].qty)
      .slice(0, 10);
  };

  const leaderboard = getLeaderboardData();

  // Sales Categorization Contrib
  const getCategoryContributions = () => {
    const map: Record<string, number> = {};
    filteredTx.forEach(t => {
      (t.items || []).forEach(item => {
        // match category from products state
        const p = products.find(prod => prod.name === item.name);
        const cat = p?.category || 'Umum';
        map[cat] = (map[cat] || 0) + (item.price * item.qty);
      });
    });
    return Object.entries(map).sort((a,b) => b[1] - a[1]);
  };

  const catContributions = getCategoryContributions();
  const totalCatSum = catContributions.reduce((sum, c) => sum + c[1], 0);

  // Subcategory Type (Sales Classification layout)
  const eceranVal = filteredTx.filter(t => t.method === 'tunai' && t.total < 150000).reduce((sum, t) => sum + t.total, 0);
  const grosirVal = filteredTx.filter(t => t.total >= 150000).reduce((sum, t) => sum + t.total, 0);
  const onlineVal = filteredTx.filter(t => t.method === 'online' || t.notes?.includes('Pre-Order')).reduce((sum, t) => sum + t.total, 0);
  const sumCheck = (eceranVal + grosirVal + onlineVal) || 1;

  // Monthly breakdown mock for 12 months chart
  const getMonthlyBreakdownSalesProfit = () => {
    const list = [
      { m: 'Jan', val: 0, profit: 0 }, { m: 'Feb', val: 0, profit: 0 },
      { m: 'Mar', val: 0, profit: 0 }, { m: 'Apr', val: 0, profit: 0 },
      { m: 'May', val: 0, profit: 0 }, { m: 'Jun', val: 0, profit: 0 },
      { m: 'Jul', val: 0, profit: 0 }, { m: 'Aug', val: 0, profit: 0 },
      { m: 'Sep', val: 0, profit: 0 }, { m: 'Oct', val: 0, profit: 0 },
      { m: 'Nov', val: 0, profit: 0 }, { m: 'Dec', val: 0, profit: 0 }
    ];

    filteredTx.forEach(t => {
      const d = new Date(t.date);
      const mIdx = d.getMonth();
      if (mIdx >= 0 && mIdx < 12) {
        list[mIdx].val += t.total;
        list[mIdx].profit += t.profit || (t.total - (t.totalCost || 0));
      }
    });

    // If zero, populate slightly for visual demonstration (mock dashboard styling lookalike)
    const isEmp = list.every(item => item.val === 0);
    if (isEmp) {
      list[0].val = 33000000; list[0].profit = 4500000;
      list[1].val = 29000000; list[1].profit = 3900000;
      list[2].val = 31000000; list[2].profit = 4900000;
      list[3].val = 55000000; list[3].profit = 8100000;
      list[4].val = 32000000; list[4].profit = 4100000;
      list[5].val = 39000000; list[5].profit = 5200000;
      list[6].val = 42000000; list[6].profit = 6000000;
      list[7].val = 51000000; list[7].profit = 7500000;
      list[8].val = 49000000; list[8].profit = 7100000;
      list[9].val = 45000000; list[9].profit = 6300000;
      list[10].val = 37000000; list[10].profit = 5500000;
      list[11].val = 41000000; list[11].profit = 6100000;
    }

    return list;
  };

  const monthlyBreakdown = getMonthlyBreakdownSalesProfit();
  const maxWeeklyBreakVal = Math.max(1, ...monthlyBreakdown.map(x => x.val));

  // --- MULTI-GUDANG TRANSFERS ---
  const handleTransferStockSubmit = () => {
    const { productId, fromWh, toWh, qty } = stockToTransfer;
    if (!productId) {
      alert('Mohon pilih produk yang ingin Anda pindahkan.');
      return;
    }
    if (fromWh === toWh) {
      alert('Gudang asal dan gudang tujuan perpindahan sediaan tidak boleh sama.');
      return;
    }
    if (qty <= 0) {
      alert('Jumlah perpindahan unit minimal 1 pcs.');
      return;
    }

    const targetProduct = products.find(p => p.id === productId);
    if (!targetProduct) return;

    // Check availability in source warehouse
    const currentWhStocks = targetProduct.warehouseStocks || {};
    const sourceQty = currentWhStocks[fromWh] || (fromWh === 'wh_main' ? targetProduct.stock : 0);

    if (sourceQty < qty) {
      alert(`Stok di ${warehouses.find(w => w.id === fromWh)?.name} tidak mencukupi.\nStock sedia: ${sourceQty} pcs, diminta pindah: ${qty} pcs.`);
      return;
    }

    // Update product stock distribution
    const sourceUpdatedQty = sourceQty - qty;
    const destUpdatedQty = (currentWhStocks[toWh] || (toWh === 'wh_main' ? targetProduct.stock : 0)) + qty;

    const updatedWhDistribution = {
      ...currentWhStocks,
      [fromWh]: sourceUpdatedQty,
      [toWh]: destUpdatedQty
    };

    const updatedProductsList = products.map(p => {
      if (p.id === productId) {
        // adjust global stock aggregates if applicable or persist distributions
        return {
          ...p,
          warehouseStocks: updatedWhDistribution
        };
      }
      return p;
    });

    onUpdateProducts(updatedProductsList);

    // Save transfer log
    const transferLog: StockTransfer = {
      id: 'TRF' + Date.now().toString().slice(-6),
      productId,
      productName: targetProduct.name,
      fromWarehouseId: fromWh,
      toWarehouseId: toWh,
      qty,
      date: new Date().toISOString()
    };

    const updatedTransfers = [transferLog, ...transferHistory];
    saveTransfers(updatedTransfers);

    setStockToTransfer(prev => ({ ...prev, qty: 1 }));
    alert(`Sukses memindahkan ${qty} pcs ${targetProduct.name} antar gudang!`);

    addLog(`Stock Transfer: memindahkan ${qty} unit ${targetProduct.name} dari ${warehouses.find(w => w.id === fromWh)?.name} ke ${warehouses.find(w => w.id === toWh)?.name}`);
  };

  // --- PARTNER SHARE PROFITS ---
  const handleAddPartner = () => {
    const name = newPartnerName.trim();
    const pct = Number(newPartnerPct);

    if (!name || isNaN(pct) || pct <= 0) {
      alert('Silakan tulis nama mitra pengelola & persentase kepemilikan yang sah.');
      return;
    }

    const currentTotal = partners.reduce((sum, p) => sum + p.percentage, 0);
    if (currentTotal + pct > 100) {
      alert(`Persentase melebihi batas 100%!\nAkumulasi terpasang: ${currentTotal}%, Kuota sisa: ${100 - currentTotal}%.`);
      return;
    }

    const updated = [...partners, { id: Date.now().toString(), name, percentage: pct }];
    saveShares(updated);
    setNewPartnerName('');
    setNewPartnerPct('');
    alert(`Partner ${name} dengan share ${pct}% berhasil didaftarkan.`);
  };

  const handleRemovePartner = (id: string) => {
    const updated = partners.filter(p => p.id !== id);
    saveShares(updated);
  };

  // --- TRIPPLE SIMULATION HELPERS ---
  const addLog = (msg: string) => {
    setSimLog(prev => [`[${new Date().toLocaleTimeString('id-ID')}] ${msg}`, ...prev.slice(0, 49)]);
  };

  // SIMULATOR 1: MOCK ONLINE BUYER SUBMISSION
  const triggerMockOnlinePreOrder = () => {
    if (products.length === 0) {
      alert('Harap buat produk di Katalog terlebih dahulu sebelum menjalankan simulator.');
      return;
    }

    const randomProduct = products[Math.floor(Math.random() * products.length)];
    const buyerNames = ['Senut Handriansyah', 'Salsa Melati', 'Dede Nurdiaz', 'Rizky Amalia', 'Andi Pratama'];
    const randomBuyer = buyerNames[Math.floor(Math.random() * buyerNames.length)];
    const id = 'ORD' + Math.floor(100000 + Math.random() * 900000);

    const mockupOrder: OnlineOrder = {
      id,
      name: randomBuyer,
      items: [{ id: randomProduct.id, name: randomProduct.name, price: randomProduct.price, cost: randomProduct.cost || randomProduct.price * 0.6, qty: 1 }],
      total: randomProduct.price,
      date: new Date().toISOString(),
      status: 'pending' as const,
      whatsapp: '08512345678',
      pickupDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString().split('T')[0], // tomorrow
      pickupTime: '15:30',
      storeName: randomProduct.storeName || shopName
    };

    if (onUpdateIncomingOrders && incomingOrders) {
      const updated = [mockupOrder, ...incomingOrders];
      onUpdateIncomingOrders(updated);
    } else {
      // Append to orders locally
      const currentOrders = localStorage.getItem('pos_orders_' + (products[0].storeName || 'public'));
      const arr = currentOrders ? JSON.parse(currentOrders) : [];
      const updated = [mockupOrder, ...arr];
      localStorage.setItem('pos_orders_' + (products[0].storeName || 'public'), JSON.stringify(updated));
    }

    // Also trigger window reload state notifications or push
    addLog(`Buyer Simulator: ${randomBuyer} mengirimkan Pre-Order #${id} sediaan ${randomProduct.name} untuk pickup besok jam 15:30.`);
    alert(`Simulation Berhasil! 🎉\n\nPelanggan "${randomBuyer}" mengirimkan Pre-Order #${id} ke antrean sediaan toko secara real-time.\nSilakan buka tab "Pesanan Masuk Online" di bilah utama untuk menyetujui pesanan ini!`);
  };

  // SIMULATOR 2: BLUETOOTH PRINTER SCENE
  const handleScanPrinter = () => {
    setIsScanningPrinter(true);
    setDiscoveredDevices([]);
    setTimeout(() => {
      setDiscoveredDevices([
        { id: 'bt_thermal_58a', name: '🖨️ BluePrint Lite 58A (Bluetooth)' },
        { id: 'bt_epson_p60', name: '🖨️ Seiko Epson P60 AutoCut (Wi-Fi)' },
        { id: 'bt_gprinter_3inch', name: '🖨️ Gprinter GP-3120TU (USB/LAN Core)' }
      ]);
      setIsScanningPrinter(false);
    }, 1500);
  };

  const handleConnectPrinter = (id: string) => {
    setSelectedPrinterId(id);
    setIsConnectedPrinter(true);
    const dName = discoveredDevices.find(d => d.id === id)?.name || 'Thermal printer';
    localStorage.setItem('pos_simulated_printer_id', id);
    localStorage.setItem('pos_simulated_printer_name', dName);
    addLog(`Printer Simulator: Berhasil terhubung ke ${dName} via ${printerType.toUpperCase()} network.`);
    alert(`Sinyal Terkoneksi! 🎉\n\nAplikasi Anda sekarang terhubung nirkabel ke printer thermal ${dName}.\nKetika mencetak struk kasir, data struk akan langsung dikirimkan.`);
  };

  const handleDisconnectPrinter = () => {
    localStorage.removeItem('pos_simulated_printer_id');
    localStorage.removeItem('pos_simulated_printer_name');
    setSelectedPrinterId('');
    setIsConnectedPrinter(false);
    addLog('Printer Simulator: Memutuskan hubungan printer.');
    alert('Printer berhasil diputuskan! 🔌');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Tabs Navigator Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight text-left">💡 Konsolidasi & Business Intelligence</h2>
          <p className="text-xs text-slate-500 mt-0.5 text-left">Manajemen Multi-Toko, Multi-Gudang, HPP Akuntansi & Simulator Bisnis KWU Store</p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'analytics', label: '📊 Analisis Grafis', icon: BarChart3 },
            { id: 'gudang', label: '🏬 Multi-Gudang', icon: ArrowRightLeft },
            { id: 'financials', label: '📑 Laba-Rugi & Neraca', icon: FileText },
            { id: 'shares', label: '🤝 Bagi Hasil %', icon: Users },
            { id: 'simulator', label: '🎮 Simulator & Printer', icon: HelpCircle }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setSubView(tab.id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  subView === tab.id 
                    ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* --- WORKSPACE SUB-VIEW CONTEXTS --- */}

      {/* VIEW 1: HIGH-FIDELITY ANALYTICAL DASHBOARD (LIKE IMAGE ATTACHED) */}
      {subView === 'analytics' && (
        <div className="space-y-6">
          
          {/* Mockup Title Header Matching Image layout */}
          <div className="bg-slate-800 rounded-3xl p-5 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl border-b-4 border-slate-900">
            <div className="flex items-center gap-3 text-left">
              <span className="text-3xl p-2 bg-slate-700/50 rounded-2xl border border-white/10">📈</span>
              <div>
                <h3 className="font-extrabold text-base tracking-wide uppercase">Dashboard Analisis Data Penjualan</h3>
                <p className="text-[10px] text-slate-350 mt-0.5 font-bold uppercase tracking-widest">Real-time Financial Graphing & KPI Indicators</p>
              </div>
            </div>

            {/* Quick Categories Class Tag in Mockup */}
            <div className="flex gap-1.5 text-[9px] font-black uppercase tracking-wider">
              <span className="bg-[#EF4444] px-3.5 py-1.5 rounded-lg text-white shadow-sm shadow-[#EF4444]/20 border border-white/10">Eceran</span>
              <span className="bg-emerald-600 px-3.5 py-1.5 rounded-lg text-white shadow-sm border border-white/10">Grosir</span>
              <span className="bg-blue-600 px-3.5 py-1.5 rounded-lg text-white shadow-sm border border-white/15">Online</span>
            </div>
          </div>

          {/* Interactive Filters Panel */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-4 shadow-xs grid grid-cols-2 md:grid-cols-5 gap-3 text-left">
            
            {/* Store (Cabang Multi-Toko) Selection Filter */}
            <div>
              <label className="block text-[8px] font-black text-slate-400 uppercase mb-1">🏬 CABANG TOKO/MITRA</label>
              <select 
                value={filterStore}
                onChange={(e) => setFilterStore(e.target.value)}
                className="w-full text-xs font-bold border border-slate-200 rounded-xl px-2.5 py-1.5 bg-slate-50 focus:outline-none"
              >
                <option value="Semua">Semua Toko</option>
                <option value={shopName}>{shopName} (Pusat)</option>
                {storeNames.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            {/* Calendar Year Filter */}
            <div>
              <label className="block text-[8px] font-black text-slate-400 uppercase mb-1">📅 ANALISIS TAHUN</label>
              <div className="flex gap-1">
                {(['2021', '2022', '2026'] as const).map(yr => (
                  <button
                    key={yr}
                    onClick={() => setFilterYear(yr)}
                    className={`flex-1 py-1 px-2.5 rounded-lg text-[10px] font-black border transition-all cursor-pointer ${filterYear === yr ? 'bg-red-500 border-red-500 text-white shadow-xs' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                  >
                    {yr}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Method Filter */}
            <div>
              <label className="block text-[8px] font-black text-slate-400 uppercase mb-1">💳 PEMBAYARAN</label>
              <div className="flex gap-1">
                {(['semua', 'tunai', 'kredit'] as const).map(pay => (
                  <button
                    key={pay}
                    onClick={() => setFilterPayment(pay)}
                    className={`flex-1 py-1 px-1 text-[9px] font-black border uppercase transition-all cursor-pointer ${filterPayment === pay ? 'bg-red-500 border-red-500 text-white shadow-xs' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                  >
                    {pay === 'semua' ? 'All' : pay === 'tunai' ? 'Cash' : 'Kredit'}
                  </button>
                ))}
              </div>
            </div>

            {/* Month Filter Selector list */}
            <div>
              <label className="block text-[8px] font-black text-slate-400 uppercase mb-1">🌙 PILIH BULAN</label>
              <select 
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="w-full text-xs font-bold border border-slate-200 rounded-xl px-2.5 py-1.5 bg-slate-50 focus:outline-none cursor-pointer"
              >
                <option value="Semua">Semua Bulan (Tahunan)</option>
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* Quick Status Asset values */}
            <div>
              <label className="block text-[8px] font-black text-slate-400 uppercase mb-1">🏦 KEKAYAAN STOK (HPP)</label>
              <div className="bg-emerald-50 text-emerald-800 text-xs font-black p-2.5 rounded-xl border border-emerald-100 uppercase text-center truncate">
                Rp {totalAssetsFromStock.toLocaleString('id-ID')}
              </div>
            </div>

          </div>

          {/* Three Giant KPI Cards resembling the dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* CARD 1: Total Sales */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm text-center relative overflow-hidden">
              <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Total Penjualan</span>
              <h4 className="text-2xl font-black text-slate-800 mt-2 truncate">
                Rp {totalSalesVal.toLocaleString('id-ID')}
              </h4>
              <p className="text-[10px] text-slate-400 font-bold mt-1.5 uppercase">Volume Perdagangan Bruto</p>
              <div className="absolute top-1 border-b-2 right-1 w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center opacity-10">
                <BarChart3 className="w-8 h-8" />
              </div>
            </div>

            {/* CARD 2: Total Profit & Margin Percentage */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm text-center relative overflow-hidden">
              <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Total Profit</span>
              <h4 className="text-2xl font-black text-slate-800 mt-2 truncate">
                Rp {totalProfitVal.toLocaleString('id-ID')}
              </h4>
              <div className="inline-block bg-blue-50 text-blue-700 font-black text-[10px] px-2.5 py-0.5 mt-2 rounded-full border border-blue-100">
                ⭐ Margin Laba: {profitPercentage}%
              </div>
              <div className="absolute top-1 right-1 w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center opacity-10">
                <TrendingUp className="w-8 h-8" />
              </div>
            </div>

            {/* CARD 3: Total Unit Products Sold */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm text-center relative overflow-hidden">
              <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Total Produk Terjual</span>
              <div className="flex items-baseline justify-center gap-1.5 mt-2">
                <h4 className="text-2xl font-black text-slate-800 truncate">
                  {totalItemsSold.toLocaleString('id-ID')}
                </h4>
                <span className="text-xs font-bold text-slate-400">Pcs</span>
              </div>
              <p className="text-[10px] text-slate-400 font-bold mt-1.5 uppercase">Laju Sediaan Terdistribusi</p>
              <div className="absolute top-1 right-1 w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center opacity-10">
                <ShoppingCart className="w-8 h-8" />
              </div>
            </div>

          </div>

          {/* MAIN GRAPHICS ROW: Dynamic Bulanan, Categories, and Best Sellers Leaderboard */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 text-left">
            
            {/* LEFT CONTAINER: Bulanan Bar graph representation (Col: 7) */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm lg:col-span-7 flex flex-col justify-between space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <h4 className="font-extrabold text-xs text-slate-800 tracking-wide uppercase flex items-center gap-1.5">
                  📅 Grafik Bulanan: Penjualan & Profit Bersih
                </h4>
                <span className="text-[9px] text-slate-405 font-bold uppercase">Sumbu Unit IDR Juta</span>
              </div>

              {/* Responsive SVG/HTML Bar Diagram matching layout */}
              <div className="h-56 flex items-end gap-2 px-1 pt-4 relative border-b border-slate-200">
                {monthlyBreakdown.map((item, i) => {
                  const salePct = (item.val / maxWeeklyBreakVal) * 85;
                  const profitPct = (item.profit / maxWeeklyBreakVal) * 85;

                  return (
                    <div key={item.m} className="flex-1 flex flex-col items-center gap-0.5 group relative h-full justify-end">
                      
                      {/* Floating Tooltips */}
                      <div className="absolute bottom-[calc(100%+4px)] left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-800 text-white text-[9px] p-2 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-all font-semibold z-25 pointer-events-none whitespace-nowrap space-y-0.5">
                        <p className="text-blue-300 font-black">🛒 Omzet: Rp {item.val.toLocaleString('id-ID')}</p>
                        <p className="text-emerald-400 font-black">💰 Profit: Rp {item.profit.toLocaleString('id-ID')}</p>
                      </div>

                      {/* Stacked representation in two columns */}
                      <div className="w-full flex items-end justify-center gap-[1px]">
                        {/* Omzet Bar (Cyan/Blue) */}
                        <div 
                          style={{ height: `${Math.max(5, salePct)}%` }}
                          className="w-1.5 md:w-2 bg-[#EF4444] rounded-t-sm group-hover:opacity-85 transition-all shadow-5xs"
                        ></div>
                        {/* Profit Bar (Pink/Violet) */}
                        <div 
                          style={{ height: `${Math.max(3, profitPct)}%` }}
                          className="w-1.5 md:w-2 bg-emerald-500 rounded-t-sm group-hover:opacity-85 transition-all shadow-5xs"
                        ></div>
                      </div>

                      {/* X Label */}
                      <span className="text-[8px] text-slate-500 font-black tracking-wide uppercase mt-1">{item.m}</span>
                    </div>
                  );
                })}
              </div>

              {/* Chart Legend matching colors */}
              <div className="flex gap-4 p-1 rounded-2xl bg-slate-50 border border-slate-100 justify-center text-[10px] font-black">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-[#EF4444] rounded"></span> Omzet Penjualan Bruto</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-emerald-500 rounded"></span> Keuntungan (Laba Bersih)</span>
              </div>
            </div>

            {/* RIGHT CONTAINER: 10 Best Sellers List (Col: 5) */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm lg:col-span-5 flex flex-col justify-between space-y-3">
              <div className="border-b border-slate-100 pb-2">
                <h4 className="font-extrabold text-xs text-slate-800 tracking-wide uppercase flex items-center gap-1.5">
                  🏆 10 Produk Terlaris sediaan Toko
                </h4>
                <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">Urutan berdasarkan kuantitas pcs terdistribusi</p>
              </div>

              <div className="space-y-1.5 max-h-56 overflow-y-auto scrollbar-thin pr-1 text-xs">
                {leaderboard.length > 0 ? (
                  leaderboard.map(([name, stat], idx) => {
                    // compute layout percentage for progress visual bar
                    const maxLeaderQty = leaderboard[0] ? leaderboard[0][1].qty : 1;
                    const visualPct = (stat.qty / maxLeaderQty) * 100;

                    return (
                      <div key={name} className="space-y-0.5">
                        <div className="flex justify-between items-center text-[10px] font-black">
                          <span className="text-slate-700 truncate max-w-[170px]">
                            {idx + 1}. {name}
                          </span>
                          <span className="text-blue-900 bg-blue-50 px-1.5 py-0.5 rounded text-[9px]">
                            {stat.qty} Unit (Rp {stat.value.toLocaleString('id-ID')})
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            style={{ width: `${visualPct}%` }}
                            className="h-full bg-blue-500 rounded-full"
                          ></div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-slate-405 text-center py-12 font-medium">Belum ada sediaan penjualan terekam.</p>
                )}
              </div>
            </div>

          </div>

          {/* LOWER ANALYSIS ROW: Type sales (eceran vs grosir), categories, and Kontribusi Nilai */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
            
            {/* WIDGET 1: Jenis Penjualan Doughnut Chart representation */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between space-y-3">
              <div className="border-b border-slate-100 pb-2">
                <h4 className="font-extrabold text-xs text-slate-800 tracking-wide uppercase">Jenis Penjualan (Segmentasi)</h4>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Analisis Eceran, Grosir, & Online</p>
              </div>

              {/* Simulated pie chart visualization with CSS gradients */}
              <div className="flex items-center justify-center py-2">
                <div 
                  className="w-32 h-32 rounded-full flex items-center justify-center text-center relative border-4 border-slate-100 shadow-md"
                  style={{
                    boxShadow: 'inset 0 0 10px rgba(0,0,0,0.05)',
                    background: 'conic-gradient(#EF4444 0% 35%, #059669 35% 70%, #2563EB 70% 100%)'
                  }}
                >
                  {/* Doughnut center */}
                  <div className="w-20 h-20 bg-white rounded-full flex flex-col justify-center items-center text-slate-800 shadow-sm">
                    <span className="text-[10px] font-black text-slate-450 uppercase leading-none">TOTAL</span>
                    <span className="text-xs font-black text-slate-850 scale-95 mt-1">100%</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 text-[10px] font-black uppercase">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#EF4444]"></span> 🛒 Eceran Kasir</span>
                  <span className="text-slate-600 bg-slate-50 px-2 py-0.5 rounded">Rp {eceranVal.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#059669]"></span> 📦 Grosir UMKM</span>
                  <span className="text-slate-600 bg-slate-50 px-2 py-0.5 rounded">Rp {grosirVal.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#2563EB]"></span> 📱 Pre-Order Pickup</span>
                  <span className="text-slate-600 bg-slate-50 px-2 py-0.5 rounded">Rp {onlineVal.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>

            {/* WIDGET 2: Penjualan / Kategori list percentages */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between space-y-3">
              <div className="border-b border-slate-100 pb-2">
                <h4 className="font-extrabold text-xs text-slate-800 tracking-wide uppercase">Penjualan / Kategori</h4>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Kontribusi omzet per kelompok sediaan</p>
              </div>

              <div className="space-y-2.5 max-h-48 overflow-y-auto scrollbar-thin pr-1 text-xs">
                {catContributions.length > 0 ? (
                  catContributions.map(([cat, statVal]) => {
                    const contribPct = totalCatSum > 0 ? ((statVal / totalCatSum) * 100).toFixed(1) : '0';
                    return (
                      <div key={cat} className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold text-slate-700">
                          <span>🍔 {cat}</span>
                          <span className="font-extrabold text-emerald-600">Rp {statVal.toLocaleString('id-ID')} ({contribPct}%)</span>
                        </div>
                        <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            style={{ width: `${contribPct}%` }}
                            className="h-full bg-emerald-500 rounded-full"
                          ></div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-slate-404 text-center py-12">Belum ada transaksi terekam.</p>
                )}
              </div>
            </div>

            {/* WIDGET 3: Kontribusi Nilai Penjualan */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between space-y-3 text-xs">
              <div className="border-b border-slate-100 pb-2">
                <h4 className="font-extrabold text-xs text-slate-800 tracking-wide uppercase">Kontribusi Nilai Penjualan</h4>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Efisiensi operasional dan rasio HPP</p>
              </div>

              <div className="space-y-3 select-none text-[10px] font-black uppercase">
                <div className="flex justify-between items-center p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-505">Rasio HPP (COGS Cost)</span>
                  <span className="text-amber-800 bg-amber-50/50 px-2 py-0.5 rounded">
                    {totalSalesVal > 0 ? ((totalCostVal / totalSalesVal) * 100).toFixed(1) + '%' : '0%'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-505">Rasio Laba Bersih</span>
                  <span className="text-emerald-800 bg-emerald-50/50 px-2 py-0.5 rounded">
                    {totalSalesVal > 0 ? ((totalProfitVal / totalSalesVal) * 100).toFixed(1) + '%' : '0%'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-505">Nilai Pasar Sediaan Toko</span>
                  <span className="text-blue-800 bg-blue-50/50 px-2 py-0.5 rounded">
                    Rp {totalInventoryMarketValue.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-505">Simulated Success Rate</span>
                  <span className="text-purple-800 bg-purple-50/50 px-2 py-0.5 rounded">
                    98.4%
                  </span>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* VIEW 2: MULTI-GUDANG & STOCK TRANSFER & INVENTORY HPP VALUE */}
      {subView === 'gudang' && (
        <div className="space-y-6 text-left animate-in fade-in duration-200">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* LEFT COLUMN: Transfer Form */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
              <h3 className="font-extrabold text-sm text-slate-800 border-b border-slate-100 pb-2">📦 Formulir Perpindahan Stok (Mutasi)</h3>
              
              <div className="space-y-3.5 text-xs">
                {/* 1. Select Product */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">PILIH PRODUK SEDIAAN</label>
                  <select
                    value={stockToTransfer.productId}
                    onChange={(e) => setStockToTransfer(prev => ({ ...prev, productId: e.target.value }))}
                    className="w-full text-xs font-bold border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  >
                    <option value="">-- Pilih Barang --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} (Global Sedia: {p.stock} Pcs | Cat: {p.category})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Select Source Warehouse */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">DARI GUDANG ASAL</label>
                  <select
                    value={stockToTransfer.fromWh}
                    onChange={(e) => setStockToTransfer(prev => ({ ...prev, fromWh: e.target.value }))}
                    className="w-full text-xs font-bold border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  >
                    {warehouses.map(wh => (
                      <option key={wh.id} value={wh.id}>{wh.name} ({wh.location})</option>
                    ))}
                  </select>
                </div>

                {/* 3. Select Destination Warehouse */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">KE GUDANG TUJUAN</label>
                  <select
                    value={stockToTransfer.toWh}
                    onChange={(e) => setStockToTransfer(prev => ({ ...prev, toWh: e.target.value }))}
                    className="w-full text-xs font-bold border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  >
                    {warehouses.map(wh => (
                      <option key={wh.id} value={wh.id}>{wh.name} ({wh.location})</option>
                    ))}
                  </select>
                </div>

                {/* 4. Quantity input */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">JUMLAH BARANG (PCS)</label>
                  <input
                    type="number"
                    min="1"
                    value={stockToTransfer.qty}
                    onChange={(e) => setStockToTransfer(prev => ({ ...prev, qty: Math.max(1, Number(e.target.value)) }))}
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleTransferStockSubmit}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow transition-all active:scale-95 text-center flex items-center justify-center gap-1 cursor-pointer"
                >
                  <ArrowRightLeft className="w-4 h-4" /> Mutasi Sediaan Sekarang
                </button>
              </div>
            </div>

            {/* MIDDLE/RIGHT COLUMN: Warehouse list + stock level per warehouse */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm lg:col-span-2 space-y-4">
              <h3 className="font-extrabold text-sm text-slate-800 border-b border-slate-100 pb-2 flex items-center justify-between">
                <span>🏬 Status Sediaan per Cluster Gudang</span>
                <span className="text-[10px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded font-black uppercase">Multi-Warehouse Audit</span>
              </h3>

              {/* Warehouse Loop cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {warehouses.map(wh => {
                  // Compute total items and inventory value in this specific sub-warehouse
                  let totalItemsInWh = 0;
                  let assetsValInWh = 0;

                  products.forEach(p => {
                    const whStocks = p.warehouseStocks || {};
                    // If whStocks is empty for this warehouse and it's the main warehouse, default to the global stock amount!
                    const currentQty = whStocks[wh.id] !== undefined ? whStocks[wh.id] : (wh.id === 'wh_main' ? p.stock : 0);
                    totalItemsInWh += currentQty;
                    assetsValInWh += currentQty * (p.cost || p.price * 0.6);
                  });

                  return (
                    <div key={wh.id} className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-4 border border-slate-150 shadow-5xs text-left">
                      <h4 className="font-extrabold text-xs text-slate-800 truncate">🏦 {wh.name}</h4>
                      <p className="text-[9px] text-slate-400 mt-0.5 font-semibold"><span className="text-slate-300">📍</span> {wh.location}</p>

                      <div className="mt-4 pt-3 border-t border-slate-150 text-[10px] space-y-2 select-none">
                        <div className="flex justify-between items-center text-slate-500 font-bold">
                          <span>Total Unit:</span>
                          <span className="font-black text-slate-800 text-[11px] bg-slate-100 px-2.5 py-0.5 rounded-lg">{totalItemsInWh} pcs</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-500 font-bold">
                          <span>Nilai Sediaan (HPP):</span>
                          <span className="font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Rp {assetsValInWh.toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Advanced distribution breakdown table */}
              <div className="space-y-2 select-none">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Rincian Komprehensif Sediaan Stok per Gudang</p>
                <div className="overflow-x-auto max-h-52 border border-slate-150 rounded-2xl text-[11px]">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-150">
                        <th className="p-2">Nama Barang</th>
                        <th className="p-2 text-center">SKU</th>
                        <th className="p-2 text-right">Gudang Utama</th>
                        <th className="p-2 text-right">Gudang Display</th>
                        <th className="p-2 text-right">Gudang Cadangan</th>
                        <th className="p-2 text-right font-black text-slate-800">Total Global</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-750">
                      {products.map(p => {
                        const whStocks = p.warehouseStocks || {};
                        const mainQty = whStocks['wh_main'] !== undefined ? whStocks['wh_main'] : p.stock;
                        const displayQty = whStocks['wh_store'] !== undefined ? whStocks['wh_store'] : 0;
                        const reserveQty = whStocks['wh_back'] !== undefined ? whStocks['wh_back'] : 0;

                        return (
                          <tr key={p.id} className="hover:bg-slate-50/50">
                            <td className="p-2 font-semibold truncate max-w-[150px]">{p.name}</td>
                            <td className="p-2 text-center font-mono text-[9px] text-slate-400">{p.sku || '-'}</td>
                            <td className="p-2 text-right text-slate-600">{mainQty} pcs</td>
                            <td className="p-2 text-right text-slate-600">{displayQty} pcs</td>
                            <td className="p-2 text-right text-slate-600">{reserveQty} pcs</td>
                            <td className="p-2 text-right font-black text-blue-900 bg-blue-50/20">{p.stock} pcs</td>
                          </tr>
                        );
                      })}
                      {products.length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center py-8 text-slate-400 font-bold">Katalog sediaan barang kosong.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Histori Mutasi */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm">
            <h3 className="font-extrabold text-sm text-slate-800 border-b border-slate-100 pb-2">📜 Riwayat Perpindahan Sediaan (Mutasi)</h3>
            <div className="space-y-1.5 mt-3 max-h-40 overflow-y-auto scrollbar-thin text-xs font-semibold pr-1">
              {transferHistory.map(tr => {
                const dateFmt = new Date(tr.date).toLocaleDateString('id-ID') + ' ' + new Date(tr.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
                return (
                  <div key={tr.id} className="flex justify-between items-center p-2.5 bg-slate-50 border border-slate-150 rounded-xl leading-none">
                    <div className="flex items-center gap-2">
                      <span className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded text-[8px] font-black">{tr.id}</span>
                      <p className="text-slate-800 font-bold truncate max-w-[200px]">
                        {tr.productName} <span className="text-slate-405 font-medium">x{tr.qty} pcs</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-[11px]">
                      <p className="text-slate-500">
                        Ambil: <strong className="text-orange-700">{warehouses.find(w => w.id === tr.fromWarehouseId)?.name.split(' ')[1] || 'Asal'}</strong> 
                        &nbsp;➡️ Taruh: <strong className="text-emerald-700">{warehouses.find(w => w.id === tr.toWarehouseId)?.name.split(' ')[1] || 'Tujuan'}</strong>
                      </p>
                      <span className="text-[10px] text-slate-400 text-right">{dateFmt}</span>
                    </div>
                  </div>
                );
              })}
              {transferHistory.length === 0 && (
                <p className="text-center py-6 text-slate-400 bg-slate-50 border border-slate-100 border-dashed rounded-xl font-bold">Belum ada riwayat mutasi stok dilakukan.</p>
              )}
            </div>
          </div>

        </div>
      )}

      {/* VIEW 3: FINANCIAL REPORT (LABA RUGI, NERACA, ARUS KAS) */}
      {subView === 'financials' && (
        <div className="space-y-5 text-left animate-in fade-in duration-200">
          
          {/* Quick Informative Header */}
          <div className="bg-amber-500/10 border-2 border-amber-500/15 rounded-3xl p-4 text-xs text-amber-900 leading-relaxed font-bold">
            💡 KELOLA NERACA & HPP: Seluruh laporan akuntansi disusun secara otomatis dari rekaman kasir (POS), biaya modal (HPP/COGS), pengeluaran sewa & operasional bulanan (OPEX), serta sisa nilai aset dari ketersediaan sediaan stok barang.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* COLUMN 1: LAPORAN LABA RUGI */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
              <h3 className="font-extrabold text-sm text-slate-800 border-b border-slate-100 pb-2 text-center uppercase tracking-wider text-rose-500">📊 Laba Rugi (Income Statement)</h3>
              
              <div className="space-y-3.5 text-xs text-slate-700 font-bold">
                <div className="flex justify-between items-center">
                  <span>Omzet Penjualan Kasir:</span>
                  <span className="text-blue-900 border-b border-slate-100 p-1 font-extrabold">Rp {totalSalesVal.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center text-red-650">
                  <span>HPP (Harga Pokok Penjualan):</span>
                  <span>- Rp {totalCostVal.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center bg-slate-50 p-2 rounded-xl text-slate-800 border-t-2 border-slate-200 font-black">
                  <span>Laba Kotor (Gross Profit):</span>
                  <span>Rp {(totalSalesVal - totalCostVal).toLocaleString('id-ID')}</span>
                </div>

                <p className="text-[10px] text-slate-400 uppercase font-black border-b border-slate-100 pt-2 mb-1">BEBAN OPERASIONAL (OPEX)</p>
                <div className="flex justify-between items-center font-medium text-slate-500">
                  <span>Beban Sewa Ruko:</span>
                  <span>Rp {expenses.rent?.toLocaleString('id-ID') || 0}</span>
                </div>
                <div className="flex justify-between items-center font-medium text-slate-500">
                  <span>Gaji Pegawai Kasir:</span>
                  <span>Rp {expenses.salary?.toLocaleString('id-ID') || 0}</span>
                </div>
                <div className="flex justify-between items-center font-medium text-slate-500">
                  <span>Beban Air, Listrik, Wi-Fi:</span>
                  <span>Rp {expenses.utilities?.toLocaleString('id-ID') || 0}</span>
                </div>
                <div className="flex justify-between items-center font-medium text-slate-500">
                  <span>Operasional Lainnya:</span>
                  <span>Rp {expenses.other?.toLocaleString('id-ID') || 0}</span>
                </div>

                {/* Total OPEX */}
                {(() => {
                  const opexSum = (expenses.rent || 0) + (expenses.salary || 0) + (expenses.utilities || 0) + (expenses.other || 0);
                  const netProfit = (totalSalesVal - totalCostVal) - opexSum;

                  return (
                    <>
                      <div className="flex justify-between items-center text-red-650 border-t border-slate-200 pt-2">
                        <span>Total Beban Operasional:</span>
                        <span>- Rp {opexSum.toLocaleString('id-ID')}</span>
                      </div>
                      <div className={`p-3.5 rounded-2xl border text-center font-black mt-4 text-xs ${netProfit >= 0 ? 'bg-emerald-500/10 text-emerald-800 border-emerald-55/20' : 'bg-red-50 text-red-800 border-red-200'}`}>
                        <p className="text-[9px] uppercase tracking-wider font-extrabold text-slate-450 leading-none">Keuntungan Bersih (Net Income)</p>
                        <p className="text-base mt-1.5">Rp {netProfit.toLocaleString('id-ID')}</p>
                      </div>
                    </>
                  );
                })()}
              </div>

            </div>

            {/* COLUMN 2: NERACA KEUANGAN */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
              <h3 className="font-extrabold text-sm text-slate-800 border-b border-slate-100 pb-2 text-center uppercase tracking-wider text-rose-500">⚖️ Neraca Usaha (Balance Sheet)</h3>
              
              {/* Assets left vs Liabilities right standard representation */}
              <div className="space-y-3.5 text-xs text-slate-700 font-bold select-none">
                <p className="text-[10px] text-slate-400 uppercase font-black border-b border-slate-150 mb-1">Aset Lancar (Assets)</p>
                
                {/* Cash in hand = accumulated cash sales - expenditures */}
                {(() => {
                  const paySum = filteredTx.filter(t => t.method === 'tunai').reduce((s,t) => s + t.total, 0);
                  const opexSum = (expenses.rent || 0) + (expenses.salary || 0) + (expenses.utilities || 0) + (expenses.other || 0);
                  const cashAsset = Math.max(2500000, paySum - opexSum); // safe floor representation

                  const totalAssets = cashAsset + totalAssetsFromStock;

                  return (
                    <>
                      <div className="flex justify-between items-center font-medium text-slate-600">
                        <span>Kas Tunai di Tangan:</span>
                        <span className="font-black text-slate-800">Rp {cashAsset.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between items-center font-medium text-slate-600">
                        <span>Sediaan Stok Sedia (HPP):</span>
                        <span className="font-black text-slate-800">Rp {totalAssetsFromStock.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl text-slate-800 border-t-2 border-slate-200 font-black">
                        <span>Total Nilai Aset Usaha:</span>
                        <span>Rp {totalAssets.toLocaleString('id-ID')}</span>
                      </div>

                      <p className="text-[10px] text-slate-400 uppercase font-black border-b border-slate-150 pt-2 mb-1">Pasiva: Kewajiban & Ekuitas (Equity)</p>
                      <div className="flex justify-between items-center font-medium text-slate-500">
                        <span>Kewajiban / Utang Usaha:</span>
                        <span>Rp 0</span>
                      </div>
                      <div className="flex justify-between items-center font-medium text-slate-500">
                        <span>Beban Modal Awal Pengurus:</span>
                        <span>Rp {(totalAssets * 0.7).toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between items-center font-medium text-slate-500 font-bold text-slate-700">
                        <span>Laba Ditahan (Retained earnings):</span>
                        <span>Rp {(totalAssets * 0.3).toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border-t border-slate-150 text-slate-800 font-black">
                        <span>Total Kewajiban & Modal:</span>
                        <span>Rp {totalAssets.toLocaleString('id-ID')}</span>
                      </div>
                    </>
                  );
                })()}

              </div>
            </div>

            {/* COLUMN 3: LAPORAN ARUS KAS */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
              <h3 className="font-extrabold text-sm text-slate-800 border-b border-slate-100 pb-2 text-center uppercase tracking-wider text-rose-500">💸 Arus Kas (Cash Flow)</h3>
              
              <div className="space-y-3.5 text-xs text-slate-700 font-semibold">
                <p className="text-[10px] text-slate-400 uppercase font-bold border-b border-slate-100 mb-1">Aktivitas Operasional (Cash In)</p>
                <div className="flex justify-between items-center font-bold">
                  <span>Penerimaan Kas dari Konsumen:</span>
                  <span className="text-emerald-700 font-black">+ Rp {totalSalesVal.toLocaleString('id-ID')}</span>
                </div>

                <p className="text-[10px] text-slate-400 uppercase font-bold border-b border-slate-100 pt-2 mb-1">PENGELUARAN KAS (Cash Out)</p>
                <div className="flex justify-between items-center font-medium text-red-650">
                  <span>Pembayaran Sediaan Barang:</span>
                  <span>- Rp {totalCostVal.toLocaleString('id-ID')}</span>
                </div>
                {(() => {
                  const opexSum = (expenses.rent || 0) + (expenses.salary || 0) + (expenses.utilities || 0) + (expenses.other || 0);
                  const netChange = totalSalesVal - totalCostVal - opexSum;

                  return (
                    <>
                      <div className="flex justify-between items-center font-medium text-red-650">
                        <span>Pembayaran Beban Operasional:</span>
                        <span>- Rp {opexSum.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border-t border-slate-200 font-black text-slate-805">
                        <span>Arus Kas Operasional Bersih:</span>
                        <span className={netChange >= 0 ? 'text-emerald-700' : 'text-red-700'}>Rp {netChange.toLocaleString('id-ID')}</span>
                      </div>

                      <p className="text-[10px] text-slate-400 uppercase font-bold border-b border-slate-100 pt-2 mb-1">Kas Akhir Sesi</p>
                      <div className="flex justify-between items-center bg-purple-65/10 border border-purple-200 p-3 rounded-2xl text-purple-900 font-black mt-2">
                        <span>KAS DI TANGAN (Net Liquid):</span>
                        <span>Rp {Math.max(5000000, 5000000 + netChange).toLocaleString('id-ID')}</span>
                      </div>
                    </>
                  );
                })()}
              </div>

            </div>

          </div>

        </div>
      )}

      {/* VIEW 4: AUTOMATED OWNER PARTNERSHIP SPLITS (PEMBAGIAN HASIL KEPEMILIKAN BENTUK PERSEN) */}
      {subView === 'shares' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5 text-left animate-in fade-in duration-200">
          <div>
            <h3 className="font-extrabold text-sm text-slate-800">🤝 Pembagian Hasil Kepemilikan Persentase</h3>
            <p className="text-xs text-slate-500 mt-1">Definisikan daftar pemegang hak kepemilikan modal/usaha, sistem otomatis menghitung porsi bagi hasil dari Pendapatan kotor dan Keuntungan bersih kas saat ini.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Form adding partners */}
            <div className="bg-slate-55 border border-slate-150 p-4 rounded-2xl text-xs space-y-3 shrink-0">
              <h4 className="font-bold text-slate-800">Add Pemilik Modal / Mitra Baru</h4>
              
              <div>
                <label className="block text-[10px] text-slate-450 font-black uppercase mb-1">Nama Pemilik / Partner</label>
                <input
                  type="text"
                  placeholder="Contoh: Salsa Melati (Investor)"
                  value={newPartnerName}
                  onChange={(e) => setNewPartnerName(e.target.value)}
                  className="w-full text-xs font-bold border border-slate-350 rounded-xl px-2.5 py-1.5 bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-450 font-black uppercase mb-1">Persen Kepemilikan (%)</label>
                <input
                  type="number"
                  placeholder="Contoh: 15"
                  value={newPartnerPct}
                  onChange={(e) => setNewPartnerPct(e.target.value !== '' ? Number(e.target.value) : '')}
                  className="w-full text-xs border border-slate-350 rounded-xl px-2.5 py-1.5 bg-white focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={handleAddPartner}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all active:scale-[0.98] cursor-pointer"
              >
                + Register Partner Persentase
              </button>
            </div>

            {/* Calculations outputs rightwards */}
            <div className="md:col-span-2 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Daftar Porsi Bagian Pemilik</span>
                <span className="text-[10px] bg-slate-100 font-extrabold px-2 py-0.5 rounded text-slate-500 select-none">
                  Accumulated Share: {partners.reduce((s,p) => s + p.percentage, 0)}% / 100%
                </span>
              </div>

              <div className="space-y-2 border border-slate-150 rounded-2xl p-2 max-h-52 overflow-y-auto scrollbar-thin text-xs font-medium">
                {partners.map(p => {
                  // split calculations
                  const shareRevenues = (totalSalesVal * p.percentage) / 100;
                  const shareProfit = (totalProfitVal * p.percentage) / 100;

                  return (
                    <div key={p.id} className="flex justify-between items-center p-3 bg-slate-50 hover:bg-slate-100/60 rounded-xl border border-slate-150 leading-none">
                      <div>
                        <h4 className="font-extrabold text-slate-805">👤 {p.name}</h4>
                        <p className="text-[9px] text-slate-405 font-bold mt-1 uppercase">Saham kepemilikan: {p.percentage}%</p>
                      </div>

                      <div className="flex gap-4 text-right">
                        <div className="text-left">
                          <span className="block text-[8px] text-slate-400 uppercase font-black font-semibold">Bagi Omzet</span>
                          <span className="font-bold text-slate-800">Rp {shareRevenues.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="text-left">
                          <span className="block text-[8px] text-slate-400 uppercase font-black">Bagi Untung Bersih</span>
                          <span className="font-extrabold text-emerald-600 bg-emerald-100/10 px-1 py-0.5 rounded">Rp {shareProfit.toLocaleString('id-ID')}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemovePartner(p.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-slate-100 rounded self-center p-1 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
                {partners.length === 0 && (
                  <p className="text-center py-10 font-bold text-slate-400">Belum didaftarkan nama mitra persentase kepemilikan.</p>
                )}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* VIEW 5: TUTORIAL SIMULATORS & WIRELESS THERMAL PRINTS (BLUETOOTH WIFI CONNECT) */}
      {subView === 'simulator' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left animate-in fade-in duration-200">
          
          {/* SIMULATOR CHIP 1: PRINT BLUETOOTH / WIFI THERMAL RECEIPT PAIRS */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-slate-800 border-b border-slate-100 pb-2">📶 Printer Struk Nirkabel (BT/Wi-Fi)</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Konfigurasi simulasi untuk menyambungkan HP/Laptop dengan printer thermal kasir 58mm / 80mm secara virtual lewat Bluetooth / Wi-Fi lokal.
            </p>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[10px] text-slate-400 font-extrabold uppercase mb-1">JARINGAN PRINTER</label>
                <div className="flex gap-2 font-bold text-slate-650">
                  <button
                    onClick={() => { setPrinterType('bluetooth'); setIsConnectedPrinter(false); }}
                    className={`flex-1 py-2 rounded-xl text-xs font-black border transition-all cursor-pointer ${printerType === 'bluetooth' ? 'bg-indigo-50 border-indigo-550 text-indigo-750' : 'bg-slate-50 border-slate-150'}`}
                  >
                    🔵 Bluetooth
                  </button>
                  <button
                    onClick={() => { setPrinterType('wifi'); setIsConnectedPrinter(false); }}
                    className={`flex-1 py-2 rounded-xl text-xs font-black border transition-all cursor-pointer ${printerType === 'wifi' ? 'bg-cyan-50 border-cyan-550 text-cyan-750' : 'bg-slate-50 border-slate-150'}`}
                  >
                    🟢 Wi-Fi Router
                  </button>
                </div>
              </div>

              {printerType === 'bluetooth' ? (
                <button
                  type="button"
                  onClick={handleScanPrinter}
                  disabled={isScanningPrinter}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-350 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  {isScanningPrinter ? 'Mencari Perangkat (BT)...' : '🔍 Pindai Printer Terdekat'}
                </button>
              ) : (
                <div className="space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-150">
                  <label className="block text-[9px] text-slate-450 uppercase font-black leading-none">IP Address Printer Port</label>
                  <div className="flex gap-1.5 items-center mt-1.5">
                    <input type="text" placeholder="192.168.1.100" defaultValue="192.168.1.100" className="flex-1 px-2 py-1 text-xs border border-slate-350 bg-white rounded font-mono" />
                    <button onClick={() => { setIsConnectedPrinter(true); addLog('Printer Simulator: Terhubung ke EPSON Wi-Fi (IP: 192.168.1.100)'); }} className="py-1 px-3 bg-cyan-600 text-white font-bold rounded">Connect</button>
                  </div>
                </div>
              )}

              {/* Scanned result devices list */}
              {discoveredDevices.length > 0 && !isConnectedPrinter && (
                <div className="space-y-1 bg-slate-50 p-3 rounded-2xl border border-slate-150">
                  <p className="text-[10px] text-indigo-805 font-black uppercase tracking-wider mb-2">Perangkat Ditemukan:</p>
                  {discoveredDevices.map(d => (
                    <button
                      key={d.id}
                      onClick={() => handleConnectPrinter(d.id)}
                      className="w-full text-left text-xs bg-white border border-slate-205 p-2 rounded-xl hover:border-indigo-505 font-medium mb-1 flex items-center justify-between"
                    >
                      <span className="truncate">{d.name}</span>
                      <span className="text-[9px] font-black uppercase text-indigo-650 bg-indigo-50 px-2 py-0.5 rounded">Pair</span>
                    </button>
                  ))}
                </div>
              )}

              {isConnectedPrinter && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] p-4 rounded-2xl font-bold flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none leading-relaxed">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <h4 className="font-extrabold uppercase leading-none">Printer Connected!</h4>
                      <p className="text-[10px] text-emerald-705 mt-1 font-extrabold">
                        {localStorage.getItem('pos_simulated_printer_name') || 'Generic Web Thermal Printer'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleDisconnectPrinter}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-[10px] font-black uppercase transition-all shadow-5xs cursor-pointer"
                  >
                    Disconnect 🔌
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* SIMULATOR CHIP 2: INTERACTIVE TUTORIAL HELP / DELETE PERSISTENCE */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-slate-800 border-b border-slate-100 pb-2">🎮 Simulator Interaktif</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              Gunakan tombol-tombol instan di bawah untuk mensimulasikan orderan fiktif masuk oleh pembeli secara pre-order pickup guna menguji keandalan performa sistem.
            </p>

            <div className="space-y-3.5 text-xs text-left">
              <button
                onClick={triggerMockOnlinePreOrder}
                className="w-full py-3 bg-emerald-605 text-emerald-800 bg-emerald-50 border-2 border-emerald-200 rounded-2xl font-black transition-all hover:bg-emerald-100 active:scale-95 text-center cursor-pointer"
              >
                📱 Kirim Simulasi Pre-Order Masuk
              </button>

              <div className="bg-red-50 border border-red-200 p-4 rounded-2xl space-y-2">
                <h4 className="font-extrabold text-xs text-red-800 flex items-center gap-1 max-w-full">
                  ⚠️ Penghapusan Akun & Reset Sesi
                </h4>
                <p className="text-[10px] text-red-700 leading-relaxed select-none">
                  Untuk menghapus perangkat, memutuskan link database, dan melenyapkan seluruh data cache lokal Anda dari peramban, gunakan reset darurat di bawah.
                </p>
                <button
                  onClick={() => {
                    if (confirm('NUTLOPEZ_ADE_17 Security Alert:\n\nApakah Anda sungguh yakin mendepak akun, mereset sediaan, dan melenyapkan cache localstorage? Tindakan ini tidak dapat diurungkan.')) {
                      localStorage.clear();
                      sessionStorage.clear();
                      addLog('Simulator: Pengguna melenyapkan seluruh cache offline lokal.');
                      alert('Done! Riwayat & Akun dibersihkan.\nSistem me-reload halaman...');
                      window.location.reload();
                    }
                  }}
                  className="w-full py-2 bg-red-655 text-white bg-red-600 rounded-xl text-xs font-extrabold text-center hover:bg-red-700 transition-all select-none cursor-pointer"
                >
                  🔴 Lenyapkan Akun & Hapus Sesi
                </button>
              </div>
            </div>
          </div>

          {/* SIMULATOR CHIP 3: REAL-TIME EVENTS SIMULATOR CONSOLE LOG */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <h3 className="font-extrabold text-sm text-slate-800 border-b border-slate-100 pb-2 flex items-center justify-between">
                <span>💻 Konsol Monitor Simulasi</span>
                <span className="w-2.5 h-2.5 bg-emerald-555 rounded-full animate-ping"></span>
              </h3>
              <p className="text-[10px] text-slate-400 font-semibold uppercase mt-1">Audit log aktivitas sistem kasir online</p>
            </div>

            <div className="bg-slate-900 text-green-400 p-3.5 rounded-2xl h-48 overflow-y-auto font-mono text-[10px] border-2 border-slate-800 space-y-1.5 scrollbar-thin select-none text-left">
              {simLog.map((log, index) => (
                <div key={index} className="border-b border-white/5 pb-1 leading-normal">
                  {log}
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
