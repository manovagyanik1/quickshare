-- Create videos table with all required columns
create table if not exists videos (
  id uuid primary key default gen_random_uuid(),
  onedrive_id text not null,
  share_id text not null,
  owner_id uuid not null,
  download_url text,
  url_expiry timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Create indexes for performance
create index if not exists videos_onedrive_id_idx on videos (onedrive_id);
create index if not exists videos_owner_id_idx on videos (owner_id);
create index if not exists videos_share_id_idx on videos (share_id);

-- Add unique constraint for share_id
alter table videos 
add constraint unique_share_id unique (share_id);

-- Enable Row Level Security (RLS)
alter table videos enable row level security;

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

-- Add documentation
comment on table videos is 'Stores video metadata and sharing information';
comment on column videos.onedrive_id is 'The original OneDrive file ID';
comment on column videos.share_id is 'The OneDrive share ID used for public access'; 