-- Modificar la tabla reservations para permitir user_id nulo
ALTER TABLE reservations ALTER COLUMN user_id DROP NOT NULL;
