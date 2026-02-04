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

alter table products
  add column if not exists confirmed_at timestamp with time zone;

alter table products
  add column if not exists confirmed_by text;

alter table compliance_reports
  alter column ppwr_compliant drop not null;

alter table compliance_reports
  alter column empty_space_percent drop not null;

alter table compliance_reports
  alter column recommended_box_id drop not null;

create table if not exists compliance_audit_log (
  id text primary key,
  created_at timestamp with time zone default now(),
  actor_id text not null,
  action text not null,
  source text not null
);

create index if not exists idx_audit_actor on compliance_audit_log (actor_id);
create index if not exists idx_audit_action on compliance_audit_log (action);
