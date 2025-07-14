///Users/raghavtripathi/Projects 2.0/session-scribe-log/src/lib/utils.ts

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Category } from "@/types/session"; // Import the Category type

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ADD THIS FUNCTION: This function is now consolidated here.
export const getCategoryGradient = (category: Category): string => {
  switch (category) {
    case 'weed': return 'from-green-500 to-emerald-600';
    case 'cigs': return 'from-gray-500 to-slate-600';
    case 'vapes': return 'from-cyan-500 to-blue-600';
    case 'liquor': return 'from-amber-500 to-orange-600';
    default: return 'from-blue-500 to-purple-600';
  }
};