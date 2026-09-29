alter table public.idea_messages add column if not exists edited_at timestamptz;
alter table public.idea_messages add column if not exists deleted_at timestamptz;

create index if not exists idea_messages_sender_created_idx on public.idea_messages(sender_id,created_at desc);
create index if not exists idea_messages_receiver_created_idx on public.idea_messages(receiver_id,created_at desc);

notify pgrst, 'reload schema';
