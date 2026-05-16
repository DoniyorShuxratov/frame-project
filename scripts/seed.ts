/**
 * Seed script: creates test accounts and inserts 8 fashion products.
 * Run with:  npx ts-node -r tsconfig-paths/register scripts/seed.ts
 * Or paste the fetch calls into the browser console after npm run dev.
 */
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!; // needs service role for admin user creation

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const PRODUCTS = [
  {
    name: "Classic White Tee",
    description: "A timeless white crew-neck T-shirt in premium combed cotton. Relaxed fit, perfect for layering.",
    price: 29.99,
    category: "T-Shirts",
    sizes: ["XS", "S", "M", "L", "XL"],
    image_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&auto=format&fit=crop",
    stock: 120,
  },
  {
    name: "Oversized Linen Shirt",
    description: "Breathable linen shirt with dropped shoulders. A summer wardrobe essential.",
    price: 64.99,
    category: "Shirts",
    sizes: ["S", "M", "L", "XL"],
    image_url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop",
    stock: 45,
  },
  {
    name: "Slim Chino Pants",
    description: "Stretch-blend chinos in a slim silhouette. Wrinkle-resistant and office-ready.",
    price: 79.99,
    category: "Pants",
    sizes: ["28", "30", "32", "34", "36"],
    image_url: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&auto=format&fit=crop",
    stock: 60,
  },
  {
    name: "Merino Wool Sweater",
    description: "Ultra-soft 100% merino wool crew-neck sweater. Naturally temperature-regulating.",
    price: 119.99,
    category: "Knitwear",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    image_url: "https://images.unsplash.com/photo-1516478177764-9fe5bd7e9717?w=800&auto=format&fit=crop",
    stock: 30,
  },
  {
    name: "Denim Trucker Jacket",
    description: "Classic mid-wash denim jacket with button-up front and chest pockets.",
    price: 139.99,
    category: "Jackets",
    sizes: ["S", "M", "L", "XL"],
    image_url: "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=800&auto=format&fit=crop",
    stock: 20,
  },
  {
    name: "Floral Midi Dress",
    description: "Flowing midi dress in a vintage floral print. Features a V-neck and adjustable tie waist.",
    price: 94.99,
    category: "Dresses",
    sizes: ["XS", "S", "M", "L"],
    image_url: "https://images.unsplash.com/photo-1495385794356-15371f348c31?w=800&auto=format&fit=crop",
    stock: 25,
  },
  {
    name: "Canvas Tote Bag",
    description: "Heavy-duty 12oz canvas tote with internal zip pocket. Holds up to 15kg.",
    price: 34.99,
    category: "Accessories",
    sizes: ["One Size"],
    image_url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop",
    stock: 200,
  },
  {
    name: "Leather Chelsea Boots",
    description: "Genuine leather Chelsea boots with elastic side panels and stacked heel.",
    price: 189.99,
    category: "Shoes",
    sizes: ["38", "39", "40", "41", "42", "43", "44"],
    image_url: "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=800&auto=format&fit=crop",
    stock: 15,
  },
];

async function createUser(email: string, password: string, username: string, role: string) {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { username, role },
  });
  if (error) {
    if (error.message.includes("already")) {
      console.log(`  User ${email} already exists, skipping.`);
    } else {
      console.error(`  Error creating ${email}:`, error.message);
    }
  } else {
    console.log(`  Created user: ${email} (${role})`);
    // Profile is created by trigger, but manually upsert to ensure role is set
    if (data.user) {
      await supabase.from("profiles").upsert({ id: data.user.id, username, role });
    }
  }
}

async function main() {
  console.log("Creating test accounts…");
  await createUser("user110@frame.com",  "12345678", "user110",  "customer");
  await createUser("admin110@frame.com", "87654321", "admin110", "admin");

  console.log("\nSeeding products…");
  const { error } = await supabase.from("products").insert(PRODUCTS);
  if (error) {
    console.error("  Error seeding products:", error.message);
  } else {
    console.log(`  Inserted ${PRODUCTS.length} products.`);
  }

  console.log("\nDone.");
}

main();
