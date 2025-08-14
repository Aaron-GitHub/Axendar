-- RPC: auto_complete_reservations
-- Pasa reservas a 'completed' cuando su end_time ya pasó y están en estado 'confirmed'

create or replace function public.auto_complete_reservations()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer := 0;
begin
  with updated as (
    update public.reservations r
    set status = 'completed',
        updated_at = now()
    where r.status = 'confirmed'
      and now() > r.end_time
    returning 1
  )
  select count(*) into v_count from updated;
  return v_count;
end;
$$;

-- Programación con pg_cron (ejemplo cada 10 minutos):
-- create extension if not exists pg_cron with schema extensions;
-- select cron.schedule(
--   'auto-complete-reservations-every-10m',
--   '*/10 * * * *',
--   $$select public.auto_complete_reservations();$$
-- );

-- Para ver jobs: select * from cron.job;
-- Para eliminar: select cron.unschedule((select jobid from cron.job where jobname = 'auto-complete-reservations-every-10m'));
