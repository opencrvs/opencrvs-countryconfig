/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */

import { ADMIN_DATABASE_URL } from '@countryconfig/constants'
import { Kysely, PostgresDialect, sql } from 'kysely'
import { Pool } from 'pg'
import { getClient } from './postgres'

/**
 * Creates a Postgres user ("role") if it does not already exist. The user is only granted an access to the analytics data.
 * @param roleName The name of the user, e.g. events_analytics
 * @param rolePassword  The password of the user, e.g. analytics_password
 */
function createRole(roleName: string, rolePassword: string, trx: Kysely<any>) {
  return sql
    .raw(
      `DO $$
      BEGIN
        IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${roleName}') THEN
          CREATE USER "${roleName}" WITH PASSWORD '${rolePassword}';
        END IF;
        GRANT CONNECT ON DATABASE events TO "${roleName}";
      END $$;`
    )
    .execute(trx)
}

function createAnalyticsTables(trx: Kysely<any>) {
  return sql`
    CREATE OR REPLACE VIEW analytics.locations
    WITH (security_barrier)
    AS
    SELECT * FROM app.locations;

    CREATE TABLE IF NOT EXISTS analytics.events (
      id uuid DEFAULT gen_random_uuid() NOT NULL,
      event_type text NOT NULL,
      transaction_id text NOT NULL,
      tracking_id text NOT NULL,
      created_at timestamp with time zone DEFAULT now() NOT NULL,
      updated_at timestamp with time zone DEFAULT now() NOT NULL,
      CONSTRAINT events_pkey PRIMARY KEY (id),
      CONSTRAINT events_tracking_id_key UNIQUE (tracking_id),
      CONSTRAINT events_transaction_id_event_type_key UNIQUE (transaction_id, event_type)
    );

    CREATE TABLE IF NOT EXISTS analytics.event_actions (
      action_type app.action_type NOT NULL,
      annotation jsonb,
      assigned_to text,
      created_at timestamp with time zone DEFAULT now() NOT NULL,
      created_at_location uuid,
      created_by text NOT NULL,
      created_by_role text NOT NULL,
      created_by_signature text,
      created_by_user_type app.user_type NOT NULL,
      declaration jsonb DEFAULT '{}'::jsonb NOT NULL,
      event_id uuid NOT NULL,
      id uuid DEFAULT gen_random_uuid() NOT NULL,
      original_action_id uuid,
      reason_is_duplicate boolean,
      reason_message text,
      registration_number text,
      request_id text,
      status app.action_status NOT NULL,
      transaction_id text NOT NULL,
      content jsonb,
      -- calculated current state at the time of this action
      current_state jsonb DEFAULT '{}'::jsonb NOT NULL,
      UNIQUE (transaction_id, action_type),
      CONSTRAINT event_actions_pkey PRIMARY KEY (id),
      CONSTRAINT event_actions_event_id_fkey
        FOREIGN KEY (event_id) REFERENCES analytics.events(id),
      CONSTRAINT event_actions_created_at_location_fkey
        FOREIGN KEY (created_at_location) REFERENCES app.locations(id)
    );
  `.execute(trx)
}

async function grantAccessToUser(roleName: string, trx: Kysely<any>) {
  // Allow queries into the schema (but not modifications)
  await sql.raw(`GRANT USAGE ON SCHEMA analytics TO "${roleName}"`).execute(trx)

  // Allow read/write on all tables
  await sql
    .raw(
      `GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA analytics TO "${roleName}"`
    )
    .execute(trx)
}

export async function provisionAnalyticsWithAdmin() {
  const roleName = 'events_analytics'
  const rolePassword = process.env.ANALYTICS_DB_PASSWORD ?? 'analytics_password'

  const admin = new Kysely<any>({
    dialect: new PostgresDialect({
      pool: new Pool({ connectionString: ADMIN_DATABASE_URL })
    })
  })

  try {
    await admin.transaction().execute(async (trx) => {
      await createRole(roleName, rolePassword, trx)
      await trx.schema.createSchema('analytics').ifNotExists().execute()
      await createAnalyticsTables(trx)
      await grantAccessToUser(roleName, trx)
    })
  } finally {
    await admin.destroy()
  }
}

export async function smokeTestAnalytics() {
  const client = getClient()

  await sql`SELECT 1 FROM analytics.events LIMIT 1`.execute(client)
  await sql`SELECT 1 FROM analytics.event_actions LIMIT 1`.execute(client)
  await sql`SELECT 1 FROM analytics.locations LIMIT 1`.execute(client)
}
