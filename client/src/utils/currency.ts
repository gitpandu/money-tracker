export const fmt = (n: number) => "Rp " + n.toLocaleString("id-ID");

export const fmtShort = (n: number, shorten = true) => {
    if (!shorten) return fmt(n);
    if (n >= 1000000) return `Rp ${(n / 1000000).toFixed(1)}jt`;
    if (n >= 1000) return `Rp ${(n / 1000).toFixed(0)}rb`;
    return `Rp ${n}`;
};
