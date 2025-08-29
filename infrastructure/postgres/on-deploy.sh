#!/bin/bash
set -euo pipefail

# Configuration
: "${POSTGRES_HOST:=postgres}"
: "${POSTGRES_PORT:=5432}"
: "${POSTGRES_USER:?Must set POSTGRES_USER}"
: "${POSTGRES_PASSWORD:?Must set POSTGRES_PASSWORD}"
: "${EVENTS_MIGRATOR_POSTGRES_PASSWORD:?Must set EVENTS_MIGRATOR_POSTGRES_PASSWORD}"
: "${EVENTS_APP_POSTGRES_PASSWORD:?Must set EVENTS_APP_POSTGRES_PASSWORD}"
: "${EVENTS_ANALYTICS_POSTGRES_PASSWORD:?Must set EVENTS_ANALYTICS_POSTGRES_PASSWORD}"

TARGET_DB="events"

echo "Waiting for PostgreSQL to be ready at ${POSTGRES_HOST}:${POSTGRES_PORT}..."
until PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" \
  -U "$POSTGRES_USER" -d postgres -c '\q' 2>/dev/null; do
  sleep 2
done

# Prevent Swarm from marking this task as failed due to early exit
sleep 10

# Helper: create or update role
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
    EXECUTE format('GRANT CONNECT ON DATABASE %I TO %I', '${db}', '${role}');
  ELSE
    EXECUTE format('ALTER ROLE %I WITH PASSWORD %L', '${role}', '${password}');
  END IF;
END
\$\$;
EOSQL
}

# Ensure target DB exists
DB_EXISTS=$(PGPASSWORD="$POSTGRES_PASSWORD" psql -qtAX -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" \
  -U "$POSTGRES_USER" -d postgres \
  -c "SELECT 1 FROM pg_database WHERE datname = '$TARGET_DB';")

if [[ "$DB_EXISTS" != "1" ]]; then
  echo "Database '$TARGET_DB' does not exist. Creating..."
  PGPASSWORD="$POSTGRES_PASSWORD" psql -v ON_ERROR_STOP=1 -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" \
    -U "$POSTGRES_USER" -d postgres \
    -c "CREATE DATABASE \"$TARGET_DB\";"
else
  echo "Database '$TARGET_DB' already exists."
fi

# Ensure roles exist + passwords are up-to-date
create_or_update_role "events_migrator" "$EVENTS_MIGRATOR_POSTGRES_PASSWORD" "$TARGET_DB"
create_or_update_role "events_app" "$EVENTS_APP_POSTGRES_PASSWORD" "$TARGET_DB"
create_or_update_role "events_analytics" "$EVENTS_ANALYTICS_POSTGRES_PASSWORD" "$TARGET_DB"

# Database-specific setup
PGPASSWORD="$POSTGRES_PASSWORD" psql -v ON_ERROR_STOP=1 -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" \
  -U "$POSTGRES_USER" -d "$TARGET_DB" <<EOF
-- revoke grants (safe to re-run)
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
REVOKE CREATE ON SCHEMA public FROM events_migrator;
REVOKE CREATE ON SCHEMA public FROM events_analytics;

-- create schema if missing
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'app') THEN
    EXECUTE 'CREATE SCHEMA app AUTHORIZATION events_migrator';
  END IF;
END
\$\$;

-- always ensure usage grant
GRANT USAGE ON SCHEMA app TO events_app;
EOF

echo "✅ Database '$TARGET_DB' and roles initialized"