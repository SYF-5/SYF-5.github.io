// 创建商品数据类型定义
export interface Product {
  id: number;
  name: string;
  price: number;
  picture: string;
  description?: string;
  category?: string;
  stock?: number;
  rating?: number;
}