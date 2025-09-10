#!/bin/bash
set -euo pipefail

# Configuration
: "${POSTGRES_HOST:=localhost}"
: "${POSTGRES_PORT:=5432}"
: "${ANALYTICS_POSTGRES_USER:?Must set ANALYTICS_POSTGRES_USER}"
: "${ANALYTICS_POSTGRES_PASSWORD:?Must set ANALYTICS_POSTGRES_PASSWORD}"
: "${EVENTS_ANALYTICS_POSTGRES_PASSWORD:?Must set EVENTS_ANALYTICS_POSTGRES_PASSWORD}"
: "${KEEP_ALIVE_SECONDS:=0}" # Prevent Swarm from marking this task as failed due to early exit

TARGET_DB="events"

echo "Waiting for PostgreSQL to be ready at ${POSTGRES_HOST}:${POSTGRES_PORT}..."
until PGPASSWORD="$ANALYTICS_POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" \
  -U "$ANALYTICS_POSTGRES_USER" -d postgres -c '\q' 2>/dev/null; do
  sleep 2
done

sleep "$KEEP_ALIVE_SECONDS"

create_or_update_role() {
  local role=$1
  local password=$2
  local db=$3

  PGPASSWORD="$ANALYTICS_POSTGRES_PASSWORD" psql -v ON_ERROR_STOP=1 -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" \
    -U "$ANALYTICS_POSTGRES_USER" -d postgres <<EOSQL
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
PGPASSWORD="$ANALYTICS_POSTGRES_PASSWORD" psql -v ON_ERROR_STOP=1 -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" \
  -U "$ANALYTICS_POSTGRES_USER" -d "$TARGET_DB" <<EOSQL

CREATE SCHEMA IF NOT EXISTS analytics;

CREATE OR REPLACE VIEW analytics.locations
WITH (security_barrier)
AS
SELECT * FROM app.locations;

CREATE TABLE IF NOT EXISTS analytics.event_actions (
  event_type text NOT NULL,
  action_type app.action_type NOT NULL,
  annotation jsonb,
  assigned_to text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at_location uuid REFERENCES app.locations(id),
  created_by text NOT NULL,
  created_by_role text NOT NULL,
  created_by_signature text,
  created_by_user_type app.user_type NOT NULL,
  declared_at timestamp with time zone,
  registered_at timestamp with time zone,
  declaration jsonb NOT NULL DEFAULT '{}'::jsonb,
  event_id uuid NOT NULL REFERENCES app.events(id),
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  original_action_id uuid REFERENCES app.event_actions(id),
  registration_number text UNIQUE,
  request_id text,
  status app.action_status NOT NULL,
  transaction_id text NOT NULL,
  content jsonb,
  UNIQUE (id, event_id)
);

CREATE TABLE IF NOT EXISTS analytics.location_levels (
  id text PRIMARY KEY,
  level int NOT NULL,
  name text NOT NULL
);

GRANT USAGE ON SCHEMA analytics TO events_analytics;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA analytics TO events_analytics;
EOSQL

echo "✅ Analytics schema initialized for database '$TARGET_DB'"