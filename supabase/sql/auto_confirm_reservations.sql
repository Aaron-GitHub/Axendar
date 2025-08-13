-- RPC: auto_confirm_reservations
-- Confirma reservas 'pending' cuando now() supera (start_time - min_cancel_hours)
-- Calcula el umbral vía JOIN a profiles.min_cancel_hours

create or replace function public.auto_confirm_reservations()
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
    set status = 'confirmed',
        updated_at = now()
    from public.profiles p
    where p.id = r.user_id
      and r.status = 'pending'
      and now() > (r.start_time - make_interval(hours => coalesce(p.min_cancel_hours, 0)))
    returning 1
  )
  select count(*) into v_count from updated;
  return v_count;
end;
$$;

-- Permisos: el Edge Function usa service role, pero se puede otorgar a authenticated si se desea
-- grant execute on function public.auto_confirm_reservations() to authenticated, anon;
