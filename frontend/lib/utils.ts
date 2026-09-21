import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Buyer-facing local product IDs are "local_<doc_id>", but seller PUT/DELETE
 * endpoints (/seller/products/{product_doc_id}) take the bare Mongo doc id.
 * Derive it once here rather than re-deriving it ad hoc at each call site.
 */
export function deriveSellerDocId(productId: string): string {
  return productId.replace(/^local_/, '')
}
