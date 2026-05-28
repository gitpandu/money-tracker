import { useState, useMemo, useEffect, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

/* ─── CYCLES ─────────────────────────────────────────────────────────────── */
const CYCLES = [
  { id: "2024-01", label: "Jan 2024", start: "2023-12-25", end: "2024-01-24" },
  { id: "2024-02", label: "Feb 2024", start: "2024-01-25", end: "2024-02-24" },
  { id: "2024-03", label: "Mar 2024", start: "2024-02-25", end: "2024-03-24" },
  { id: "2024-04", label: "Apr 2024", start: "2024-03-25", end: "2024-04-24" },
  { id: "2024-05", label: "May 2024", start: "2024-04-25", end: "2024-05-24" },
];
const CURRENT_CYCLE = "2024-05";

/* ─── MOCK DATA ──────────────────────────────────────────────────────────── */
const INITIAL_CATEGORIES = [
  { id: 1, name: "Food", type: "expense", color: "#c2674e", icon: "🍜", parentId: null },
  { id: 2, name: "Groceries", type: "expense", color: "#e85d3a", parentId: 1 },
  { id: 3, name: "Dining Out", type: "expense", color: "#f0944d", parentId: 1 },
  { id: 4, name: "Transport", type: "expense", color: "#3a7d5c", icon: "🚗", parentId: null },
  { id: 5, name: "Fuel", type: "expense", color: "#2eaa72", parentId: 4 },
  { id: 6, name: "Ride-hailing", type: "expense", color: "#45c48a", parentId: 4 },
  { id: 7, name: "Household", type: "expense", color: "#6b5fc7", icon: "🏠", parentId: null },
  { id: 8, name: "Utilities", type: "expense", color: "#8b7ee0", parentId: 7 },
  { id: 9, name: "Maintenance", type: "expense", color: "#b0a6e8", parentId: 7 },
  { id: 10, name: "Salary", type: "income", color: "#2e7d4f", icon: "💼", parentId: null },
  { id: 11, name: "Freelance", type: "income", color: "#4a9e6a", icon: "💻", parentId: null },
];

const INITIAL_TRANSACTIONS = [
  // May cycle
  { id: 1, amount: 8500000, type: "income", categoryId: 10, note: "Monthly salary", date: "2024-05-10", receipt: null },
  { id: 2, amount: 2000000, type: "income", categoryId: 11, note: "Web project", date: "2024-05-05", receipt: null },
  { id: 3, amount: 450000, type: "expense", categoryId: 2, note: "Indomaret weekly", date: "2024-05-20", receipt: null },
  { id: 4, amount: 185000, type: "expense", categoryId: 3, note: "Dinner at Warung Bu Sri", date: "2024-05-18", receipt: null },
  { id: 5, amount: 300000, type: "expense", categoryId: 5, note: "Pertamax full tank", date: "2024-05-15", receipt: null },
  { id: 6, amount: 75000, type: "expense", categoryId: 6, note: "Gojek this week", date: "2024-05-12", receipt: null },
  { id: 7, amount: 650000, type: "expense", categoryId: 8, note: "PLN + PDAM", date: "2024-05-08", receipt: null },
  { id: 8, amount: 120000, type: "expense", categoryId: 3, note: "Family lunch", date: "2024-05-06", receipt: null },
  { id: 9, amount: 200000, type: "expense", categoryId: 9, note: "AC servicing", date: "2024-05-03", receipt: null },
  { id: 10, amount: 380000, type: "expense", categoryId: 2, note: "Bulk groceries", date: "2024-04-28", receipt: null },
  // Apr cycle
  { id: 11, amount: 8500000, type: "income", categoryId: 10, note: "Monthly salary", date: "2024-04-10", receipt: null },
  { id: 12, amount: 520000, type: "expense", categoryId: 2, note: "Groceries", date: "2024-04-20", receipt: null },
  { id: 13, amount: 220000, type: "expense", categoryId: 3, note: "Resto", date: "2024-04-15", receipt: null },
  { id: 14, amount: 350000, type: "expense", categoryId: 5, note: "Fuel", date: "2024-04-12", receipt: null },
  { id: 15, amount: 700000, type: "expense", categoryId: 8, note: "Utilities", date: "2024-04-08", receipt: null },
  // Mar cycle
  { id: 16, amount: 10500000, type: "income", categoryId: 10, note: "Monthly salary", date: "2024-03-10", receipt: null },
  { id: 17, amount: 480000, type: "expense", categoryId: 2, note: "Groceries", date: "2024-03-20", receipt: null },
  { id: 18, amount: 190000, type: "expense", categoryId: 3, note: "Lunch", date: "2024-03-14", receipt: null },
  { id: 19, amount: 310000, type: "expense", categoryId: 5, note: "Pertamax", date: "2024-03-11", receipt: null },
  { id: 20, amount: 650000, type: "expense", categoryId: 8, note: "PLN", date: "2024-03-07", receipt: null },
  // Feb cycle
  { id: 21, amount: 8500000, type: "income", categoryId: 10, note: "Monthly salary", date: "2024-02-10", receipt: null },
  { id: 22, amount: 560000, type: "expense", categoryId: 2, note: "Groceries", date: "2024-02-18", receipt: null },
  { id: 23, amount: 250000, type: "expense", categoryId: 3, note: "Dinner", date: "2024-02-14", receipt: null },
  { id: 24, amount: 400000, type: "expense", categoryId: 5, note: "Fuel", date: "2024-02-10", receipt: null },
  { id: 25, amount: 720000, type: "expense", categoryId: 8, note: "Utilities", date: "2024-02-06", receipt: null },
  // Jan cycle
  { id: 26, amount: 8500000, type: "income", categoryId: 10, note: "Monthly salary", date: "2024-01-10", receipt: null },
  { id: 27, amount: 490000, type: "expense", categoryId: 2, note: "Groceries", date: "2024-01-20", receipt: null },
  { id: 28, amount: 210000, type: "expense", categoryId: 3, note: "Makan", date: "2024-01-15", receipt: null },
  { id: 29, amount: 330000, type: "expense", categoryId: 5, note: "Fuel", date: "2024-01-11", receipt: null },
  { id: 30, amount: 680000, type: "expense", categoryId: 8, note: "PLN+PDAM", date: "2024-01-07", receipt: null },
];

const INITIAL_BUDGETS = [
  { id: 1, categoryId: 2, limit: 800000, active: true, note: "" },
  { id: 2, categoryId: 3, limit: 400000, active: true, note: "" },
  { id: 3, categoryId: 5, limit: 500000, active: true, note: "Usually spikes mid-month" },
  { id: 4, categoryId: 6, limit: 150000, active: false, note: "" },
  { id: 5, categoryId: 8, limit: 700000, active: true, note: "PLN + PDAM due 8th" },
];

const INITIAL_GOALS = [
  { id: 1, name: "Emergency Fund", icon: "🛡️", target: 30000000, saved: 12000000, deadline: "2024-12-31", color: "#2eaa72" },
  { id: 2, name: "Vacation — Bali", icon: "✈️", target: 8000000, saved: 3500000, deadline: "2024-08-01", color: "#4a7fc4" },
  { id: 3, name: "New Laptop", icon: "💻", target: 15000000, saved: 5000000, deadline: null, color: "#8b7ee0" },
];

const EMOJI_OPTIONS = ["🍜", "🍽️", "🚗", "🏠", "💼", "💻", "🏥", "📚", "🎮", "✈️", "👗", "💊", "🐾", "🎁", "🏋️", "☕", "🍕", "🛍️", "🎵", "📱", "🏦", "🎓", "🌿", "🧴", "🛒", "🛡️", "🎯", "🏖️", "💍", "🚀", "🌟", "🎸"];
const COLOR_OPTIONS = [
  "#e85d3a", "#f0944d", "#e8b84b", "#e85d7a",
  "#2eaa72", "#45c48a", "#6dd49a", "#3a9e5a",
  "#4a7fc4", "#6b9fe0", "#8b7ee0", "#b0a6e8",
  "#2ab8a8", "#45d4c2", "#4ab8d4", "#6acce0",
  "#d45a8a", "#e07ab0", "#c45ac4", "#a45ae0",
  "#8a6a4a", "#b08a6a", "#c2674e", "#9e6b5f",
];

/* ─── I18N ───────────────────────────────────────────────────────────────── */
const STRINGS = {
  en: {
    appName: "Money Tracker", home: "Home", budgets: "Budgets", goals: "Goals", reports: "Reports", settings: "Settings",
    cycle: "Cycle", cycleActive: "Active", income: "Income", expense: "Expense", netBalance: "Net balance",
    transactions: "Transactions", all: "All", search: "Search transactions…",
    newTransaction: "New Transaction", editTransaction: "Edit Transaction",
    amount: "Amount (Rp)", date: "Date", category: "Category", note: "Note", receipt: "Receipt",
    receiptPreview: "Receipt", noReceipt: "No receipt attached",
    save: "Save", cancel: "Cancel", delete: "Delete",
    budgeted: "Budgeted", spent: "Spent", remaining: "Remaining",
    noLimit: "No limit set", excluded: "Excluded this cycle", over: "Over",
    overLimit: "over limit", on: "On", off: "Off",
    editBudget: "Edit Budget", limit: "Limit (Rp)", budgetNote: "Note (optional)",
    trend: "Spending trend", monthlyOverview: "Monthly Overview", expenseByCategory: "Expense by Category",
    savings: "Savings", topSpend: "Top Spend", avgCycle: "Avg / Cycle",
    cycleSetting: "Cycle", resetDay: "Reset Day", resetDayDesc: "Cycle resets on this day each month",
    carryOver: "Carry Over Balance", carryOverDesc: "Add previous net as opening income",
    copyBudgets: "Copy Budgets on Reset", copyBudgetsDesc: "Auto-copy last cycle's limits",
    darkMode: "Dark Mode", darkModeDesc: "Toggle dark appearance",
    expenseCats: "Expense Categories", incomeCats: "Income Categories",
    addCategory: "New Category", editCategory: "Edit Category",
    addCat: "+ Add", noneYet: "None yet", noTxns: "No transactions",
    parent: "Parent (optional)", noneTopLevel: "None — top level",
    icon: "Icon", color: "Color", accentColor: "Accent Color",
    subCats: "sub-categories", type: "Type",
    deleteConfirmTitle: (n) => `Delete "${n}"?`,
    deleteConfirmBody: "This will also remove all sub-categories. Transactions will remain but may appear uncategorised.",
    language: "Language", exportCSV: "Export CSV", exportDesc: "Download current cycle transactions",
    goalsTitle: "Savings Goals", newGoal: "New Goal", editGoal: "Edit Goal",
    target: "Target (Rp)", saved: "Saved so far (Rp)", deadline: "Deadline (optional)",
    addContrib: "Add", contribAmount: "Amount to add (Rp)", contribute: "Contribute",
    noGoals: "No savings goals yet", goalName: "Goal name", goalIcon: "Icon", goalColor: "Color",
    selectCat: "Select…", of: "of",
  },
  id: {
    appName: "Pelacak Uang", home: "Beranda", budgets: "Anggaran", goals: "Tabungan", reports: "Laporan", settings: "Pengaturan",
    cycle: "Siklus", cycleActive: "Aktif", income: "Pemasukan", expense: "Pengeluaran", netBalance: "Saldo bersih",
    transactions: "Transaksi", all: "Semua", search: "Cari transaksi…",
    newTransaction: "Transaksi Baru", editTransaction: "Ubah Transaksi",
    amount: "Jumlah (Rp)", date: "Tanggal", category: "Kategori", note: "Catatan", receipt: "Bukti",
    receiptPreview: "Bukti Pembayaran", noReceipt: "Tidak ada bukti",
    save: "Simpan", cancel: "Batal", delete: "Hapus",
    budgeted: "Dianggarkan", spent: "Terpakai", remaining: "Sisa",
    noLimit: "Batas belum diatur", excluded: "Dinonaktifkan siklus ini", over: "Melebihi",
    overLimit: "melebihi batas", on: "Aktif", off: "Nonaktif",
    editBudget: "Ubah Anggaran", limit: "Batas (Rp)", budgetNote: "Catatan (opsional)",
    trend: "Tren pengeluaran", monthlyOverview: "Ringkasan Bulanan", expenseByCategory: "Pengeluaran per Kategori",
    savings: "Tabungan", topSpend: "Pengeluaran Terbesar", avgCycle: "Rata-rata / Siklus",
    cycleSetting: "Siklus", resetDay: "Hari Reset", resetDayDesc: "Siklus reset pada hari ini tiap bulan",
    carryOver: "Bawa Saldo", carryOverDesc: "Tambah saldo bersih lalu sebagai pemasukan awal",
    copyBudgets: "Salin Anggaran saat Reset", copyBudgetsDesc: "Otomatis salin batas siklus sebelumnya",
    darkMode: "Mode Gelap", darkModeDesc: "Aktifkan tampilan gelap",
    expenseCats: "Kategori Pengeluaran", incomeCats: "Kategori Pemasukan",
    addCategory: "Kategori Baru", editCategory: "Ubah Kategori",
    addCat: "+ Tambah", noneYet: "Belum ada", noTxns: "Belum ada transaksi",
    parent: "Induk (opsional)", noneTopLevel: "Tidak ada — tingkat atas",
    icon: "Ikon", color: "Warna", accentColor: "Warna Aksen",
    subCats: "sub-kategori", type: "Tipe",
    deleteConfirmTitle: (n) => `Hapus "${n}"?`,
    deleteConfirmBody: "Ini juga akan menghapus semua sub-kategori. Transaksi tetap ada tapi mungkin tidak berkategori.",
    language: "Bahasa", exportCSV: "Ekspor CSV", exportDesc: "Unduh transaksi siklus ini",
    goalsTitle: "Target Tabungan", newGoal: "Target Baru", editGoal: "Ubah Target",
    target: "Target (Rp)", saved: "Sudah ditabung (Rp)", deadline: "Batas waktu (opsional)",
    addContrib: "Tambah", contribAmount: "Jumlah yang ditambahkan (Rp)", contribute: "Tabung",
    noGoals: "Belum ada target tabungan", goalName: "Nama target", goalIcon: "Ikon", goalColor: "Warna",
    selectCat: "Pilih…", of: "dari",
  },
};

/* ─── UTILS ──────────────────────────────────────────────────────────────── */
const fmt = n => "Rp " + n.toLocaleString("id-ID");
const fmtShort = n => n >= 1000000 ? `Rp ${(n / 1000000).toFixed(1)}jt` : n >= 1000 ? `Rp ${(n / 1000).toFixed(0)}rb` : `Rp ${n}`;
const getCat = (cats, id) => cats.find(c => c.id === id);
let uid = 300;

function txnsInCycle(txns, cycleId) {
  const cyc = CYCLES.find(c => c.id === cycleId);
  if (!cyc) return txns;
  return txns.filter(t => t.date >= cyc.start && t.date <= cyc.end);
}

function exportCSV(txns, cats, cycleLabel) {
  const rows = [["Date", "Type", "Category", "Sub-category", "Note", "Amount"]];
  txns.forEach(t => {
    const cat = getCat(cats, t.categoryId);
    const parent = cat?.parentId ? getCat(cats, cat.parentId) : null;
    rows.push([t.date, t.type, parent?.name || cat?.name || "", cat?.parentId ? cat.name : "", t.note, t.amount]);
  });
  const csv = rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `transactions-${cycleLabel}.csv`; a.click();
  URL.revokeObjectURL(url);
}

/* ─── SVG ICONS ──────────────────────────────────────────────────────────── */
const Ico = {
  edit: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
  trash: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>,
  home: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
  budget: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>,
  goal: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>,
  chart: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>,
  cog: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>,
  plus: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
  check: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
  search: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>,
  close: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
  img: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>,
  sun: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>,
  moon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>,
  download: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>,
  chevron: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>),
};

/* ─── CSS ────────────────────────────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500;9..144,600;9..144,700&family=DM+Sans:wght@300;400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}

/* ── Light tokens ── */
:root {
  --cream:#f6f2ec; --paper:#fdfaf6; --stone1:#ece6dc; --stone2:#d5cdc0; --stone3:#b3a99a;
  --ink:#28231e; --ink2:#5a5047; --ink3:#9a8e82;
  --terra:#b85c42; --terra-light:#f5e8e3;
  --sage:#3a7d5c; --sage-light:#e0f0e8;
  --income:#2e7d4f; --expense:#a84832;
  --warn:#b07820; --warn-light:#fef3dc;
  --r:14px; --rs:9px;
  --display:'Fraunces',Georgia,serif; --body:'DM Sans',sans-serif;
  --sh:0 1px 4px rgba(40,35,30,.07),0 4px 16px rgba(40,35,30,.06);
}

/* ── Dark tokens ── */
[data-theme="dark"] {
  --cream:#1a1610; --paper:#221e17; --stone1:#332c22; --stone2:#4a4030; --stone3:#6b5e4a;
  --ink:#f0ebe3; --ink2:#c8bfb2; --ink3:#8a7e6e;
  --terra:#d4724e; --terra-light:#3a2419;
  --sage:#4a9e72; --sage-light:#1a3228;
  --income:#4aaa6e; --expense:#d46050;
  --warn:#d4a040; --warn-light:#332810;
  --sh:0 1px 4px rgba(0,0,0,.3),0 4px 16px rgba(0,0,0,.25);
}

html,body,#root{height:100%;background:var(--cream);font-family:var(--body);color:var(--ink);}
button{font-family:var(--body);cursor:pointer;border:none;background:none;}
input,select,textarea{font-family:var(--body);}
::-webkit-scrollbar{width:3px;}
::-webkit-scrollbar-thumb{background:var(--stone2);border-radius:3px;}

/* ── Shell ── */
.shell{display:flex;height:100%;background:var(--cream);}
.sidebar{display:none;}
.bottom-nav{
  position:fixed;bottom:0;left:0;right:0;
  background:var(--paper);border-top:1px solid var(--stone1);
  display:flex;z-index:50;padding-bottom:env(safe-area-inset-bottom,0);
  box-shadow:0 -2px 12px rgba(40,35,30,.07);
}
.main-col{flex:1;display:flex;flex-direction:column;min-height:100%;overflow:hidden;}
.topbar{background:var(--paper);border-bottom:1px solid var(--stone1);padding:12px 16px 10px;flex-shrink:0;}
.topbar-row1{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;}
.topbar-cycle-label{font-size:10px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:var(--ink3);}
.topbar-title{font-family:var(--display);font-size:21px;font-weight:600;color:var(--ink);line-height:1;}
.cycle-pills{display:flex;gap:5px;overflow-x:auto;padding-bottom:2px;}
.cycle-pills::-webkit-scrollbar{display:none;}
.cycle-pill{
  border:1.5px solid var(--stone2);background:transparent;color:var(--ink3);
  padding:4px 11px;border-radius:99px;font-size:11px;font-weight:600;
  white-space:nowrap;flex-shrink:0;transition:all .1s;cursor:pointer;
}
.cycle-pill.active{background:var(--terra);border-color:var(--terra);color:#fff;}
.scroll-area{flex:1;overflow-y:auto;padding:14px 16px 92px;}

@media(min-width:720px){
  .bottom-nav{display:none;}
  .sidebar{
    display:flex;flex-direction:column;
    width:220px;min-width:220px;background:var(--paper);
    border-right:1px solid var(--stone1);padding:28px 0 24px;
  }
  .sidebar-brand{padding:0 22px 24px;font-family:var(--display);font-size:17px;font-weight:600;color:var(--ink);border-bottom:1px solid var(--stone1);margin-bottom:12px;}
  .sidebar-brand span{color:var(--terra);}
  .sidebar-nav-item{display:flex;align-items:center;gap:11px;padding:10px 22px;color:var(--ink3);font-size:13.5px;font-weight:500;border-left:2.5px solid transparent;transition:all .12s;}
  .sidebar-nav-item:hover{color:var(--ink);background:var(--cream);}
  .sidebar-nav-item.active{color:var(--terra);background:var(--terra-light);border-left-color:var(--terra);}
  .sidebar-cycle{margin-top:auto;padding:16px 22px 0;font-size:11px;color:var(--ink3);line-height:1.7;border-top:1px solid var(--stone1);}
  .scroll-area{padding:20px 28px 32px;}
  .topbar{padding:16px 28px 12px;}
  .topbar-title{font-size:24px;}
}

/* ── Nav tab ── */
.nav-tab{flex:1;display:flex;flex-direction:column;align-items:center;padding:8px 4px 6px;color:var(--ink3);font-size:9px;font-weight:600;letter-spacing:.5px;text-transform:uppercase;gap:3px;transition:color .12s;}
.nav-tab.active{color:var(--terra);}

/* ── FAB ── */
.fab{position:fixed;bottom:72px;right:18px;width:50px;height:50px;border-radius:15px;background:var(--terra);color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 20px rgba(184,92,66,.4);z-index:60;transition:transform .22s cubic-bezier(.4,0,.2,1),opacity .22s cubic-bezier(.4,0,.2,1);border:none;cursor:pointer;}
.fab:active{transform:scale(.93);}
@media(min-width:720px){.fab{bottom:32px;right:32px;}}

/* ── Hero ── */
.hero{background:var(--paper);border-radius:var(--r);border:1px solid var(--stone1);box-shadow:var(--sh);padding:16px 18px;margin-bottom:14px;}
.hero-row{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px;}
.hero-net{padding-top:12px;border-top:1px solid var(--stone1);display:flex;align-items:center;justify-content:space-between;}
.hero-net-label{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:var(--ink3);}
.hero-net-amt{font-family:var(--display);font-size:22px;font-weight:500;}
.sum-label{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:var(--ink3);margin-bottom:4px;}
.sum-amt{font-family:var(--display);font-size:19px;font-weight:500;line-height:1;}
.sum-amt.inc{color:var(--income);}
.sum-amt.exp{color:var(--expense);}

/* ── Search bar ── */
.search-wrap{position:relative;margin-bottom:12px;}
.search-ico{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--ink3);pointer-events:none;}
.search-input{width:100%;padding:9px 36px 9px 36px;border-radius:var(--rs);border:1.5px solid var(--stone2);background:var(--paper);color:var(--ink);font-size:13.5px;outline:none;transition:border-color .15s;}
.search-input:focus{border-color:var(--terra);}
.search-clear{position:absolute;right:10px;top:50%;transform:translateY(-50%);color:var(--ink3);padding:2px;background:none;border:none;cursor:pointer;}

/* ── Cards & rows ── */
.card{background:var(--paper);border-radius:var(--r);border:1px solid var(--stone1);box-shadow:var(--sh);overflow:hidden;margin-bottom:12px;}
.txn-row{display:flex;align-items:center;gap:11px;padding:10px 14px;border-bottom:1px solid var(--stone1);cursor:pointer;transition:background .1s;}
.txn-row:last-child{border-bottom:none;}
.txn-row:hover{background:var(--cream);}
.txn-icon{width:36px;height:36px;border-radius:11px;display:flex;align-items:center;justify-content:center;font-size:17px;flex-shrink:0;}
.txn-icon-emoji{background:var(--cream);}
.txn-body{flex:1;min-width:0;}
.txn-note{font-size:13px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.txn-sub{font-size:11px;color:var(--ink3);margin-top:2px;display:flex;align-items:center;gap:5px;}
.receipt-chip{display:inline-flex;align-items:center;gap:3px;color:var(--terra);font-size:10px;font-weight:600;cursor:pointer;}
.txn-amt{font-family:var(--display);font-size:14px;font-weight:500;flex-shrink:0;}
.txn-amt.inc{color:var(--income);}
.txn-amt.exp{color:var(--expense);}
.txn-expand{background:var(--cream);padding:9px 14px 11px;border-bottom:1px solid var(--stone1);display:flex;align-items:center;justify-content:space-between;}
.txn-expand-full{font-size:12px;color:var(--ink2);font-family:var(--display);}
.txn-expand-acts{display:flex;gap:6px;}
.act-btn{display:flex;align-items:center;gap:5px;padding:5px 10px;border-radius:7px;font-size:11px;font-weight:600;border:1px solid var(--stone2);background:var(--paper);color:var(--ink2);transition:all .1s;}
.act-btn:hover{background:var(--stone1);}
.act-btn.danger{background:#fce9e5;border-color:#e8bdb5;color:var(--expense);}

/* ── Filter pills ── */
.filter-row{display:flex;gap:6px;margin-bottom:12px;overflow-x:auto;padding-bottom:2px;}
.filter-row::-webkit-scrollbar{display:none;}
.pill{border:1.5px solid var(--stone2);background:transparent;color:var(--ink2);padding:5px 13px;border-radius:99px;font-size:11.5px;font-weight:500;white-space:nowrap;flex-shrink:0;transition:all .1s;cursor:pointer;}
.pill.active{background:var(--terra);border-color:var(--terra);color:#fff;}

/* ── Budget total card ── */
.budget-total-card{background:var(--paper);border-radius:var(--r);border:1px solid var(--stone1);box-shadow:var(--sh);padding:14px 18px;margin-bottom:12px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;}
.bt-cell{text-align:center;}
.bt-label{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.8px;color:var(--ink3);margin-bottom:4px;}
.bt-val{font-family:var(--display);font-size:17px;font-weight:500;}

/* ── Budget blocks ── */
.bblock{background:var(--paper);border:1px solid var(--stone1);border-radius:var(--r);box-shadow:var(--sh);margin-bottom:10px;overflow:hidden;}
.bblock-head{padding:12px 14px;background:var(--cream);border-bottom:1px solid var(--stone1);display:flex;align-items:center;gap:9px;}
.bblock-head-icon{font-size:18px;}
.bblock-head-name{font-size:14px;font-weight:600;flex:1;}
.bblock-head-total{font-family:var(--display);font-size:13px;color:var(--ink2);}
.bsub{padding:11px 14px;border-bottom:1px solid var(--stone1);}
.bsub:last-child{border-bottom:none;}
.bsub-inactive{opacity:.4;}
.bsub-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:7px;}
.bsub-name{font-size:13px;font-weight:500;display:flex;align-items:center;gap:6px;}
.bsub-acts{display:flex;align-items:center;gap:5px;}
.bsub-toggle{display:flex;align-items:center;gap:4px;font-size:11px;font-weight:600;padding:4px 8px;border-radius:6px;border:1px solid var(--stone2);color:var(--ink3);background:var(--paper);transition:all .1s;cursor:pointer;}
.bsub-toggle.on{background:var(--sage-light);border-color:var(--sage);color:var(--sage);}
.bsub-note{font-size:11px;color:var(--ink3);font-style:italic;margin-top:5px;}
.track{height:5px;background:var(--stone1);border-radius:99px;overflow:hidden;}
.track-fill{height:100%;border-radius:99px;transition:width .4s cubic-bezier(.4,0,.2,1);}
.track-status{font-size:10.5px;margin-top:4px;}
.over-badge{display:inline-flex;align-items:center;background:#fce9e5;color:var(--expense);font-size:10px;font-weight:700;border-radius:5px;padding:1px 6px;margin-right:4px;}

/* ── Sparkline ── */
.sparkline-wrap{margin-top:8px;padding-top:8px;border-top:1px dashed var(--stone1);}
.sparkline-label{font-size:10px;color:var(--ink3);font-weight:600;text-transform:uppercase;letter-spacing:.8px;margin-bottom:4px;}

/* ── Charts ── */
.chart-card{background:var(--paper);border:1px solid var(--stone1);border-radius:var(--r);box-shadow:var(--sh);padding:16px 12px;margin-bottom:12px;}
.chart-title{font-family:var(--display);font-size:15px;font-weight:500;margin-bottom:12px;}
.stats-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px;}
.stat-box{background:var(--paper);border:1px solid var(--stone1);border-radius:var(--r);padding:11px;box-shadow:var(--sh);text-align:center;}
.stat-val{font-family:var(--display);font-size:16px;font-weight:500;line-height:1.1;}
.stat-lbl{font-size:9px;text-transform:uppercase;letter-spacing:.8px;color:var(--ink3);margin-top:4px;font-weight:600;}

/* ── Goals ── */
.goal-card{background:var(--paper);border:1px solid var(--stone1);border-radius:var(--r);box-shadow:var(--sh);padding:16px;margin-bottom:10px;}
.goal-head{display:flex;align-items:center;gap:10px;margin-bottom:12px;}
.goal-icon-box{width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;}
.goal-name{font-size:15px;font-weight:600;flex:1;}
.goal-acts{display:flex;gap:5px;}
.goal-amounts{display:flex;justify-content:space-between;font-size:12px;color:var(--ink3);margin-bottom:6px;}
.goal-saved{font-family:var(--display);font-size:14px;color:var(--ink);font-weight:500;}
.goal-target{font-family:var(--display);font-size:12px;}
.goal-deadline{font-size:10.5px;color:var(--ink3);margin-top:5px;}
.goal-contrib-row{margin-top:10px;padding-top:10px;border-top:1px solid var(--stone1);display:flex;gap:8px;align-items:center;}
.contrib-input{flex:1;padding:7px 10px;border-radius:var(--rs);border:1.5px solid var(--stone2);background:var(--cream);color:var(--ink);font-size:13px;outline:none;}
.contrib-input:focus{border-color:var(--terra);}
.contrib-btn{padding:7px 14px;border-radius:var(--rs);background:var(--terra);color:#fff;font-size:12px;font-weight:600;border:none;cursor:pointer;}

/* ── Settings ── */
.setting-row{display:flex;align-items:center;justify-content:space-between;padding:14px 0;border-bottom:1px solid var(--stone1);}
.setting-row:last-child{border-bottom:none;}
.setting-lbl{font-size:14px;font-weight:500;}
.setting-desc{font-size:11px;color:var(--ink3);margin-top:2px;}
.toggle-wrap{position:relative;width:42px;height:23px;flex-shrink:0;}
.toggle-wrap input{opacity:0;width:0;height:0;}
.toggle-slider{position:absolute;inset:0;background:var(--stone2);border-radius:99px;cursor:pointer;transition:.18s;}
.toggle-wrap input:checked+.toggle-slider{background:var(--terra);}
.toggle-slider::before{content:'';position:absolute;width:17px;height:17px;left:3px;top:3px;background:#fff;border-radius:50%;transition:.18s;box-shadow:0 1px 4px rgba(40,35,30,.2);}
.toggle-wrap input:checked+.toggle-slider::before{transform:translateX(19px);}

/* ── Category list ── */
.cat-section-hd{display:flex;align-items:center;justify-content:space-between;margin:16px 0 8px;}
.cat-section-title{font-family:var(--display);font-size:15px;font-weight:500;}
.add-btn{border:1.5px solid var(--terra);color:var(--terra);border-radius:7px;padding:5px 12px;font-size:12px;font-weight:600;background:transparent;cursor:pointer;}
.cat-row{display:flex;align-items:center;gap:10px;padding:10px 13px;border-bottom:1px solid var(--stone1);}
.cat-row:last-child{border-bottom:none;}
.cat-icon-box{width:34px;height:34px;border-radius:10px;background:var(--cream);display:flex;align-items:center;justify-content:center;font-size:17px;flex-shrink:0;}
.sub-color-swatch{width:28px;height:28px;border-radius:8px;flex-shrink:0;}
.cat-name{font-size:13px;font-weight:500;}
.cat-meta{font-size:11px;color:var(--ink3);margin-top:1px;}
.cat-chip{font-size:10px;font-weight:600;padding:2px 7px;border-radius:99px;}
.cat-chip.inc{background:var(--sage-light);color:var(--sage);}
.cat-chip.exp{background:var(--terra-light);color:var(--terra);}
.cat-acts{display:flex;gap:5px;margin-left:auto;}
.icon-btn{display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:7px;background:var(--stone1);color:var(--ink2);transition:all .1s;border:none;cursor:pointer;}
.icon-btn:hover{background:var(--stone2);}
.icon-btn.del{background:#fce9e5;color:var(--expense);}

/* ── Modal sheet ── */
.overlay{position:fixed;inset:0;background:rgba(20,16,10,.55);z-index:200;display:flex;align-items:flex-end;backdrop-filter:blur(3px);}
@media(min-width:720px){.overlay{align-items:center;justify-content:center;} .sheet{border-radius:18px !important;max-width:460px;margin:0 auto;}}
.sheet{background:var(--paper);width:100%;border-radius:20px 20px 0 0;padding:16px 18px 26px;max-height:92vh;overflow-y:auto;animation:slideUp .2s cubic-bezier(.4,0,.2,1);}
@keyframes slideUp{from{transform:translateY(36px);opacity:0;}to{transform:translateY(0);opacity:1;}}
.sheet-handle{width:34px;height:4px;background:var(--stone2);border-radius:99px;margin:0 auto 14px;}
.sheet-title{font-family:var(--display);font-size:18px;font-weight:600;margin-bottom:16px;}
.field{margin-bottom:12px;}
.field-label{font-size:10.5px;font-weight:600;text-transform:uppercase;letter-spacing:.7px;color:var(--ink3);margin-bottom:5px;display:block;}
.field-input{width:100%;padding:9px 38px 9px 12px;border-radius:var(--rs);border:1.5px solid var(--stone2);background:var(--cream);color:var(--ink);font-size:14px;outline:none;transition:border-color .15s;}
.field-input:focus{border-color:var(--terra);}
.field-row{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
.select-wrap{
  position:relative;
}

.select-wrap .field-input{
  padding-right:38px;
    appearance:none;
  -webkit-appearance:none;
  -moz-appearance:none;
}

.select-arrow{
  position:absolute;
  inset:0 12px 0 auto;
  pointer-events:none;
  color:var(--ink3);
  display:flex;
  align-items:center;
  justify-content:center;
}
.type-toggle{display:grid;grid-template-columns:1fr 1fr;gap:7px;}
.type-btn{padding:9px;border-radius:var(--rs);border:1.5px solid var(--stone2);background:transparent;color:var(--ink2);font-size:13px;font-weight:600;transition:all .12s;cursor:pointer;}
.type-btn.inc.on{background:var(--sage-light);border-color:var(--sage);color:var(--sage);}
.type-btn.exp.on{background:var(--terra-light);border-color:var(--terra);color:var(--terra);}
.sheet-btns{display:flex;gap:8px;margin-top:16px;}
.btn{flex:1;padding:11px;border-radius:var(--rs);font-size:14px;font-weight:600;transition:all .12s;border:none;cursor:pointer;}
.btn-primary{background:var(--terra);color:#fff;}
.btn-ghost{background:var(--stone1);color:var(--ink2);}
.btn-danger{background:#fce9e5;color:var(--expense);border:1px solid #e8bdb5;}

/* ── Receipt preview overlay ── */
.receipt-overlay{position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:300;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;}
.receipt-overlay-close{position:absolute;top:16px;right:16px;color:#fff;background:rgba(255,255,255,.15);border:none;border-radius:8px;width:36px;height:36px;display:flex;align-items:center;justify-content:center;cursor:pointer;}
.receipt-overlay-title{color:#fff;font-size:13px;font-weight:600;margin-bottom:12px;opacity:.7;}
.receipt-img{max-width:100%;max-height:80vh;border-radius:10px;object-fit:contain;}

/* ── Misc ── */
.section-lbl{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:1.2px;color:var(--ink3);margin:14px 0 8px;}
.empty-state{text-align:center;padding:32px 20px;color:var(--ink3);font-size:13px;}
.emoji-grid{display:flex;flex-wrap:wrap;gap:5px;margin-top:5px;}
.emoji-opt{font-size:19px;padding:5px;border-radius:8px;border:2px solid transparent;background:var(--cream);cursor:pointer;transition:border-color .1s;}
.emoji-opt.on{border-color:var(--terra);}
.color-grid{display:flex;flex-wrap:wrap;gap:6px;margin-top:5px;}
.color-sw{width:26px;height:26px;border-radius:7px;border:2.5px solid transparent;cursor:pointer;transition:all .1s;}
.color-sw.on{border-color:var(--ink);transform:scale(1.1);}
.export-btn{display:flex;align-items:center;gap:7px;padding:9px 14px;border-radius:var(--rs);background:var(--terra-light);border:1.5px solid var(--terra);color:var(--terra);font-size:13px;font-weight:600;cursor:pointer;transition:all .1s;width:100%;}
.export-btn:hover{background:var(--terra);color:#fff;}
`;

/* ─── TXN ICON ───────────────────────────────────────────────────────────── */
function TxnIcon({ cat }) {
  if (!cat) return <div className="txn-icon txn-icon-emoji">?</div>;
  if (!cat.parentId) return <div className="txn-icon txn-icon-emoji">{cat.icon || "?"}</div>;
  return (
    <div className="txn-icon" style={{ background: cat.color + "22", border: `2px solid ${cat.color}44` }}>
      <div style={{ width: 14, height: 14, borderRadius: 4, background: cat.color }} />
    </div>
  );
}

/* ─── RECEIPT PREVIEW ────────────────────────────────────────────────────── */
function ReceiptPreview({ src, name, onClose, t }) {
  const isImg = src?.startsWith("data:image");
  return (
    <div className="receipt-overlay" onClick={onClose}>
      <button className="receipt-overlay-close" onClick={onClose}>{Ico.close}</button>
      <div className="receipt-overlay-title">{t.receiptPreview}</div>
      {isImg
        ? <img className="receipt-img" src={src} alt="receipt" onClick={e => e.stopPropagation()} />
        : <div style={{ color: "#fff", fontSize: 14, opacity: .8 }}>{name || t.noReceipt}</div>
      }
    </div>
  );
}

/* ─── TRANSACTION MODAL ──────────────────────────────────────────────────── */
function TxnModal({ onClose, onSave, categories, initial, t }) {
  const [type, setType] = useState(initial?.type || "expense");
  const [amount, setAmt] = useState(initial?.amount?.toString() || "");
  const [catId, setCat] = useState(initial?.categoryId?.toString() || "");
  const [note, setNote] = useState(initial?.note || "");
  const [date, setDate] = useState(initial?.date || new Date().toISOString().slice(0, 10));
  const [receipt, setReceipt] = useState(initial?.receipt || null); // {src, name}

  const cats = categories.filter(c => c.type === type);
  const parents = cats.filter(c => !c.parentId);

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setReceipt({ src: ev.target.result, name: file.name });
    reader.readAsDataURL(file);
  }

  function save() {
    if (!amount || !catId || !date) return;
    onSave({ id: initial?.id || uid++, type, amount: parseInt(amount), categoryId: parseInt(catId), note, date, receipt });
    onClose();
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="sheet-title">{initial ? t.editTransaction : t.newTransaction}</div>
        <div className="field">
          <div className="type-toggle">
            <button className={`type-btn inc ${type === "income" ? "on" : ""}`} onClick={() => { setType("income"); setCat(""); }}>+ {t.income}</button>
            <button className={`type-btn exp ${type === "expense" ? "on" : ""}`} onClick={() => { setType("expense"); setCat(""); }}>− {t.expense}</button>
          </div>
        </div>
        <div className="field-row">
          <div className="field">
            <label className="field-label">{t.amount}</label>
            <input className="field-input" type="number" value={amount} onChange={e => setAmt(e.target.value)} placeholder="0" />
          </div>
          <div className="field">
            <label className="field-label">{t.date}</label>
            <input className="field-input" type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
        </div>
        <div className="field">
          <label className="field-label">{t.category}</label>
          <div className="select-wrap">
            <select className="field-input" value={catId} onChange={e => setCat(e.target.value)}>
              <option value="">{t.selectCat}</option>
              {parents.map(p => {
                const subs = cats.filter(c => c.parentId === p.id);
                return subs.length > 0
                  ? <optgroup key={p.id} label={`${p.icon || ""} ${p.name}`}>
                    {subs.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </optgroup>
                  : <option key={p.id} value={p.id}>{p.icon || ""} {p.name}</option>;
              })}
            </select>
            <div className="select-arrow">
              {Ico.chevron}
            </div></div>
        </div>
        <div className="field">
          <label className="field-label">{t.note}</label>
          <input className="field-input" type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="Optional…" />
        </div>
        <div className="field">
          <label className="field-label">{t.receipt}</label>
          {receipt
            ? <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ fontSize: 12, color: "var(--terra)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{receipt.name}</div>
              <button className="icon-btn del" onClick={() => setReceipt(null)}>{Ico.close}</button>
            </div>
            : <input className="field-input" type="file" accept="image/*,application/pdf" onChange={handleFile} />
          }
        </div>
        <div className="sheet-btns">
          <button className="btn btn-ghost" onClick={onClose}>{t.cancel}</button>
          <button className="btn btn-primary" onClick={save}>{t.save}</button>
        </div>
      </div>
    </div>
  );
}

/* ─── CATEGORY MODAL ─────────────────────────────────────────────────────── */
function CatModal({ onClose, onSave, categories, initial, t }) {
  const [name, setName] = useState(initial?.name || "");
  const [type, setType] = useState(initial?.type || "expense");
  const [icon, setIcon] = useState(initial?.icon || "🛒");
  const [color, setColor] = useState(initial?.color || COLOR_OPTIONS[0]);
  const [parentId, setPar] = useState(initial?.parentId?.toString() || "");

  const parentOpts = categories.filter(c => c.type === type && !c.parentId && c.id !== initial?.id);
  const isSub = !!parentId;

  function save() {
    if (!name) return;
    onSave({ id: initial?.id || uid++, name, type, icon: isSub ? undefined : icon, color, parentId: parentId ? parseInt(parentId) : null });
    onClose();
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="sheet-title">{initial ? t.editCategory : t.addCategory}</div>
        <div className="field">
          <div className="type-toggle">
            <button className={`type-btn inc ${type === "income" ? "on" : ""}`} onClick={() => { setType("income"); setPar(""); }}>{t.income}</button>
            <button className={`type-btn exp ${type === "expense" ? "on" : ""}`} onClick={() => { setType("expense"); setPar(""); }}>{t.expense}</button>
          </div>
        </div>
        <div className="field">
          <label className="field-label">{t.parent}</label>
          <div className="select-wrap">
            <select className="field-input" value={parentId} onChange={e => setPar(e.target.value)}>
              <option value="">{t.noneTopLevel}</option>
              {parentOpts.map(p => <option key={p.id} value={p.id}>{p.icon || ""} {p.name}</option>)}
            </select>
            <div className="select-arrow">
              {Ico.chevron}
            </div>
          </div>
        </div>
        <div className="field">
          <label className="field-label">{t.category}</label>
          <input className="field-input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Coffee" />
        </div>
        {!isSub
          ? <div className="field"><label className="field-label">{t.icon}</label>
            <div className="emoji-grid">{EMOJI_OPTIONS.map(e => <button key={e} className={`emoji-opt ${icon === e ? "on" : ""}`} onClick={() => setIcon(e)}>{e}</button>)}</div>
          </div>
          : <div className="field"><label className="field-label">{t.color}</label>
            <div className="color-grid">{COLOR_OPTIONS.map(c => <div key={c} className={`color-sw ${color === c ? "on" : ""}`} style={{ background: c }} onClick={() => setColor(c)} />)}</div>
          </div>
        }
        <div className="sheet-btns">
          <button className="btn btn-ghost" onClick={onClose}>{t.cancel}</button>
          <button className="btn btn-primary" onClick={save}>{t.save}</button>
        </div>
      </div>
    </div>
  );
}

/* ─── BUDGET MODAL ───────────────────────────────────────────────────────── */
function BudgetModal({ onClose, onSave, budget, catName, t }) {
  const [limit, setLimit] = useState(budget?.limit?.toString() || "");
  const [note, setNote] = useState(budget?.note || "");
  function save() {
    if (!limit) return;
    onSave({ ...budget, limit: parseInt(limit), note });
    onClose();
  }
  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="sheet-title">{t.editBudget} — {catName}</div>
        <div className="field">
          <label className="field-label">{t.limit}</label>
          <input className="field-input" type="number" value={limit} onChange={e => setLimit(e.target.value)} placeholder="0" />
        </div>
        <div className="field">
          <label className="field-label">{t.budgetNote}</label>
          <input className="field-input" type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. paid on 8th" />
        </div>
        <div className="sheet-btns">
          <button className="btn btn-ghost" onClick={onClose}>{t.cancel}</button>
          <button className="btn btn-primary" onClick={save}>{t.save}</button>
        </div>
      </div>
    </div>
  );
}

/* ─── GOAL MODAL ─────────────────────────────────────────────────────────── */
function GoalModal({ onClose, onSave, initial, t }) {
  const [name, setName] = useState(initial?.name || "");
  const [icon, setIcon] = useState(initial?.icon || "🎯");
  const [color, setColor] = useState(initial?.color || COLOR_OPTIONS[3]);
  const [target, setTarget] = useState(initial?.target?.toString() || "");
  const [saved, setSaved] = useState(initial?.saved?.toString() || "0");
  const [deadline, setDeadline] = useState(initial?.deadline || "");

  function save() {
    if (!name || !target) return;
    onSave({ id: initial?.id || uid++, name, icon, color, target: parseInt(target), saved: parseInt(saved) || 0, deadline: deadline || null });
    onClose();
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="sheet-title">{initial ? t.editGoal : t.newGoal}</div>
        <div className="field">
          <label className="field-label">{t.goalName}</label>
          <input className="field-input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Vacation" />
        </div>
        <div className="field-row">
          <div className="field">
            <label className="field-label">{t.target}</label>
            <input className="field-input" type="number" value={target} onChange={e => setTarget(e.target.value)} placeholder="0" />
          </div>
          <div className="field">
            <label className="field-label">{t.saved}</label>
            <input className="field-input" type="number" value={saved} onChange={e => setSaved(e.target.value)} placeholder="0" />
          </div>
        </div>
        <div className="field">
          <label className="field-label">{t.deadline}</label>
          <input className="field-input" type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
        </div>
        <div className="field"><label className="field-label">{t.goalIcon}</label>
          <div className="emoji-grid">{EMOJI_OPTIONS.map(e => <button key={e} className={`emoji-opt ${icon === e ? "on" : ""}`} onClick={() => setIcon(e)}>{e}</button>)}</div>
        </div>
        <div className="field"><label className="field-label">{t.goalColor}</label>
          <div className="color-grid">{COLOR_OPTIONS.map(c => <div key={c} className={`color-sw ${color === c ? "on" : ""}`} style={{ background: c }} onClick={() => setColor(c)} />)}</div>
        </div>
        <div className="sheet-btns">
          <button className="btn btn-ghost" onClick={onClose}>{t.cancel}</button>
          <button className="btn btn-primary" onClick={save}>{t.save}</button>
        </div>
      </div>
    </div>
  );
}

/* ─── CONFIRM MODAL ──────────────────────────────────────────────────────── */
function ConfirmModal({ onClose, onConfirm, title, body, t }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="sheet-title">{title}</div>
        <p style={{ fontSize: 13, color: "var(--ink2)", lineHeight: 1.6, marginBottom: 8 }}>{body}</p>
        <div className="sheet-btns">
          <button className="btn btn-ghost" onClick={onClose}>{t.cancel}</button>
          <button className="btn btn-danger" onClick={onConfirm}>{t.delete}</button>
        </div>
      </div>
    </div>
  );
}

/* ─── TXN LIST ───────────────────────────────────────────────────────────── */
function TxnList({ txns, setTxns, categories, t }) {
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [modal, setModal] = useState(null);
  const [preview, setPreview] = useState(null);

  const list = useMemo(() => {
    const q = query.toLowerCase();
    return [...txns]
      .filter(x => filter === "all" || x.type === filter)
      .filter(x => {
        if (!q) return true;
        const cat = getCat(categories, x.categoryId);
        const par = cat?.parentId ? getCat(categories, cat.parentId) : null;
        return (x.note || "").toLowerCase().includes(q)
          || (cat?.name || "").toLowerCase().includes(q)
          || (par?.name || "").toLowerCase().includes(q);
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [txns, filter, query]);

  function catLabel(cat) {
    if (!cat) return "—";
    if (cat.parentId) {
      const par = getCat(categories, cat.parentId);
      return par ? `${par.name} - ${cat.name}` : cat.name;
    }
    return cat.name;
  }

  function save(txn) {
    setTxns(prev => {
      const i = prev.findIndex(x => x.id === txn.id);
      return i >= 0 ? prev.map(x => x.id === txn.id ? txn : x) : [txn, ...prev];
    });
  }

  return (
    <>
      {/* Search */}
      <div className="search-wrap">
        <span className="search-ico">{Ico.search}</span>
        <input className="search-input" value={query} onChange={e => setQuery(e.target.value)} placeholder={t.search} />
        {query && <button className="search-clear" onClick={() => setQuery("")}>{Ico.close}</button>}
      </div>

      <div className="filter-row">
        {["all", "income", "expense"].map(f => (
          <button key={f} className={`pill ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
            {f === "all" ? t.all : f === "income" ? t.income : t.expense}
          </button>
        ))}
      </div>

      <div className="card">
        {list.length === 0 && <div className="empty-state">{t.noTxns}</div>}
        {list.map(x => {
          const cat = getCat(categories, x.categoryId);
          const open = expanded === x.id;
          return (
            <div key={x.id}>
              <div className="txn-row" onClick={() => setExpanded(open ? null : x.id)}>
                <TxnIcon cat={cat} />
                <div className="txn-body">
                  <div className="txn-note">{x.note || cat?.name}</div>
                  <div className="txn-sub">
                    <span>{catLabel(cat)} · {x.date}</span>
                    {x.receipt && (
                      <span className="receipt-chip" onClick={e => { e.stopPropagation(); setPreview(x.receipt); }}>
                        {Ico.img} {t.receipt}
                      </span>
                    )}
                  </div>
                </div>
                <div className={`txn-amt ${x.type === "income" ? "inc" : "exp"}`}>
                  {x.type === "income" ? "+" : "−"}{fmtShort(x.amount)}
                </div>
              </div>
              {open && (
                <div className="txn-expand">
                  <div className="txn-expand-full">{fmt(x.amount)}</div>
                  <div className="txn-expand-acts">
                    <button className="act-btn" onClick={() => { setModal(x); setExpanded(null); }}>{Ico.edit} Edit</button>
                    <button className="act-btn danger" onClick={() => { setTxns(p => p.filter(y => y.id !== x.id)); setExpanded(null); }}>{Ico.trash} {t.delete}</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {modal && <TxnModal categories={categories} initial={modal} t={t} onClose={() => setModal(null)} onSave={save} />}
      {preview && <ReceiptPreview src={preview.src} name={preview.name} t={t} onClose={() => setPreview(null)} />}
    </>
  );
}

/* ─── PAGES ──────────────────────────────────────────────────────────────── */
function Dashboard({ txns, setTxns, categories, t }) {
  const income = txns.filter(x => x.type === "income").reduce((s, x) => s + x.amount, 0);
  const expense = txns.filter(x => x.type === "expense").reduce((s, x) => s + x.amount, 0);
  const net = income - expense;
  return (
    <div>
      <div className="hero">
        <div className="hero-row">
          <div><div className="sum-label">{t.income}</div><div className="sum-amt inc">{fmtShort(income)}</div></div>
          <div><div className="sum-label">{t.expense}</div><div className="sum-amt exp">{fmtShort(expense)}</div></div>
        </div>
        <div className="hero-net">
          <span className="hero-net-label">{t.netBalance}</span>
          <span className="hero-net-amt" style={{ color: net >= 0 ? "var(--income)" : "var(--expense)" }}>
            {net >= 0 ? "+" : "−"}{fmtShort(Math.abs(net))}
          </span>
        </div>
      </div>
      <p className="section-lbl">{t.transactions}</p>
      <TxnList txns={txns} setTxns={setTxns} categories={categories} t={t} />
    </div>
  );
}

function Budgets({ allTxns, categories, cycleId, t }) {
  const [budgets, setBudgets] = useState(INITIAL_BUDGETS);
  const [editBudget, setEditBudget] = useState(null);

  const txns = txnsInCycle(allTxns, cycleId);
  const parents = categories.filter(c => !c.parentId && c.type === "expense");

  function spentFor(catId, txnSet) {
    const subs = categories.filter(c => c.parentId === catId);
    if (subs.length) return subs.reduce((s, c) => s + spentFor(c.id, txnSet), 0);
    return txnSet.filter(tx => tx.categoryId === catId && tx.type === "expense").reduce((s, tx) => s + tx.amount, 0);
  }
  function budgetFor(catId) { return budgets.find(b => b.categoryId === catId); }
  function toggleActive(bid) { setBudgets(prev => prev.map(b => b.id === bid ? { ...b, active: !b.active } : b)); }
  function saveBudget(upd) { setBudgets(prev => prev.map(b => b.id === upd.id ? upd : b)); }

  const grandSpent = budgets.filter(b => b.active).reduce((s, b) => s + spentFor(b.categoryId, txns), 0);
  const grandLimit = budgets.filter(b => b.active).reduce((s, b) => s + b.limit, 0);
  const grandLeft = Math.max(grandLimit - grandSpent, 0);

  // Build sparkline data for a parent category (last 5 cycles)
  function sparkData(parentCat) {
    const subs = categories.filter(c => c.parentId === parentCat.id);
    return CYCLES.slice(-5).map(cyc => {
      const cycTxns = txnsInCycle(allTxns, cyc.id);
      const total = subs.length
        ? subs.reduce((s, c) => s + spentFor(c.id, cycTxns), 0)
        : spentFor(parentCat.id, cycTxns);
      return { cycle: cyc.label.split(" ")[0], val: total };
    });
  }

  function BudgetBar({ spent, budget }) {
    if (!budget) return <div style={{ fontSize: 11, color: "var(--ink3)" }}>{t.noLimit}</div>;
    if (!budget.active) return <div style={{ fontSize: 11, color: "var(--ink3)" }}>{t.excluded}</div>;
    const lim = budget.limit, pct = Math.min((spent / lim) * 100, 100);
    const over = spent > lim, warn = pct >= 80;
    const fill = over ? "var(--expense)" : warn ? "var(--warn)" : "var(--sage)";
    return (
      <>
        <div className="track"><div className="track-fill" style={{ width: `${pct}%`, background: fill }} /></div>
        <div className="track-status" style={{ color: over ? "var(--expense)" : warn ? "var(--warn)" : "var(--ink3)" }}>
          {over
            ? <><span className="over-badge">{t.over}</span>{fmtShort(spent - lim)} {t.overLimit}</>
            : `${fmtShort(spent)} ${t.of} ${fmtShort(lim)} — ${pct.toFixed(0)}%`}
        </div>
        {budget.note ? <div className="bsub-note">{budget.note}</div> : null}
      </>
    );
  }

  return (
    <div>
      <div className="budget-total-card">
        <div className="bt-cell"><div className="bt-label">{t.budgeted}</div><div className="bt-val">{fmtShort(grandLimit)}</div></div>
        <div className="bt-cell"><div className="bt-label">{t.spent}</div><div className="bt-val" style={{ color: "var(--expense)" }}>{fmtShort(grandSpent)}</div></div>
        <div className="bt-cell"><div className="bt-label">{t.remaining}</div><div className="bt-val" style={{ color: grandLeft > 0 ? "var(--income)" : "var(--expense)" }}>{fmtShort(grandLeft)}</div></div>
      </div>

      {parents.map(p => {
        const subs = categories.filter(c => c.parentId === p.id);
        const totalSpent = spentFor(p.id, txns);
        const activeBdgs = subs.length ? subs.map(s => budgetFor(s.id)).filter(b => b?.active) : [budgetFor(p.id)].filter(b => b?.active);
        const totalLimit = activeBdgs.reduce((s, b) => s + (b?.limit || 0), 0);
        const spark = sparkData(p);

        return (
          <div className="bblock" key={p.id}>
            <div className="bblock-head">
              <span className="bblock-head-icon">{p.icon || "•"}</span>
              <span className="bblock-head-name">{p.name}</span>
              <span className="bblock-head-total">{fmtShort(totalSpent)}{totalLimit > 0 ? ` / ${fmtShort(totalLimit)}` : ""}</span>
            </div>

            {(subs.length > 0 ? subs : [p]).map(item => {
              const b = budgetFor(item.id);
              const sp = spentFor(item.id, txns);
              return (
                <div className={`bsub ${b && !b.active ? "bsub-inactive" : ""}`} key={item.id}>
                  <div className="bsub-top">
                    <span className="bsub-name">
                      {subs.length > 0 && <div style={{ width: 10, height: 10, borderRadius: 3, background: item.color, flexShrink: 0 }} />}
                      {subs.length > 0 ? item.name : (item.icon || "") + " " + item.name}
                    </span>
                    <div className="bsub-acts">
                      {b && <button className={`bsub-toggle ${b.active ? "on" : ""}`} onClick={() => toggleActive(b.id)}>{b.active ? <>{Ico.check} {t.on}</> : t.off}</button>}
                      {b && <button className="icon-btn" onClick={() => setEditBudget({ budget: b, catName: item.name })}>{Ico.edit}</button>}
                    </div>
                  </div>
                  <BudgetBar spent={sp} budget={b} />
                </div>
              );
            })}

            {/* Spending trend sparkline */}
            <div style={{ padding: "8px 14px 12px" }}>
              <div className="sparkline-label">{t.trend}</div>
              <ResponsiveContainer width="100%" height={88}>
                <LineChart data={spark} margin={{ left: 0, right: 0, top: 2, bottom: 0 }}>
                  <XAxis dataKey="cycle" tick={{ fill: "var(--ink3)", fontSize: 9 }} axisLine={false} tickLine={false} />
                  <Line type="monotone" dataKey="val" stroke={p.color || "var(--terra)"} strokeWidth={2} />
                  <Tooltip formatter={v => fmtShort(v)} contentStyle={{ background: "var(--paper)", border: "1px solid var(--stone1)", borderRadius: 8, fontSize: 11 }} cursor={{ fill: "var(--stone1)" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      })}

      {editBudget && (
        <BudgetModal budget={editBudget.budget} catName={editBudget.catName} t={t}
          onClose={() => setEditBudget(null)} onSave={b => { saveBudget(b); setEditBudget(null); }} />
      )}
    </div>
  );
}

function Goals({ t }) {
  const [goals, setGoals] = useState(INITIAL_GOALS);
  const [modal, setModal] = useState(null);
  const [contribs, setContribs] = useState({}); // goalId -> input string
  const [confirm, setConfirm] = useState(null);

  function saveGoal(g) {
    setGoals(prev => { const i = prev.findIndex(x => x.id === g.id); return i >= 0 ? prev.map(x => x.id === g.id ? g : x) : [...prev, g]; });
  }
  function deleteGoal(id) { setGoals(prev => prev.filter(x => x.id !== id)); setConfirm(null); }
  function contribute(goalId) {
    const amt = parseInt(contribs[goalId] || "0");
    if (!amt) return;
    setGoals(prev => prev.map(g => g.id === goalId ? { ...g, saved: Math.min(g.saved + amt, g.target) } : g));
    setContribs(prev => ({ ...prev, [goalId]: "" }));
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <span className="section-lbl" style={{ margin: 0 }}>{t.goalsTitle}</span>
        <button className="add-btn" onClick={() => setModal({ mode: "add" })}>+ {t.addCat}</button>
      </div>

      {goals.length === 0 && <div className="empty-state">{t.noGoals}</div>}
      {goals.map(g => {
        const pct = Math.min((g.saved / g.target) * 100, 100);
        const done = g.saved >= g.target;
        return (
          <div className="goal-card" key={g.id}>
            <div className="goal-head">
              <div className="goal-icon-box" style={{ background: g.color + "22", border: `2px solid ${g.color}44` }}>{g.icon}</div>
              <div className="goal-name">{g.name}</div>
              <div className="goal-acts">
                <button className="icon-btn" onClick={() => setModal({ mode: "edit", goal: g })}>{Ico.edit}</button>
                <button className="icon-btn del" onClick={() => setConfirm(g)}>{Ico.trash}</button>
              </div>
            </div>

            <div className="goal-amounts">
              <span className="goal-saved">{fmtShort(g.saved)}</span>
              <span className="goal-target">{t.of} {fmtShort(g.target)}</span>
            </div>
            <div className="track">
              <div className="track-fill" style={{ width: `${pct}%`, background: done ? "var(--income)" : g.color }} />
            </div>
            <div className="track-status" style={{ color: done ? "var(--income)" : "var(--ink3)" }}>
              {done ? "✓ Goal reached!" : `${pct.toFixed(0)}% — ${fmtShort(g.target - g.saved)} ${t.remaining}`}
            </div>
            {g.deadline && <div className="goal-deadline">🗓 {g.deadline}</div>}

            {!done && (
              <div className="goal-contrib-row">
                <input className="contrib-input" type="number" placeholder={t.contribAmount}
                  value={contribs[g.id] || ""} onChange={e => setContribs(p => ({ ...p, [g.id]: e.target.value }))} />
                <button className="contrib-btn" onClick={() => contribute(g.id)}>{t.contribute}</button>
              </div>
            )}
          </div>
        );
      })}

      {modal && <GoalModal initial={modal.mode === "edit" ? modal.goal : null} t={t} onClose={() => setModal(null)} onSave={g => { saveGoal(g); setModal(null); }} />}
      {confirm && <ConfirmModal title={t.deleteConfirmTitle(confirm.name)} body={t.deleteConfirmBody} t={t} onClose={() => setConfirm(null)} onConfirm={() => deleteGoal(confirm.id)} />}
    </div>
  );
}

const PIE_COLORS = ["#e85d3a", "#2eaa72", "#6b5fc7", "#e8b84b", "#4a7fc4", "#d45a8a"];

function Reports({ allTxns, categories, cycleId, t }) {
  const txns = txnsInCycle(allTxns, cycleId);
  const income = txns.filter(x => x.type === "income").reduce((s, x) => s + x.amount, 0);
  const expense = txns.filter(x => x.type === "expense").reduce((s, x) => s + x.amount, 0);
  const savings = income > 0 ? (((income - expense) / income) * 100).toFixed(0) : 0;

  const pieData = useMemo(() => {
    const map: Record<string, number> = {};
    txns.filter(x => x.type === "expense").forEach(x => {
      const cat = getCat(categories, x.categoryId); if (!cat) return;
      const par = cat.parentId ? getCat(categories, cat.parentId) : cat;
      map[par.name] = (map[par.name] || 0) + x.amount;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [txns]);

  const trendData = CYCLES.map(cyc => {
    const ct = txnsInCycle(allTxns, cyc.id);
    return {
      cycle: cyc.label.split(" ")[0],
      income: ct.filter(x => x.type === "income").reduce((s, x) => s + x.amount, 0),
      expense: ct.filter(x => x.type === "expense").reduce((s, x) => s + x.amount, 0),
    };
  });

  const topCat = [...pieData].sort((a, b) => b.value - a.value)[0]?.name || "—";
  const avgExp = Math.round(trendData.reduce((s, m) => s + m.expense, 0) / trendData.length);

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-box"><div className="stat-val" style={{ color: "var(--income)" }}>{savings}%</div><div className="stat-lbl">{t.savings}</div></div>
        <div className="stat-box"><div className="stat-val" style={{ fontSize: 12, lineHeight: 1.3 }}>{topCat}</div><div className="stat-lbl">{t.topSpend}</div></div>
        <div className="stat-box"><div className="stat-val">{fmtShort(avgExp)}</div><div className="stat-lbl">{t.avgCycle}</div></div>
      </div>
      <div className="chart-card">
        <div className="chart-title">{t.monthlyOverview}</div>
        <ResponsiveContainer width="100%" height={175}>
          <BarChart data={trendData} barGap={3} margin={{ left: -16 }}>
            <XAxis dataKey="cycle" tick={{ fill: "var(--ink3)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={v => `${(v / 1e6).toFixed(0)}jt`} tick={{ fill: "var(--ink3)", fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip formatter={v => fmt(v)} contentStyle={{ background: "var(--paper)", border: "1px solid var(--stone1)", borderRadius: 10, fontSize: 12, color: "var(--ink)" }} />
            <Bar dataKey="income" fill="var(--income)" radius={[4, 4, 0, 0]} name={t.income} />
            <Bar dataKey="expense" fill="var(--expense)" radius={[4, 4, 0, 0]} name={t.expense} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="chart-card">
        <div className="chart-title">{t.expenseByCategory}</div>
        <ResponsiveContainer width="100%" height={190}>
          <PieChart>
            <Pie data={pieData} cx="50%" cy="50%" outerRadius={72} dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={false} style={{ fontSize: 10 }}>
              {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
            </Pie>
            <Tooltip formatter={v => fmt(v)} contentStyle={{ background: "var(--paper)", border: "1px solid var(--stone1)", borderRadius: 10, fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function Settings({ categories, setCategories, lang, setLang, darkMode, setDarkMode, allTxns, cycleId, t }) {
  const [cycleDay, setCycleDay] = useState(25);
  const [carryOver, setCarryOver] = useState(true);
  const [copyBudgets, setCopyBdg] = useState(true);
  const [exportCycle, setExportCycle] = useState(cycleId);
  const [modal, setModal] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);

  function handleExportCSV() {
    const selectedCycle = CYCLES.find((c) => c.id === exportCycle);
    if (!selectedCycle) return;

    const exportTxns = txnsInCycle(allTxns, exportCycle);

    exportCSV(exportTxns, categories, selectedCycle.label);
  }

  function saveCat(cat) {
    setCategories(prev => { const i = prev.findIndex(c => c.id === cat.id); return i >= 0 ? prev.map(c => c.id === cat.id ? cat : c) : [...prev, cat]; });
  }
  function deleteCat(id) { setCategories(prev => prev.filter(c => c.id !== id && c.parentId !== id)); setConfirmDel(null); }

  function CatGroup({ title, type }) {
    const parents = categories.filter(c => c.type === type && !c.parentId);
    return (
      <>
        <div className="cat-section-hd">
          <span className="cat-section-title">{title}</span>
          <button className="add-btn" onClick={() => setModal({ mode: "add" })}>{t.addCat}</button>
        </div>
        <div className="card">
          {parents.length === 0 && <div className="empty-state">{t.noneYet}</div>}
          {parents.map(p => {
            const subs = categories.filter(c => c.parentId === p.id);
            return (
              <div key={p.id}>
                <div className="cat-row">
                  <div className="cat-icon-box">{p.icon || "?"}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="cat-name" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      {p.name}
                      <span className={`cat-chip ${type === "income" ? "inc" : "exp"}`}>{type === "income" ? t.income : t.expense}</span>
                    </div>
                    {subs.length > 0 && <div className="cat-meta">{subs.length} {t.subCats}</div>}
                  </div>
                  <div className="cat-acts">
                    <button className="icon-btn" onClick={() => setModal({ mode: "edit", cat: p })}>{Ico.edit}</button>
                    <button className="icon-btn del" onClick={() => setConfirmDel(p)}>{Ico.trash}</button>
                  </div>
                </div>
                {subs.map(s => (
                  <div className="cat-row" key={s.id} style={{ paddingLeft: 32, background: "var(--cream)" }}>
                    <div className="sub-color-swatch" style={{ background: s.color, borderRadius: 8 }} />
                    <div style={{ flex: 1 }}><div className="cat-name" style={{ fontSize: 12.5 }}>{s.name}</div></div>
                    <div className="cat-acts">
                      <button className="icon-btn" onClick={() => setModal({ mode: "edit", cat: s })}>{Ico.edit}</button>
                      <button className="icon-btn del" onClick={() => setConfirmDel(s)}>{Ico.trash}</button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </>
    );
  }

  return (
    <div>
      <p className="section-lbl">{t.cycleSetting}</p>
      <div className="card" style={{ padding: "0 16px" }}>
        <div className="setting-row">
          <div><div className="setting-lbl">{t.resetDay}</div><div className="setting-desc">{t.resetDayDesc}</div></div>
          <input className="field-input" type="number" min={1} max={28} value={cycleDay}
            onChange={e => setCycleDay(Number(e.target.value))}
            style={{ width: 58, textAlign: "center", fontFamily: "var(--display)", fontSize: 16, padding: "6px" }} />
        </div>
        <div className="setting-row">
          <div><div className="setting-lbl">{t.carryOver}</div><div className="setting-desc">{t.carryOverDesc}</div></div>
          <label className="toggle-wrap"><input type="checkbox" checked={carryOver} onChange={e => setCarryOver(e.target.checked)} /><span className="toggle-slider" /></label>
        </div>
        <div className="setting-row">
          <div><div className="setting-lbl">{t.copyBudgets}</div><div className="setting-desc">{t.copyBudgetsDesc}</div></div>
          <label className="toggle-wrap"><input type="checkbox" checked={copyBudgets} onChange={e => setCopyBdg(e.target.checked)} /><span className="toggle-slider" /></label>
        </div>
        <div className="setting-row">
          <div><div className="setting-lbl">{t.darkMode}</div><div className="setting-desc">{t.darkModeDesc}</div></div>
          <label className="toggle-wrap"><input type="checkbox" checked={darkMode} onChange={e => setDarkMode(e.target.checked)} /><span className="toggle-slider" /></label>
        </div>
        <div className="setting-row">
          <div><div className="setting-lbl">{t.language}</div></div>
          <div style={{ display: "flex", gap: 6 }}>
            {["en", "id"].map(l => (
              <button key={l} onClick={() => setLang(l)} style={{
                padding: "5px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
                fontFamily: "var(--body)", transition: "all .1s",
                border: `1.5px solid ${lang === l ? "var(--terra)" : "var(--stone2)"}`,
                background: lang === l ? "var(--terra)" : "transparent",
                color: lang === l ? "#fff" : "var(--ink2)",
              }}>{l === "en" ? "English" : "Indonesia"}</button>
            ))}
          </div>
        </div>
      </div>

      <p className="section-lbl">{t.exportCSV}</p>
      <div className="card" style={{ padding: "12px 16px" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <div className="select-wrap"><select className="field-input" value={exportCycle} onChange={(e) => setExportCycle(e.target.value)} style={{ flex: 1 }}>
            {CYCLES.map((c) => (<option key={c.id} value={c.id}>{c.label}</option>))}
          </select>
            <div className="select-arrow">
              {Ico.chevron}
            </div></div>
        </div>

        <div style={{ fontSize: 12, color: "var(--ink3)", marginBottom: 10 }}>
          {t.exportDesc} ({CYCLES.find((c) => c.id === exportCycle)?.label})
        </div>

        <button className="export-btn" onClick={handleExportCSV}>
          {Ico.download}
          {t.exportCSV} —{" "}
          {CYCLES.find((c) => c.id === exportCycle)?.label}
        </button>
      </div>

      <CatGroup title={t.expenseCats} type="expense" />
      <div style={{ height: 6 }} />
      <CatGroup title={t.incomeCats} type="income" />

      {modal && <CatModal categories={categories} initial={modal.mode === "edit" ? modal.cat : null} t={t} onClose={() => setModal(null)} onSave={cat => { saveCat(cat); setModal(null); }} />}
      {confirmDel && <ConfirmModal title={t.deleteConfirmTitle(confirmDel.name)} body={t.deleteConfirmBody} t={t} onClose={() => setConfirmDel(null)} onConfirm={() => deleteCat(confirmDel.id)} />}
    </div>
  );
}

/* ─── APP SHELL ──────────────────────────────────────────────────────────── */
const TAB_IDS = ["dashboard", "budgets", "goals", "reports", "settings"];
const TAB_ICONS = { dashboard: "home", budgets: "budget", goals: "goal", reports: "chart", settings: "cog" };

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [txns, setTxns] = useState(INITIAL_TRANSACTIONS);
  const [cats, setCats] = useState(INITIAL_CATEGORIES);
  const [cycleId, setCycleId] = useState(CURRENT_CYCLE);
  const [fabOpen, setFabOpen] = useState(false);
  const [showFab, setShowFab] = useState(true);
  const [lang, setLang] = useState("en");
  const [darkMode, setDarkMode] = useState(
    typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches
  );
  const scrollRef = useRef(0);

  // Apply dark mode to root
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const t = STRINGS[lang];
  const TAB_LBL = { dashboard: t.home, budgets: t.budgets, goals: t.goals, reports: t.reports, settings: t.settings };
  const cycleTxns = txnsInCycle(txns, cycleId);
  const cycle = CYCLES.find(c => c.id === cycleId);

  function handleScroll(e: React.UIEvent<HTMLDivElement>): void {
    const currentScroll = e.currentTarget.scrollTop;
    const previousScroll = scrollRef.current;

    const isScrollingUp = currentScroll < previousScroll;
    const isNearTop = currentScroll < 40;

    setShowFab(isScrollingUp || isNearTop);

    scrollRef.current = currentScroll;
  }

  return (
    <>
      <style>{CSS}</style>
      <div className="shell">
        {/* Desktop sidebar */}
        <nav className="sidebar">
          <div className="sidebar-brand">Money <span>Tracker</span></div>
          {TAB_IDS.map(id => (
            <button key={id} className={`sidebar-nav-item ${tab === id ? "active" : ""}`} onClick={() => setTab(id)}>
              {Ico[TAB_ICONS[id]]} {TAB_LBL[id]}
            </button>
          ))}
          <div className="sidebar-cycle">
            {cycle?.label}<br />
            <span style={{ color: "var(--sage)" }}>● {t.cycleActive}</span>
          </div>
        </nav>

        {/* Main column */}
        <div className="main-col">
          <div className="topbar">
            <div className="topbar-row1">
              <div>
                <div className="topbar-title">{tab === "dashboard" ? t.home : TAB_LBL[tab]}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button onClick={() => setDarkMode(d => !d)} style={{ color: "var(--ink3)", padding: 4, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center" }}>
                  {darkMode ? Ico.sun : Ico.moon}
                </button>
              </div>
            </div>

            {tab === "dashboard" && (
              <div className="select-wrap">
                <select className="field-input" value={cycleId} onChange={(e) => setCycleId(e.target.value)} style={{ width: "100%" }}>
                  {CYCLES.map((c) => (<option key={c.id} value={c.id}> {c.label} </option>))}
                </select>
                <div className="select-arrow">
                  {Ico.chevron}
                </div>
              </div>
            )}
          </div>

          <div className="scroll-area" onScroll={handleScroll}>
            {tab === "dashboard" && <Dashboard txns={cycleTxns} setTxns={setTxns} categories={cats} t={t} />}
            {tab === "budgets" && <Budgets allTxns={txns} categories={cats} cycleId={cycleId} t={t} />}
            {tab === "goals" && <Goals t={t} />}
            {tab === "reports" && <Reports allTxns={txns} categories={cats} cycleId={cycleId} t={t} />}
            {tab === "settings" && <Settings categories={cats} setCategories={setCats} lang={lang} setLang={setLang} darkMode={darkMode} setDarkMode={setDarkMode} allTxns={txns} cycleId={cycleId} t={t} />}
          </div>
        </div>

        {/* FAB — home only */}
        {tab === "dashboard" && (
          <button className="fab"
            onClick={() => setFabOpen(true)}
            style={{
              opacity: showFab ? 1 : 0,
              transform: showFab ? "translateY(0px) scale(1)" : "translateY(24px) scale(0.9)",
              pointerEvents: showFab ? "auto" : "none",
            }}>{Ico.plus}
          </button>
        )}
        {fabOpen && (
          <TxnModal categories={cats} initial={null} t={t}
            onClose={() => setFabOpen(false)}
            onSave={tx => { setTxns(p => [tx, ...p]); setFabOpen(false); }} />
        )}

        {/* Mobile bottom nav */}
        <nav className="bottom-nav">
          {TAB_IDS.map(id => (
            <button key={id} className={`nav-tab ${tab === id ? "active" : ""}`} onClick={() => setTab(id)}>
              {Ico[TAB_ICONS[id]]}{TAB_LBL[id]}
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}