-- ============================================================
-- FRAME E-Commerce — Supabase Setup SQL
-- Run this in the Supabase SQL Editor
-- ============================================================

-- 1. PROFILES TABLE
create table if not exists public.profiles (
  id   uuid references auth.users on delete cascade primary key,
  username text,
  role text not null default 'customer'
);
alter table public.profiles enable row level security;
create policy "Users can view own profile"   on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Admins can view all profiles" on public.profiles for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Trigger: create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, username, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'customer')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. PRODUCTS TABLE
create table if not exists public.products (
  id          uuid default gen_random_uuid() primary key,
  name        text not null,
  description text,
  price       numeric(10,2) not null,
  category    text not null,
  sizes       text[] default '{}',
  image_url   text,
  stock       integer not null default 0,
  created_at  timestamptz default now()
);
alter table public.products enable row level security;
create policy "Anyone can read products" on public.products for select using (true);
create policy "Admins can insert products" on public.products for insert with check (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Admins can update products" on public.products for update using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Admins can delete products" on public.products for delete using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- 3. ORDERS TABLE
create table if not exists public.orders (
  id          uuid default gen_random_uuid() primary key,
  customer_id uuid references auth.users on delete set null,
  total       numeric(10,2) not null,
  status      text not null default 'pending',
  created_at  timestamptz default now()
);
alter table public.orders enable row level security;
create policy "Users can view own orders"   on public.orders for select using (auth.uid() = customer_id);
create policy "Users can create orders"     on public.orders for insert with check (auth.uid() = customer_id);
create policy "Admins can view all orders"  on public.orders for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Admins can update orders"    on public.orders for update using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- 4. ORDER ITEMS TABLE
create table if not exists public.order_items (
  id         uuid default gen_random_uuid() primary key,
  order_id   uuid references public.orders on delete cascade,
  product_id uuid references public.products on delete set null,
  quantity   integer not null,
  size       text,
  price      numeric(10,2) not null
);
alter table public.order_items enable row level security;
create policy "Users can view own order items" on public.order_items for select using (
  exists (select 1 from public.orders where id = order_id and customer_id = auth.uid())
);
create policy "Users can insert order items" on public.order_items for insert with check (
  exists (select 1 from public.orders where id = order_id and customer_id = auth.uid())
);
create policy "Admins can view all order items" on public.order_items for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- 5. Enable realtime for orders
alter publication supabase_realtime add table public.orders;
