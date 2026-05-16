export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  sizes: string[];
  image: string;
  images?: string[];
  description: string;
  rating: number;
  reviews: number;
  badge?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  size: string;
}

export interface Order {
  id: string;
  customer: string;
  email: string;
  date: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  total: number;
  items: number;
}
