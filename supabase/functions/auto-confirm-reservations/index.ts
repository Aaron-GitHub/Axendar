// Supabase Edge Function: auto-confirm-reservations
// Confirma automáticamente reservas pendientes cuyo límite de modificación/cancelación venció,
// calculando el umbral vía JOIN con profiles.min_cancel_hours en SQL (RPC).

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req: Request) => {
  try {
    const SUPABASE_URL = Deno.env.get("SECRET_SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SECRET_SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(
        JSON.stringify({ error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" }),
        { status: 500, headers: { "content-type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
      global: { headers: { "X-Client-Info": "edge-fn:auto-confirm-reservations" } },
    });

    // Ejecuta el RPC que hace el JOIN y actualiza estados a 'confirmed'
    const { data, error } = await supabase.rpc("auto_confirm_reservations");
    if (error) throw error;

    // data esperado: número de filas confirmadas
    const count = typeof data === "number" ? data : 0;

    return new Response(
      JSON.stringify({ ok: true, confirmed_count: count }),
      { status: 200, headers: { "content-type": "application/json" } }
    );
  } catch (err) {
    console.error("auto-confirm-reservations error", err);
    return new Response(
      JSON.stringify({ ok: false, error: String(err) }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
});
