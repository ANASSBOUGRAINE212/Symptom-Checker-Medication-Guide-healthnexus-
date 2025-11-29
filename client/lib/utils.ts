import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function smartSplit(str: string): string[] {
  if (!str) return [];
  const result: string[] = [];
  let current = '';
  let depth = 0;
  
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (char === '(') depth++;
    if (char === ')') depth = Math.max(0, depth - 1);
    
    if (char === ',' && depth === 0) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  if (current.trim()) result.push(current.trim());
  return result;
}
