create table if not exists products (
  id text primary key,
  external_id text,
  source text not null,
  title text not null,
  description text,
  length_cm numeric,
  width_cm numeric,
  height_cm numeric,
  weight_kg numeric,
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
  add column if not exists weight_kg numeric;

alter table products
  alter column length_cm drop not null;

alter table products
  alter column width_cm drop not null;

alter table products
  alter column height_cm drop not null;

alter table products
  add column if not exists confirmed_at timestamp with time zone;

alter table products
  add column if not exists confirmed_by text;

alter table products
  add column if not exists confirmed_source text;

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
  product_id text,
  action text not null,
  source text not null
);

create index if not exists idx_audit_actor on compliance_audit_log (actor_id);
create index if not exists idx_audit_action on compliance_audit_log (action);

create table if not exists dpp (
  id text primary key,
  product_id text,
  report_id text,
  destination_country text,
  created_at timestamp with time zone default now(),
  carbon_material_co2 numeric,
  carbon_transport_co2 numeric,
  carbon_total_co2 numeric,
  carbon_calculation_date timestamp with time zone,
  carbon_calculation_method text default 'EU_AVERAGE_LIGHT_V1'
);

alter table dpp
  add column if not exists destination_country text;

-- === CompliPack MVP additions (non-destructive) ===
alter table products
  add column if not exists merchant_id uuid;

alter table products
  add column if not exists sku text;

alter table products
  add column if not exists product_url text;

alter table products
  add column if not exists image_url text;

alter table products
  add column if not exists weight_g integer;

alter table products
  add column if not exists packaging_material_type text;

alter table products
  add column if not exists updated_at timestamp with time zone default now();

alter table products
  alter column packaging_status set default 'missing';

create table if not exists standard_boxes (
  id text primary key,
  name text not null,
  length_cm numeric not null,
  width_cm numeric not null,
  height_cm numeric not null,
  created_at timestamp with time zone default now()
);

create table if not exists reports (
  id text primary key,
  product_id text not null references products(id),
  kind text not null,
  status text not null,
  ppwr_result_json jsonb,
  dpp_json jsonb,
  carbon_json jsonb,
  qr_ppwr_url text,
  qr_dpp_url text,
  pdf_url text,
  finalized_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

create table if not exists epr_quarterly_exports (
  id text primary key,
  period_start date not null,
  period_end date not null,
  totals_json jsonb not null,
  xlsx_url text,
  pdf_url text,
  created_at timestamp with time zone default now()
);

create table if not exists shops (
  id text primary key,
  name text,
  public_api_key text unique,
  created_at timestamp with time zone default now()
);
