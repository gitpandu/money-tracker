import { Transaction, Category } from '../../../shared/types';

export function exportCSV(txns: Transaction[], cats: Category[], cycleLabel: string) {
  const getCat = (id: number) => cats.find(c => c.id === id);
  
  const rows = [["Date", "Type", "Category", "Sub-category", "Note", "Amount"]];
  
  txns.forEach(t => {
    const cat = getCat(t.category_id);
    const parent = cat?.parent_id ? getCat(cat.parent_id) : null;
    rows.push([
      t.date,
      t.type,
      parent?.name || cat?.name || "",
      cat?.parent_id ? cat.name : "",
      t.note,
      t.amount.toString()
    ]);
  });
  
  const csv = rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement("a");
  a.href = url;
  a.download = `transactions-${cycleLabel}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
