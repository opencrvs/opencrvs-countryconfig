// Creates all OpenCRVS Tuvalu Metabase dashboards via the Metabase API.
// Run with: node create-dashboards.mjs

const BASE = 'http://localhost:4444'
const EMAIL = 'user@opencrvs.org'
const PASSWORD = 'm3tabase'

// ── API helper ───────────────────────────────────────────────────────────────

let TOKEN

async function api(method, path, body) {
  const headers = { 'Content-Type': 'application/json' }
  if (TOKEN) headers['X-Metabase-Session'] = TOKEN
  const res = await fetch(`${BASE}/api${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`${method} /api${path} → ${res.status}: ${text.slice(0, 300)}`)
  return text ? JSON.parse(text) : null
}

// ── Setup ────────────────────────────────────────────────────────────────────

const session = await api('POST', '/session', { username: EMAIL, password: PASSWORD })
TOKEN = session.id
console.log('✓ Authenticated')

const { data: dbs } = await api('GET', '/database')
const db = dbs.find(d => d.name.includes('Analytics') || d.name.includes('analytics'))
if (!db) throw new Error(`Analytics DB not found. Available: ${dbs.map(d => d.name).join(', ')}`)
const DB = db.id
console.log(`✓ Database "${db.name}" id=${DB}`)

// Archive all existing non-personal collections (Farajaland content)
const existingCols = await api('GET', '/collection')
const toArchive = existingCols.filter(c =>
  c.id !== 'root' && !c.is_personal && c.location !== undefined && !c.archived && c.name !== 'OpenCRVS Tuvalu'
)
for (const col of toArchive) {
  await api('PUT', `/collection/${col.id}`, { archived: true })
}
console.log(`✓ Archived ${toArchive.length} existing collections`)

// Find or create top-level collection
const allCols = await api('GET', '/collection')
let tuvalu = allCols.find(c => c.name === 'OpenCRVS Tuvalu' && !c.archived)
if (!tuvalu) {
  tuvalu = await api('POST', '/collection', { name: 'OpenCRVS Tuvalu', color: '#509EE3' })
}
const COL = tuvalu.id
console.log(`✓ Collection "OpenCRVS Tuvalu" id=${COL}`)

// ── Card factory ─────────────────────────────────────────────────────────────

async function card(name, type, sql, display, vizSettings = {}, templateTags = {}) {
  const c = await api('POST', '/card', {
    name,
    type,
    database_id: DB,
    dataset_query: {
      database: DB,
      type: 'native',
      native: { query: sql, 'template-tags': templateTags }
    },
    display,
    visualization_settings: vizSettings,
    collection_id: COL
  })
  console.log(`  ✓ [${type.padEnd(8)}] "${name}" id=${c.id}`)
  return c.id
}

function tag(name, displayName) {
  return {
    [name]: {
      id: crypto.randomUUID(),
      name,
      'display-name': displayName,
      type: 'text',
      required: false
    }
  }
}

// ── Models ───────────────────────────────────────────────────────────────────

console.log('\n── Models ──')

const M = {}

M.allRegistrations = await card(
  'All Registrations', 'model',
  "SELECT * FROM analytics.event_actions WHERE action_type = 'REGISTER'",
  'table'
)

M.declarations = await card(
  'Declarations', 'model',
  "SELECT * FROM analytics.event_actions WHERE action_type = 'DECLARE'",
  'table'
)

M.actions = await card(
  'Actions', 'model',
  'SELECT * FROM analytics.event_actions',
  'table'
)

// locations.administrative_area_id → administrative_areas; parent_id is on administrative_areas
M.locations = await card(
  'Locations', 'model',
  `WITH RECURSIVE r AS (
  SELECT
    l.id AS location_id,
    l.name AS loc_name,
    aa.id AS area_id,
    aa.name AS area_name,
    aa.parent_id,
    1 AS level
  FROM analytics.locations l
  JOIN analytics.administrative_areas aa ON l.administrative_area_id = aa.id
  UNION ALL
  SELECT r.location_id, r.loc_name, p.id, p.name, p.parent_id, r.level + 1
  FROM r JOIN analytics.administrative_areas p ON r.parent_id = p.id
)
SELECT
  location_id,
  MAX(loc_name) AS level_0,
  MAX(CASE WHEN level = 1 THEN area_name END) AS level_1,
  MAX(CASE WHEN level = 2 THEN area_name END) AS level_2,
  MAX(CASE WHEN level = 3 THEN area_name END) AS level_3
FROM r GROUP BY location_id`,
  'table'
)

M.eventTypes = await card(
  'Event types', 'model',
  'SELECT DISTINCT event_type FROM analytics.event_actions',
  'table'
)

// ── Questions ────────────────────────────────────────────────────────────────

console.log('\n── Questions ──')

const Q = {}

// Q1 – Birth Registrations by Gender
Q.birthByGender = await card(
  'Birth Registrations by Gender', 'question',
  `SELECT
  (declaration ->> 'child_gender') AS child_gender,
  COUNT(*) AS count
FROM analytics.event_actions
WHERE event_type = 'birth' AND action_type = 'REGISTER'
  [[AND (declaration ->> 'child_gender') = {{gender}}]]
  [[AND created_at_location::text = {{location}}]]
GROUP BY (declaration ->> 'child_gender')
ORDER BY child_gender ASC`,
  'bar',
  { 'graph.x_axis.scale': 'ordinal', 'graph.dimensions': ['child_gender'], 'graph.metrics': ['count'] },
  { ...tag('gender', 'Gender'), ...tag('location', 'Location') }
)

// Q2 – Under-1yr Birth Registrations by Gender
Q.under1ByGender = await card(
  'Under-1yr Birth Registrations by Gender', 'question',
  `SELECT
  (declaration ->> 'child_gender') AS child_gender,
  COUNT(*) AS cnt
FROM analytics.event_actions
WHERE action_type = 'DECLARE' AND event_type = 'birth'
  [[AND created_at_location::text = {{location}}]]
  [[AND (declaration ->> 'child_gender') = {{gender}}]]
  AND (declaration ->> 'child_dob')::date >= created_at - INTERVAL '1 year'
GROUP BY (declaration ->> 'child_gender')
ORDER BY child_gender`,
  'bar',
  { 'graph.x_axis.scale': 'ordinal', 'graph.dimensions': ['child_gender'], 'graph.metrics': ['cnt'] },
  { ...tag('gender', 'Gender'), ...tag('location', 'Location') }
)

// Q3 – Under-5yr Birth Registrations by Gender
Q.under5ByGender = await card(
  'Under-5yr Birth Registrations by Gender', 'question',
  `SELECT
  (declaration ->> 'child_gender') AS child_gender,
  COUNT(*) AS cnt
FROM analytics.event_actions
WHERE action_type = 'DECLARE' AND event_type = 'birth'
  [[AND created_at_location::text = {{location}}]]
  [[AND (declaration ->> 'child_gender') = {{gender}}]]
  AND (declaration ->> 'child_dob')::date >= created_at - INTERVAL '5 years'
GROUP BY (declaration ->> 'child_gender')
ORDER BY child_gender`,
  'bar',
  { 'graph.x_axis.scale': 'ordinal', 'graph.dimensions': ['child_gender'], 'graph.metrics': ['cnt'] },
  { ...tag('gender', 'Gender'), ...tag('location', 'Location') }
)

// Q4 – Birth Registration by Gender (pie)
Q.birthGenderPie = await card(
  'Birth Registration by Gender', 'question',
  `SELECT
  (declaration ->> 'child_gender') AS child_gender,
  COUNT(*) AS count
FROM analytics.event_actions
WHERE event_type = 'birth' AND action_type = 'REGISTER'
  AND (declaration ->> 'child_gender') IS NOT NULL
GROUP BY (declaration ->> 'child_gender')`,
  'pie',
  { 'pie.dimension': 'child_gender', 'pie.metric': 'count' }
)

// Q6 – Total Births Registered
Q.totalBirths = await card(
  'Total Births Registered', 'question',
  "SELECT COUNT(*) AS count FROM analytics.event_actions WHERE action_type = 'REGISTER' AND event_type = 'birth'",
  'scalar',
  { 'scalar.field': 'count' }
)

// Q7 – Birth Registrations by Location (map)
Q.birthRegByLocation = await card(
  'Birth Registrations by Location', 'question',
  `WITH RECURSIVE r AS (
  SELECT
    ea.created_at_location AS location_id,
    l.name AS loc_name,
    COUNT(*) AS count,
    aa.id AS area_id, aa.name AS area_name, aa.parent_id, 1 AS level
  FROM analytics.event_actions ea
  JOIN analytics.locations l ON ea.created_at_location = l.id
  JOIN analytics.administrative_areas aa ON l.administrative_area_id = aa.id
  WHERE ea.action_type = 'REGISTER' AND ea.event_type = 'birth'
  GROUP BY ea.created_at_location, l.name, aa.id, aa.name, aa.parent_id
  UNION ALL
  SELECT r.location_id, r.loc_name, r.count, p.id, p.name, p.parent_id, r.level + 1
  FROM r JOIN analytics.administrative_areas p ON r.parent_id = p.id
)
SELECT
  location_id,
  MAX(loc_name) AS level_0,
  MAX(CASE WHEN level = 1 THEN area_name END) AS level_1,
  MAX(CASE WHEN level = 2 THEN area_name END) AS level_2,
  MAX(CASE WHEN level = 3 THEN area_name END) AS level_3,
  MAX(count) AS count
FROM r GROUP BY location_id ORDER BY count DESC`,
  'map',
  {
    'map.type': 'region',
    'map.region': 'cdc1d5eb-c7f8-8b01-b296-eda34d06b6da',
    'map.dimension': 'level_2',
    'map.metric': 'count'
  }
)

// Q8 – Birth Declarations per Location (map)
Q.birthDeclByLocation = await card(
  'Birth Declarations per Location', 'question',
  `WITH RECURSIVE r AS (
  SELECT
    ea.created_at_location AS location_id,
    l.name AS loc_name,
    COUNT(*) AS count,
    aa.id AS area_id, aa.name AS area_name, aa.parent_id, 1 AS level
  FROM analytics.event_actions ea
  JOIN analytics.locations l ON ea.created_at_location = l.id
  JOIN analytics.administrative_areas aa ON l.administrative_area_id = aa.id
  WHERE ea.action_type = 'DECLARE' AND ea.event_type = 'birth'
  GROUP BY ea.created_at_location, l.name, aa.id, aa.name, aa.parent_id
  UNION ALL
  SELECT r.location_id, r.loc_name, r.count, p.id, p.name, p.parent_id, r.level + 1
  FROM r JOIN analytics.administrative_areas p ON r.parent_id = p.id
)
SELECT
  location_id,
  MAX(loc_name) AS level_0,
  MAX(CASE WHEN level = 1 THEN area_name END) AS level_1,
  MAX(CASE WHEN level = 2 THEN area_name END) AS level_2,
  MAX(CASE WHEN level = 3 THEN area_name END) AS level_3,
  MAX(count) AS count
FROM r GROUP BY location_id ORDER BY count DESC`,
  'map',
  {
    'map.type': 'region',
    'map.region': 'cdc1d5eb-c7f8-8b01-b296-eda34d06b6da',
    'map.dimension': 'level_2',
    'map.metric': 'count'
  }
)

// Q9 – % Registrations Certified
Q.pctCertified = await card(
  '% Registrations Certified', 'question',
  `SELECT
  CASE WHEN has_certified THEN 'Certified' ELSE 'Not Certified' END AS group_name,
  COUNT(*) AS count
FROM (
  SELECT
    event_id,
    BOOL_OR(action_type = 'PRINT_CERTIFICATE') AS has_certified
  FROM analytics.event_actions
  WHERE action_type IN ('REGISTER', 'PRINT_CERTIFICATE')
  GROUP BY event_id
  HAVING BOOL_OR(action_type = 'REGISTER')
) t
GROUP BY has_certified`,
  'pie',
  { 'pie.dimension': 'group_name', 'pie.metric': 'count' }
)

// Q13 – Death Registrations by Manner of Death (Tuvalu-specific)
Q.deathByManner = await card(
  'Death Registrations by Manner of Death', 'question',
  `SELECT
  (declaration ->> 'eventDetails_mannerOfDeath') AS manner_of_death,
  COUNT(*) AS count
FROM analytics.event_actions
WHERE event_type = 'death' AND action_type = 'REGISTER'
  AND (declaration ->> 'eventDetails_mannerOfDeath') IS NOT NULL
GROUP BY manner_of_death
ORDER BY count DESC`,
  'bar',
  { 'graph.x_axis.scale': 'ordinal', 'graph.dimensions': ['manner_of_death'], 'graph.metrics': ['count'] }
)

// Q14 – Death Registrations by Gender
Q.deathByGender = await card(
  'Death Registrations by Gender', 'question',
  `SELECT
  (declaration ->> 'deceased_gender') AS deceased_gender,
  COUNT(*) AS count
FROM analytics.event_actions
WHERE event_type = 'death' AND action_type = 'REGISTER'
GROUP BY deceased_gender
ORDER BY deceased_gender`,
  'bar',
  { 'graph.x_axis.scale': 'ordinal', 'graph.dimensions': ['deceased_gender'], 'graph.metrics': ['count'] }
)

// Q15 – Total Deaths Registered
Q.totalDeaths = await card(
  'Total Deaths Registered', 'question',
  "SELECT COUNT(*) AS count FROM analytics.event_actions WHERE action_type = 'REGISTER' AND event_type = 'death'",
  'scalar',
  { 'scalar.field': 'count' }
)

// Q16 – Death Registrations by Burial Arrangement (Tuvalu-unique)
Q.deathByBurial = await card(
  'Death Registrations by Burial Arrangement', 'question',
  `SELECT
  (declaration ->> 'burial_arrangement') AS burial_arrangement,
  COUNT(*) AS count
FROM analytics.event_actions
WHERE event_type = 'death' AND action_type = 'REGISTER'
  AND (declaration ->> 'burial_arrangement') IS NOT NULL
GROUP BY burial_arrangement
ORDER BY count DESC`,
  'bar',
  { 'graph.x_axis.scale': 'ordinal', 'graph.dimensions': ['burial_arrangement'], 'graph.metrics': ['count'] }
)

// Q19 – Death Registrations by Location (map)
Q.deathRegByLocation = await card(
  'Death Registrations by Location', 'question',
  `WITH RECURSIVE r AS (
  SELECT
    ea.created_at_location AS location_id,
    l.name AS loc_name,
    COUNT(*) AS count,
    aa.id AS area_id, aa.name AS area_name, aa.parent_id, 1 AS level
  FROM analytics.event_actions ea
  JOIN analytics.locations l ON ea.created_at_location = l.id
  JOIN analytics.administrative_areas aa ON l.administrative_area_id = aa.id
  WHERE ea.action_type = 'REGISTER' AND ea.event_type = 'death'
  GROUP BY ea.created_at_location, l.name, aa.id, aa.name, aa.parent_id
  UNION ALL
  SELECT r.location_id, r.loc_name, r.count, p.id, p.name, p.parent_id, r.level + 1
  FROM r JOIN analytics.administrative_areas p ON r.parent_id = p.id
)
SELECT
  location_id,
  MAX(loc_name) AS level_0,
  MAX(CASE WHEN level = 1 THEN area_name END) AS level_1,
  MAX(CASE WHEN level = 2 THEN area_name END) AS level_2,
  MAX(CASE WHEN level = 3 THEN area_name END) AS level_3,
  MAX(count) AS count
FROM r GROUP BY location_id ORDER BY count DESC`,
  'map',
  {
    'map.type': 'region',
    'map.region': 'cdc1d5eb-c7f8-8b01-b296-eda34d06b6da',
    'map.dimension': 'level_2',
    'map.metric': 'count'
  }
)

// Q17 – Birth Registrations table (Vital Statistics)
Q.birthRegTable = await card(
  'Birth Registrations', 'question',
  `SELECT registration_number, created_at, created_at_location,
  created_by, created_by_role, declaration
FROM analytics.event_actions
WHERE action_type = 'REGISTER' AND event_type = 'birth'`,
  'table',
  {
    'table.columns': [
      { name: 'registration_number', enabled: true },
      { name: 'created_at', enabled: true },
      { name: 'created_at_location', enabled: true },
      { name: 'created_by', enabled: true },
      { name: 'created_by_role', enabled: true },
      { name: 'declaration', enabled: true }
    ]
  }
)

// Q18 – Death Registrations table (Vital Statistics)
Q.deathRegTable = await card(
  'Death Registrations', 'question',
  `SELECT registration_number, created_at, created_at_location,
  created_by, created_by_role, declaration
FROM analytics.event_actions
WHERE action_type = 'REGISTER' AND event_type = 'death'`,
  'table',
  {
    'table.columns': [
      { name: 'registration_number', enabled: true },
      { name: 'created_at', enabled: true },
      { name: 'created_at_location', enabled: true },
      { name: 'created_by', enabled: true },
      { name: 'created_by_role', enabled: true },
      { name: 'declaration', enabled: true }
    ]
  }
)

// ── Dashboard helpers ─────────────────────────────────────────────────────────

/**
 * Creates a dashboard with tabs and cards in one operation.
 * tabDefs: [{ name, cards: [{ cardId, row, col, sizeX, sizeY }] }]
 * Tabs use negative client-side IDs resolved by the PUT /cards endpoint.
 */
async function createDashboard(name, tabDefs) {
  const d = await api('POST', '/dashboard', { name, collection_id: COL })

  const tabs = tabDefs.map((t, i) => ({ id: -(i + 1), name: t.name, position: i }))

  let cardIdx = 0
  const cards = tabDefs.flatMap((t, tabIdx) =>
    t.cards.map(c => ({
      id: -(++cardIdx),
      card_id: c.cardId,
      dashboard_tab_id: -(tabIdx + 1),
      row: c.row,
      col: c.col,
      size_x: c.sizeX,
      size_y: c.sizeY,
      series: [],
      parameter_mappings: [],
      visualization_settings: {}
    }))
  )

  await api('PUT', `/dashboard/${d.id}/cards`, { tabs, cards })
  console.log(`\n✓ Dashboard "${name}" id=${d.id} (${tabs.length} tabs, ${cards.length} cards)`)
  return d.id
}

console.log('\n── Dashboards ──')

// ── Dashboard 1: Birth Dashboard ─────────────────────────────────────────────
await createDashboard('Birth Dashboard', [
  {
    name: 'Overview',
    cards: [
      { cardId: Q.totalBirths,    row:  0, col:  0, sizeX: 24, sizeY: 4 },
      { cardId: Q.birthGenderPie, row:  4, col:  0, sizeX: 12, sizeY: 8 },
      { cardId: Q.birthByGender,  row:  4, col: 12, sizeX: 12, sizeY: 8 },
    ]
  },
  {
    name: 'Age Statistics',
    cards: [
      { cardId: Q.under1ByGender, row: 0, col:  0, sizeX: 12, sizeY: 8 },
      { cardId: Q.under5ByGender, row: 0, col: 12, sizeX: 12, sizeY: 8 },
    ]
  },
  {
    name: 'Geography',
    cards: [
      { cardId: Q.birthRegByLocation,  row: 0, col:  0, sizeX: 12, sizeY: 8 },
      { cardId: Q.birthDeclByLocation, row: 0, col: 12, sizeX: 12, sizeY: 8 },
      { cardId: Q.pctCertified,        row: 8, col:  0, sizeX: 12, sizeY: 8 },
    ]
  },
  {
    name: 'Records',
    cards: [
      { cardId: Q.birthRegTable, row: 0, col: 0, sizeX: 24, sizeY: 9 },
    ]
  }
])

// ── Dashboard 2: Death Dashboard ──────────────────────────────────────────────
await createDashboard('Death Dashboard', [
  {
    name: 'Overview',
    cards: [
      { cardId: Q.totalDeaths,   row:  0, col:  0, sizeX: 24, sizeY: 4 },
      { cardId: Q.deathByGender, row:  4, col:  0, sizeX: 12, sizeY: 8 },
      { cardId: Q.deathByManner, row:  4, col: 12, sizeX: 12, sizeY: 8 },
      { cardId: Q.deathByBurial, row: 12, col:  0, sizeX: 12, sizeY: 8 },
    ]
  },
  {
    name: 'Geography',
    cards: [
      { cardId: Q.deathRegByLocation, row: 0, col: 0, sizeX: 12, sizeY: 8 },
    ]
  },
  {
    name: 'Records',
    cards: [
      { cardId: Q.deathRegTable, row: 0, col: 0, sizeX: 24, sizeY: 9 },
    ]
  }
])

console.log('\n✅ All done!')
console.log('   Open Metabase → http://localhost:4444')
console.log('   Login: user@opencrvs.org / m3tabase')
console.log('\n   When finished, press Ctrl+C in the run-dev.sh terminal to save metabase.init.db.sql')
