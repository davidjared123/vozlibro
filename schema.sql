-- Create the books table
create table books (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  author text,
  text_content text,
  audio_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid -- Optional for now, can be linked to auth.users later
);

-- Enable Row Level Security (RLS)
alter table books enable row level security;

-- Create a policy that allows anyone to read/write for now (since we don't have auth setup yet)
-- WARNING: This is for development only. In production, you should restrict this to authenticated users.
create policy "Enable read access for all users" on books for select using (true);
create policy "Enable insert access for all users" on books for insert with check (true);
