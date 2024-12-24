-- Create videos table
create table if not exists videos (
  id uuid primary key default gen_random_uuid(),
  onedrive_id text not null,
  owner_id uuid not null,
  download_url text,
  url_expiry timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Create indexes for performance
create index if not exists videos_onedrive_id_idx on videos (onedrive_id);
create index if not exists videos_owner_id_idx on videos (owner_id);

-- Enable Row Level Security (RLS)
alter table videos enable row level security;

-- Create policy for read access
create policy "Users can view their own videos"
  on videos for select
  using (owner_id::uuid = auth.uid());

-- Create policy for insert
create policy "Users can insert their own videos"
  on videos for insert
  with check (owner_id::uuid = auth.uid());

-- Create policy for update
create policy "Users can update their own videos"
  on videos for update
  using (owner_id::uuid = auth.uid());

-- Create function to automatically update updated_at
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger for updated_at
create trigger set_updated_at
  before update on videos
  for each row
  execute function handle_updated_at(); 