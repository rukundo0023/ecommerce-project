const RWF_FORMATTER = new Intl.NumberFormat("en-RW", {
  style: "currency",
  currency: "RWF",
  maximumFractionDigits: 0,
});

export const formatRwf = (amount: number) => RWF_FORMATTER.format(amount);
