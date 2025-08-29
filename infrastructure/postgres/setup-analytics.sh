#!/bin/bash
set -euo pipefail

# Configuration
: "${POSTGRES_HOST:=localhost}"
: "${POSTGRES_PORT:=5432}"
: "${POSTGRES_USER:?Must set POSTGRES_USER}"
: "${POSTGRES_PASSWORD:?Must set POSTGRES_PASSWORD}"
: "${EVENTS_ANALYTICS_POSTGRES_PASSWORD:?Must set EVENTS_ANALYTICS_POSTGRES_PASSWORD}"
: "${KEEP_ALIVE_SECONDS:=0}" # Prevent Swarm from marking this task as failed due to early exit

TARGET_DB="events"

echo "Waiting for PostgreSQL to be ready at ${POSTGRES_HOST}:${POSTGRES_PORT}..."
until PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" \
  -U "$POSTGRES_USER" -d postgres -c '\q' 2>/dev/null; do
  sleep 2
done

sleep "$KEEP_ALIVE_SECONDS"

create_or_update_role() {
  local role=$1
  local password=$2
  local db=$3

  PGPASSWORD="$POSTGRES_PASSWORD" psql -v ON_ERROR_STOP=1 -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" \
    -U "$POSTGRES_USER" -d postgres <<EOSQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = '${role}') THEN
    EXECUTE format('CREATE ROLE %I LOGIN PASSWORD %L', '${role}', '${password}');
  ELSE
    EXECUTE format('ALTER ROLE %I WITH PASSWORD %L', '${role}', '${password}');
  END IF;

  EXECUTE format('GRANT CONNECT ON DATABASE %I TO %I', '${db}', '${role}');
END
\$\$;
EOSQL
}

create_or_update_role "events_analytics" "$EVENTS_ANALYTICS_POSTGRES_PASSWORD" "$TARGET_DB"

# Schema + tables + grants
PGPASSWORD="$POSTGRES_PASSWORD" psql -v ON_ERROR_STOP=1 -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" \
  -U "$POSTGRES_USER" -d "$TARGET_DB" <<EOSQL

-- Create schema if not exists
CREATE SCHEMA IF NOT EXISTS analytics;

-- Create or replace view
CREATE OR REPLACE VIEW analytics.locations
WITH (security_barrier)
AS
SELECT * FROM app.locations;

-- Create events table if not exists
CREATE TABLE IF NOT EXISTS analytics.events (
  id uuid NOT NULL UNIQUE,
  event_type text NOT NULL,
  tracking_id text NOT NULL UNIQUE,
  declaration jsonb DEFAULT '{}'::jsonb NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Grant usage on schema
GRANT USAGE ON SCHEMA analytics TO events_analytics;

-- Grant table permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA analytics TO events_analytics;
EOSQL

echo "✅ Database '$TARGET_DB' and analytics schema initialized"