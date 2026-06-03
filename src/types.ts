export interface Organization {
  id: string;
  name: string;
  adminName: string;
  email: string;
  whatsapp?: string;
}

export interface UserSession {
  orgId: string;
  role: 'admin' | 'kasir';
  staffId: string | null;
  email: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  stock: number;
  cost: number;
  price: number;
  imageId?: number;
  storeName?: string;
  warehouseStocks?: Record<string, number>; // key: warehouseId, value: stock quantity
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  cost: number;
  qty: number;
}

export interface Transaction {
  id: string;
  items: CartItem[];
  total: number;
  subtotal: number;
  totalCost: number;
  profit: number;
  method: 'tunai' | 'qris' | 'transfer' | 'online';
  date: string;
  status: 'selesai' | 'pending' | 'batal';
  operator: string;
  customerName: string;
  notes?: string;
  discountPct?: number;
  taxIncluded?: boolean;
}

export interface Staff {
  id: string;
  nama: string;
  email: string;
}

export interface Customer {
  id: string;
  nama: string;
  hp?: string;
}

export interface PurchaseRecord {
  productId: string;
  productName: string;
  qty: number;
  cost: number;
  supplier: string;
  date: string;
}

export interface OperationalExpenses {
  rent: number;
  salary: number;
  utilities: number;
  other: number;
}

export interface BusinessProfile {
  storeName: string;
  whatsapp: string;
  address: string;
  taxEnabled: boolean;
  taxRate: number;
  instagram?: string;
}

export interface OnlineOrder {
  id: string;
  name: string;
  items: CartItem[];
  total: number;
  date: string;
  status: 'pending' | 'accepted' | 'ready' | 'completed' | 'rejected';
  whatsapp?: string;
  pickupDate?: string;
  pickupTime?: string;
  rejectReason?: string;
  storeName?: string;
  notes?: string;
}

export interface Warehouse {
  id: string;
  name: string;
  location: string;
}

export interface StockTransfer {
  id: string;
  productId: string;
  productName: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  qty: number;
  date: string;
}

export interface PartnerShare {
  id: string;
  name: string;
  percentage: number;
}

export interface AppNotification {
  msg: string;
  time: string;
}
