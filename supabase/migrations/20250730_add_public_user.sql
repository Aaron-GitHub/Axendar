-- Crear usuario público para reservas sin autenticación
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  'public@reservaspro.local',
  'RESERVED_FOR_PUBLIC_BOOKINGS',
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"local","providers":["local"]}',
  '{"name":"Public User"}',
  false,
  'authenticated'
)
ON CONFLICT (id) DO NOTHING;
