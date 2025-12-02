
-- Add progress tracking columns to books table
alter table books 
add column if not exists last_position integer default 0,
add column if not exists progress_percent integer default 0;
