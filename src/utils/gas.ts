export function getGasUrl(): string {
  return localStorage.getItem('pos_gas_url') || '';
}

export function saveGasUrl(url: string): void {
  localStorage.setItem('pos_gas_url', url.trim());
}

export async function testGasConnectionUrl(url: string): Promise<{ success: boolean; message?: string; error?: string }> {
  const trimmedUrl = url.trim();
  if (!trimmedUrl) {
    throw new Error('URL Apps Script kosong.');
  }
  const payloadStr = encodeURIComponent(JSON.stringify({}));
  const fullUrl = trimmedUrl + (trimmedUrl.includes('?') ? '&' : '?') + 'action=testConnection&payload=' + payloadStr;
  
  const res = await fetch(fullUrl, {
    method: 'GET',
    redirect: 'follow',
    cache: 'no-store'
  });
  
  if (!res.ok) {
    throw new Error('HTTP Error ' + res.status);
  }
  
  const text = await res.text();
  if (!text) {
    throw new Error('Respons database kosong');
  }
  
  const json = JSON.parse(text);
  if (json.error) {
    throw new Error(json.error);
  }
  return json;
}

export async function gasRequest<T = any>(action: string, payload: any = {}): Promise<T> {
  const url = getGasUrl();
  if (!url) {
    throw new Error('URL Apps Script belum diatur.');
  }
  const payloadStr = encodeURIComponent(JSON.stringify(payload));
  const fullUrl = url + (url.includes('?') ? '&' : '?') + 'action=' + encodeURIComponent(action) + '&payload=' + payloadStr;
  
  const res = await fetch(fullUrl, {
    method: 'GET',
    redirect: 'follow',
    cache: 'no-store'
  });
  
  if (!res.ok) {
    throw new Error('HTTP Error ' + res.status);
  }
  
  const text = await res.text();
  if (!text) {
    throw new Error('Respons database kosong');
  }
  
  let json: any;
  try {
    json = JSON.parse(text);
  } catch (e) {
    throw new Error('Respons dari server bukan format JSON valid');
  }
  
  if (json.error) {
    throw new Error(json.error);
  }
  
  return json as T;
}

export const GAS_SCRIPT_CODE = `// Salin kode di bawah ini ke Google Apps Script Anda
// Cara Akses: Ekstensi > Apps Script
// Deploy: Penerapan Baru > Aplikasi Web > Jalankan sebagai: Saya > Akses: Siapa saja

const SPREADSHEET_ID = '[GANTI DENGAN ID SPREADSHEET ANDA]';
let _ss = null;
function getSs() {
  if (_ss) return _ss;
  if (!SPREADSHEET_ID || SPREADSHEET_ID.indexOf('GANTI') !== -1) {
    throw new Error('ID Spreadsheet belum dikonfigurasi di baris pertama Google Apps Script. Harap ganti [GANTI DENGAN ID SPREADSHEET ANDA] dengan ID Spreadsheet aktif Anda.');
  }
  _ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  return _ss;
}

function getSheet(name){return getSs().getSheetByName(name);}
function findRow(sheet,col,val){const d=sheet.getDataRange().getValues();for(let i=1;i<d.length;i++)if(d[i][col]==val)return i+1;return -1;}
function getRowsAsObjects(sheet){const d=sheet.getDataRange().getValues();if(!d.length)return[];const h=d[0];return d.slice(1).map(r=>{const o={};h.forEach((k,i)=>o[k]=r[i]);return o;});}
function generateId(){return Date.now().toString(36)+Math.random().toString(36).substr(2);}

function createRequiredSheets(){
const sheets=['ORGANISASI','PENGGUNA','KATEGORI','PRODUK','PELANGGAN','TRANSAKSI','DETAIL_TRANSAKSI','PEMBELIAN','BIAYA_OPERASIONAL'];
sheets.forEach(n=>{if(!getSs().getSheetByName(n))getSs().insertSheet(n);});
const headers={
'ORGANISASI':['ID_ORG','NAMA','ALAMAT','WHATSAPP','EMAIL_ADMIN','CREATED_AT'],
'PENGGUNA':['ID_ORG','STAFF_ID','NAMA','EMAIL','PIN','ROLE','STATUS','CREATED_AT'],
'KATEGORI':['ID_ORG','KATEGORI_ID','NAMA','CREATED_AT'],
'PRODUK':['ID_ORG','PRODUK_ID','NAMA','SKU','KATEGORI','HPP','HARGA','STOK','IMAGE_ID','CREATED_AT'],
'PELANGGAN':['ID_ORG','PELANGGAN_ID','NAMA','TELEPON','EMAIL','CREATED_AT'],
'TRANSAKSI':['ID_ORG','TX_ID','TOTAL','SUBTOTAL','DISKON_PCT','PAJAK','METHOD','OPERATOR','PELANGGAN','STATUS','CATATAN','CREATED_AT'],
'DETAIL_TRANSAKSI':['ID_ORG','TX_ID','PRODUK_ID','NAMA','HARGA','QTY','SUBTOTAL'],
'PEMBELIAN':['ID_ORG','PEMBELIAN_ID','PRODUK_ID','NAMA','QTY','HPP','SUPPLIER','CREATED_AT'],
'BIAYA_OPERASIONAL':['ID_ORG','SEWA','GAJI','LISTRIK_AIR','LAINNYA','UPDATED_AT']
};
Object.entries(headers).forEach(([n,cols])=>{const s=getSheet(n);if(s.getLastRow()===0)s.appendRow(cols);});
return{success:true};
}

function doRegister(orgName,adminName,email,pin){
try{createRequiredSheets();
const us=getSheet('PENGGUNA');const users=getRowsAsObjects(us);
if(users.some(u=>u.EMAIL===email))return{error:'Email sudah terdaftar'};
const ID_ORG=generateId();
getSheet('ORGANISASI').appendRow([ID_ORG,orgName,'','',email,new Date()]);
const SID='admin_'+generateId();
us.appendRow([ID_ORG,SID,adminName,email,pin,'admin','aktif',new Date()]);
return{success:true,orgId:ID_ORG,orgName,adminName,email,role:'admin',staffId:SID};
}catch(e){return{error:e.toString()};}
}

function doLogin(email,pin){
try{const us=getSheet('PENGGUNA');const d=us.getDataRange().getValues();
const el=String(email).trim().toLowerCase();const ps=String(pin).trim();
for(let i=1;i<d.length;i++){
if(String(d[i][3]||'').trim().toLowerCase()===el){
if(String(d[i][4]||'').trim()===ps){
const orgId=d[i][0];const os=getSheet('ORGANISASI').getDataRange().getValues();
let orgName='Org';for(let j=1;j<os.length;j++)if(os[j][0]===orgId){orgName=os[j][1];break;}
return{success:true,orgId,orgName,adminName:d[i][2],email:el,role:String(d[i][5]||'kasir'),staffId:d[i][1]};
}else return{error:'PIN salah'};
}}
return{error:'Email tidak ditemukan'};
}catch(e){return{error:e.toString()};}
}

function findUserByEmail(email){
try{const us=getRowsAsObjects(getSheet('PENGGUNA'));
const u=us.find(x=>x.EMAIL===email);
if(!u)return{error:'Email tidak ditemukan'};
return{success:true,email};
}catch(e){return{error:e.toString()};}
}

function resetUserPin(email,newPin){
try{const s=getSheet('PENGGUNA');const row=findRow(s,3,email);
if(row<=0)return{error:'User tidak ditemukan'};
s.getRange(row,5).setValue(newPin);
return{success:true};
}catch(e){return{error:e.toString()};}
}

function getAllData(orgId){
try{createRequiredSheets();
const prods=getRowsAsObjects(getSheet('PRODUK')).filter(p=>p.ID_ORG===orgId);
const cats=[...new Set(prods.map(p=>p.KATEGORI).filter(c=>c))];
const txs=getRowsAsObjects(getSheet('TRANSAKSI')).filter(t=>t.ID_ORG===orgId);
const staff=getRowsAsObjects(getSheet('PENGGUNA')).filter(u=>u.ID_ORG===orgId&&u.ROLE==='kasir');
const custs=getRowsAsObjects(getSheet('PELANGGAN')).filter(c=>c.ID_ORG===orgId);
const purch=getRowsAsObjects(getSheet('PEMBELIAN')).filter(p=>p.ID_ORG===orgId);
const opex=getRowsAsObjects(getSheet('BIAYA_OPERASIONAL')).find(o=>o.ID_ORG===orgId)||{};
const org=getRowsAsObjects(getSheet('ORGANISASI')).find(o=>o.ID_ORG===orgId)||{};
return{
products:prods.map(p=>({id:p.PRODUK_ID,name:p.NAMA,sku:p.SKU,category:p.KATEGORI,stock:Number(p.STOK)||0,cost:Number(p.HPP)||0,price:Number(p.HARGA)||0,imageId:Number(p.IMAGE_ID)||1})),
categories:cats,
transactions:txs.map(t=>({id:t.TX_ID,total:Number(t.TOTAL)||0,subtotal:Number(t.SUBTOTAL)||0,totalCost:0,profit:0,discountPct:Number(t.DISKON_PCT)||0,taxIncluded:Number(t.PAJAK)>0,method:t.METHOD,operator:t.OPERATOR,customerName:t.PELANGGAN,status:t.STATUS,date:t.CREATED_AT,notes:t.CATATAN})),
petugasList:staff.map(u=>({id:u.STAFF_ID,nama:u.NAMA,email:u.EMAIL})),
pelangganList:custs.map(c=>({id:c.PELANGGAN_ID,nama:c.NAMA,hp:c.TELEPON})),
purchaseHistory:purch.map(p=>({productId:p.PRODUK_ID,productName:p.NAMA,qty:Number(p.QTY)||0,cost:Number(p.HPP)||0,supplier:p.SUPPLIER,date:p.CREATED_AT})),
operationalExpenses:{rent:Number(opex.SEWA)||0,salary:Number(opex.GAJI)||0,utilities:Number(opex.LISTRIK_AIR)||0,other:Number(opex.LAINNYA)||0},
businessProfile:{storeName:org.NAMA||'Toko',whatsapp:org.WHATSAPP||'',address:org.ALAMAT||'',taxEnabled:false,taxRate:11},
orgInfo:{name:org.NAMA||'',address:org.ALAMAT||'',whatsapp:org.WHATSAPP||'',email:org.EMAIL_ADMIN||''},
notifications:[],nextProductId:prods.length+1
};
}catch(e){return{error:e.toString()};}
}

function saveAllData(orgId,data){
try{
const ps=getSheet('PRODUK');
(data.products||[]).forEach(p=>{
const row=findRow(ps,1,p.id);// PRODUK_ID col index 1
if(row>0)ps.getRange(row,1,1,10).setValues([[orgId,p.id,p.name,p.sku||'',p.category||'',p.cost||0,p.price||0,p.stock||0,p.imageId||1,new Date()]]);
else ps.appendRow([orgId,p.id,p.name,p.sku||'',p.category||'',p.cost||0,p.price||0,p.stock||0,p.imageId||1,new Date()]);
});
const ts=getSheet('TRANSAKSI');
(data.transactions||[]).forEach(t=>{
if(findRow(ts,1,t.id)===-1)ts.appendRow([orgId,t.id,t.total||0,t.subtotal||0,t.discountPct||0,t.taxIncluded?11:0,t.method,t.operator,t.customerName,t.status,t.notes||'',t.date]);
});
// Save categories
const cs=getSheet('KATEGORI');const existCats=getRowsAsObjects(cs).filter(c=>c.ID_ORG===orgId).map(c=>c.NAMA);
(data.categories||[]).forEach(c=>{if(!existCats.includes(c))cs.appendRow([orgId,generateId(),c,new Date()]);});
// Save customers
const cust=getSheet('PELANGGAN');
(data.pelangganList||[]).forEach(c=>{if(findRow(cust,1,c.id)===-1)cust.appendRow([orgId,c.id,c.nama,c.hp||'','',new Date()]);});
// Save purchases
const pu=getSheet('PEMBELIAN');
(data.purchaseHistory||[]).forEach(p=>{pu.appendRow([orgId,generateId(),p.productId,p.productName,p.qty,p.cost,p.supplier,p.date]);});
// Save opex
const opSheet=getSheet('BIAYA_OPERASIONAL');const opRow=findRow(opSheet,0,orgId);
const oe=data.operationalExpenses||{};
if(opRow>0)opSheet.getRange(opRow,1,1,6).setValues([[orgId,oe.rent||0,oe.salary||0,oe.utilities||0,oe.other||0,new Date()]]);
else opSheet.appendRow([orgId,oe.rent||0,oe.salary||0,oe.utilities||0,oe.other||0,new Date()]);
// Update org info
const os=getSheet('ORGANISASI');const oRow=findRow(os,0,orgId);
if(oRow>0&&data.orgInfo){os.getRange(oRow,2).setValue(data.orgInfo.name||'');os.getRange(oRow,3).setValue(data.orgInfo.address||'');os.getRange(oRow,4).setValue(data.orgInfo.whatsapp||'');}
return{success:true};
}catch(e){return{error:e.toString()};}
}

function addStaff(orgId,staffId,nama,email,pin){
try{getSheet('PENGGUNA').appendRow([orgId,staffId,nama,email,pin,'kasir','aktif',new Date()]);return{success:true};}catch(e){return{error:e.toString()};}
}

function changePin(orgId,email,newPin){
try{const s=getSheet('PENGGUNA');const row=findRow(s,3,email);if(row>0){s.getRange(row,5).setValue(newPin);return{success:true};}return{error:'Not found'};}catch(e){return{error:e.toString()};}
}

function resetOrg(orgId){
try{['PRODUK','KATEGORI','TRANSAKSI','DETAIL_TRANSAKSI','PEMBELIAN','PELANGGAN','BIAYA_OPERASIONAL','PENGGUNA'].forEach(n=>{
const s=getSheet(n);const d=s.getDataRange().getValues();for(let i=d.length;i>1;i--)if(d[i-1][0]===orgId)s.deleteRow(i);
});
const os=getSheet('ORGANISASI');const r=findRow(os,0,orgId);if(r>0)os.deleteRow(r);
return{success:true};
}catch(e){return{error:e.toString()};}
}

function testConnection(){try{createRequiredSheets();return{success:true,message:'OK'};}catch(e){return{error:e.toString()};}}

function doGet(e){
try{const action=e.parameter.action;const payload=JSON.parse(decodeURIComponent(e.parameter.payload||'{}'));
let result;
switch(action){
case'register':result=doRegister(payload.orgName,payload.adminName,payload.email,payload.pin);break;
case'login':result=doLogin(payload.email,payload.pin);break;
case'findUserByEmail':result=findUserByEmail(payload.email);break;
case'resetUserPin':result=resetUserPin(payload.email,payload.newPin);break;
case'getAllData':result=getAllData(payload.orgId);break;
case'saveAllData':result=saveAllData(payload.orgId,payload.data);break;
case'addStaff':result=addStaff(payload.orgId,payload.staffId,payload.nama,payload.email,payload.pin);break;
case'changePin':result=changePin(payload.orgId,payload.email,payload.newPin);break;
case'resetOrg':result=resetOrg(payload.orgId);break;
case'testConnection':result=testConnection();break;
default:result={error:'Unknown action: '+action};
}
return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}catch(e){return ContentService.createTextOutput(JSON.stringify({error:e.toString()})).setMimeType(ContentService.MimeType.JSON);}
}

function doPost(e){
try{const payload=JSON.parse(e.postData.contents);const action=payload.action;
return doGet({parameter:{action,payload:encodeURIComponent(JSON.stringify(payload))}});
}catch(e){return ContentService.createTextOutput(JSON.stringify({error:e.toString()})).setMimeType(ContentService.MimeType.JSON);}
}`;
