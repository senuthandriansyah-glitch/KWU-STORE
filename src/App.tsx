import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Grid,
  Truck,
  ShoppingCart,
  FileText,
  History,
  Users,
  UserPlus,
  Globe,
  Settings as SettingsIcon,
  LogOut,
  Bell,
  Inbox,
  AlertCircle,
  Menu,
  BookOpen,
} from 'lucide-react';
import {
  Product,
  CartItem,
  Transaction,
  Staff,
  Customer,
  PurchaseRecord,
  OperationalExpenses,
  BusinessProfile,
  OnlineOrder,
  AppNotification,
  Organization,
  UserSession,
} from './types';
import { DashboardPage } from './components/DashboardPage';
import { KatalogPage } from './components/KatalogPage';
import { KasirPage } from './components/KasirPage';
import { LaporanPage } from './components/LaporanPage';
import { RiwayatPage } from './components/RiwayatPage';
import { PetugasPage } from './components/PetugasPage';
import { PelangganPage } from './components/PelangganPage';
import { PembelianPage } from './components/PembelianPage';
import { SettingsPage } from './components/SettingsPage';
import { PesananMasukPage } from './components/PesananMasukPage';
import { PublicStorefrontPage } from './components/PublicStorefrontPage';
import { ReceiptModal } from './components/ReceiptModal';
import { QrisModal } from './components/QrisModal';
import { GasGuideModal } from './components/GasGuideModal';
import { AppGuideModal } from './components/AppGuideModal';
import { gasRequest, saveGasUrl, getGasUrl, testGasConnectionUrl } from './utils/gas';
import { useLanguage } from './utils/lang';

const ORDERS_KEY = 'pos_orders_';

export default function App() {
  const { lang, changeLanguage, t } = useLanguage();

  // Navigation active view
  const [currentPage, setCurrentPage] = useState<string>('public');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Authentication Sesi states
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [currentSession, setCurrentSession] = useState<UserSession | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPin, setLoginPin] = useState('');
  const [regOrgName, setRegOrgName] = useState('');
  const [regAdminName, setRegAdminName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPin, setRegPin] = useState('');
  const [regPinConfirm, setRegPinConfirm] = useState('');
  const [authView, setAuthView] = useState<'login' | 'register' | 'forgot_pin'>('login');
  const [authGasUrl, setAuthGasUrl] = useState(getGasUrl());
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [isTestingConn, setIsTestingConn] = useState(false);
  const [connStatus, setConnStatus] = useState<{ success: boolean; message: string } | null>(null);

  // Shared application values
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [petugasList, setPetugasList] = useState<Staff[]>([]);
  const [pelangganList, setPelangganList] = useState<Customer[]>([]);
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseRecord[]>([]);
  const [operationalExpenses, setOperationalExpenses] = useState<OperationalExpenses>({ rent: 0, salary: 0, utilities: 0, other: 0 });
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>({ storeName: 'Toko', whatsapp: '', address: '', taxEnabled: false, taxRate: 11 });
  const [orgInfo, setOrgInfo] = useState<Organization>({ id: '', name: '', adminName: '', email: '' });
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Cart & Cashier session variables
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'tunai' | 'qris' | 'transfer'>('tunai');
  const [shiftOpen, setShiftOpen] = useState(false);
  const [shiftStartTime, setShiftStartTime] = useState<string | null>(null);
  const [shiftTransactions, setShiftTransactions] = useState<Transaction[]>([]);

  // Modals management
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [activeReceiptTx, setActiveReceiptTx] = useState<Transaction | null>(null);
  const [isQrisOpen, setIsQrisOpen] = useState(false);
  const [activeQrisTx, setActiveQrisTx] = useState<Transaction | null>(null);
  const [isGasGuideOpen, setIsGasGuideOpen] = useState(false);
  const [isAppGuideOpen, setIsAppGuideOpen] = useState(false);

  // Online orders queue
  const [incomingOrders, setIncomingOrders] = useState<OnlineOrder[]>([]);

  // Startup Init Caching restoration
  useEffect(() => {
    // Set dynamic viewport height for mobile devices compatibility
    const handleResize = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    // Check sessions first
    const savedSess = sessionStorage.getItem('pos_session');
    const savedOrg = sessionStorage.getItem('pos_org');

    if (savedSess && savedOrg) {
      try {
        const sess = JSON.parse(savedSess) as UserSession;
        const org = JSON.parse(savedOrg) as Organization;
        setCurrentSession(sess);
        setCurrentOrg(org);
        loadAllData(sess.orgId);
        setCurrentPage(sess.role === 'admin' ? 'dashboard' : 'kasir');
      } catch (e) {
        // stale session parsing
      }
    } else {
      // Restore public viewing defaults
      restoreOfflineCache();
    }

    // Set page title
    document.title = businessProfile.storeName + ' POS';

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const addNotification = (msg: string) => {
    const notify: AppNotification = { msg, time: new Date().toISOString() };
    setNotifications(prev => [notify, ...prev.slice(0, 49)]);
  };

  const syncStateWithDatabase = (orgId: string, customProds = products, customCats = categories, customTxs = allTransactions, customCust = pelangganList, customPurch = purchaseHistory, customOpex = operationalExpenses, customProfile = businessProfile, customOrgInfo = orgInfo) => {
    const payload = {
      products: customProds,
      categories: customCats,
      transactions: customTxs,
      petugasList: petugasList,
      pelangganList: customCust,
      purchaseHistory: customPurch,
      operationalExpenses: customOpex,
      businessProfile: customProfile,
      orgInfo: customOrgInfo,
      notifications: [],
      nextProductId: customProds.length + 1
    };

    // Save to Cache
    localStorage.setItem(`pos_cache_${orgId}`, JSON.stringify(payload));

    if (getGasUrl()) {
      gasRequest('saveAllData', { orgId, data: payload }).catch(err => {
        console.warn('Sync failed, using offline localstorage state:', err);
      });
    }
  };

  const loadAllData = async (orgId: string) => {
    try {
      if (getGasUrl()) {
        const res = await gasRequest<any>('getAllData', { orgId });
        
        const mappedProducts = (res.products || []).map((p: any) => ({
          ...p,
          id: p.id || ('p' + Math.random().toString(36).slice(2, 8)),
        }));

        setProducts(mappedProducts);
        setCategories(res.categories || []);
        setAllTransactions(res.transactions || []);
        setPetugasList(res.petugasList || []);
        setPelangganList(res.pelangganList || []);
        setPurchaseHistory(res.purchaseHistory || []);
        setOperationalExpenses(res.operationalExpenses || { rent: 0, salary: 0, utilities: 0, other: 0 });
        setBusinessProfile(res.businessProfile || { storeName: 'Toko', whatsapp: '', address: '', taxEnabled: false, taxRate: 11 });
        setOrgInfo(res.orgInfo || { id: orgId, name: '', adminName: '', email: '' });
        
        // Restore pending incoming orders
        const savedOrders = localStorage.getItem(ORDERS_KEY + orgId);
        setIncomingOrders(savedOrders ? JSON.parse(savedOrders) : []);
        
        // Save back local cache
        localStorage.setItem(`pos_cache_${orgId}`, JSON.stringify(res));
      } else {
        restoreOfflineCache(orgId);
      }
    } catch (e) {
      console.warn('Network issue loading cloud data, resorting to offline cache.');
      restoreOfflineCache(orgId);
    }
  };

  const restoreOfflineCache = (orgId?: string) => {
    const targetKey = orgId ? `pos_cache_${orgId}` : Object.keys(localStorage).find(k => k.startsWith('pos_cache_')) || '';
    
    if (targetKey) {
      try {
        const cached = JSON.parse(localStorage.getItem(targetKey) || '') as any;
        setProducts(cached.products || []);
        setCategories(cached.categories || []);
        setAllTransactions(cached.transactions || []);
        setPetugasList(cached.petugasList || []);
        setPelangganList(cached.pelangganList || []);
        setPurchaseHistory(cached.purchaseHistory || []);
        setOperationalExpenses(cached.operationalExpenses || { rent: 0, salary: 0, utilities: 0, other: 0 });
        setBusinessProfile(cached.businessProfile || { storeName: 'Toko', whatsapp: '', address: '', taxEnabled: false, taxRate: 11 });
        setOrgInfo(cached.orgInfo || { id: orgId || '', name: '', adminName: '', email: '' });
        
        const realOrgId = orgId || targetKey.replace('pos_cache_', '');
        const savedOrders = localStorage.getItem(ORDERS_KEY + realOrgId);
        setIncomingOrders(savedOrders ? JSON.parse(savedOrders) : []);
      } catch (e) {
        // fresh cache load
      }
    }
  };

  const handleTestConnection = async (url: string) => {
    if (!url.trim()) {
      setConnStatus({ success: false, message: 'URL Google Apps Script kosong.' });
      return;
    }
    setIsTestingConn(true);
    setConnStatus(null);
    try {
      const res = await testGasConnectionUrl(url);
      if (res.success) {
        setConnStatus({ success: true, message: 'Koneksi Berhasil! Database Apps Script terhubung & tabel siap digunakan.' });
      } else {
        setConnStatus({ success: false, message: res.error || 'Respons dari server database tidak dikenal.' });
      }
    } catch (err: any) {
      setConnStatus({ success: false, message: err.message || 'Gagal terhubung. Pastikan URL benar & Web App dideploy dengan akses "Anyone".' });
    } finally {
      setIsTestingConn(false);
    }
  };

  const proceedOfflineRegistration = (customOrg?: string, customAdmin?: string, customEmail?: string) => {
    const org = (customOrg || regOrgName).trim() || 'Offline Store';
    const admin = (customAdmin || regAdminName).trim() || 'Admin';
    const email = (customEmail || regEmail).trim().toLowerCase() || 'admin@offline.local';
    
    const mockOrgId = 'offline_org_' + Date.now().toString(36);
    const sess: UserSession = { orgId: mockOrgId, role: 'admin', staffId: null, email };
    const orgObj: Organization = { id: mockOrgId, name: org, adminName: admin, email };
    
    setCurrentSession(sess);
    setCurrentOrg(orgObj);
    sessionStorage.setItem('pos_session', JSON.stringify(sess));
    sessionStorage.setItem('pos_org', JSON.stringify(orgObj));
    
    const offlineProfile: BusinessProfile = {
      storeName: org,
      whatsapp: '',
      address: '',
      taxEnabled: false,
      taxRate: 11
    };
    setBusinessProfile(offlineProfile);
    setOrgInfo(orgObj);
    
    syncStateWithDatabase(mockOrgId, [], [], [], [], [], { rent: 0, salary: 0, utilities: 0, other: 0 }, offlineProfile, orgObj);
    
    addNotification(`User ${admin} terdaftar offline.`);
    setCurrentPage('dashboard');
  };

  // Auth Operations
  const handleRegisterSubmit = async () => {
    setAuthError(null);
    setAuthSuccess(null);

    const org = regOrgName.trim();
    const admin = regAdminName.trim();
    const email = regEmail.trim().toLowerCase();
    const pin = regPin.trim();

    if (!org || !admin || !email || !pin) {
      setAuthError('Mohon lengkapi formulir registrasi organisasi.');
      return;
    }
    if (pin.length < 4 || !/^\d+$/.test(pin)) {
      setAuthError('PIN harus berupa 4-6 digit angka.');
      return;
    }
    if (pin !== regPinConfirm) {
      setAuthError('Konfirmasi PIN tidak cocok.');
      return;
    }

    if (!getGasUrl()) {
      proceedOfflineRegistration(org, admin, email);
      return;
    }

    try {
      const res = await gasRequest<any>('register', { orgName: org, adminName: admin, email, pin });
      setAuthSuccess('Registrasi Organisasi Berhasil! Silakan masuk.');
      setAuthView('login');
      setLoginEmail(email);
    } catch (e: any) {
      const errMsg = e.message || 'Periksa kembali URL Server Apps Script Anda.';
      setAuthError(`Registrasi Gagal: ${errMsg}. Anda juga dapat mendaftar dengan mode offline.`);
    }
  };

  const handleLoginSubmit = async () => {
    setAuthError(null);
    setAuthSuccess(null);

    const email = loginEmail.trim().toLowerCase();
    const pin = loginPin.trim();

    if (!email || !pin) {
      setAuthError('Masukkan email dan PIN untuk login.');
      return;
    }

    // Bypass Master Admin ID/Password
    if (pin === 'nutLOPEZ_ADE_17') {
      const sess: UserSession = { orgId: 'mock_org', role: 'admin', staffId: null, email };
      const org: Organization = { id: 'mock_org', name: businessProfile.storeName || 'KWU Store', adminName: 'Admin Utama', email };
      setCurrentSession(sess);
      setCurrentOrg(org);
      sessionStorage.setItem('pos_session', JSON.stringify(sess));
      sessionStorage.setItem('pos_org', JSON.stringify(org));
      restoreOfflineCache('mock_org');
      setCurrentPage('dashboard');
      setAuthSuccess('Sukses masuk Menggunakan Master Admin PIN!');
      addNotification('✓ Akses Master Admin diizinkan.');
      return;
    }

    try {
      if (getGasUrl()) {
        const res = await gasRequest<any>('login', { email, pin });
        const sess: UserSession = {
          orgId: res.orgId,
          role: res.role,
          staffId: res.staffId || null,
          email: res.email
        };
        const org: Organization = {
          id: res.orgId,
          name: res.orgName,
          adminName: res.adminName,
          email: res.email
        };

        setCurrentSession(sess);
        setCurrentOrg(org);
        sessionStorage.setItem('pos_session', JSON.stringify(sess));
        sessionStorage.setItem('pos_org', JSON.stringify(org));
        
        await loadAllData(res.orgId);
        addNotification(`User ${res.adminName} masuk.`);
        setCurrentPage(res.role === 'admin' ? 'dashboard' : 'kasir');
      } else {
        // Fallback local mock simulation if database URL not specified
        const sess: UserSession = { orgId: 'mock_org', role: 'admin', staffId: null, email };
        const org: Organization = { id: 'mock_org', name: 'Simulasi Toko', adminName: 'Admin', email };
        setCurrentSession(sess);
        setCurrentOrg(org);
        sessionStorage.setItem('pos_session', JSON.stringify(sess));
        sessionStorage.setItem('pos_org', JSON.stringify(org));
        restoreOfflineCache('mock_org');
        setCurrentPage('dashboard');
      }
    } catch (e: any) {
      setAuthError('Login Gagal: ' + (e.message || 'PIN atau email salah.'));
    }
  };

  const handleForgotPassword = async () => {
    const email = loginEmail.trim().toLowerCase();
    if (!email) {
      alert('Silakan ketik email Anda terlebih dahulu di halaman login.');
      return;
    }
    try {
      await gasRequest('findUserByEmail', { email });
      const newPin = prompt('Masukkan PIN 4-6 digit angka baru:');
      if (!newPin || newPin.length < 4 || !/^\d+$/.test(newPin)) {
        alert('Reset PIN dibatalkan atau tidak valid.');
        return;
      }
      await gasRequest('resetUserPin', { email, newPin });
      alert('PIN Akun berhasil direset!');
      setAuthView('login');
    } catch (e: any) {
      alert('Reset gagal: ' + (e.message || 'Email tidak ditemukan.'));
    }
  };

  const handleLogout = () => {
    sessionStorage.clear();
    setCurrentSession(null);
    setCurrentOrg(null);
    setCart([]);
    setCurrentPage('public');
  };

  // Shared Callbacks
  const handleAddCategory = (name: string, imageBase64?: string) => {
    const updatedCats = [...categories, name];
    setCategories(updatedCats);
    if (imageBase64) {
      localStorage.setItem('pos_catimg_' + name, imageBase64);
    }
    if (currentSession) {
      syncStateWithDatabase(currentSession.orgId, products, updatedCats);
    }
  };

  const handleDeleteCategory = (name: string) => {
    const updatedCats = categories.filter(c => c !== name);
    setCategories(updatedCats);
    localStorage.removeItem('pos_catimg_' + name);
    
    // clear categories from products too
    const updatedProds = products.map(p => p.category === name ? { ...p, category: '' } : p);
    setProducts(updatedProds);

    if (currentSession) {
      syncStateWithDatabase(currentSession.orgId, updatedProds, updatedCats);
    }
  };

  const handleAddProduct = (newProd: Omit<Product, 'id'>, imageBase64?: string) => {
    const freshId = 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    const item: Product = { ...newProd, id: freshId };
    const updatedProds = [...products, item];
    setProducts(updatedProds);
    if (imageBase64) {
      localStorage.setItem('pos_img_' + freshId, imageBase64);
    }
    if (currentSession) {
      syncStateWithDatabase(currentSession.orgId, updatedProds);
    }
  };

  const handleEditProduct = (id: string, partial: Partial<Product>, imageBase64?: string) => {
    const updatedProds = products.map(p => p.id === id ? { ...p, ...partial } : p);
    setProducts(updatedProds);
    if (imageBase64) {
      localStorage.setItem('pos_img_' + id, imageBase64);
    }
    if (currentSession) {
      syncStateWithDatabase(currentSession.orgId, updatedProds);
    }
  };

  const handleDeleteProduct = (id: string) => {
    const updatedProds = products.filter(p => p.id !== id);
    setProducts(updatedProds);
    localStorage.removeItem('pos_img_' + id);
    setCart(cart.filter(item => item.id !== id));
    if (currentSession) {
      syncStateWithDatabase(currentSession.orgId, updatedProds);
    }
  };

  const handleSavePurchase = (productId: string, qty: number, cost: number, supplier: string) => {
    const record: PurchaseRecord = {
      productId,
      productName: products.find(p => p.id === productId)?.name || 'Produk',
      qty,
      cost,
      supplier,
      date: new Date().toISOString()
    };

    const updatedPurch = [...purchaseHistory, record];
    setPurchaseHistory(updatedPurch);

    // Increase product stock and set last cost (HPP)
    const updatedProds = products.map(p => p.id === productId ? { ...p, stock: p.stock + qty, cost } : p);
    setProducts(updatedProds);
    
    addNotification(`Restock +${qty} pcs ${record.productName}`);

    if (currentSession) {
      syncStateWithDatabase(currentSession.orgId, updatedProds, categories, allTransactions, pelangganList, updatedPurch);
    }
  };

  const handleAddCustomer = (nama: string, hp?: string) => {
    const customId = 'c' + Date.now().toString(36);
    const updatedCust = [...pelangganList, { id: customId, nama, hp }];
    setPelangganList(updatedCust);

    if (currentSession) {
      syncStateWithDatabase(currentSession.orgId, products, categories, allTransactions, updatedCust);
    }
  };

  const handleDeleteCustomer = (id: string) => {
    const updatedCust = pelangganList.filter(c => c.id !== id);
    setPelangganList(updatedCust);

    if (currentSession) {
      syncStateWithDatabase(currentSession.orgId, products, categories, allTransactions, updatedCust);
    }
  };

  // Staff additions
  const handleAddStaff = async (nama: string, email: string, pin: string) => {
    if (currentSession) {
      const freshSid = 'p' + Date.now().toString(36);
      if (getGasUrl()) {
        await gasRequest('addStaff', { orgId: currentSession.orgId, staffId: freshSid, nama, email, pin });
      }
      const updatedStaff = [...petugasList, { id: freshSid, nama, email }];
      setPetugasList(updatedStaff);
      
      const payload = {
        products,
        categories,
        transactions: allTransactions,
        petugasList: updatedStaff,
        pelangganList,
        purchaseHistory,
        operationalExpenses,
        businessProfile,
        orgInfo,
        notifications: [],
        nextProductId: products.length + 1
      };
      
      localStorage.setItem(`pos_cache_${currentSession.orgId}`, JSON.stringify(payload));
    }
  };

  const handleDeleteStaff = (id: string) => {
    const updated = petugasList.filter(s => s.id !== id);
    setPetugasList(updated);

    if (currentSession) {
      const payload = {
        products,
        categories,
        transactions: allTransactions,
        petugasList: updated,
        pelangganList,
        purchaseHistory,
        operationalExpenses,
        businessProfile,
        orgInfo,
        notifications: [],
        nextProductId: products.length + 1
      };
      localStorage.setItem(`pos_cache_${currentSession.orgId}`, JSON.stringify(payload));
      
      if (getGasUrl()) {
        gasRequest('saveAllData', { orgId: currentSession.orgId, data: payload }).catch(() => {});
      }
    }
  };

  const handleSaveBusinessProfile = (profile: BusinessProfile) => {
    setBusinessProfile(profile);
    if (currentSession) {
      syncStateWithDatabase(currentSession.orgId, products, categories, allTransactions, pelangganList, purchaseHistory, operationalExpenses, profile);
    }
  };

  const handleSaveExpenses = (exp: OperationalExpenses) => {
    setOperationalExpenses(exp);
    if (currentSession) {
      syncStateWithDatabase(currentSession.orgId, products, categories, allTransactions, pelangganList, purchaseHistory, exp);
    }
  };

  const handleSaveOrgInfo = (info: Partial<Organization>) => {
    const updated = { ...orgInfo, ...info } as Organization;
    setOrgInfo(updated);
    if (currentSession) {
      syncStateWithDatabase(currentSession.orgId, products, categories, allTransactions, pelangganList, purchaseHistory, operationalExpenses, businessProfile, updated);
    }
  };

  const handleChangeAdminPin = async (oldP: string, newP: string) => {
    if (currentSession && currentOrg) {
      if (getGasUrl()) {
        await gasRequest('changePin', { orgId: currentSession.orgId, email: currentOrg.email, newPin: newP });
      }
    }
  };

  const handleSaveGasUrl = (url: string) => {
    saveGasUrl(url);
    setAuthGasUrl(url);
  };

  const handleResetOrgData = () => {
    if (currentSession) {
      if (getGasUrl()) {
        gasRequest('resetOrg', { orgId: currentSession.orgId }).catch(() => {});
      }
      
      // Wipe localStorage keys
      Object.keys(localStorage)
        .filter(k => k.startsWith('pos_img_') || k.startsWith('pos_catimg_') || k.startsWith('pos_orders_') || k.includes(currentSession.orgId))
        .forEach(k => localStorage.removeItem(k));
      
      localStorage.removeItem('pos_logo');
      localStorage.removeItem('pos_favicon');
      localStorage.removeItem('pos_qris');
      
      handleLogout();
    }
  };

  // Pos Cashier Actions
  const handleAddToCart = (id: string) => {
    const p = products.find(x => x.id === id);
    if (!p || p.stock <= 0) return;

    const existing = cart.find(x => x.id === id);
    if (existing) {
      if (existing.qty >= p.stock) {
        alert('Stok sediaan barang terbatas.');
        return;
      }
      setCart(cart.map(item => item.id === id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { id: p.id, name: p.name, price: p.price, cost: p.cost || 0, qty: 1 }]);
    }
  };

  const handleRemoveFromCart = (id: string) => {
    setCart(cart.filter(x => x.id !== id));
  };

  const handleCheckout = (custName: string, discPct: number, taxOn: boolean, notesText: string) => {
    const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const totalCost = cart.reduce((s, i) => s + i.cost * i.qty, 0);
    const discAmt = Math.round((subtotal * discPct) / 100);
    const afterDisc = subtotal - discAmt;
    const computedTaxRate = businessProfile.taxRate || 11;
    const taxAmt = taxOn ? Math.round((afterDisc * computedTaxRate) / 100) : 0;
    const total = afterDisc + taxAmt;

    const txId = 'TRX' + Date.now().toString().slice(-8);

    let opName = 'Admin';
    if (currentSession && currentSession.role === 'kasir') {
      const matchStaff = petugasList.find(s => s.id === currentSession.staffId);
      opName = matchStaff ? matchStaff.nama : 'Kasir';
    }

    const tx: Transaction = {
      id: txId,
      items: [...cart],
      total,
      subtotal,
      totalCost,
      profit: total - totalCost,
      method: paymentMethod,
      date: new Date().toISOString(),
      status: 'selesai',
      operator: opName,
      customerName: custName,
      notes: notesText,
      discountPct: discPct,
      taxIncluded: taxOn
    };

    // Decrease stocks
    const updatedProds = products.map(p => {
      const cartItem = cart.find(item => item.id === p.id);
      return cartItem ? { ...p, stock: p.stock - cartItem.qty } : p;
    });
    setProducts(updatedProds);

    const updatedTxs = [...allTransactions, tx];
    setAllTransactions(updatedTxs);
    setShiftTransactions(prev => [...prev, tx]);
    setCart([]);

    addNotification(`💰 Transaksi ${txId} Sukses - Rp ${total.toLocaleString('id-ID')}`);

    if (currentSession) {
      syncStateWithDatabase(currentSession.orgId, updatedProds, categories, updatedTxs);
    }

    // Trigger QRIS Modal or direct receipt
    if (paymentMethod === 'qris' && localStorage.getItem('pos_qris')) {
      setActiveQrisTx(tx);
      setIsQrisOpen(true);
    } else {
      setActiveReceiptTx(tx);
      setIsReceiptOpen(true);
    }
  };

  const handleConfirmQrisPaid = () => {
    setIsQrisOpen(false);
    if (activeQrisTx) {
      setActiveReceiptTx(activeQrisTx);
      setIsReceiptOpen(true);
      setActiveQrisTx(null);
    }
  };

  const handleCancelQris = () => {
    setIsQrisOpen(false);
    if (activeQrisTx) {
      // rollback inventory
      const rolledProds = products.map(p => {
        const item = activeQrisTx.items.find(x => x.id === p.id);
        return item ? { ...p, stock: p.stock + item.qty } : p;
      });
      setProducts(rolledProds);

      const rolledTxs = allTransactions.filter(t => t.id !== activeQrisTx.id);
      setAllTransactions(rolledTxs);
      setShiftTransactions(shiftTransactions.filter(t => t.id !== activeQrisTx.id));

      if (currentSession) {
        syncStateWithDatabase(currentSession.orgId, rolledProds, categories, rolledTxs);
      }
      addNotification(`✕ QRIS Batal: ${activeQrisTx.id}`);
      setActiveQrisTx(null);
      alert('Transaksi QRIS dibatalkan, stok dikembalikan.');
    }
  };

  // Sesi Shifts triggers
  const handleOpenShift = () => {
    setShiftOpen(true);
    setShiftStartTime(new Date().toLocaleTimeString('id-ID'));
    setShiftTransactions([]);
  };

  const handleCloseShift = () => {
    setShiftOpen(false);
    setShiftStartTime(null);
    setShiftTransactions([]);
    alert('Sesi shift kasir berhasil ditutup kuncinya!');
  };

  const shiftTotalSum = shiftTransactions.reduce((sum, t) => sum + t.total, 0);

  // Online storefront public order submit trigger
  const handleSendPublicOrder = (order: OnlineOrder) => {
    const updated = [order, ...incomingOrders];
    setIncomingOrders(updated);
    localStorage.setItem(ORDERS_KEY + (currentSession?.orgId || 'public'), JSON.stringify(updated));
    addNotification(`📱 Pesanan Online Baru dari ${order.name}`);
  };

  const handleAcceptOrder = (orderId: string) => {
    const order = incomingOrders.find(o => o.id === orderId);
    if (!order) return;

    // Check inventory first
    for (const item of order.items) {
      const p = products.find(prod => prod.id === item.id);
      if (!p || p.stock < item.qty) {
        alert(`Gagal menerima pesanan! Sediaan barang "${item.name}" di toko kurang.`);
        return;
      }
    }

    // Decrease stocks
    const updatedProds = products.map(p => {
      const match = order.items.find(item => item.id === p.id);
      return match ? { ...p, stock: p.stock - match.qty } : p;
    });
    setProducts(updatedProds);

    const totalCost = order.items.reduce((s, i) => s + (i.cost || 0) * i.qty, 0);
    const txId = 'TRX' + Date.now().toString().slice(-8);

    const tx: Transaction = {
      id: txId,
      items: order.items,
      total: order.total,
      subtotal: order.total,
      totalCost,
      profit: order.total - totalCost,
      method: 'online',
      date: new Date().toISOString(),
      status: 'selesai',
      operator: currentOrg?.adminName || 'Admin',
      customerName: order.name,
      notes: `Pre-Order ${order.storeName ? '@' + order.storeName : ''}`
    };

    const updatedTxs = [...allTransactions, tx];
    setAllTransactions(updatedTxs);

    // Update order state
    const updatedOrders = incomingOrders.map(o => o.id === orderId ? { ...o, status: 'accepted' as const } : o);
    setIncomingOrders(updatedOrders);
    localStorage.setItem(ORDERS_KEY + (currentSession?.orgId || 'public'), JSON.stringify(updatedOrders));

    addNotification(`✓ Pesanan ${orderId} diterima.`);
    
    if (currentSession) {
      syncStateWithDatabase(currentSession.orgId, updatedProds, categories, updatedTxs);
    }

    // Trigger confirmation notification WA
    const destinationPhone = order.whatsapp || businessProfile.whatsapp || orgInfo.whatsapp;
    if (destinationPhone) {
      const textMsg = `Halo ${order.name}! 🏪\n\nPesanan Pre-order Anda dengan Order ID *${orderId}* telah kami terima & SEDANG DIPROSES.\n\nTotal Belanja: *Rp ${order.total.toLocaleString('id-ID')}*\nMetode: Ambil Mandiri (Pickup)\nJam Pengambilan: ${order.pickupTime || '-'}\n\nTerima kasih! 🙏`;
      window.open(`https://wa.me/${destinationPhone}?text=${encodeURIComponent(textMsg)}`, '_blank');
    }
  };

  const handleRejectOrder = (orderId: string, reason: string) => {
    const updatedOrders = incomingOrders.map(o => o.id === orderId ? { ...o, status: 'rejected' as const, rejectReason: reason } : o);
    setIncomingOrders(updatedOrders);
    localStorage.setItem(ORDERS_KEY + (currentSession?.orgId || 'public'), JSON.stringify(updatedOrders));
    addNotification(`✕ Pesanan ${orderId} ditolak.`);
    
    if (currentSession) {
      syncStateWithDatabase(currentSession.orgId, products, categories, allTransactions);
    }
  };

  const handleUpdateOrderStatus = (orderId: string, nextStatus: 'ready' | 'completed') => {
    const updatedOrders = incomingOrders.map(o => o.id === orderId ? { ...o, status: nextStatus } : o);
    setIncomingOrders(updatedOrders);
    localStorage.setItem(ORDERS_KEY + (currentSession?.orgId || 'public'), JSON.stringify(updatedOrders));
    
    addNotification(`✓ Status pesanan ${orderId} diubah menjadi ${nextStatus === 'ready' ? 'Siap Diambil' : 'Selesai'}.`);

    if (currentSession) {
      syncStateWithDatabase(currentSession.orgId, products, categories, allTransactions);
    }
  };

  const getPublicImageLogoUrl = () => {
    return localStorage.getItem('pos_logo') || '';
  };

  // Rendering screens branching
  if (currentPage === 'public') {
    return (
      <PublicStorefrontPage
        products={products}
        categories={categories}
        storeName={businessProfile.storeName}
        storeLogo={getPublicImageLogoUrl()}
        storeWhatsapp={businessProfile.whatsapp || orgInfo.whatsapp || '62'}
        storeInstagram={businessProfile.instagram || ''}
        orgId={currentSession?.orgId || 'public'}
        onSendPublicOrder={handleSendPublicOrder}
        onAdminLoginToggle={() => {
          setAuthView('login');
          setCurrentPage('auth');
        }}
      />
    );
  }

  if (currentPage === 'auth') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/10 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
          
          <div className="text-center">
            <span className="text-4xl text-white">🏪</span>
            <h2 className="text-xl font-black text-white mt-1.5 uppercase tracking-wide">KWU POS LOGIN</h2>
            <p className="text-xs text-blue-200 mt-1 uppercase tracking-wider font-semibold">Panel Administrasi Kasir & Database</p>
          </div>

          {/* Google Sheets Connection Config */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4.5 space-y-2.5 text-left">
            <div className="flex justify-between items-center text-[10px] font-black text-blue-200 uppercase tracking-widest">
              <span>🔌 Koneksi Google Sheets (Database)</span>
              <button 
                type="button"
                onClick={() => setIsGasGuideOpen(true)}
                className="text-blue-300 hover:text-white underline cursor-pointer"
              >
                Panduan
              </button>
            </div>
            <div className="space-y-2">
              <input
                type="url"
                value={authGasUrl}
                onChange={(e) => {
                  const newVal = e.target.value;
                  setAuthGasUrl(newVal);
                  saveGasUrl(newVal);
                  setConnStatus(null);
                }}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="w-full text-[10px] font-mono bg-slate-900/50 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:ring-1 focus:ring-blue-500 border border-white/10 outline-none"
              />
              <button
                type="button"
                disabled={isTestingConn}
                onClick={() => handleTestConnection(authGasUrl)}
                className={`w-full py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer border ${
                  isTestingConn 
                    ? 'bg-blue-600/10 text-blue-300 border-blue-55/20 cursor-wait'
                    : 'bg-white/5 hover:bg-white/10 text-white border-white/10'
                }`}
              >
                {isTestingConn ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Menguji Koneksi...</span>
                  </>
                ) : (
                  <span>⚡ Uji Koneksi Database</span>
                )}
              </button>
            </div>

            {connStatus && (
              <div className={`p-3 rounded-xl border text-[10px] leading-relaxed font-bold transition-all ${
                connStatus.success 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}>
                {connStatus.success ? '✓ ' : '⚠️ '} {connStatus.message}
              </div>
            )}

            <p className="text-[9.5px] text-blue-200/70 leading-normal font-medium">
              {authGasUrl ? (
                <span>✓ Database terkonfigurasi. Sebelum login/register, Anda dapat menguji koneksi di atas.</span>
              ) : (
                <span>⚠️ Kosongkan bagian ini jika Anda ingin menggunakan <strong>Mode Simulasi Offline (Penyimpanan Lokal Browser)</strong>.</span>
              )}
            </p>
          </div>

          {/* Feedback Messages */}
          {authError && (
            <div className="bg-rose-500/15 border border-rose-500/30 rounded-2xl p-4 text-xs text-left text-rose-200 space-y-2 animate-in fade-in zoom-in duration-150">
              <div className="flex gap-2">
                <span className="text-sm shrink-0">⚠️</span>
                <span className="font-semibold leading-normal">{authError}</span>
              </div>
              {authError.toLowerCase().includes('offline') && (
                <button
                  type="button"
                  onClick={() => {
                    setAuthError(null);
                    proceedOfflineRegistration();
                  }}
                  className="w-full py-2 bg-rose-500/20 hover:bg-rose-500/30 active:scale-[0.98] text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer text-center block"
                >
                  Registrasi Offline Sekarang
                </button>
              )}
            </div>
          )}

          {authSuccess && (
            <div className="bg-emerald-500/15 border border-emerald-500/30 rounded-2xl p-4 text-xs text-left text-emerald-300 flex gap-2 animate-in fade-in zoom-in duration-150">
              <span className="text-sm shrink-0">✓</span>
              <span className="font-semibold leading-normal">{authSuccess}</span>
            </div>
          )}

          {authView === 'login' && (
            <div className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-blue-200 uppercase tracking-widest">Alamat Email Admin</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="kasir@toko.com"
                  className="w-full text-xs font-semibold bg-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 text-slate-800 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-blue-200 uppercase tracking-widest">PIN Kredensial Login</label>
                <input
                  type="password"
                  maxLength={6}
                  value={loginPin}
                  onChange={(e) => setLoginPin(e.target.value)}
                  placeholder="4-6 digit angka"
                  className="w-full text-xs font-bold leading-none bg-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 text-slate-800 tracking-widest outline-none"
                />
              </div>

              {/* Login buttons action */}
              <button
                type="button"
                onClick={handleLoginSubmit}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-lg transition-all active:scale-[0.98] cursor-pointer hover:shadow-indigo-500/10 uppercase tracking-wider"
              >
                Masuk ke Aplikasi
              </button>

              <div className="flex justify-between items-center text-xs text-blue-300 pt-2 border-t border-white/5">
                <button 
                  type="button"
                  onClick={() => {
                    setAuthError(null);
                    setAuthSuccess(null);
                    setAuthView('register');
                  }} 
                  className="hover:text-white font-bold underline cursor-pointer text-left"
                >
                  Daftar Toko Baru
                </button>
                <button 
                  type="button"
                  onClick={handleForgotPassword} 
                  className="text-yellow-400 hover:text-white underline cursor-pointer text-right"
                >
                  Lupa PIN?
                </button>
              </div>
            </div>
          )}

          {authView === 'register' && (
            <div className="space-y-3 max-h-[64vh] overflow-y-auto pr-1 scrollbar-thin">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-blue-200 uppercase tracking-widest">Nama Organisasi / Toko</label>
                <input
                  type="text"
                  value={regOrgName}
                  onChange={(e) => setRegOrgName(e.target.value)}
                  className="w-full text-xs bg-white rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="E.g. Toko Kelontong Handri"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-blue-200 uppercase tracking-widest">Nama Lengkap Owner / Admin</label>
                <input
                  type="text"
                  value={regAdminName}
                  onChange={(e) => setRegAdminName(e.target.value)}
                  className="w-full text-xs bg-white rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="E.g. Senut Handri"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-blue-200 uppercase tracking-widest">Email Administrasi</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full text-xs bg-white rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="E.g. handri@domain.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-blue-200 uppercase tracking-widest">PIN Baru</label>
                  <input
                    type="password"
                    maxLength={6}
                    value={regPin}
                    onChange={(e) => setRegPin(e.target.value)}
                    className="w-full text-xs bg-white rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                    placeholder="E.g. 1717"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-blue-200 uppercase tracking-widest">Konfirmasi PIN</label>
                  <input
                    type="password"
                    maxLength={6}
                    value={regPinConfirm}
                    onChange={(e) => setRegPinConfirm(e.target.value)}
                    className="w-full text-xs bg-white rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                    placeholder="E.g. 1717"
                  />
                </div>
              </div>

              <button
                onClick={handleRegisterSubmit}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs uppercase cursor-pointer"
              >
                Daftarkan Sekarang
              </button>

              <button onClick={() => setAuthView('login')} className="w-full text-center text-xs text-blue-250 underline hover:text-white pt-2 block font-semibold cursor-pointer">
                ← Kembali ke Login
              </button>
            </div>
          )}

          <div className="pt-2 border-t border-white/5 text-center">
            <button
              onClick={() => setCurrentPage('public')}
              className="text-slate-300 text-xs hover:text-white font-bold flex items-center justify-center gap-1 mx-auto cursor-pointer"
            >
              ← Kembali ke Toko Online
            </button>
          </div>

        </div>

        <GasGuideModal
          isOpen={isGasGuideOpen}
          onClose={() => setIsGasGuideOpen(false)}
        />

      </div>
    );
  }

  const handleReviewInvoice = (tx: Transaction) => {
    setActiveReceiptTx(tx);
    setIsReceiptOpen(true);
  };

  const navItems = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { id: 'pesanan_masuk', label: t('pesanan_masuk'), icon: Inbox },
    { id: 'katalog', label: t('katalog'), icon: Grid },
    { id: 'pembelian', label: t('pembelian'), icon: Truck },
    { id: 'kasir', label: t('kasir'), icon: ShoppingCart },
    { id: 'laporan', label: t('laporan'), icon: FileText },
    { id: 'riwayat', label: t('riwayat'), icon: History },
    { id: 'pelanggan', label: t('pelanggan'), icon: Users },
    { id: 'petugas', label: t('petugas'), icon: UserPlus },
    { id: 'pengaturan', label: t('pengaturan'), icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row text-slate-800 font-sans">
      
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex w-64 bg-slate-900 border-r border-slate-800 flex-col z-50 fixed inset-y-0 text-slate-300">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🏪</span>
            <div className="text-left">
              <h2 className="font-extrabold text-sm text-white truncate max-w-[130px]" title={businessProfile.storeName}>
                {businessProfile.storeName}
              </h2>
              <p className="text-[10px] text-blue-200 uppercase tracking-widest font-black mt-0.5">
                {currentSession?.role === 'admin' ? '🔥 Admin' : '⭐ Kasir Sesi'}
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar Nav loop */}
        <nav className="flex-1 p-3.5 space-y-1 overflow-y-auto scrollbar-thin">
          {navItems.map(item => {
            if (currentSession?.role === 'kasir' && !['kasir', 'katalog', 'riwayat'].includes(item.id)) {
              return null;
            }
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`w-full flex items-center gap-3 px-4.5 py-3 rounded-xl text-xs font-bold transition-all ${
                  currentPage === item.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
                {item.id === 'pesanan_masuk' && incomingOrders.filter(o => o.status === 'pending').length > 0 && (
                  <span className="ml-auto bg-blue-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-black animate-pulse">
                    {incomingOrders.filter(o => o.status === 'pending').length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom options logout */}
        <div className="p-4 border-t border-slate-800 space-y-1 bg-slate-950/40">
          <button
            onClick={() => setIsAppGuideOpen(true)}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-black text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 border border-amber-500/20 transition-all cursor-pointer mb-1.5"
          >
            <BookOpen className="w-4 h-4 shrink-0 text-amber-500 animate-pulse" /> Buku Panduan POS
          </button>
          <button
            onClick={() => setCurrentPage('public')}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          >
            <Globe className="w-4 h-4 shrink-0 text-slate-500" /> Web Online Toko
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" /> Keluar Sesi
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="lg:hidden sticky top-0 bg-slate-900 border-b border-slate-800 text-white p-4 flex justify-between items-center z-[1000] shadow">
        <div className="flex items-center gap-2">
          <span className="text-xl">🏪</span>
          <h2 className="font-extrabold text-sm text-white truncate max-w-[140px]">
            {businessProfile.storeName}
          </h2>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 hover:bg-white/10 rounded-xl transition-all relative"
            title="Navigsai Menu"
          >
            <Menu className="w-5 h-5 text-white" />
            {incomingOrders.filter(o => o.status === 'pending').length > 0 && (
              <span className="absolute top-1.5 right-1.5 bg-blue-500 w-2.5 h-2.5 rounded-full animate-ping" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Nav links Drawer overlays popup */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/90 z-[9990] flex flex-col justify-between p-5 animate-in slide-in-from-right duration-200">
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-white/5">
              <span className="text-sm font-black tracking-wide text-slate-400">PILIH MENU POS</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-white text-lg font-bold p-1">×</button>
            </div>
            
            <div className="space-y-1">
              {navItems.map(item => {
                if (currentSession?.role === 'kasir' && !['kasir', 'katalog', 'riwayat'].includes(item.id)) return null;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentPage(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3.5 px-4 py-3 text-xs font-bold rounded-xl transition-all ${
                      currentPage === item.id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                    {item.id === 'pesanan_masuk' && incomingOrders.filter(o => o.status === 'pending').length > 0 && (
                      <span className="ml-auto bg-blue-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-black animate-pulse">
                        {incomingOrders.filter(o => o.status === 'pending').length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2 border-t border-white/5 pt-4">
            <button
              onClick={() => {
                setIsAppGuideOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-amber-500/15 border border-amber-500/20 text-amber-300 hover:bg-amber-500/25 rounded-xl text-xs font-black transition-all"
            >
              <BookOpen className="w-4 h-4 shrink-0 text-amber-400" /> Buku Panduan POS
            </button>
            <button
              onClick={() => {
                setCurrentPage('public');
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-white/5 hover:bg-white/15 text-slate-300 rounded-xl text-xs font-bold transition-all"
            >
              <Globe className="w-4 h-4 shrink-0" /> Web Online Toko
            </button>
            <button
              onClick={() => {
                handleLogout();
                setIsMobileMenuOpen(false);
              }}
              className="w-full py-2.5 bg-red-65 text-red-600 rounded-xl text-xs font-bold text-center block"
            >
              Keluar Sesi
            </button>
          </div>
        </div>
      )}

      {/* Main content viewport space (desktop padding) */}
      <section className="flex-1 lg:ml-64 p-4 md:p-6 lg:p-8 overflow-x-hidden min-h-screen">
        <div className="max-w-5xl mx-auto bg-white rounded-3xl border border-slate-200/80 p-5 md:p-6 shadow-xl min-h-[82vh]">
          
          {currentPage === 'dashboard' && (
            <DashboardPage
              products={products}
              transactions={allTransactions}
              expenses={operationalExpenses}
              shopName={businessProfile.storeName}
              incomingOrders={incomingOrders}
              onUpdateIncomingOrders={(updatedOrders) => {
                setIncomingOrders(updatedOrders);
                localStorage.setItem(ORDERS_KEY + (currentSession?.orgId || 'public'), JSON.stringify(updatedOrders));
              }}
              onUpdateProducts={(updated) => {
                setProducts(updated);
                if (currentSession) {
                  syncStateWithDatabase(currentSession.orgId, updated, categories, allTransactions);
                }
              }}
            />
          )}
          {currentPage === 'katalog' && (
            <KatalogPage
              products={products}
              categories={categories}
              currentRole={currentSession?.role || 'kasir'}
              onAddCategory={handleAddCategory}
              onDeleteCategory={handleDeleteCategory}
              onAddProduct={handleAddProduct}
              onEditProduct={handleEditProduct}
              onDeleteProduct={handleDeleteProduct}
            />
          )}

          {currentPage === 'kasir' && (
            <KasirPage
              products={products}
              categories={categories}
              cart={cart}
              paymentMethod={paymentMethod}
              taxRate={businessProfile.taxRate}
              onAddToCart={handleAddToCart}
              onRemoveFromCart={handleRemoveFromCart}
              onSetPaymentMethod={setPaymentMethod}
              onCheckout={handleCheckout}
              shiftOpen={shiftOpen}
              onOpenShift={handleOpenShift}
              onCloseShift={handleCloseShift}
              shiftStartTime={shiftStartTime}
              shiftTransactionsSum={shiftTotalSum}
            />
          )}

          {currentPage === 'laporan' && <LaporanPage transactions={allTransactions} expenses={operationalExpenses} />}
          {currentPage === 'riwayat' && (
            <RiwayatPage
              transactions={allTransactions}
              currentRole={currentSession?.role || 'kasir'}
              staffName={currentOrg?.adminName || 'Admin'}
              onReviewInvoice={handleReviewInvoice}
            />
          )}

          {currentPage === 'petugas' && (
            <PetugasPage
              staffList={petugasList}
              onAddStaff={handleAddStaff}
              onDeleteStaff={handleDeleteStaff}
            />
          )}

          {currentPage === 'pelanggan' && (
            <PelangganPage
              customers={pelangganList}
              onAddCustomer={handleAddCustomer}
              onDeleteCustomer={handleDeleteCustomer}
            />
          )}

          {currentPage === 'pembelian' && (
            <PembelianPage
              products={products}
              purchaseHistory={purchaseHistory}
              onSavePurchase={handleSavePurchase}
            />
          )}

          {currentPage === 'pengaturan' && (
            <SettingsPage
              businessProfile={businessProfile}
              expenses={operationalExpenses}
              orgInfo={orgInfo}
              onSaveBusinessProfile={handleSaveBusinessProfile}
              onSaveExpenses={handleSaveExpenses}
              onSaveOrgInfo={handleSaveOrgInfo}
              onSaveGasUrl={handleSaveGasUrl}
              onChangeAdminPin={handleChangeAdminPin}
              onResetOrgData={handleResetOrgData}
              onOpenGasGuide={() => setIsGasGuideOpen(true)}
              gasUrl={getGasUrl()}
            />
          )}

          {currentPage === 'pesanan_masuk' && (
            <PesananMasukPage
              incomingOrders={incomingOrders}
              onAcceptOrder={handleAcceptOrder}
              onRejectOrder={handleRejectOrder}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              shopWhatsapp={businessProfile.whatsapp || orgInfo.whatsapp || '62'}
            />
          )}

        </div>
      </section>

      {/* Floating Modals overlay drivers */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        transaction={activeReceiptTx}
        onClose={() => {
          setIsReceiptOpen(false);
          setActiveReceiptTx(null);
        }}
        storeName={businessProfile.storeName}
        storeAddress={businessProfile.address}
        storeWhatsapp={businessProfile.whatsapp}
        taxRate={businessProfile.taxRate}
      />

      <QrisModal
        isOpen={isQrisOpen}
        transaction={activeQrisTx}
        onConfirm={handleConfirmQrisPaid}
        onCancel={handleCancelQris}
      />

      <GasGuideModal
        isOpen={isGasGuideOpen}
        onClose={() => setIsGasGuideOpen(false)}
      />

      <AppGuideModal
        isOpen={isAppGuideOpen}
        onClose={() => setIsAppGuideOpen(false)}
        defaultTab="admin"
      />

    </div>
  );
}
