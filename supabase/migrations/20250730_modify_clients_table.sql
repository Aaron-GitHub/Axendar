-- Modificar la tabla clients para permitir user_id nulo
ALTER TABLE clients ALTER COLUMN user_id DROP NOT NULL;
