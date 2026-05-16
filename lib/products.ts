import { Product } from "./types";

export const products: Product[] = [
  {
    id: "1",
    name: "Classic White Essential Tee",
    price: 29.99,
    category: "Men",
    sizes: ["XS", "S", "M", "L", "XL", "2XL"],
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
      "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&q=80",
    ],
    description: "A timeless wardrobe staple crafted from 100% organic cotton. Relaxed fit with reinforced stitching for everyday wear.",
    rating: 4.5,
    reviews: 238,
    badge: "Bestseller",
  },
  {
    id: "2",
    name: "Women's Tailored Slim Blazer",
    price: 149.99,
    originalPrice: 199.99,
    category: "Women",
    sizes: ["XS", "S", "M", "L"],
    image: "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=800&q=80",
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80",
    ],
    description: "Elevate any look with this structured slim-fit blazer. Features premium woven fabric with a single-button closure.",
    rating: 4.8,
    reviews: 142,
    badge: "Sale",
  },
  {
    id: "3",
    name: "Men's Slim Chino Trousers",
    price: 89.99,
    category: "Men",
    sizes: ["28", "30", "32", "34", "36"],
    image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&q=80",
    ],
    description: "Versatile slim-fit chinos in a stretch-cotton blend. Perfect for the office or weekend outings.",
    rating: 4.3,
    reviews: 95,
  },
  {
    id: "4",
    name: "Floral Wrap Midi Dress",
    price: 119.99,
    category: "Women",
    sizes: ["XS", "S", "M", "L", "XL"],
    image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=80",
    ],
    description: "A flowing midi dress with a delicate floral print. The wrap silhouette flatters every figure beautifully.",
    rating: 4.7,
    reviews: 187,
    badge: "New",
  },
  {
    id: "5",
    name: "Oversized Fleece Hoodie",
    price: 69.99,
    category: "Unisex",
    sizes: ["XS", "S", "M", "L", "XL", "2XL"],
    image: "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=800&q=80",
    ],
    description: "Ultra-soft fleece hoodie with an oversized fit. Kangaroo pocket and adjustable drawstring for relaxed styling.",
    rating: 4.6,
    reviews: 312,
    badge: "Bestseller",
  },
  {
    id: "6",
    name: "High-Waist Skinny Jeans",
    price: 99.99,
    originalPrice: 129.99,
    category: "Women",
    sizes: ["24", "26", "28", "30", "32"],
    image: "https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=800&q=80",
    ],
    description: "Premium stretch denim with a flattering high-waist silhouette. Fade-resistant fabric keeps its shape wash after wash.",
    rating: 4.4,
    reviews: 203,
    badge: "Sale",
  },
  {
    id: "7",
    name: "Genuine Leather Belt",
    price: 49.99,
    category: "Accessories",
    sizes: ["S", "M", "L", "XL"],
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
    ],
    description: "Full-grain leather belt with a polished silver buckle. Built to last and improve with age.",
    rating: 4.9,
    reviews: 67,
  },
  {
    id: "8",
    name: "Canvas Everyday Tote Bag",
    price: 79.99,
    category: "Accessories",
    sizes: ["One Size"],
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80",
    ],
    description: "Spacious canvas tote with reinforced handles and an interior zip pocket. Sustainable and stylish.",
    rating: 4.2,
    reviews: 88,
    badge: "New",
  },
  {
    id: "9",
    name: "Men's Oxford Button Shirt",
    price: 89.99,
    category: "Men",
    sizes: ["XS", "S", "M", "L", "XL"],
    image: "https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=800&q=80",
    ],
    description: "Classic Oxford weave button-down shirt in a tailored fit. Wrinkle-resistant fabric perfect for all-day wear.",
    rating: 4.5,
    reviews: 156,
  },
  {
    id: "10",
    name: "Merino Wool Cardigan",
    price: 109.99,
    originalPrice: 139.99,
    category: "Women",
    sizes: ["XS", "S", "M", "L"],
    image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80",
    ],
    description: "Luxuriously soft merino wool cardigan with a relaxed open-front design. Lightweight yet remarkably warm.",
    rating: 4.8,
    reviews: 124,
    badge: "Sale",
  },
  {
    id: "11",
    name: "Men's Satin Bomber Jacket",
    price: 199.99,
    category: "Men",
    sizes: ["S", "M", "L", "XL", "2XL"],
    image: "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=800&q=80",
    ],
    description: "Premium satin bomber with ribbed cuffs and hem. Features an embroidered chest logo and two side pockets.",
    rating: 4.7,
    reviews: 79,
    badge: "New",
  },
  {
    id: "12",
    name: "Women's Leather Ankle Boots",
    price: 159.99,
    originalPrice: 199.99,
    category: "Footwear",
    sizes: ["36", "37", "38", "39", "40", "41"],
    image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80",
    ],
    description: "Sleek leather ankle boots with a block heel and side zipper. A versatile wardrobe investment piece.",
    rating: 4.6,
    reviews: 231,
    badge: "Sale",
  },
];

export const categories = ["All", "Men", "Women", "Unisex", "Accessories", "Footwear"];

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getProductsByCategory(category: string): Product[] {
  if (category === "All") return products;
  return products.filter((p) => p.category === category);
}
