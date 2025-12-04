import type { Product } from '@/types/index'

declare class ProductService {
  products: Product[]
  categories: any[]
  categoryGoodsMap: Record<number, Product[]>
  loaded: boolean

  loadAllData(): Promise<void>
  normalizeImagePath(path: string, productId: number): string
  setRealDataBackup(): void
  getNewProducts(): Product[]
  getProductById(id: number | string): Product | null
  getCategories(): any[]
  getGoodsByCategoryId(categoryId: number): Product[]
  getAllProducts(): Product[]
  getProductsOnly(): Product[]
  isLoaded(): boolean
}

declare const _default: ProductService
export default _default