# Infrastructure & Deployment

Country-config (not core) owns nearly all deployment infrastructure. Core's [infrastructure/](../../../opencrvs-core/infrastructure/) is intentionally thin — only `hearth-plugins/`, `hearth-queryparam-extensions.json`, and `influxdb.conf`. Everything else lives here so each country can tune its own deploy topology without forking core.

## Top-level layout

```
infrastructure/
├── docker-compose.deploy.yml                # base for all envs
├── docker-compose.{development,qa,staging,production}-deploy.yml  # per-env overrides
├── clear-all-data.sh / clear-all-data-dev.sh
├── port-forward.sh
├── rotate-secrets.sh
├── run-migrations.sh
├── setup-deploy-config.sh
├── hearth-queryparam-extensions.json
├── influxdb.conf
├── logrotate.conf
├── known-hosts
├── deployment/
│   ├── deploy.sh                           # main deploy entrypoint
│   ├── reindex.sh
│   └── validate-required-variables-in-compose-files.ts
├── environments/
│   ├── setup-environment.ts                # `yarn environment:init`
│   ├── github.ts                           # Octokit secrets/vars helpers
│   ├── ssh.ts                              # SSH connectivity check
│   ├── logger.ts                           # kleur-coloured CLI logger
│   └── update-known-hosts.sh
├── server-setup/                           # Ansible playbooks
│   ├── playbook.yml / swarm.yml / jump.yml / backups.yml / self-hosted-runner.yml
│   ├── inventory/ group_vars/ tasks/ templates/ files/
├── local-development/
│   ├── provision-linux.sh / provision-macos.sh
│   ├── local.linux.yml.template / local.macos.yml
│   └── provision.ipynb
├── postgres/                                # on-deploy.sh, setup-analytics.sh
├── mongodb/                                 # on-deploy.sh
├── elasticsearch/                           # setup.sh, setup-users.sh, setup-settings.sh, setup-helpers.sh, setup-elastalert-indices.sh, roles/, jvm.options
├── redis/                                   # redis.conf
├── monitoring/                              # apm/ elastalert/ filebeat/ kibana/ logstash/ metricbeat/
├── metabase/                                # initialize-database.sh, run.sh, run-dev.sh, environment-configuration.sql, metabase.init.db.sql
├── mc-config/                               # Minio Client config
├── backups/                                 # backup.sh, restore.sh, restore-snapshot.sh, rotate_backups.sh, download.sh
├── cryptfs/                                 # bootstrap.sh, mount.sh, umount.sh, decrypt.sh
├── hearth-plugins/                          # FHIR plugins (checkDuplicateTask.js, etc.)
```

## Docker Compose deploy files

The deploy stack is composed by stacking files in this order (see [infrastructure/deployment/deploy.sh](../../infrastructure/deployment/deploy.sh) lines 65–70):

```
/tmp/docker-compose.deps.yml          # pulled from core (DB dependencies)
/tmp/docker-compose.yml               # pulled from core (services)
infrastructure/docker-compose.deploy.yml         # country-config base overrides
infrastructure/docker-compose.<env>-deploy.yml   # per-env final overrides
```

Adding an env var to a service requires editing the matching service entry in the country-config overrides — do NOT fork core's compose files. The deploy script will combine them in order, with later files overriding earlier ones.

Per-env replicas, hostnames, and image tags are passed via CLI args:
```bash
./deploy.sh \
  --host=<deploy-target> \
  --environment=production \
  --ssh_host=<jump-host> \
  --ssh_user=<user> \
  --ssh_port=22 \
  --version=<core-image-tag> \
  --country_config_version=<countryconfig-image-tag> \
  --replicas=3
```

The script reads `.env.<environment>` (e.g. `.env.production`) from the project root for additional env vars before composing files.

## `yarn environment:init` — interactive GitHub setup

[infrastructure/environments/setup-environment.ts](../../infrastructure/environments/setup-environment.ts) is the canonical bootstrap for a new deploy environment. Run via:

```bash
yarn environment:init   # alias for `ts-node infrastructure/environments/setup-environment.ts`
yarn environment:upgrade  # same script — re-runs to detect missing values
```

It uses [@inquirer/editor](https://www.npmjs.com/package/@inquirer/editor) + [prompts](https://www.npmjs.com/package/prompts) to walk through:
- GitHub repository selection (Octokit).
- Per-environment GitHub secrets and variables (created/updated via [infrastructure/environments/github.ts](../../infrastructure/environments/github.ts)).
- SSH connectivity check via [infrastructure/environments/ssh.ts](../../infrastructure/environments/ssh.ts).
- Writes `.env.<environment>` to the project root.

Add new questions by extending the `ALL_QUESTIONS` array in the file with `QuestionDescriptor<T>` entries. Each question has `scope: 'ENVIRONMENT' | 'REPOSITORY'` and `valueType: 'SECRET' | 'VARIABLE'`.

For non-interactive deploys, populate `.env.<env>` directly with the keys you'd otherwise be prompted for; the deploy script reads it.

## Ansible server setup

[infrastructure/server-setup/](../../infrastructure/server-setup/) bootstraps a fresh server stack. Key playbooks:

| Playbook | Purpose |
|---|---|
| `playbook.yml` | Main entrypoint, includes per-host tasks |
| `swarm.yml` | Initialize Docker Swarm (manager + workers), open UFW port 2377 |
| `jump.yml` | Configure jump/bastion host |
| `backups.yml` | Configure backup server with cron + SSH keys |
| `self-hosted-runner.yml` | Install GitHub Actions self-hosted runner |

Inventory in [infrastructure/server-setup/inventory/](../../infrastructure/server-setup/inventory/), group vars in [group_vars/all.yml](../../infrastructure/server-setup/group_vars/all.yml), templates in [templates/](../../infrastructure/server-setup/templates/) (e.g. `jail.local.j2` for fail2ban).

Always run with `--check` first for new environments to preview changes. Use tags (`--tags swarm`, etc.) to scope re-runs.

## On-deploy DB hooks

Per-database setup scripts run as part of the deploy. They are idempotent and re-run on every deploy:

| Script | What it does |
|---|---|
| [infrastructure/mongodb/on-deploy.sh](../../infrastructure/mongodb/on-deploy.sh) | Mongo replica set bootstrap, user creation, indexes for Hearth/user-mgnt/performance |
| [infrastructure/postgres/on-deploy.sh](../../infrastructure/postgres/on-deploy.sh) | Postgres roles/databases for core's events service |
| [infrastructure/postgres/setup-analytics.sh](../../infrastructure/postgres/setup-analytics.sh) | Creates the country-config-owned `analytics` schema and `events_analytics` user. See [`analytics.md`](analytics.md) for details. |
| [infrastructure/elasticsearch/setup.sh](../../infrastructure/elasticsearch/setup.sh) | ES index setup; sources `setup-users.sh`, `setup-settings.sh`, `setup-helpers.sh`, `setup-elastalert-indices.sh` |
| [infrastructure/elasticsearch/roles/](../../infrastructure/elasticsearch/roles/) | ES role definitions (per-service permissions) |

When adding a new DB feature for a deploy:
1. Make the change idempotent (use `CREATE IF NOT EXISTS`, `--if-exists` etc.).
2. Test against a fresh stack via `yarn db:clear:all` + redeploy.
3. Keep secrets out of these scripts — they read env vars set by deploy.sh.

## Monitoring stack

Six subdirectories under [infrastructure/monitoring/](../../infrastructure/monitoring/):

- `apm/` — Elastic APM Server config
- `elastalert/` — Alert rules (correlate with `tests/verify-elastalert-kibana-alerts-match.test.ts`)
- `filebeat/` — Log shipping
- `kibana/` — Dashboards
- `logstash/` — Log parsing pipelines
- `metricbeat/` — System/Docker metrics

**ElastAlert rules and Kibana alerts must match.** The repo has [tests/verify-elastalert-kibana-alerts-match.test.ts](../../tests/verify-elastalert-kibana-alerts-match.test.ts) to enforce parity — run `yarn test` after touching any monitoring config to catch drift.

## Metabase

[infrastructure/metabase/](../../infrastructure/metabase/) hosts Metabase dashboards backed by the country-config analytics Postgres. See [`analytics.md`](analytics.md) for the data plumbing.

- `run-dev.sh` — `yarn metabase` shortcut for local dashboard work
- `initialize-database.sh` / `metabase.init.db.sql` — Metabase's own H2 config DB
- `environment-configuration.sql` — env-specific overrides applied on start
- `_data/` — exported dashboard JSON for version control

## Backups

[infrastructure/backups/](../../infrastructure/backups/):

| Script | Purpose | yarn alias |
|---|---|---|
| `backup.sh` | Snapshot all DBs to backup server | `yarn snapshot` |
| `restore-snapshot.sh` | Restore from a named snapshot | `yarn restore-snapshot` |
| `restore.sh` | Restore from latest | — |
| `rotate_backups.sh` | Prune old snapshots | cron-scheduled |
| `download.sh` | Pull snapshot from backup server locally | — |

Backups cover Mongo (Hearth, user-mgnt, performance), Postgres (events + analytics), Minio (documents), Elasticsearch indices. Always test restores in a non-prod environment before relying on them.

## Cryptfs (LUKS disk encryption)

[infrastructure/cryptfs/](../../infrastructure/cryptfs/) wraps LVM+LUKS encryption for the data volume:

| Script | Purpose |
|---|---|
| `bootstrap.sh` | First-time setup: create LUKS volume, format, mount |
| `mount.sh` | Mount after reboot (requires passphrase) |
| `decrypt.sh` | Decrypt-only (no mount) |
| `umount.sh` | Safe unmount |

These run on the deploy host, not inside containers. Passphrases must not be committed — they live in GitHub environment secrets (set via `yarn environment:init`).

## Local development

[infrastructure/local-development/](../../infrastructure/local-development/) provisions a dev workstation:

- `provision-linux.sh` / `provision-macos.sh` — install Docker, Node 22, Yarn, dependencies
- `local.linux.yml.template` / `local.macos.yml` — Ansible-style configs the scripts apply
- `provision.ipynb` — Jupyter notebook walking new contributors through the same steps

For a fresh dev setup, follow the README in this folder. The country-config dev stack also depends on core's [development-environment/dev.sh](../../../opencrvs-core/development-environment/dev.sh) — start core first, then `yarn dev` here.

## Common operations

### Deploy a new version

```bash
yarn deploy \
  --host=<server> \
  --environment=<env> \
  --ssh_host=<jump> --ssh_user=<user> --ssh_port=22 \
  --version=<core-tag> \
  --country_config_version=<countryconfig-tag> \
  --replicas=3
```

### Reset all data (dev)

```bash
yarn db:clear:all       # alias for clear-all-data-dev.sh + setup-analytics
```

### Reset all data (production "reset data" pipeline)

Uses [infrastructure/clear-all-data.sh](../../infrastructure/clear-all-data.sh) — clears all DBs INCLUDING the Metabase analytics database (PostgreSQL analytics schema + Metabase H2 config).

### Port-forward to a deployed env

```bash
yarn port-forward       # bash infrastructure/port-forward.sh
```

### Rotate secrets

```bash
bash infrastructure/rotate-secrets.sh
```

### Validate compose env vars

```bash
ts-node infrastructure/deployment/validate-required-variables-in-compose-files.ts
```

Catches typos and missing-required env vars across compose files. Run before deploy.

## Anti-patterns

- **Editing core's compose files** instead of country-config overrides — your changes will be wiped on the next core upgrade.
- **Non-idempotent on-deploy scripts** — every deploy runs them. Use `IF NOT EXISTS`, check before create.
- **Committing secrets to `.env.<env>`** — these files contain operational secrets; should be in `.gitignore` and populated by `yarn environment:init` or the deploy CI.
- **Changing ElastAlert rules without updating Kibana alerts (and vice versa)** — breaks the `tests/verify-elastalert-kibana-alerts-match.test.ts` check.
- **Skipping `--check` on first Ansible run for a new host** — destructive operations can run without preview.
- **Encrypting `cryptfs` with a passphrase known only to one person** — bus factor. Store securely in a shared vault and rotate.
- **Snapshotting without verifying restore** — backups that haven't been restored are unproven. Add a periodic restore drill.
- **Forgetting to bump `--replicas`** when scaling Mongo — must be 1, 3, or 5 (odd numbers for replica set quorum).
- **Editing `Tiltfile`, `Dockerfile`, or `Dockerfile.assets` without testing locally** — these are the build inputs; broken builds block all deploys.
