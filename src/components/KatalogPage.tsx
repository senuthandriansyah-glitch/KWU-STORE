import React, { useState } from 'react';
import { Search, Plus, Trash2, Edit3, Image as ImageIcon, Sparkles } from 'lucide-react';
import { Product } from '../types';

interface KatalogPageProps {
  products: Product[];
  categories: string[];
  currentRole: 'admin' | 'kasir';
  onAddCategory: (name: string, imageBase64?: string) => void;
  onDeleteCategory: (name: string) => void;
  onAddProduct: (product: Omit<Product, 'id'>, imageBase64?: string) => void;
  onEditProduct: (id: string, product: Partial<Product>, imageBase64?: string) => void;
  onDeleteProduct: (id: string) => void;
}

export const KatalogPage: React.FC<KatalogPageProps> = ({
  products,
  categories,
  currentRole,
  onAddCategory,
  onDeleteCategory,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchText, setSearchText] = useState<string>('');

  // Modals inside state management
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [catNameInput, setCatNameInput] = useState('');
  const [catImgPending, setCatImgPending] = useState<string>('');

  const [isProdModalOpen, setIsProdModalOpen] = useState(false);
  const [editingProdId, setEditingProdId] = useState<string | null>(null);
  
  // Product Form states
  const [prodName, setProdName] = useState('');
  const [prodSku, setProdSku] = useState('');
  const [prodCat, setProdCat] = useState('');
  const [prodCost, setProdCost] = useState(0);
  const [prodPrice, setProdPrice] = useState(0);
  const [prodStock, setProdStock] = useState(1);
  const [prodImgPending, setProdImgPending] = useState<string>('');

  const getProductImgSrc = (id: string) => {
    return localStorage.getItem('pos_img_' + id) || '';
  };

  const getCategoryImgSrc = (cat: string) => {
    return localStorage.getItem('pos_catimg_' + cat) || '';
  };

  // Filtering products
  const filteredProducts = products.filter(p => {
    const matchesCat = !selectedCategory || p.category === selectedCategory;
    const matchesSearch = !searchText || p.name.toLowerCase().includes(searchText.toLowerCase()) || (p.sku || '').toLowerCase().includes(searchText.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleOpenAddCategory = () => {
    setCatNameInput('');
    setCatImgPending('');
    setIsCatModalOpen(true);
  };

  const handleSaveCategory = () => {
    const name = catNameInput.trim();
    if (!name) {
      alert('Isi nama kategori terlebih dahulu.');
      return;
    }
    if (categories.includes(name)) {
      alert('Kategori ' + name + ' sudah ada.');
      return;
    }
    onAddCategory(name, catImgPending || undefined);
    setIsCatModalOpen(false);
  };

  const handleCategoryImgFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCatImgPending(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenAddProduct = () => {
    if (!categories.length) {
      alert('Silakan buat kategori produk pertama Anda terlebih dahulu.');
      return;
    }
    setEditingProdId(null);
    setProdName('');
    setProdSku('');
    setProdCat(categories[0]);
    setProdCost(0);
    setProdPrice(0);
    setProdStock(1);
    setProdImgPending('');
    setIsProdModalOpen(true);
  };

  const handleOpenEditProduct = (p: Product) => {
    setEditingProdId(p.id);
    setProdName(p.name);
    setProdSku(p.sku || '');
    setProdCat(p.category || categories[0]);
    setProdCost(p.cost || 0);
    setProdPrice(p.price || 0);
    setProdStock(p.stock || 0);
    setProdImgPending(getProductImgSrc(p.id));
    setIsProdModalOpen(true);
  };

  const handleSaveProduct = () => {
    const name = prodName.trim();
    if (!name || prodPrice <= 0) {
      alert('Lengkapi nama produk dan harga jual yang valid.');
      return;
    }
    if (editingProdId) {
      onEditProduct(editingProdId, {
        name,
        sku: prodSku,
        category: prodCat,
        cost: prodCost,
        price: prodPrice,
        stock: prodStock,
      }, prodImgPending || undefined);
    } else {
      onAddProduct({
        name,
        sku: prodSku,
        category: prodCat,
        cost: prodCost,
        price: prodPrice,
        stock: prodStock,
      }, prodImgPending || undefined);
    }
    setIsProdModalOpen(false);
  };

  const handleProductImgFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setProdImgPending(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerCatDelete = (cat: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus kategori "${cat}"? Seluruh produk kategori tersebut akan dikosongkan kategorinya.`)) {
      onDeleteCategory(cat);
      if (selectedCategory === cat) setSelectedCategory('');
    }
  };

  const triggerProdDelete = (id: string) => {
    if (confirm('Yakin ingin menghapus produk ini?')) {
      onDeleteProduct(id);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Search Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Katalog Produk</h2>
          <p className="text-xs text-slate-500 mt-0.5">Kelola stok kategori, harga modal (HPP), dan detail SKU cepat</p>
        </div>
        {currentRole === 'admin' && (
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={handleOpenAddCategory}
              className="py-2 px-4 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold active:scale-[0.98] transition-all flex items-center gap-1.5 shadow"
            >
              <Plus className="w-4 h-4" /> Kategori
            </button>
            <button
              onClick={handleOpenAddProduct}
              className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold active:scale-[0.98] transition-all flex items-center gap-1.5 shadow"
            >
              <Plus className="w-4 h-4" /> Tambah Produk
            </button>
          </div>
        )}
      </div>

      {/* Input query search */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Cari nama produk, kategori atau nomor SKU..."
          className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
        />
      </div>

      {/* Categories Horizontal Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        <button
          onClick={() => setSelectedCategory('')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all ${
            !selectedCategory
              ? 'bg-blue-600 text-white border-blue-600 shadow-md'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
          }`}
        >
          Semua Produk
        </button>
        {categories.map(cat => (
          <div key={cat} className="relative group flex-shrink-0">
            <button
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
            {currentRole === 'admin' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  triggerCatDelete(cat);
                }}
                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-600 text-white hover:bg-red-700 flex items-center justify-center text-[10px] shadow duration-150 transition-all cursor-pointer"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredProducts.length > 0 ? (
          filteredProducts.map(p => {
            const img = getProductImgSrc(p.id);
            const isLow = p.stock <= 5;
            return (
              <div
                key={p.id}
                className={`bg-white rounded-2xl border ${
                  isLow ? 'border-red-300 shadow-red-50' : 'border-slate-100 shadow-sm'
                } overflow-hidden hover:shadow-md transition-all flex flex-col relative group`}
              >
                {isLow && (
                  <span className="absolute top-2 right-2 bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow z-10">
                    Stok Tipis
                  </span>
                )}
                
                {/* Photo frame */}
                <div className="h-28 bg-slate-50 flex items-center justify-center overflow-hidden border-b border-slate-100 relative">
                  {img ? (
                    <img src={img} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" alt={p.name} />
                  ) : (
                    <div className="text-4xl text-slate-300">📦</div>
                  )}
                </div>

                {/* Details */}
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-widest">{p.category || 'Tanpa Kategori'}</span>
                    <h4 className="font-bold text-xs text-slate-800 truncate mt-1">{p.name}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5 flex justify-between">
                      <span>SKU: {p.sku || 'N/A'}</span>
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-50 text-[11px] space-y-1">
                    <div className="flex justify-between text-slate-400">
                      <span>HPP (Modal)</span>
                      <span>Rp {(p.cost || 0).toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between font-bold text-emerald-600">
                      <span>Harga Jual</span>
                      <span>Rp {p.price.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-slate-600 items-center mt-1">
                      <span>Stok</span>
                      <span className={`px-1.5 py-0.5 rounded font-black text-xs ${isLow ? 'text-red-700 bg-red-50' : 'text-slate-800'}`}>
                        {p.stock} pcs
                      </span>
                    </div>
                  </div>

                  {currentRole === 'admin' && (
                    <div className="flex gap-1.5 mt-3 border-t border-slate-50 pt-3">
                      <button
                        onClick={() => handleOpenEditProduct(p)}
                        className="flex-1 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg text-[10px] transition-all flex items-center justify-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => triggerProdDelete(p.id)}
                        className="py-1.5 px-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-[10px] transition-all"
                        title="Hapus Produk"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <p className="col-span-full py-16 text-slate-400 text-center text-xs font-medium">
            Tidak ada produk yang berjalan sesuai pencarian atau kategori Anda.
          </p>
        )}
      </div>

      {/* Modal Add Category */}
      {isCatModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[10003] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-sm">Tambah Kategori Baru</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Kelompokkan berbagai produk di toko Anda</p>
            </div>
            <div className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nama Kategori</label>
                <input
                  type="text"
                  value={catNameInput}
                  onChange={(e) => setCatNameInput(e.target.value)}
                  placeholder="Misal: Minuman Dingin, Snack, dll"
                  className="w-full text-xs border border-slate-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              {/* Photo Category Picker */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Foto Sampul Kategori</label>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden">
                    {catImgPending ? (
                      <img src={catImgPending} className="w-full h-full object-cover" alt="Kategori" />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      id="upload-cat-picker"
                      onChange={handleCategoryImgFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="upload-cat-picker"
                      className="inline-block py-1.5 px-3 bg-violet-50 hover:bg-violet-100 text-violet-700 rounded-lg text-[10px] font-bold cursor-pointer transition-all"
                    >
                      Pilih dari Galeri
                    </label>
                    <p className="text-[9px] text-slate-400 mt-1">Opsional, akan tampil sebagai background visual.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2 text-xs">
              <button
                onClick={() => setIsCatModalOpen(false)}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-300"
              >
                Batal
              </button>
              <button
                onClick={handleSaveCategory}
                className="px-4 py-2 bg-violet-600 text-white rounded-xl font-bold hover:bg-violet-700"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add/Edit Product */}
      {isProdModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[10003] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-sm">
                {editingProdId ? 'Edit Detail Produk' : 'Tambah Produk Baru'}
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Kelola SKU, taksasi, stok, serta foto produk</p>
            </div>
            
            <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto scrollbar-thin">
              {/* Product Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nama Produk (Lengkap)</label>
                <input
                  type="text"
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  placeholder="Misal: Teh Botol Sosro 450ml"
                  className="w-full text-xs border border-slate-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 font-medium"
                />
              </div>

              {/* SKU & Category Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nomor SKU / Kode Bar</label>
                  <input
                    type="text"
                    value={prodSku}
                    onChange={(e) => setProdSku(e.target.value)}
                    placeholder="E.g. BT882"
                    className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kategori</label>
                  <select
                    value={prodCat}
                    onChange={(e) => setProdCat(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price Calculation (HPP vs Jual) */}
              <div className="grid grid-cols-2 gap-3 bg-blue-50/50 p-3 rounded-2xl border border-blue-50">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">HPP (Modal / Unit)</label>
                  <input
                    type="number"
                    value={prodCost || ''}
                    onChange={(e) => setProdCost(Number(e.target.value))}
                    placeholder="Rp 0"
                    className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white focus:ring-blue-500 focus:ring-2"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">Harga Jual (Unit)</label>
                  <input
                    type="number"
                    value={prodPrice || ''}
                    onChange={(e) => setProdPrice(Number(e.target.value))}
                    placeholder="Rp 0"
                    className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white focus:ring-emerald-500 focus:ring-2 font-bold text-emerald-800"
                  />
                </div>
              </div>

              {/* Stock input */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sediaan Stok Awal</label>
                <input
                  type="number"
                  value={prodStock}
                  onChange={(e) => setProdStock(Number(e.target.value))}
                  placeholder="Jumlah stok"
                  className="w-full text-xs border border-slate-300 rounded-xl px-4 py-2 focus:ring-blue-500 focus:ring-2"
                />
              </div>

              {/* Product Photo Picker */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gambar Produk</label>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden">
                    {prodImgPending ? (
                      <img src={prodImgPending} className="w-full h-full object-cover" alt="Pratinjau" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-slate-300" />
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      id="upload-prod-picker"
                      onChange={handleProductImgFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <label
                      htmlFor="upload-prod-picker"
                      className="inline-block py-1.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-[10px] font-bold cursor-pointer transition-all"
                    >
                      Unggah dari Galeri
                    </label>
                    <p className="text-[9px] text-slate-400 mt-1">Gunakan foto beresolusi 200x200 untuk hasil tajam.</p>
                  </div>
                </div>
              </div>

            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2 text-xs font-semibold">
              <button
                onClick={() => setIsProdModalOpen(false)}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition-all font-bold"
              >
                Batal
              </button>
              <button
                onClick={handleSaveProduct}
                className="px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold"
              >
                {editingProdId ? 'Simpan' : 'Simpan Produk'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
