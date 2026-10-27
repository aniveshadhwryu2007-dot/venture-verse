create table public.form_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  source text not null default 'website'
    check (source in ('website', 'google_form')),
  submission_type text not null
    check (submission_type in ('inquiry', 'registration', 'sponsorship')),
  event_name text
    check (event_name is null or event_name in ('Venture Craft', 'Mudra', 'Karvaan')),
  full_name text not null
    check (char_length(btrim(full_name)) between 2 and 120),
  email text not null
    check (char_length(email) <= 254 and position('@' in email) > 1),
  phone text
    check (phone is null or char_length(phone) <= 30),
  organization text
    check (organization is null or char_length(organization) <= 160),
  message text
    check (message is null or char_length(message) <= 5000),
  answers jsonb not null default '{}'::jsonb
    check (jsonb_typeof(answers) = 'object')
);

alter table public.form_submissions enable row level security;
revoke all on table public.form_submissions from anon, authenticated;
grant insert on table public.form_submissions to anon;
grant select, insert, update, delete on table public.form_submissions to service_role;

create policy "Public can submit website forms"
  on public.form_submissions
  for insert
  to anon
  with check (true);
