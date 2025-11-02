declare module '@/services/productService.js' {
  interface Product {
    id: number
    name: string
    price: number
    picture: string
    desc: string
    categoryId?: number
    categoryName?: string
    dataSource?: string
  }

  interface Category {
    id: number
    name: string
    children: string[]
  }

  class ProductService {
    loadAllData(): Promise<void>
    getProductById(id: number): Product | null
    getCategories(): Category[]
    getGoodsByCategoryId(categoryId: number): Product[]
    getAllProducts(): Product[]
    getNewProducts(): Product[]
    getProductsByCategoryName(categoryName: string): Product[]
    isLoaded(): boolean
  }

  const productService: ProductService
  export default productService
}