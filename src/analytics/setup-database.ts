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

import {
  ADMIN_DATABASE_URL,
  ANALYTICS_DATABASE_PASSWORD
} from '@countryconfig/constants'
import { Kysely, PostgresDialect, sql } from 'kysely'
import { Pool } from 'pg'

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
      id uuid NOT NULL UNIQUE,
      event_type text NOT NULL,
      tracking_id text NOT NULL UNIQUE,
      declaration jsonb DEFAULT '{}'::jsonb NOT NULL,
      created_at timestamp with time zone DEFAULT now() NOT NULL,
      updated_at timestamp with time zone DEFAULT now() NOT NULL
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

export async function setupAnalyticsUsingAdminRole() {
  const roleName = 'events_analytics'

  const admin = new Kysely<any>({
    dialect: new PostgresDialect({
      pool: new Pool({ connectionString: ADMIN_DATABASE_URL })
    })
  })

  try {
    await admin.transaction().execute(async (trx) => {
      await createRole('events_analytics', ANALYTICS_DATABASE_PASSWORD, trx)
      await trx.schema.createSchema('analytics').ifNotExists().execute()
      await createAnalyticsTables(trx)
      await grantAccessToUser(roleName, trx)
    })
  } finally {
    await admin.destroy()
  }
}
