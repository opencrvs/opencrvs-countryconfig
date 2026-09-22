---
applyTo: "infrastructure/**,Dockerfile,Dockerfile.assets,docker-compose*.yml"
description: "Use when editing OpenCRVS deployment infrastructure — Docker Compose deploy files (per environment), Ansible Swarm/jump/backups/runner playbooks, the yarn environment:init CLI for GitHub secrets and SSH bootstrap, on-deploy DB hooks for Mongo/Postgres/Elasticsearch/Minio, monitoring (ElastAlert/Kibana/Logstash/Metricbeat/Filebeat/APM), backups (snapshot/restore/rotate), and cryptfs (LUKS) operations. Country-config owns most infra; core only ships hearth-plugins and influxdb config."
---

# Infrastructure & Deployment

**Critical rules** (apply reflexively):
- Country-config compose files **override** core's — edit overrides here, never fork core's compose. Stacking order: `deps.yml` (core) → `yml` (core) → `docker-compose.deploy.yml` (here) → `docker-compose.<env>-deploy.yml` (here).
- All on-deploy scripts (`mongodb/on-deploy.sh`, `postgres/on-deploy.sh`, `setup-analytics.sh`, `elasticsearch/setup.sh`) MUST be idempotent — they re-run on every deploy. Use `CREATE IF NOT EXISTS`, check-before-create.
- `setup-analytics.sh` runs **before** core migrations — it cannot reference core's tables.
- Never commit secrets to `.env.<env>`. Use `yarn environment:init` to populate them via GitHub secrets.
- Mongo `--replicas` must be 1, 3, or 5 (odd for replica set quorum).
- ElastAlert rules and Kibana alerts must stay in sync — [tests/verify-elastalert-kibana-alerts-match.test.ts](../../tests/verify-elastalert-kibana-alerts-match.test.ts) enforces this.
- For first-run Ansible against a new host: always use `--check` first.

**For full details, read this context file**:
- [.github/context/infrastructure.md](../context/infrastructure.md) — compose stacking, Ansible playbooks, on-deploy hooks, monitoring, backups, cryptfs, local dev
