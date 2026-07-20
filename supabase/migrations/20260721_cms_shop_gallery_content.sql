-- =====================================================================
-- Content management: shop, gallery, services, team, site stats/contact
-- + a public Storage bucket for admin-uploaded images.
--
-- Public (anon) can READ everything; only admins (is_admin()) can write.
-- Seeded with the site's existing content so nothing looks empty.
-- Safe to re-run (idempotent).
-- =====================================================================

-- ---------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------

create table if not exists public.shop_categories (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    slug text unique not null,
    description text,
    image_url text,
    sort_order int not null default 0,
    is_active boolean not null default true,
    created_at timestamptz not null default now()
);

create table if not exists public.shop_products (
    id uuid primary key default gen_random_uuid(),
    category_id uuid references public.shop_categories(id) on delete set null,
    name text not null,
    slug text not null,
    price numeric,
    price_note text,
    description text,
    image_url text,
    images jsonb not null default '[]'::jsonb,
    brand text,
    condition text,
    in_stock boolean not null default true,
    featured boolean not null default false,
    sort_order int not null default 0,
    created_at timestamptz not null default now()
);
create index if not exists shop_products_category_idx on public.shop_products (category_id);

create table if not exists public.gallery_categories (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    slug text unique not null,
    sort_order int not null default 0,
    created_at timestamptz not null default now()
);

create table if not exists public.gallery_images (
    id uuid primary key default gen_random_uuid(),
    category_id uuid references public.gallery_categories(id) on delete set null,
    image_url text not null,
    caption text,
    sort_order int not null default 0,
    created_at timestamptz not null default now()
);
create index if not exists gallery_images_category_idx on public.gallery_images (category_id);

create table if not exists public.services (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    description text,
    icon text,
    features jsonb not null default '[]'::jsonb,
    sort_order int not null default 0,
    is_active boolean not null default true,
    created_at timestamptz not null default now()
);

create table if not exists public.team_members (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    role text,
    title text,
    photo_url text,
    sort_order int not null default 0,
    created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- RLS: public read, admin write (relies on public.is_admin() from the
-- earlier admin migration).
-- ---------------------------------------------------------------------

do $$
declare
    t text;
begin
    foreach t in array array[
        'shop_categories', 'shop_products', 'gallery_categories',
        'gallery_images', 'services', 'team_members'
    ] loop
        execute format('alter table public.%I enable row level security;', t);

        execute format('drop policy if exists "Public can read %1$s" on public.%1$s;', t);
        execute format(
            'create policy "Public can read %1$s" on public.%1$s for select to anon, authenticated using (true);',
            t
        );

        execute format('drop policy if exists "Admins manage %1$s" on public.%1$s;', t);
        execute format(
            'create policy "Admins manage %1$s" on public.%1$s for all to authenticated using (public.is_admin()) with check (public.is_admin());',
            t
        );

        execute format('grant select on public.%I to anon, authenticated;', t);
        execute format('grant insert, update, delete on public.%I to authenticated;', t);
    end loop;
end $$;

-- ---------------------------------------------------------------------
-- Seed: site stats + contact info (in the existing admin_settings table)
-- ---------------------------------------------------------------------

insert into public.admin_settings (key, value) values
    ('site_stats', '{"happy_clients": "500+", "interns_trained": "50+", "years_experience": "3+"}'::jsonb),
    ('contact_info', '{"phone": "+237 671 827 893 / 674 410 358", "email": "telnetinc23@gmail.com", "address": "Tarred Malingo, behind Amazing Pharmacy, Molyko-Buea / St Claire", "whatsapp": "237671827893", "hours": "Tue – Fri: 8am – 7pm\nSaturday: 9am – 6pm"}'::jsonb)
on conflict (key) do nothing;

-- ---------------------------------------------------------------------
-- Seed: shop categories
-- ---------------------------------------------------------------------

insert into public.shop_categories (name, slug, description, sort_order) values
    ('Student Laptops', 'student-laptops', 'Affordable, reliable laptops perfect for schoolwork, research, and everyday use.', 1),
    ('Gaming Laptops', 'gaming-laptops', 'High-performance machines with dedicated graphics and fast processors for gaming enthusiasts.', 2),
    ('Business Laptops', 'business-laptops', 'Professional-grade laptops with enhanced security, durability, and productivity features.', 3),
    ('Desktop Screens', 'desktop-screens', 'Quality monitors and desktop displays for workstations and office setups.', 4),
    ('Accessories', 'accessories', 'Keyboards, mice, chargers, bags, USB hubs, and all essential laptop accessories.', 5),
    ('Networking Tools', 'networking-tools', 'Routers, switches, cables, and all networking equipment for home and office setup.', 6)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------
-- Seed: gallery categories
-- ---------------------------------------------------------------------

insert into public.gallery_categories (name, slug, sort_order) values
    ('IT Trainings & Internships', 'trainings', 1),
    ('Girls in Tech', 'girls-in-tech', 2),
    ('Community Outreach', 'community', 3),
    ('Smart Installations', 'installations', 4),
    ('Network Equipment', 'network', 5),
    ('Computers', 'computers', 6),
    ('Accessories', 'accessories', 7)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------
-- Seed: gallery images (existing public assets), only if none exist yet
-- ---------------------------------------------------------------------

insert into public.gallery_images (category_id, image_url, caption, sort_order)
select c.id, v.image_url, v.caption, v.sort_order
from (values
    ('trainings', '/Our team/other images/training sesseions.jpg', 'Training Sessions', 1),
    ('trainings', '/Our team/other images/Presentations.jpeg', 'Presentations', 2),
    ('trainings', '/Our team/other images/practicals.jpeg', 'Practical Sessions', 3),
    ('trainings', '/Our team/other images/interns.jpeg', 'Our Interns', 4),
    ('trainings', '/Our team/other images/internship certicate awarded.jpeg', 'Internship Certificates', 5),
    ('trainings', '/Our team/other images/internship conclusion.jpeg', 'Internship Conclusion', 6),
    ('trainings', '/Our team/other images/hardware maintenance.jpeg', 'Hardware Maintenance', 7),
    ('trainings', '/Our team/other images/windows installation.jpeg', 'Windows Installation', 8),
    ('trainings', '/Our team/other images/camera installation practicals.jpeg', 'Camera Installation Practicals', 9),
    ('girls-in-tech', '/Our team/other images/girls in tech/g.jpeg', 'Girls in Tech', 1),
    ('girls-in-tech', '/Our team/other images/girls in tech/g1.jpeg', 'Girls in Tech Training', 2),
    ('girls-in-tech', '/Our team/other images/girls in tech/g2.jpeg', 'Girls in Tech Workshop', 3),
    ('girls-in-tech', '/Our team/other images/girls in tech/g3.jpeg', 'Girls in Tech Program', 4),
    ('girls-in-tech', '/Our team/other images/girls in tech/g4.jpeg', 'Girls in Tech Session', 5),
    ('installations', '/Our team/other images/installation/camera.jpeg', 'Camera Installation', 1),
    ('installations', '/Our team/other images/installation/f.jpeg', 'Field Installation', 2),
    ('installations', '/Our team/other images/installation/f2.jpeg', 'Installation Work', 3),
    ('installations', '/Our team/other images/installation/f3.jpeg', 'On-site Installation', 4),
    ('installations', '/Our team/other images/installation/f4.jpeg', 'Installation Project', 5),
    ('installations', '/Our team/other images/installation/field work.jpeg', 'Field Work', 6),
    ('computers', '/Our team/other images/laptop.jpg', 'Laptop', 1),
    ('computers', '/Our team/other images/laptop/Dell..jpeg', 'Dell Laptop', 2),
    ('computers', '/Our team/other images/laptop/DELL.jpeg', 'Dell Computer', 3),
    ('computers', '/Our team/other images/laptop/delll.jpeg', 'Dell Device', 4),
    ('computers', '/Our team/other images/laptop/HP..jpeg', 'HP Laptop', 5),
    ('computers', '/Our team/other images/laptop/hp.jpeg', 'HP Computer', 6),
    ('computers', '/Our team/other images/laptop/HPs.jpeg', 'HP Devices', 7),
    ('computers', '/Our team/other images/laptop/L1.jpeg', 'Laptop Model 1', 8),
    ('computers', '/Our team/other images/laptop/L2.jpeg', 'Laptop Model 2', 9),
    ('computers', '/Our team/other images/laptop/l3.jpeg', 'Laptop Model 3', 10),
    ('computers', '/Our team/other images/laptop/l4.jpeg', 'Laptop Model 4', 11),
    ('computers', '/Our team/other images/laptop/laptop.jpg', 'Laptop Display', 12),
    ('computers', '/Our team/other images/laptop/macbook.jpeg', 'MacBook', 13),
    ('accessories', '/Our team/other images/accessories/calculators.jpeg', 'Calculators', 1),
    ('accessories', '/Our team/other images/accessories/display cable.jpeg', 'Display Cable', 2),
    ('accessories', '/Our team/other images/accessories/HDMI and VGA adapter.jpeg', 'HDMI & VGA Adapter', 3),
    ('accessories', '/Our team/other images/accessories/portable laptop bags.jpeg', 'Portable Laptop Bags', 4),
    ('network', '/Our team/other images/camera.jpeg', 'Camera Equipment', 1),
    ('network', '/Our team/other images/network equipments/utility knives.jpeg', 'Utility Knives', 2)
) as v(cat_slug, image_url, caption, sort_order)
join public.gallery_categories c on c.slug = v.cat_slug
where not exists (select 1 from public.gallery_images);

-- ---------------------------------------------------------------------
-- Seed: services
-- ---------------------------------------------------------------------

insert into public.services (title, description, icon, features, sort_order)
select v.title, v.description, v.icon, v.features::jsonb, v.sort_order
from (values
    ('Laptop Sales', 'We provide high-quality laptops and accessories suitable for students, professionals, and businesses. Our products come from trusted brands like HP, Dell, Lenovo and more.', '💻', '["Brand New & Refurbished", "All Accessories", "Warranty Support"]', 1),
    ('Security Camera Installation', 'Protect your property with reliable surveillance systems. We install modern CCTV solutions from trusted brands for homes, offices, and businesses.', '📹', '["HD & IP Cameras", "Remote Monitoring", "24/7 Recording"]', 2),
    ('Internet Installation', 'We install and configure high-speed satellite internet using Starlink technology to ensure reliable connectivity even in remote areas.', '🌐', '["Starlink Setup", "Wi-Fi Configuration", "Network Optimization"]', 3),
    ('Tech Training', 'Our training programs help individuals gain practical technology skills including computer fundamentals, networking, CCTV installation, graphic design, and web development.', '🎓', '["Computer Fundamentals", "Networking & CCTV", "Graphic Design & Web Dev"]', 4),
    ('Hardware Maintenance', 'Expert repair and maintenance for laptops, desktops, printers, and other IT equipment to keep your systems running.', '🔧', '["Diagnosis & Repair", "Component Upgrade", "Preventive Care"]', 5),
    ('Cybersecurity', 'Protect your digital assets with our comprehensive cybersecurity solutions, assessments, and awareness training.', '🔒', '["Security Audits", "Data Protection", "Awareness Training"]', 6)
) as v(title, description, icon, features, sort_order)
where not exists (select 1 from public.services);

-- ---------------------------------------------------------------------
-- Seed: team members
-- ---------------------------------------------------------------------

insert into public.team_members (name, role, title, photo_url, sort_order)
select v.name, v.role, v.title, v.photo_url, v.sort_order
from (values
    ('Taku Otto Angwa', 'CEO', 'Skilled Technician & Technology Expert', '/Our team/Taku Otto Angwa(CEO).jpeg', 1),
    ('Nkemetiafie Innocencia', 'Manager', 'IT Expert & Network Engineer', '/Our team/Nkemetiafie Innocensia(Manager).jpeg', 2),
    ('Emane Kelly Akwa', 'Deputy Manager', 'IT Expert & Trainer', '/Our team/Emane Kelly Akwa(Deputy Manager).jpeg', 3)
) as v(name, role, title, photo_url, sort_order)
where not exists (select 1 from public.team_members);

-- ---------------------------------------------------------------------
-- Storage bucket for uploaded images (public read, admin write).
-- Run last: if your project restricts policy creation on storage.objects
-- (error 42501 "must be owner of table objects"), everything above still
-- applies — just create the bucket + policies from the Storage dashboard.
-- ---------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('site-images', 'site-images', true)
on conflict (id) do update set public = true;

drop policy if exists "Public read site-images" on storage.objects;
create policy "Public read site-images"
    on storage.objects for select
    using (bucket_id = 'site-images');

drop policy if exists "Admins upload site-images" on storage.objects;
create policy "Admins upload site-images"
    on storage.objects for insert to authenticated
    with check (bucket_id = 'site-images' and public.is_admin());

drop policy if exists "Admins update site-images" on storage.objects;
create policy "Admins update site-images"
    on storage.objects for update to authenticated
    using (bucket_id = 'site-images' and public.is_admin())
    with check (bucket_id = 'site-images' and public.is_admin());

drop policy if exists "Admins delete site-images" on storage.objects;
create policy "Admins delete site-images"
    on storage.objects for delete to authenticated
    using (bucket_id = 'site-images' and public.is_admin());
