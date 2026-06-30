import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format bytes into a human-readable string (e.g., "1.5 MB").
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

/**
 * Map a MIME type to a Lucide icon name for document type display.
 */
export function mimeTypeToIcon(mimeType: string): 'FileText' | 'Image' | 'File' {
  if (mimeType === 'application/pdf' || mimeType.includes('word')) return 'FileText';
  if (mimeType.startsWith('image/')) return 'Image';
  return 'File';
}

/**
 * Truncate a string to maxLength with an ellipsis.
 */
export function truncate(str: string, maxLength: number): string {
  return str.length > maxLength ? `${str.slice(0, maxLength)}...` : str;
}
