alter table public.applications
  add column if not exists followup_date timestamptz;
