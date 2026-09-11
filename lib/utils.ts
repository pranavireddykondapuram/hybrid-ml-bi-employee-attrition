import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const fmtInt = (n: number) => Math.round(n).toLocaleString("en-US")
export const fmtPct = (n: number, d = 1) => `${(n * 100).toFixed(d)}%`
export const fmtMoney = (n: number) =>
  `₹${Math.round(n).toLocaleString("en-IN")}`
export const fmtMoneyShort = (n: number) => {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)}Cr`
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(1)}L`
  if (n >= 1e3) return `₹${(n / 1e3).toFixed(0)}K`
  return `₹${Math.round(n)}`
}
