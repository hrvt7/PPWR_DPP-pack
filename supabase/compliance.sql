create table if not exists products (
  id text primary key,
  external_id text,
  source text not null,
  title text not null,
  description text,
  length_cm numeric not null,
  width_cm numeric not null,
  height_cm numeric not null,
  created_at timestamp with time zone default now()
);

create table if not exists packaging_boxes (
  id text primary key,
  name text not null,
  length_cm numeric not null,
  width_cm numeric not null,
  height_cm numeric not null
);

create table if not exists compliance_reports (
  id text primary key,
  product_id text not null references products(id),
  ppwr_compliant boolean not null,
  empty_space_percent numeric not null,
  recommended_box_id text not null references packaging_boxes(id),
  status text not null,
  pdf_url text,
  qr_payload text,
  created_at timestamp with time zone default now(),
  finalized_at timestamp with time zone
);

create index if not exists idx_products_source on products (source);
create index if not exists idx_reports_product on compliance_reports (product_id);
create index if not exists idx_reports_status on compliance_reports (status);

alter table products
  add column if not exists packaging_status text default 'confirmed';
