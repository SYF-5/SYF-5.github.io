declare module '@/services/productService.js' {
  interface Product {
    id: number
    name: string
    price: number
    picture: string
    desc: string
    categoryId?: number
    categoryName?: string
    category?: string
    dataSource?: string
  }

  interface Category {
    id: number
    name: string
    children: string[]
  }

  interface Banner {
    id?: number
    picture: string
    alt?: string
    title?: string
    link?: string
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
    getBanners(): Banner[]
  }

  const productService: ProductService
  export default productService
}